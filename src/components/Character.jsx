import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NPC_OBSERVATION, DEFAULT_OBSERVATION, XP_PER_LEVEL } from '../data/npcObservation';

// Returns the ability level for a given cumulative XP value
const computeAbilityLevel = (xp) => {
  for (let i = XP_PER_LEVEL.length - 1; i >= 1; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i;
  }
  return 1;
};

// --- !!! ARCHITECT'S LOCKED ASSET MATRIX - DO NOT ALTER !!! ---
const KINETIC_LOCKED_DATA = (dir, isMoving, isKneeling) => {
  const path = '/sprites/protagonist/';
  let src = `${path}down_idle.webm`;
  let flip = false;

  if (isKneeling) {
    if (isMoving) {
      if (dir.includes('UP')) src = `${path}crouch_walk_up.webm`;
      else src = `${path}crouch_walk_down.webm`;
      if (dir.includes('RIGHT')) flip = true;
    } else {
      if (dir === 'UP')                 src = `${path}crouch_idle_up.webm`;
      else if (dir === 'DOWN')          src = `${path}crouch_idle_left_down.webm`;
      else if (dir.includes('UP_LEFT')) src = `${path}crouch_up_left_idle.webm`;
      else if (dir.includes('UP_RIGHT')) { src = `${path}crouch_up_left_idle.webm`; flip = true; }
      else if (dir.includes('RIGHT'))   { src = `${path}crouch_idle_left.webm`; flip = true; }
      else                              src = `${path}crouch_idle_left.webm`;
    }
  } else if (isMoving) {
    if (dir === 'UP')         src = `${path}walk_up.webm`;
    else if (dir === 'DOWN')  src = `${path}walk_down.webm`;
    else if (dir === 'LEFT')  src = `${path}walk_left.webm`;
    else if (dir === 'RIGHT') { src = `${path}walk_left.webm`; flip = true; }
    else if (dir === 'UP_LEFT')    src = `${path}walk_up_left.webm`;
    else if (dir === 'UP_RIGHT')   { src = `${path}walk_up_left.webm`; flip = true; }
    else if (dir === 'DOWN_RIGHT') src = `${path}walk_down_right.webm`;
    else if (dir === 'DOWN_LEFT')  { src = `${path}walk_down_right.webm`; flip = true; }
  } else {
    if (dir === 'UP')         src = `${path}idle_up.webm`;
    else if (dir === 'DOWN')  src = `${path}down_idle.webm`;
    else if (dir === 'LEFT')  src = `${path}idle_left.webm`;
    else if (dir === 'RIGHT') { src = `${path}idle_left.webm`; flip = true; }
    else if (dir.includes('UP')) { src = `${path}idle_up_left.webm`; flip = dir.includes('RIGHT'); }
    else src = `${path}down_idle.webm`;
  }
  return { src, flip };
};

export const Character = ({
  initialPos, zoom, gameState, setGameState,
  checkCollision, onNearbyEntity, onInteract, activeUI
}) => {
  const pos        = useRef({ ...initialPos });
  const playerRef  = useRef(null);
  const keysPressed  = useRef({});
  const mousePressed = useRef({ right: false });

  // --- MOTION REFS ---
  // All game-loop state lives in refs. This decouples the 60fps loop from React's
  // render cycle entirely. The loop never restarts due to direction/movement changes.
  const dirRef         = useRef('DOWN');
  const isMovingRef    = useRef(false);
  const isKneelingRef  = useRef(false);
  const isInHideZoneRef = useRef(false); // tracks whether Maya is currently inside a HIDE_ZONE
  const flipRef        = useRef(false);
  const animSrcRef     = useRef(KINETIC_LOCKED_DATA('DOWN', false, false).src);

  // --- ANIMATION STATE ---
  // The ONLY React state in the game loop. Triggers a re-render exclusively when
  // the animation clip src changes (e.g., walk → idle, left → right). Not 60fps.
  const [animSrc, setAnimSrc] = useState(animSrcRef.current);

  // --- GAMEPAD REFS ---
  const gpPrevButtons = useRef([]);
  const gpSprintRef   = useRef(false);
  const gpLoggedRef   = useRef(false);

  // --- VIRTUAL CURSOR (cursor mode) ---
  // X / Square (button 2) toggles cursor mode.  Left stick moves the crosshair.
  // A = left-click, B = right-click, X again = exit.
  // Renders via a portal so it lives in physical screen space outside GameViewport's transform.
  const cursorModeRef  = useRef(false);
  const [cursorMode, setCursorMode] = useState(false);
  const cursorPosRef   = useRef({ x: 0, y: 0 });
  const cursorDivRef   = useRef(null);
  const prevHoverRef   = useRef(null); // last element under the virtual cursor
  const gpADownPosRef  = useRef(null); // screen pos where A was pressed (null = not held)

  // --- CALLBACK REFS ---
  // Stable references to all parent callbacks. The game loop captures these refs
  // once (at mount), but always calls the latest version. No stale closures.
  const onNearbyEntityRef  = useRef(onNearbyEntity);
  const onInteractRef      = useRef(onInteract);
  const checkCollisionRef  = useRef(checkCollision);
  const gameStateRef       = useRef(gameState);
  const setGameStateRef    = useRef(setGameState);

  // Synchronous ref updates during render — guarantees fresh values in the rAF loop
  // without any post-commit delay. Callback refs still use useEffect because they
  // only change when parent recreates them (rare), not on every render.
  gameStateRef.current    = gameState;
  setGameStateRef.current = setGameState;

  useEffect(() => { onNearbyEntityRef.current  = onNearbyEntity; },  [onNearbyEntity]);
  useEffect(() => { onInteractRef.current      = onInteract; },      [onInteract]);
  useEffect(() => { checkCollisionRef.current  = checkCollision; },  [checkCollision]);

  // --- ANIMATION UPDATER ---
  // Called from the game loop and from the keydown handler.
  // Only triggers a React re-render when the video src actually changes.
  const updateAnimation = (dir, isMoving, isKneeling) => {
    const { src, flip } = KINETIC_LOCKED_DATA(dir, isMoving, isKneeling);
    flipRef.current = flip;
    if (src !== animSrcRef.current) {
      animSrcRef.current = src;
      setAnimSrc(src);
    }
  };

  // --- INPUT HANDLER ---
  // Stable (empty deps). All callbacks accessed via refs.
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Mouse events share this handler for right-click tracking only.
      // Any mousedown falls through here — guard ALL of them before touching e.key.
      if (e.type === 'mousedown') {
        if (e.button === 2) {
          mousePressed.current.right = true;
          // Social Crypsis: right-click press toggles the aura on/off
          if (gameStateRef.current.equippedAbility === 'social_crypsis') {
            setGameStateRef.current(p => ({
              ...p,
              activeAbility: p.activeAbility === 'social_crypsis' ? 'NONE' : 'social_crypsis',
            }));
          }
        }
        return;
      }
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      // e.repeat is true when the key is held and the browser fires a repeat event.
      // Without this guard: give fires on press-1 (clears pendingGive), React renders,
      // then press-2 (repeat) sees pendingGive=null and opens dialogue instead.
      if (k === 'e' && !e.repeat) onInteractRef.current('E');
      if (k === 'c') {
        const newKneeling = !isKneelingRef.current;
        isKneelingRef.current = newKneeling;
        updateAnimation(dirRef.current, isMovingRef.current, newKneeling);
      }
    };
    const handleKeyUp = (e) => {
      if (e.type === 'mouseup') {
        if (e.button === 2) mousePressed.current.right = false;
        return;
      }
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    const handleGamepadConnected = (e) => {
      console.log(`[Gamepad] Connected: "${e.gamepad.id}" — mapping: "${e.gamepad.mapping}" — ${e.gamepad.buttons.length} buttons, ${e.gamepad.axes.length} axes`);
      gpLoggedRef.current = false; // allow re-log on reconnect
    };
    const handleGamepadDisconnected = (e) => {
      console.log(`[Gamepad] Disconnected: "${e.gamepad.id}"`);
      gpPrevButtons.current = [];
      gpSprintRef.current   = false;
      gpLoggedRef.current   = false;
    };

    window.addEventListener('keydown',  handleKeyDown);
    window.addEventListener('keyup',    handleKeyUp);
    window.addEventListener('mousedown', handleKeyDown);
    window.addEventListener('mouseup',  handleKeyUp);
    window.addEventListener('gamepadconnected',    handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    return () => {
      window.removeEventListener('keydown',  handleKeyDown);
      window.removeEventListener('keyup',    handleKeyUp);
      window.removeEventListener('mousedown', handleKeyDown);
      window.removeEventListener('mouseup',  handleKeyUp);
      window.removeEventListener('gamepadconnected',    handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []); // Empty deps — fully ref-driven

  // --- AUTO CURSOR ON LOOT / ARTIFACT OPEN ---
  // When Stage opens a container or artifact UI it fires 'gp-ui-opened'.
  // If a standard gamepad is present we silently activate cursor mode so the
  // player can immediately interact without pressing X first.
  // On 'gp-ui-closed' we deactivate cursor mode (unless the player already
  // turned it off manually, in which case cursorModeRef is already false).
  useEffect(() => {
    const activate = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const hasGamepad = Array.from(pads).some(p => p?.mapping === 'standard')
        || Array.from(pads).some(p => p !== null);
      if (!hasGamepad || cursorModeRef.current) return;
      cursorModeRef.current = true;
      setCursorMode(true);
      cursorPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      document.body.style.cursor = 'none';
      window.dispatchEvent(new CustomEvent('gp-cursor-mode', { detail: true }));
    };

    const deactivate = () => {
      if (!cursorModeRef.current) return;
      cursorModeRef.current = false;
      setCursorMode(false);
      document.body.style.cursor = '';
      if (prevHoverRef.current) {
        prevHoverRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
        prevHoverRef.current = null;
      }
      if (gpADownPosRef.current) {
        window.dispatchEvent(new MouseEvent('mouseup', { bubbles: false, button: 0 }));
        gpADownPosRef.current = null;
      }
      window.dispatchEvent(new CustomEvent('gp-cursor-mode', { detail: false }));
    };

    window.addEventListener('gp-ui-opened', activate);
    window.addEventListener('gp-ui-closed', deactivate);
    return () => {
      window.removeEventListener('gp-ui-opened', activate);
      window.removeEventListener('gp-ui-closed', deactivate);
    };
  }, []); // empty deps — all state accessed via refs

  // --- GAME LOOP ---
  // Deps: [activeUI, zoom] only.
  // activeUI pauses movement (dialogue/artifact open). zoom changes are rare (never at runtime).
  // The loop is NEVER restarted due to movement, direction, or kneeling changes.
  useEffect(() => {
    let frame;

    const loop = () => {
      // ── Gamepad polling — runs every frame, even when a UI is open ────────────
      // Cursor mode must remain responsive during loot / artifact UIs.
      // Character movement (gpDx/gpDy) is only consumed inside the !activeUI block below.
      let gpDx = 0, gpDy = 0;
      {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        let gp = null;
        for (let i = 0; i < pads.length; i++) { if (pads[i]?.mapping === 'standard') { gp = pads[i]; break; } }
        if (!gp) { for (let i = 0; i < pads.length; i++) { if (pads[i]) { gp = pads[i]; break; } } }

        if (gp) {
          if (!gpLoggedRef.current) {
            gpLoggedRef.current = true;
            console.log(`[Gamepad] Active: "${gp.id}" mapping="${gp.mapping}" axes=${gp.axes.length} buttons=${gp.buttons.length}`);
            console.log('[Gamepad] Axis values:', Array.from(gp.axes).map((v, i) => `${i}:${v.toFixed(2)}`).join(' '));
          }

          const DEAD = 0.15;
          const prev = gpPrevButtons.current;
          const btnPressed  = (idx) => !!(gp.buttons[idx]?.pressed) || (gp.buttons[idx]?.value ?? 0) > 0.5;
          const justPressed = (idx) => btnPressed(idx) && !prev[idx];
          const rtHeld      = btnPressed(7) || btnPressed(5);
          const rtJustOn    = justPressed(7) || justPressed(5);

          // X / Square (2) — toggle cursor mode
          if (justPressed(2)) {
            const entering = !cursorModeRef.current;
            cursorModeRef.current = entering;
            setCursorMode(entering);
            window.dispatchEvent(new CustomEvent('gp-cursor-mode', { detail: entering }));
            if (entering) {
              cursorPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
              document.body.style.cursor = 'none';
            } else {
              document.body.style.cursor = '';
              if (prevHoverRef.current) {
                prevHoverRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, cancelable: true }));
                prevHoverRef.current.dispatchEvent(new MouseEvent('mouseout',   { bubbles: true,  cancelable: true }));
                prevHoverRef.current = null;
              }
              if (gpADownPosRef.current) {
                window.dispatchEvent(new MouseEvent('mouseup', { bubbles: false, button: 0 }));
                gpADownPosRef.current = null;
              }
            }
          }

          if (cursorModeRef.current) {
            // ── CURSOR MODE — left stick drives crosshair ────────────────────
            const CURSOR_SPEED = 12;
            const cx = Math.abs(gp.axes[0]) > DEAD ? gp.axes[0] : 0;
            const cy = Math.abs(gp.axes[1]) > DEAD ? gp.axes[1] : 0;
            cursorPosRef.current.x = Math.max(0, Math.min(window.innerWidth  - 1, cursorPosRef.current.x + cx * CURSOR_SPEED));
            cursorPosRef.current.y = Math.max(0, Math.min(window.innerHeight - 1, cursorPosRef.current.y + cy * CURSOR_SPEED));

            if (cursorDivRef.current) {
              cursorDivRef.current.style.left = cursorPosRef.current.x + 'px';
              cursorDivRef.current.style.top  = cursorPosRef.current.y + 'px';
            }

            const { x: cx2, y: cy2 } = cursorPosRef.current;
            const elUnder = document.elementFromPoint(cx2, cy2);

            if (elUnder !== prevHoverRef.current) {
              const from = prevHoverRef.current, to = elUnder;
              if (from) {
                from.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, cancelable: true, clientX: cx2, clientY: cy2, relatedTarget: to }));
                from.dispatchEvent(new MouseEvent('mouseout',   { bubbles: true,  cancelable: true, clientX: cx2, clientY: cy2, relatedTarget: to }));
              }
              if (to) {
                to.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true, clientX: cx2, clientY: cy2, relatedTarget: from }));
                to.dispatchEvent(new MouseEvent('mouseover',  { bubbles: true,  cancelable: true, clientX: cx2, clientY: cy2, relatedTarget: from }));
              }
              prevHoverRef.current = to;
            }

            const moveOpts = { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2 };
            if (elUnder) elUnder.dispatchEvent(new MouseEvent('mousemove', moveOpts));
            window.dispatchEvent(new MouseEvent('mousemove', { ...moveOpts, bubbles: false }));

            const aJustReleased = !btnPressed(0) && prev[0];
            if (justPressed(0)) {
              if (elUnder) elUnder.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2, button: 0 }));
              gpADownPosRef.current = { x: cx2, y: cy2 };
            }
            if (aJustReleased) {
              if (elUnder) elUnder.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2, button: 0 }));
              window.dispatchEvent(new MouseEvent('mouseup', { bubbles: false, clientX: cx2, clientY: cy2, button: 0 }));
              if (gpADownPosRef.current) {
                const dist = Math.hypot(cx2 - gpADownPosRef.current.x, cy2 - gpADownPosRef.current.y);
                if (dist < 10 && elUnder) elUnder.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2, button: 0 }));
                gpADownPosRef.current = null;
              }
            }

            if (justPressed(1)) {
              if (elUnder) {
                elUnder.dispatchEvent(new MouseEvent('mousedown',   { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2, button: 2 }));
                elUnder.dispatchEvent(new MouseEvent('mouseup',     { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2, button: 2 }));
                elUnder.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: cx2, clientY: cy2 }));
              }
            }

            gpDx = 0; gpDy = 0;

          } else {
            // ── NORMAL MODE ──────────────────────────────────────────────────
            gpDx = gp.axes[0] > DEAD ? 1 : gp.axes[0] < -DEAD ? -1 : 0;
            gpDy = gp.axes[1] > DEAD ? 1 : gp.axes[1] < -DEAD ? -1 : 0;
            if (gp.buttons[12]?.pressed) gpDy = -1;
            if (gp.buttons[13]?.pressed) gpDy =  1;
            if (gp.buttons[14]?.pressed) gpDx = -1;
            if (gp.buttons[15]?.pressed) gpDx =  1;

            gpSprintRef.current = !!(gp.buttons[4]?.pressed) || (gp.buttons[6]?.value ?? 0) > 0.5;

            if (!activeUI) {
              if (justPressed(0)) onInteractRef.current('E');
              if (justPressed(1)) {
                const newKneeling = !isKneelingRef.current;
                isKneelingRef.current = newKneeling;
                updateAnimation(dirRef.current, isMovingRef.current, newKneeling);
              }
              if (rtJustOn && gameStateRef.current.equippedAbility === 'social_crypsis') {
                setGameStateRef.current(p => ({
                  ...p,
                  activeAbility: p.activeAbility === 'social_crypsis' ? 'NONE' : 'social_crypsis',
                }));
              }
              mousePressed.current.right = rtHeld;
            }
          }

          // These work in all modes
          if (justPressed(9)) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
          if (justPressed(8)) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j',   bubbles: true, cancelable: true }));
          if (justPressed(3)) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i',   bubbles: true, cancelable: true }));

          gpPrevButtons.current = Array.from(gp.buttons).map(
            b => !!(b?.pressed) || (b?.value ?? 0) > 0.5
          );
        } else {
          gpSprintRef.current = false;
        }
      }

      if (!activeUI) {
        // ── Mimicry: right-click hold near an NPC observes them ─────────────────
        if (mousePressed.current.right
            && gameStateRef.current.nearbyNPC
            && gameStateRef.current.equippedAbility === 'mimicry') {
          setGameStateRef.current(p => {
            const npcId = p.nearbyNPC.id;
            const req   = NPC_OBSERVATION[npcId] || DEFAULT_OBSERVATION;
            const prev  = p.observedNPCs[npcId]  || 0;
            if (prev >= 1.0) return p; // fully observed — nothing more to drain

            const increment  = 1 / req.timeRequired;
            const next       = Math.min(1, prev + increment);
            const justDone   = prev < 1 && next >= 1;

            // Ordinary NPCs unlock immediately; special NPCs need items+knowledge first
            const readyToUnlock = justDone
              && !req.special
              && !p.unlockedMorphs.find(m => m.id === npcId);
            const newUnlocked = readyToUnlock
              ? [...p.unlockedMorphs, { id: npcId, name: p.nearbyNPC.name || npcId }]
              : p.unlockedMorphs;

            // Gain Mimicry XP while observing
            const newXP    = (p.abilityXP?.mimicry || 0) + 0.05;
            const newLevel = computeAbilityLevel(newXP);

            return {
              ...p,
              observedNPCs:  { ...p.observedNPCs, [npcId]: next },
              unlockedMorphs: newUnlocked,
              abilityXP:     { ...(p.abilityXP || {}), mimicry: newXP },
              abilityLevels: { ...(p.abilityLevels || {}), mimicry: newLevel },
            };
          });
        }

        // ── Social Crypsis: drain Morph Stability while the aura is active ──────
        if (gameStateRef.current.activeAbility === 'social_crypsis') {
          setGameStateRef.current(p => {
            const newStability = Math.max(0, p.morphStability - 0.04);
            const newXP        = (p.abilityXP?.social_crypsis || 0) + 0.01;
            const newLevel     = computeAbilityLevel(newXP);
            // Deactivate automatically if Morph Stability collapses
            return {
              ...p,
              morphStability: newStability,
              activeAbility:  newStability <= 0 ? 'NONE' : p.activeAbility,
              abilityXP:      { ...(p.abilityXP || {}), social_crypsis: newXP },
              abilityLevels:  { ...(p.abilityLevels || {}), social_crypsis: newLevel },
            };
          });
        }

        const gpMoving = gpDx !== 0 || gpDy !== 0;
        let dx = gpDx, dy = gpDy;
        if (keysPressed.current['w']) dy -= 1;
        if (keysPressed.current['s']) dy += 1;
        if (keysPressed.current['a']) dx -= 1;
        if (keysPressed.current['d']) dx += 1;
        const moving = dx !== 0 || dy !== 0;

        let res;
        if (moving) {
          const len = Math.sqrt(dx * dx + dy * dy);
          dx /= len; dy /= len;
          const baseSpeed = gpMoving ? 4.4 : 2.2;
          const speed = isKneelingRef.current ? 1.1 : (keysPressed.current['shift'] || gpSprintRef.current ? 4.0 : baseSpeed);
          const nX = pos.current.x + dx * speed;
          const nY = pos.current.y + dy * speed;
          res = checkCollisionRef.current(nX, nY);
          // WALK and EXIT and HIDE_ZONE allow movement.
          // INTERACT is solid — Maya is stopped by the object but [E] prompt appears.
          // BLOCK is a wall — hard stop with no prompt.
          // HIDE_ZONE entry is blocked while standing — Maya must crouch to go under furniture.
          // Exception: if Maya is already on a HIDE_ZONE pixel (mask painted wider than intended),
          // allow movement so she isn't permanently trapped.
          const canMove = res.type === 'WALK' || res.type === 'EXIT' ||
              (res.type === 'HIDE_ZONE' && isKneelingRef.current);
          if (canMove) {
            pos.current.x = nX; pos.current.y = nY;
            // Only update hide zone tracking when Maya actually moves into/out of the zone.
            // Checking the proposed position (res) when movement is rejected would set this
            // true while Maya stands at the boundary — blocking [C] uncrouch incorrectly.
            isInHideZoneRef.current = res.type === 'HIDE_ZONE';
          }

          // Compute new direction from input vector
          let newDir = dirRef.current;
          if      (dy > 0) newDir = dx > 0 ? 'DOWN_RIGHT' : dx < 0 ? 'DOWN_LEFT' : 'DOWN';
          else if (dy < 0) newDir = dx > 0 ? 'UP_RIGHT'   : dx < 0 ? 'UP_LEFT'   : 'UP';
          else if (dx > 0) newDir = 'RIGHT';
          else             newDir = 'LEFT';

          // Only recompute animation when direction or moving state actually changes
          if (newDir !== dirRef.current || !isMovingRef.current) {
            dirRef.current    = newDir;
            isMovingRef.current = true;
            updateAnimation(newDir, true, isKneelingRef.current);
          }
        } else {
          // Check collision at current position — CRITICAL: detection must fire when stationary.
          res = checkCollisionRef.current(pos.current.x, pos.current.y);
          // When stationary, reflect actual position in the hide zone tracker
          isInHideZoneRef.current = res.type === 'HIDE_ZONE';

          // Transition to idle animation once, not every frame
          if (isMovingRef.current) {
            isMovingRef.current = false;
            updateAnimation(dirRef.current, false, isKneelingRef.current);
          }
        }

        // Always fire entity detection — passes crouching state and facing direction
        onNearbyEntityRef.current(res, pos.current, isKneelingRef.current, dirRef.current);
      }

      // Direct DOM manipulation for position & camera — bypasses React entirely at 60fps
      if (playerRef.current) {
        playerRef.current.style.transform = [
          `translate3d(${pos.current.x * zoom}px, ${pos.current.y * zoom}px, 0)`,
          `translate(-50%, -100%)`,
          `scaleX(${flipRef.current ? -1 : 1})`,
        ].join(' ');
        playerRef.current.style.zIndex = Math.floor(pos.current.y);
      }

      const world = document.getElementById('world-container');
      if (world) {
        const camX = Math.max(0, Math.min(
          pos.current.x * zoom - window.innerWidth  / 2,
          1280 * zoom - window.innerWidth
        ));
        const camY = Math.max(0, Math.min(
          pos.current.y * zoom - window.innerHeight / 2,
          800  * zoom - window.innerHeight
        ));
        world.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [activeUI, zoom]); // Minimal, stable deps

  return (
    <>
      <div ref={playerRef} style={{ position: 'absolute', width: 85 * zoom, pointerEvents: 'none' }}>
        <video
          key={animSrc}
          autoPlay loop muted playsInline
          onCanPlay={(e) => { e.currentTarget.playbackRate = isMovingRef.current ? 1.0 : 0.8; }}
          style={{ width: '100%' }}
        >
          <source src={animSrc} type="video/webm" />
        </video>
      </div>

      {/* Virtual cursor — portal to body so it renders in physical screen space, not GameViewport scale */}
      {cursorMode && createPortal(
        <div
          ref={cursorDivRef}
          style={{
            position: 'fixed',
            left: cursorPosRef.current.x,
            top:  cursorPosRef.current.y,
            width: 0, height: 0,
            pointerEvents: 'none',
            zIndex: 999999,
          }}
        >
          {/* Crosshair arms */}
          <div style={{ position: 'absolute', width: 1, height: 18, background: '#fff', left: 0, top: -9,  opacity: 0.9, boxShadow: '0 0 2px rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'absolute', width: 1, height: 18, background: '#fff', left: 0, top:  -9, opacity: 0.9, transform: 'rotate(90deg)', boxShadow: '0 0 2px rgba(0,0,0,0.8)' }} />
          {/* Centre dot */}
          <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#fff', left: -2.5, top: -2.5, boxShadow: '0 0 3px rgba(0,0,0,0.9)' }} />
          {/* Outer ring */}
          <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.7)', left: -9, top: -9, boxShadow: '0 0 4px rgba(0,0,0,0.7)' }} />
        </div>,
        document.body
      )}
    </>
  );
};
