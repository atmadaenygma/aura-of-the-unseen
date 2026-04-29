import React from 'react';
import { createPortal } from 'react-dom';

const WORLD_W  = 1280;
const WORLD_H  = 800;
const GRID_MINOR = 50;
const GRID_MAJOR = 100;

// Color-code the logic type for fast visual scanning in the HUD
const typeColor = (type) => {
  switch (type) {
    case 'WALK':      return '#ffffff';
    case 'BLOCK':     return '#ff4444';
    case 'INTERACT':  return '#44ff44';
    case 'HIDE_ZONE': return '#ff44ff';
    case 'EXIT':      return '#4488ff';
    default:          return '#888888';
  }
};

export const DebugOverlay = ({ pos, manifest, active, zoom, telemetry }) => {
  if (!active) return null;

  // --- GRID LINES & LABELS ---
  const lines  = [];
  const labels = [];

  for (let x = 0; x <= WORLD_W; x += GRID_MINOR) {
    const isMajor = x % GRID_MAJOR === 0;
    lines.push(
      <line
        key={`v${x}`}
        x1={x * zoom} y1={0} x2={x * zoom} y2={WORLD_H * zoom}
        stroke={isMajor ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.1)'}
        strokeWidth={isMajor ? 1 : 0.5}
      />
    );
    if (isMajor) {
      labels.push(
        <text key={`vl${x}`} x={x * zoom + 3} y={14}
          fill="#00ffff" fontSize={9} fontFamily="monospace"
          style={{ userSelect: 'none' }}>
          {x}
        </text>
      );
    }
  }

  for (let y = 0; y <= WORLD_H; y += GRID_MINOR) {
    const isMajor = y % GRID_MAJOR === 0;
    lines.push(
      <line
        key={`h${y}`}
        x1={0} y1={y * zoom} x2={WORLD_W * zoom} y2={y * zoom}
        stroke={isMajor ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.1)'}
        strokeWidth={isMajor ? 1 : 0.5}
      />
    );
    if (isMajor && y > 0) {
      labels.push(
        <text key={`hl${y}`} x={3} y={y * zoom - 3}
          fill="#00ffff" fontSize={9} fontFamily="monospace"
          style={{ userSelect: 'none' }}>
          {y}
        </text>
      );
    }
  }

  // --- CROSSHAIR ---
  const cx   = pos.x * zoom;
  const cy   = pos.y * zoom;
  const ARM  = 12;
  const snapX = Math.round(pos.x / GRID_MINOR) * GRID_MINOR;
  const snapY = Math.round(pos.y / GRID_MINOR) * GRID_MINOR;

  // --- WORLD GRID OVERLAY (inside world-container — moves with the world, correct) ---
  const overlay = (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 9000,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      <svg width={WORLD_W * zoom} height={WORLD_H * zoom}
        style={{ position: 'absolute', top: 0, left: 0 }}>

        {lines}
        {labels}

        {/* Entity hitboxes (if bounds defined in manifest) */}
        {manifest?.entities && Object.values(manifest.entities).map(ent =>
          ent.bounds ? (
            <rect key={ent.id}
              x={ent.bounds.x[0] * zoom} y={ent.bounds.y[0] * zoom}
              width={(ent.bounds.x[1] - ent.bounds.x[0]) * zoom}
              height={(ent.bounds.y[1] - ent.bounds.y[0]) * zoom}
              fill="rgba(0,255,0,0.08)" stroke="lime" strokeWidth={1}
            />
          ) : null
        )}

        {/* NPC spawn markers */}
        {manifest?.npcs && Object.values(manifest.npcs).map(npc => (
          <g key={`npc-${npc.id}`}>
            <circle cx={npc.spawnX * zoom} cy={npc.spawnY * zoom}
              r={6} fill="rgba(255,255,0,0.3)" stroke="#ffff00" strokeWidth={1} />
            <text x={npc.spawnX * zoom + 8} y={npc.spawnY * zoom + 4}
              fill="#ffff00" fontSize={9} fontFamily="monospace">
              {npc.id} ({npc.spawnX},{npc.spawnY})
            </text>
          </g>
        ))}

        {/* Interaction radius — matches the 80px NPC proximity check in Stage.jsx */}
        <circle
          cx={cx} cy={cy} r={80 * zoom}
          fill="rgba(255,200,0,0.04)"
          stroke="rgba(255,200,0,0.5)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Maya crosshair */}
        <line x1={cx - ARM} y1={cy} x2={cx + ARM} y2={cy} stroke="#ff0000" strokeWidth={1.5} />
        <line x1={cx} y1={cy - ARM} x2={cx} y2={cy + ARM} stroke="#ff0000" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={4} fill="none" stroke="#ff0000" strokeWidth={1} />

        <text x={cx + ARM + 4} y={cy - 4}
          fill="#ff0000" fontSize={10} fontFamily="monospace" fontWeight="bold">
          {Math.floor(pos.x)},{Math.floor(pos.y)}
        </text>
        <text x={cx + ARM + 4} y={cy + 10}
          fill="rgba(255,100,100,0.7)" fontSize={8} fontFamily="monospace">
          snap {snapX},{snapY}
        </text>
      </svg>
    </div>
  );

  // --- TELEMETRY HUD (portaled to document.body) ---
  // position:fixed is broken inside a CSS-transformed ancestor (world-container uses
  // willChange:transform). createPortal bypasses the transform chain entirely,
  // keeping the HUD locked to the bottom of the viewport regardless of camera position.
  const hud = createPortal(
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.88)', color: '#00ffff',
      padding: '10px 20px', fontSize: '11px', fontFamily: 'monospace',
      border: '1px solid rgba(0,255,255,0.25)', borderRadius: '3px',
      boxShadow: '0 0 20px rgba(0,255,255,0.1)',
      display: 'flex', gap: '24px', alignItems: 'center',
      zIndex: 99999, pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: '#444', fontSize: '9px', letterSpacing: '2px' }}>TELEMETRY</span>

      <span>
        <span style={{ color: '#555' }}>XY </span>
        <span style={{ color: '#fff' }}>{Math.floor(pos.x)},{Math.floor(pos.y)}</span>
      </span>

      <span>
        <span style={{ color: '#555' }}>TYPE </span>
        <span style={{ color: typeColor(telemetry?.type), fontWeight: 'bold' }}>
          {telemetry?.type ?? '—'}
        </span>
      </span>

      <span>
        <span style={{ color: '#555' }}>ENTITY </span>
        <span style={{ color: '#ff88ff' }}>{telemetry?.entityKey ?? '—'}</span>
      </span>

      <span>
        <span style={{ color: '#555' }}>HIDE </span>
        <span style={{ color: '#88ffff' }}>{telemetry?.hideKey ?? '—'}</span>
      </span>

      <span>
        <span style={{ color: '#555' }}>TERRAIN </span>
        <span style={{ color: '#88ff88' }}>{telemetry?.terrain ?? '—'}</span>
      </span>
    </div>,
    document.body
  );

  return (
    <>
      {overlay}
      {hud}
    </>
  );
};
