import React, { useState, useEffect, useRef } from 'react';

// --- !!! ARCHITECT'S LOCKED ASSET MATRIX - DO NOT ALTER !!! ---
const KINETIC_LOCKED_DATA = (dir, isMoving, isKneeling, isJumping) => {
  const path = '/sprites/protagonist/';
  let src = `${path}down_idle.webm`;
  let flip = false;

  if (isKneeling) {
    if (isMoving) {
        if (dir.includes('UP')) src = `${path}crouch_walk_up.webm`;
        else src = `${path}crouch_walk_down.webm`;
        if (dir.includes('RIGHT')) flip = true;
    } else {
        if (dir === 'UP') src = `${path}crouch_idle_up.webm`;
        else if (dir === 'DOWN') src = `${path}crouch_idle_left_down.webm`;
        else if (dir.includes('UP_LEFT')) src = `${path}crouch_up_left_idle.webm`;
        else if (dir.includes('UP_RIGHT')) { src = `${path}crouch_up_left_idle.webm`; flip = true; }
        else if (dir.includes('RIGHT')) { src = `${path}crouch_idle_left.webm`; flip = true; }
        else src = `${path}crouch_idle_left.webm`;
    }
  } else if (isMoving) {
    if (dir === 'UP') src = `${path}walk_up.webm`;
    else if (dir === 'DOWN') src = `${path}walk_down.webm`;
    else if (dir === 'LEFT') src = `${path}walk_left.webm`;
    else if (dir === 'RIGHT') { src = `${path}walk_left.webm`; flip = true; }
    else if (dir === 'UP_LEFT') src = `${path}walk_up_left.webm`;
    else if (dir === 'UP_RIGHT') { src = `${path}walk_up_left.webm`; flip = true; }
    else if (dir === 'DOWN_RIGHT') src = `${path}walk_down_right.webm`;
    else if (dir === 'DOWN_LEFT') { src = `${path}walk_down_right.webm`; flip = true; }
  } else {
    if (dir === 'UP') src = `${path}idle_up.webm`;
    else if (dir === 'DOWN') src = `${path}down_idle.webm`;
    else if (dir === 'LEFT') src = `${path}idle_left.webm`;
    else if (dir === 'RIGHT') { src = `${path}idle_left.webm`; flip = true; }
    else if (dir.includes('UP')) { src = `${path}idle_up_left.webm`; flip = dir.includes('RIGHT'); }
    else src = `${path}down_idle.webm`;
  }
  return { src, flip };
};

export const Character = ({ initialPos, zoom, gameState, setGameState, checkCollision, onNearbyEntity, onInteract, activeUI }) => {
  const pos = useRef(initialPos);
  const playerRef = useRef(null);
  const keysPressed = useRef({});
  const mousePressed = useRef({ right: false });
  const [dir, setDir] = useState('DOWN');
  const [isMoving, setIsMoving] = useState(false);
  const [isKneeling, setIsKneeling] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.type === 'mousedown' && e.button === 2) mousePressed.current.right = true;
      else if (e.type === 'keydown') {
       // Inside handleKeyDown in Character.jsx
const k = e.key.toLowerCase(); 
keysPressed.current[k] = true;
if (k === 'e') onInteract('E'); // Signal Stage to search/talk
if (k === 'c') onInteract('C'); // Signal Stage to hide
      }
    };
    const handleKeyUp = (e) => {
      if (e.type === 'mouseup' && e.button === 2) mousePressed.current.right = false;
      else if (e.type === 'keyup') keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleKeyDown); window.addEventListener('mouseup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleKeyDown); window.removeEventListener('mouseup', handleKeyUp);
    };
  }, [onInteract]);

  useEffect(() => {
    let frame;
    const loop = () => {
      if (activeUI) { frame = requestAnimationFrame(loop); return; }
      if (mousePressed.current.right && gameState.nearbyNPC) {
        setGameState(p => ({...p, integrity: Math.max(0, p.integrity - 0.08), observedNPCs: {...p.observedNPCs, [p.nearbyNPC.id]: Math.min(1, (p.observedNPCs[p.nearbyNPC.id]||0) + 0.003)}}));
      }
      let dx = 0, dy = 0;
      if (keysPressed.current['w']) dy -= 1; if (keysPressed.current['s']) dy += 1;
      if (keysPressed.current['a']) dx -= 1; if (keysPressed.current['d']) dx += 1;
      const moving = dx !== 0 || dy !== 0; setIsMoving(moving);
      if (moving) {
        if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
        const speed = isKneeling ? 1.1 : (keysPressed.current['shift'] ? 4.0 : 2.2);
        const nX = pos.current.x + (dx * speed); const nY = pos.current.y + (dy * speed);
        const res = checkCollision(nX, nY);
        if (res.type !== 'BLOCK') { pos.current.x = nX; pos.current.y = nY; }
        if (dy > 0) setDir(dx > 0 ? 'DOWN_RIGHT' : dx < 0 ? 'DOWN_LEFT' : 'DOWN');
        else if (dy < 0) setDir(dx > 0 ? 'UP_RIGHT' : dx < 0 ? 'UP_LEFT' : 'UP');
        else if (dx > 0) setDir('RIGHT'); else if (dx < 0) setDir('LEFT');
        onNearbyEntity(res, pos.current);
      }
      if (playerRef.current) {
        const { flip } = KINETIC_LOCKED_DATA(dir, moving, isKneeling, false);
        playerRef.current.style.transform = `translate3d(${pos.current.x * zoom}px, ${pos.current.y * zoom}px, 0) translate(-50%, -100%) scaleX(${flip ? -1 : 1})`;
        playerRef.current.style.zIndex = Math.floor(pos.current.y);
      }
      const world = document.getElementById('world-container');
      if (world) {
        const camX = Math.max(0, Math.min(pos.current.x * zoom - window.innerWidth / 2, (1280 * zoom) - window.innerWidth));
        const camY = Math.max(0, Math.min(pos.current.y * zoom - window.innerHeight / 2, (800 * zoom) - window.innerHeight));
        world.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [activeUI, zoom, isKneeling, gameState.nearbyNPC, gameState.integrity, dir, isMoving]);

  const { src } = KINETIC_LOCKED_DATA(dir, isMoving, isKneeling, false);

  return (
    <div ref={playerRef} style={{ position: 'absolute', width: 85 * zoom, pointerEvents: 'none' }}>
      <video key={src} autoPlay loop muted playsInline onCanPlay={(e) => e.currentTarget.playbackRate = isMoving ? 1.0 : 0.8} style={{ width: '100%' }}>
        <source src={src} type="video/webm" />
      </video>
    </div>
  );
};