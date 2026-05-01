import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { readNPCSpawns } from '../utils/readNPCSpawns';
import { Character } from './Character';
import { NPC } from './NPC';
import { DebugOverlay } from './DebugOverlay';
import { DialogueSystem } from './DialogueSystem';
import { LootUI } from './LootUI';

/**
 * AURA OF THE UNSEEN: MASTER STAGE ENGINE v4.5
 * Features: Sensory Telemetry, Proximity Hitboxes, Quad-Mask Logic.
 */
export const Stage = ({ locationID, manifest, gameState, setGameState, debugMode }) => {
  const ZOOM = 1.6;

  // -- UI & NARRATIVE STATES --
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [activeLoot,     setActiveLoot]     = useState(null);
  const [activeBark,     setActiveBark]     = useState({ id: null, text: '' });
  const [nearbyEntity,   setNearbyEntity]   = useState(null);
  const [playerCoords,   setPlayerCoords]   = useState({ x: 640, y: 680, dir: 'DOWN' });
  const [currentTelemetry, setCurrentTelemetry] = useState(null);

  // Ref for entity ID comparison — prevents 60fps setState when entity hasn't changed.
  // This is the primary performance gate: Stage only re-renders when the entity
  // the player is near actually changes, not on every frame.
  const nearbyEntityIdRef = useRef(null);

  // Debounce ref for isMayaHidden — prevents 60fps setGameState while inside a hide zone
  const isMayaHiddenRef = useRef(false);

  // Terrain surface tracking — only dispatches to gameState when surface changes.
  const currentTerrainRef = useRef(null);

  // gameStateRef / nearbyEntityRef — give triggerInteraction always-fresh values without
  // adding them to useCallback deps. onInteractRef in Character updates via useEffect
  // (after paint); if gameState or nearbyEntity were closure deps, a state change could
  // leave the ref pointing to a stale callback in the narrow pre-commit window, causing
  // pendingGive to read as null and the dialogue path to fire instead.
  // Synchronous ref update during render — NOT via useEffect.
  // useEffect runs after the commit phase; in the window between render and commit,
  // the ref would still hold the previous value. Assigning directly during render
  // guarantees the ref is always current by the time any event handler fires.
  const gameStateRef    = useRef(gameState);
  const nearbyEntityRef = useRef(null);
  gameStateRef.current  = gameState;

  // NPC spawns read from mask_npcs.png.
  // Overrides spawnX/spawnY in the manifest so placement is done visually in Photoshop.
  // Falls back to manifest coordinates if the mask is missing or a color has no pixel.
  const [resolvedNPCs, setResolvedNPCs] = useState(manifest.npcs || {});

  // mask_npcs.png overrides disabled — manifest coordinates are authoritative
  // useEffect(() => {
  //   readNPCSpawns(`${manifest.path}/mask_npcs.png`, 1280, 800).then(spawns => {
  //     if (Object.keys(spawns).length === 0) return;
  //     setResolvedNPCs(prev => {
  //       const merged = { ...prev };
  //       Object.entries(merged).forEach(([colorKey, npc]) => {
  //         if (spawns[colorKey]) {
  //           merged[colorKey] = { ...npc, spawnX: spawns[colorKey].x, spawnY: spawns[colorKey].y };
  //         }
  //       });
  //       return merged;
  //     });
  //   });
  // }, [manifest.path]);

  // 1. SENSORY HOOK (Dual-Mask: logic + terrain)
  const { checkPixel, isReady } = useNavigation(
    `${manifest.path}/mask_logic.png`,
    `${manifest.path}/mask_terrain.png`
  );

  // Stable collision function passed to Character.
  // useCallback([checkPixel]) means this stabilizes after masks load (isReady → true).
  // Without this, an anonymous (x,y) => ... lambda would be a new reference every
  // Stage render, causing Character's checkCollisionRef update and potential loop churn.
  const checkCollision = useCallback(
    (x, y) => checkPixel(x, y, 1280, 800),
    [checkPixel]
  );

  // 2. DETECTION LOGIC — called 60fps from Character's rAF loop via onNearbyEntityRef.
  // useCallback([manifest, debugMode, setGameState]) ensures Character's ref stays
  // current when room or debug mode changes, without destabilizing the game loop.
  const handleEntityDetection = useCallback((navData, currentPos, isCrouching, facingDir) => {
    // Telemetry (debug only — no cost in production)
    if (debugMode) {
      setCurrentTelemetry(navData);
    }

    // Compute nearest interactive entity
    let found = null;

    // Directional interaction box — placed in front of Maya based on facing direction.
    // BOX_W: width perpendicular to facing. BOX_D: depth in the facing direction.
    const BOX_W = 60;
    const BOX_D = 70;
    const { x: mx, y: my } = currentPos;
    const dir = facingDir || 'DOWN';

    const box = (() => {
      switch (dir) {
        case 'UP':         return { x1: mx - BOX_W/2, y1: my - BOX_D, x2: mx + BOX_W/2, y2: my };
        case 'LEFT':       return { x1: mx - BOX_D,   y1: my - BOX_W/2, x2: mx,         y2: my + BOX_W/2 };
        case 'RIGHT':      return { x1: mx,           y1: my - BOX_W/2, x2: mx + BOX_D, y2: my + BOX_W/2 };
        case 'UP_LEFT':    return { x1: mx - BOX_D,   y1: my - BOX_D, x2: mx,           y2: my };
        case 'UP_RIGHT':   return { x1: mx,           y1: my - BOX_D, x2: mx + BOX_D,   y2: my };
        case 'DOWN_LEFT':  return { x1: mx - BOX_D,   y1: my,         x2: mx,           y2: my + BOX_D };
        case 'DOWN_RIGHT': return { x1: mx,           y1: my,         x2: mx + BOX_D,   y2: my + BOX_D };
        default:           return { x1: mx - BOX_W/2, y1: my,         x2: mx + BOX_W/2, y2: my + BOX_D }; // DOWN
      }
    })();

    const inBox = (px, py) => px >= box.x1 && px <= box.x2 && py >= box.y1 && py <= box.y2;

    // A. NPC — check if spawn point is inside the directional box
    const closestNPC = Object.values(resolvedNPCs).find(npc =>
      inBox(npc.spawnX, npc.spawnY)
    );

    // B. ENTITY — check if entity centre is inside the directional box
    const closestEntity = !closestNPC && Object.values(manifest.entities).find(ent =>
      inBox(ent.x, ent.y)
    );

    if (closestNPC) {
      found = { ...closestNPC, logicType: 'NPC' };
    } else if (closestEntity) {
      found = { ...closestEntity, logicType: 'ARTIFACT' };
    } else if (navData.type === 'EXIT') {
      found = { id: 'exit', name: 'Leave', logicType: 'EXIT' };
    }

    const newId  = found?.id ?? null;
    const prevId = nearbyEntityIdRef.current;

    // KEY GATE: Only commit to React state when the entity actually changes.
    // This stops the cycle: every frame while moving → nearbyEntity re-set → Stage re-renders.
    if (newId !== prevId) {
      nearbyEntityIdRef.current = newId;
      nearbyEntityRef.current   = found;
      setNearbyEntity(found);

      const updates = { nearbyEntity: found };
      if (found?.logicType === 'NPC') {
        updates.nearbyNPC = found;
      } else if (prevId !== null) {
        updates.nearbyNPC = null;
      }
      setGameState(p => ({ ...p, ...updates }));
    }

    // In debug mode: always update coords so the crosshair follows Maya continuously.
    // In production: only update when a prompt is visible (avoids 60fps re-renders).
    if (debugMode || found !== null) {
      setPlayerCoords({ x: currentPos.x, y: currentPos.y, dir: facingDir || 'DOWN' });
    }

    // Terrain surface tracking — only updates gameState when Maya crosses a surface boundary.
    // This is the hook point for footstep audio and speed modifiers.
    // mask_terrain.png currently reads all floor as "255,255,255" (wood floor default).
    // Paint distinct color zones on the mask and add entries to manifest.terrainSurfaces
    // to differentiate surfaces (carpet, grass, mud, etc.).
    // Auto-hide: Maya is hidden when crouching inside a HIDE_ZONE.
    // The ref gate prevents 60fps setGameState calls while the state is unchanged.
    const shouldBeHidden = navData.type === 'HIDE_ZONE' && isCrouching;
    if (shouldBeHidden !== isMayaHiddenRef.current) {
      isMayaHiddenRef.current = shouldBeHidden;
      setGameState(p => ({ ...p, isMayaHidden: shouldBeHidden }));
    }

    if (navData.terrain && navData.terrain !== currentTerrainRef.current) {
      currentTerrainRef.current = navData.terrain;
      const surface = manifest.terrainSurfaces?.[navData.terrain];
      if (surface) {
        setGameState(p => ({ ...p, currentTerrain: surface }));
      }
    }
  }, [manifest, resolvedNPCs, debugMode, setGameState]);

  // 3. THE ACTION ACTUATOR — [E] Talk/Search, [C] Hide
  // Both nearbyEntity and pendingGive are read from refs, NOT from the closure.
  // onInteractRef in Character.jsx is updated via useEffect which runs after paint.
  // Any React state in these deps would leave a stale callback in the narrow pre-commit
  // window — the ref is always synchronous and immune to that race.
  const triggerInteraction = useCallback((key) => {
    const entity = nearbyEntityRef.current;
    if (!entity) return;

    if (key === 'E') {
      if (entity.logicType === 'EXIT') {
        setGameState(prev => ({ ...prev, currentRoom: manifest.exitTo }));
        return;
      }

      if (entity.logicType === 'NPC') {
        // ── GIVE MODE ────────────────────────────────────────────────────────
        if (gameStateRef.current.pendingGive) {
          const item    = gameStateRef.current.pendingGive;
          const npcData = Object.values(manifest.npcs).find(n => n.id === entity.id);
          const specific = npcData?.gives?.[item.id];
          const suspCfg  = npcData?.gives?.suspicion;

          // Quest item — open a full dialogue instead of a bark
          if (specific?.giveDialogue) {
            setGameState(p => ({ ...p, pendingGive: null }));
            setActiveDialogue(specific.giveDialogue);
            return;
          }

          // Standard give — resolve bark text
          let barkText  = '...';
          let takesItem = false;
          let auraFails = false;
          let suspDelta = 0;

          if (specific) {
            barkText  = specific.text;
            takesItem = specific.takes;
          } else {
            const pool = npcData?.gives?.defaultBarks || ['...'];
            barkText   = pool[Math.floor(Math.random() * pool.length)];

            if (suspCfg) {
              const curSusp  = gameStateRef.current.npcSuspicion?.[entity.id] || 0;
              const nextSusp = curSusp + (suspCfg.gainPerGive ?? 1);
              suspDelta      = suspCfg.gainPerGive ?? 1;
              if (nextSusp >= suspCfg.threshold) {
                barkText  = suspCfg.failureBark;
                auraFails = true;
                suspDelta = -curSusp;
              } else if (nextSusp >= suspCfg.threshold - 1) {
                barkText = suspCfg.warningBark || barkText;
              }
            }
          }

          setActiveBark({ id: entity.id, text: barkText });
          setTimeout(() => setActiveBark({ id: null, text: '' }), 4000);

          setGameState(p => {
            const npcId   = entity.id;
            const curSusp = p.npcSuspicion?.[npcId] || 0;
            const next    = {
              ...p,
              pendingGive:  null,
              npcSuspicion: { ...(p.npcSuspicion || {}), [npcId]: Math.max(0, curSusp + suspDelta) },
              memories: [...(p.memories || []), {
                type:    auraFails ? 'AURA_FAIL' : 'GIVE',
                title:   `${entity.name} — ${item.name}`,
                content: barkText,
                took:    takesItem,
                ts:      Date.now(),
              }],
            };
            if (auraFails) next.integrity = Math.max(0, p.integrity - 25);
            if (takesItem) {
              const inv = Array.from({ length: 20 }, (_, i) => p.inventory[i] ?? null);
              const idx = inv.findIndex(it => it?.id === item.id);
              if (idx !== -1) inv[idx] = null;
              next.inventory = inv;
            }
            return next;
          });
          return;
        }

        // ── NORMAL NPC INTERACTION ───────────────────────────────────────────
        // Safety guard: never open dialogue while give mode is active.
        if (gameStateRef.current.pendingGive) return;
        if (entity.dialogueKey) {
          setActiveDialogue(entity.dialogueKey);
        } else if (entity.barks) {
          const b = entity.barks[Math.floor(Math.random() * entity.barks.length)];
          setActiveBark({ id: entity.id, text: b });
          setTimeout(() => setActiveBark({ id: null, text: '' }), 3000);
        }

      } else if (entity.logicType === 'ARTIFACT') {
        if (entity.type === 'CONTAINER') {
          setActiveLoot(entity);
          return;
        }
        setActiveArtifact(entity);
        if (entity.type === 'JOURNAL') {
          setGameState(p => ({
            ...p,
            memories:  [...(p.memories || []), { title: entity.name, content: entity.text }],
            integrity: Math.max(0, p.integrity + (entity.impact || 0)),
          }));
        }
      }
    }

    // [C] now only toggles crouch in Character — hiding is automatic on HIDE_ZONE entry
  }, [setGameState, manifest]);

  if (!isReady) return (
    <div style={{ color: '#d4af37', padding: '100px', fontFamily: 'serif', letterSpacing: '4px' }}>
      ESTABLISHING NEUROMIMETIC LINK...
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>

      <div
        id="world-container"
        style={{ position: 'absolute', width: 1280 * ZOOM, height: 800 * ZOOM, willChange: 'transform' }}
      >
        <DebugOverlay
          pos={playerCoords}
          manifest={manifest}
          active={debugMode}
          zoom={ZOOM}
          telemetry={currentTelemetry}
        />

        <img
          src={`${manifest.path}/base.jpg`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          alt=""
        />

        {/* NPCs — positions resolved from mask_npcs.png, falling back to manifest coords */}
        {Object.values(resolvedNPCs).map(npc => (
          <NPC
            key={npc.id}
            {...npc}
            zoom={ZOOM}
            activeBark={activeBark.id === npc.id ? activeBark.text : null}
          />
        ))}

        <Character
          initialPos={{ x: 640, y: 680 }}
          zoom={ZOOM}
          gameState={gameState}
          setGameState={setGameState}
          checkCollision={checkCollision}
          onNearbyEntity={handleEntityDetection}
          onInteract={triggerInteraction}
          activeUI={activeArtifact || activeDialogue || activeLoot}
        />

        {/* DEPTH OVERLAYS
            hidingOverlay:true → jumps to zIndex 9500 when Maya is hidden so she
            disappears visually under the furniture. Normal yDepth used otherwise. */}
        {manifest.overlays && manifest.overlays.map(ov => {
          const zIndex = (ov.hidingOverlay && gameState.isMayaHidden)
            ? 9500
            : ov.yDepth;
          return (
            <img
              key={ov.id}
              src={`${manifest.path}/${ov.filename}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex, pointerEvents: 'none' }}
              alt=""
            />
          );
        })}

      </div>

      {activeLoot && (
        <LootUI
          container={activeLoot}
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setActiveLoot(null)}
        />
      )}

      {activeDialogue && (
        <DialogueSystem
          dialogueKey={activeDialogue}
          gameState={gameState}
          setGameState={setGameState}
          onExit={() => setActiveDialogue(null)}
        />
      )}
    </div>
  );
};
