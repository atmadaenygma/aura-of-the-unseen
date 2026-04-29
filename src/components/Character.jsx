import React, { useState, useEffect, useRef } from 'react';

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
  const dirRef       = useRef('DOWN');
  const isMovingRef  = useRef(false);
  const isKneelingRef = useRef(false);
  const flipRef      = useRef(false);
  const animSrcRef   = useRef(KINETIC_LOCKED_DATA('DOWN', false, false).src);

  // --- ANIMATION STATE ---
  // The ONLY React state in the game loop. Triggers a re-render exclusively when
  // the animation clip src changes (e.g., walk → idle, left → right). Not 60fps.
  const [animSrc, setAnimSrc] = useState(animSrcRef.current);

  // --- CALLBACK REFS ---
  // Stable references to all parent callbacks. The game loop captures these refs
  // once (at mount), but always calls the latest version. No stale closures.
  const onNearbyEntityRef  = useRef(onNearbyEntity);
  const onInteractRef      = useRef(onInteract);
  const checkCollisionRef  = useRef(checkCollision);
  const gameStateRef       = useRef(gameState);
  const setGameStateRef    = useRef(setGameState);

  useEffect(() => { onNearbyEntityRef.current  = onNearbyEntity; },  [onNearbyEntity]);
  useEffect(() => { onInteractRef.current      = onInteract; },      [onInteract]);
  useEffect(() => { checkCollisionRef.current  = checkCollision; },  [checkCollision]);
  useEffect(() => { gameStateRef.current       = gameState; },       [gameState]);
  useEffect(() => { setGameStateRef.current    = setGameState; },    [setGameState]);

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
      if (e.type === 'mousedown' && e.button === 2) { mousePressed.current.right = true; return; }
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      if (k === 'e') onInteractRef.current('E');
      if (k === 'c') {
        const newKneeling = !isKneelingRef.current;
        isKneelingRef.current = newKneeling;
        // Update animation immediately on kneel toggle, don't wait for next frame
        updateAnimation(dirRef.current, isMovingRef.current, newKneeling);
        onInteractRef.current('C'); // Signal Stage to toggle isMayaHidden if near a HIDE_ZONE
      }
    };
    const handleKeyUp = (e) => {
      if (e.type === 'mouseup' && e.button === 2) { mousePressed.current.right = false; return; }
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown',  handleKeyDown);
    window.addEventListener('keyup',    handleKeyUp);
    window.addEventListener('mousedown', handleKeyDown);
    window.addEventListener('mouseup',  handleKeyUp);
    return () => {
      window.removeEventListener('keydown',  handleKeyDown);
      window.removeEventListener('keyup',    handleKeyUp);
      window.removeEventListener('mousedown', handleKeyDown);
      window.removeEventListener('mouseup',  handleKeyUp);
    };
  }, []); // Empty deps — fully ref-driven

  // --- GAME LOOP ---
  // Deps: [activeUI, zoom] only.
  // activeUI pauses movement (dialogue/artifact open). zoom changes are rare (never at runtime).
  // The loop is NEVER restarted due to movement, direction, or kneeling changes.
  useEffect(() => {
    let frame;

    const loop = () => {
      if (!activeUI) {
        // Right-click Observation mechanic — drains Integrity, builds morph knowledge
        if (mousePressed.current.right && gameStateRef.current.nearbyNPC) {
          setGameStateRef.current(p => ({
            ...p,
            integrity: Math.max(0, p.integrity - 0.08),
            observedNPCs: {
              ...p.observedNPCs,
              [p.nearbyNPC.id]: Math.min(1, (p.observedNPCs[p.nearbyNPC.id] || 0) + 0.003)
            }
          }));
        }

        let dx = 0, dy = 0;
        if (keysPressed.current['w']) dy -= 1;
        if (keysPressed.current['s']) dy += 1;
        if (keysPressed.current['a']) dx -= 1;
        if (keysPressed.current['d']) dx += 1;
        const moving = dx !== 0 || dy !== 0;

        let res;
        if (moving) {
          if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
          const speed = isKneelingRef.current ? 1.1 : (keysPressed.current['shift'] ? 4.0 : 2.2);
          const nX = pos.current.x + dx * speed;
          const nY = pos.current.y + dy * speed;
          res = checkCollisionRef.current(nX, nY);
          // WALK and EXIT and HIDE_ZONE allow movement.
          // INTERACT is solid — Maya is stopped by the object but [E] prompt appears.
          // BLOCK is a wall — hard stop with no prompt.
          if (res.type === 'WALK' || res.type === 'EXIT' || res.type === 'HIDE_ZONE') {
            pos.current.x = nX; pos.current.y = nY;
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
          // Without this, the [E] prompt vanishes the moment Maya stops walking near an NPC.
          res = checkCollisionRef.current(pos.current.x, pos.current.y);

          // Transition to idle animation once, not every frame
          if (isMovingRef.current) {
            isMovingRef.current = false;
            updateAnimation(dirRef.current, false, isKneelingRef.current);
          }
        }

        // Always fire entity detection — covers both moving and stationary states
        onNearbyEntityRef.current(res, pos.current);
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
  );
};
