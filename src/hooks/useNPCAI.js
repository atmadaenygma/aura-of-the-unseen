import { useState, useRef, useCallback } from 'react';

/**
 * NPC AI System
 * Manages state machine, sensing (LOS, hearing), random walk, and aura reactions.
 * All position updates are ref-based to avoid 60fps React re-renders.
 * State transitions (alerts, chases, catches, flees) flush to React state for UI updates.
 */

const STATES = {
  IDLE: 'IDLE',
  PATROLLING: 'PATROLLING',
  ALERTED: 'ALERTED',
  CHASING: 'CHASING',
  CATCHING: 'CATCHING',
  FLEEING: 'FLEEING',
};

// Compute angle from (ox, oy) to (tx, ty) in degrees [-180, 180]
const computeAngle = (ox, oy, tx, ty) => {
  const dx = tx - ox;
  const dy = ty - oy;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

// Compute distance
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

// Check if angle `a` (in degrees) is within cone centered at `coneDir` with half-angle `halfAngle`
const isInCone = (a, coneDir, halfAngle) => {
  let diff = a - coneDir;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return Math.abs(diff) <= halfAngle;
};

// Raycast from (ox, oy) toward (tx, ty) using checkPixel
// Returns true if line of sight is clear, false if blocked
const checkLineOfSight = (ox, oy, tx, ty, checkPixel, worldW, worldH) => {
  const dx = tx - ox;
  const dy = ty - oy;
  const d = Math.hypot(dx, dy);
  if (d === 0) return true;

  const steps = Math.ceil(d / 6); // 6px steps
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const cx = ox + dx * t;
    const cy = oy + dy * t;
    const res = checkPixel(cx, cy, worldW, worldH);
    if (res.type === 'BLOCK') return false;
  }
  return true;
};

// Random walk: pick random target within walkRadius, move toward it, avoid blocks
const updateRandomWalk = (npcState, npc, checkPixel, worldW, worldH) => {
  const { pos, walkTarget, idleTimer } = npcState;

  // If currently idling, count down
  if (idleTimer > 0) {
    npcState.idleTimer--;
    return; // Don't move while idling
  }

  // If no target or reached target, either pick new one or start idling
  if (!walkTarget || dist(pos.x, pos.y, walkTarget.x, walkTarget.y) < 10) {
    // Reached target, start idle timer (60-180 frames = 1-3 seconds at 60fps)
    npcState.idleTimer = 60 + Math.random() * 120;
    npcState.walkTarget = null;
    return;
  }

  const target = npcState.walkTarget;
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const d = Math.hypot(dx, dy);

  if (d > 0.1) {
    const ux = dx / d;
    const uy = dy / d;
    const nx = pos.x + ux * npc.moveSpeed;
    const ny = pos.y + uy * npc.moveSpeed;

    const res = checkPixel(nx, ny, worldW, worldH);
    if (res.type === 'WALK' || res.type === 'EXIT') {
      pos.x = nx;
      pos.y = ny;
      // Update facing direction based on movement vector
      npcState.facingDir = Math.atan2(uy, ux) * (180 / Math.PI);
    } else {
      // Blocked, start idle timer
      npcState.idleTimer = 30; // Shorter pause when blocked
      npcState.walkTarget = null;
    }
  }
};

export const useNPCAI = (resolvedNPCs, checkPixel, isReady, worldW, worldH) => {
  // State per NPC: { id, state, pos: {x, y}, facingDir, walkTarget, alertTimer, sightLossTimer }
  const npcStateRef = useRef(new Map());

  // Initialize NPC state refs on first render
  const ensureNPCState = useCallback(() => {
    Object.values(resolvedNPCs).forEach((npc) => {
      if (!npcStateRef.current.has(npc.id)) {
        npcStateRef.current.set(npc.id, {
          id: npc.id,
          state: STATES.IDLE,
          pos: { x: npc.spawnX, y: npc.spawnY },
          facingDir: 0, // facing right
          walkTarget: null,
          idleTimer: 0, // frames to idle at current spot
          alertTimer: 0,
          sightLossTimer: 0,
        });
      }
    });
  }, [resolvedNPCs]);

  // React state: { [npcId]: state } — only updates on state machine transitions
  const [npcStates, setNpcStates] = useState({});

  // React state for NPC positions — updated per frame but batched by React
  const [npcPositions, setNpcPositions] = useState({});

  // Tick function: called 60fps from Stage's handleEntityDetection
  const tickNPCs = useCallback(
    (mayaPos, isMayaCrouching, gameState) => {
      if (!isReady) return;

      ensureNPCState();

      npcStateRef.current.forEach((npcState) => {
        const npc = resolvedNPCs[npcState.id];
        if (!npc) return;

        const prevState = npcState.state;

        // Aura reactions
        const auraKey = gameState?.activeAura;
        const auraReaction = npc.auraReactions?.[auraKey];

        if (auraReaction?.effect === 'flee') {
          // Flee away from Maya
          npcState.state = STATES.FLEEING;
          const away = dist(npcState.pos.x, npcState.pos.y, mayaPos.x, mayaPos.y);
          if (away < auraReaction.fleeRadius) {
            const dx = npcState.pos.x - mayaPos.x;
            const dy = npcState.pos.y - mayaPos.y;
            const d = Math.hypot(dx, dy);
            if (d > 0.1) {
              const ux = dx / d;
              const uy = dy / d;
              const nx = npcState.pos.x + ux * npc.moveSpeed * 2; // double speed
              const ny = npcState.pos.y + uy * npc.moveSpeed * 2;
              const res = checkPixel(nx, ny, worldW, worldH);
              if (res.type !== 'BLOCK' && res.type !== 'INTERACT') {
                npcState.pos.x = nx;
                npcState.pos.y = ny;
                npcState.facingDir = Math.atan2(uy, ux) * (180 / Math.PI);
              }
            }
          }
        } else if (npcState.state === STATES.FLEEING) {
          // Exit flee, return to idle
          npcState.state = STATES.IDLE;
          npcState.walkTarget = null;
        } else {
          // Normal state machine
          const mayaDist = dist(npcState.pos.x, npcState.pos.y, mayaPos.x, mayaPos.y);

          switch (npcState.state) {
            case STATES.IDLE:
            case STATES.PATROLLING:
              // Random walk and idle pauses
              updateRandomWalk(npcState, npc, checkPixel, worldW, worldH);

              // Pick new target if idle timer expired
              if (npcState.idleTimer === 0 && !npcState.walkTarget) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * npc.walkRadius;
                npcState.walkTarget = {
                  x: npc.spawnX + Math.cos(angle) * r,
                  y: npc.spawnY + Math.sin(angle) * r,
                };
              }

              // Check LOS and hearing
              const angle = computeAngle(npcState.pos.x, npcState.pos.y, mayaPos.x, mayaPos.y);
              const inSightCone = isInCone(angle, npcState.facingDir, npc.sightAngle);
              const losCleared = mayaDist < npc.sightRange && checkLineOfSight(npcState.pos.x, npcState.pos.y, mayaPos.x, mayaPos.y, checkPixel, worldW, worldH);

              const hears = mayaDist < npc.hearingRange && !isMayaCrouching;

              if ((inSightCone && losCleared) || hears) {
                npcState.state = STATES.ALERTED;
                npcState.alertTimer = 0;
              }
              break;

            case STATES.ALERTED:
              // Transition to chasing
              npcState.state = STATES.CHASING;
              break;

            case STATES.CHASING:
              // Chase toward Maya
              const dx = mayaPos.x - npcState.pos.x;
              const dy = mayaPos.y - npcState.pos.y;
              const d = Math.hypot(dx, dy);

              if (d > 0.1) {
                const ux = dx / d;
                const uy = dy / d;
                const nx = npcState.pos.x + ux * npc.moveSpeed * 1.5; // faster than walk
                const ny = npcState.pos.y + uy * npc.moveSpeed * 1.5;
                const res = checkPixel(nx, ny, worldW, worldH);
                if (res.type !== 'BLOCK' && res.type !== 'INTERACT') {
                  npcState.pos.x = nx;
                  npcState.pos.y = ny;
                  npcState.facingDir = Math.atan2(uy, ux) * (180 / Math.PI);
                }
              }

              // Check grab box (same as Maya's interaction box)
              const BOX_W = 60;
              const BOX_D = 70;
              const grabBox = (() => {
                const dir = npcState.facingDir;
                // Simple cardinal check for now; diagonals can be added
                if (dir > -45 && dir <= 45) {
                  // RIGHT
                  return {
                    x1: npcState.pos.x,
                    y1: npcState.pos.y - BOX_W / 2,
                    x2: npcState.pos.x + BOX_D,
                    y2: npcState.pos.y + BOX_W / 2,
                  };
                } else if (dir > 45 && dir <= 135) {
                  // DOWN
                  return {
                    x1: npcState.pos.x - BOX_W / 2,
                    y1: npcState.pos.y,
                    x2: npcState.pos.x + BOX_W / 2,
                    y2: npcState.pos.y + BOX_D,
                  };
                } else if (dir > -135 && dir <= -45) {
                  // UP
                  return {
                    x1: npcState.pos.x - BOX_W / 2,
                    y1: npcState.pos.y - BOX_D,
                    x2: npcState.pos.x + BOX_W / 2,
                    y2: npcState.pos.y,
                  };
                } else {
                  // LEFT
                  return {
                    x1: npcState.pos.x - BOX_D,
                    y1: npcState.pos.y - BOX_W / 2,
                    x2: npcState.pos.x,
                    y2: npcState.pos.y + BOX_W / 2,
                  };
                }
              })();

              const inGrabBox =
                mayaPos.x >= grabBox.x1 &&
                mayaPos.x <= grabBox.x2 &&
                mayaPos.y >= grabBox.y1 &&
                mayaPos.y <= grabBox.y2;

              if (inGrabBox) {
                npcState.state = STATES.CATCHING;
              } else {
                // Lost sight timeout
                npcState.sightLossTimer++;
                const losCleared2 = dist(npcState.pos.x, npcState.pos.y, mayaPos.x, mayaPos.y) < npc.sightRange &&
                  checkLineOfSight(npcState.pos.x, npcState.pos.y, mayaPos.x, mayaPos.y, checkPixel, worldW, worldH);
                if (!losCleared2 && npcState.sightLossTimer > 180) {
                  // 3 seconds at 60fps
                  npcState.state = STATES.IDLE;
                  npcState.sightLossTimer = 0;
                  npcState.walkTarget = null;
                }
              }
              break;

            case STATES.CATCHING:
              // Stay in catching state — will be handled by Stage to open dialogue
              break;

            default:
              break;
          }
        }

        // Commit state machine transition to React
        if (npcState.state !== prevState) {
          setNpcStates((prev) => ({
            ...prev,
            [npcState.id]: { id: npcState.id, state: npcState.state, npcRef: npc },
          }));
        }
      });
    },
    [resolvedNPCs, checkPixel, isReady, worldW, worldH, ensureNPCState]
  );

  // Called from handleEntityDetection to update NPC positions in React state
  const updateNPCPositions = useCallback(() => {
    const newPositions = {};
    npcStateRef.current.forEach((npcState) => {
      newPositions[npcState.id] = { x: npcState.pos.x, y: npcState.pos.y };
    });
    setNpcPositions(newPositions);
  }, []);

  // Get current NPC position (for other systems that need it)
  const getNPCPosition = useCallback((npcId) => {
    return npcStateRef.current.get(npcId)?.pos || null;
  }, []);

  return {
    tickNPCs,
    npcStates,
    npcPositions,
    updateNPCPositions,
    getNPCPosition,
  };
};
