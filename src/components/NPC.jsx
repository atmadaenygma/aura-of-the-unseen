import React from 'react';

export const NPC = ({ id, name, assetPath, spawnX, spawnY, zoom, activeBark, scale = 1 }) => {
  // 1. CRITICAL SAFETY GUARD: If coordinates are missing, don't render.
  if (spawnX === undefined || spawnY === undefined) return null;

  const SPRITE_SIZE = 110 * scale;

  return (
    <div style={{
      position: 'absolute',
      left: 0, top: 0,
      width: `${SPRITE_SIZE * zoom}px`,
      transform: `translate3d(${spawnX * zoom}px, ${spawnY * zoom}px, 0) translate(-50%, -100%)`,
      zIndex: Math.floor(spawnY),
      pointerEvents: 'none',
      willChange: 'transform'
    }}>
      {activeBark && (
        <div style={{
          position: 'absolute', top: -70, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)', color: '#000', padding: '6px 12px',
          borderRadius: '2px', fontSize: '11px', fontWeight: 'bold', width: '140px',
          textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.6)', fontFamily: 'serif', border: '1px solid #000'
        }}>
          "{activeBark}"
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid white', margin: '2px auto 0' }} />
        </div>
      )}
      <video autoPlay loop muted playsInline style={{ width: '100%', height: 'auto', display: 'block' }}>
        <source src={assetPath} type="video/webm" />
      </video>
    </div>
  );
};