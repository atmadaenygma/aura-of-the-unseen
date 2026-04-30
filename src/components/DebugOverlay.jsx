import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const WORLD_W    = 1280;
const WORLD_H    = 800;
const GRID_MINOR = 50;
const GRID_MAJOR = 100;

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

const maskImgStyle = (opacity, blendMode = 'screen') => ({
  position: 'absolute', inset: 0, width: '100%', height: '100%',
  pointerEvents: 'none', imageRendering: 'pixelated',
  opacity, mixBlendMode: blendMode,
});

// Toggle button — active = lit, inactive = dim
const ToggleBtn = ({ label, color = '#00ffff', active, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      background: active ? `rgba(${hexToRgb(color)},0.15)` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
      color: active ? color : '#444',
      fontFamily: 'monospace', fontSize: 10,
      padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
      letterSpacing: '0.5px', transition: 'all 0.15s',
      pointerEvents: 'all',
    }}
  >
    {label}
  </button>
);

// Helper — converts "#rrggbb" → "r,g,b" for rgba()
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const DEFAULTS = {
  grid:           true,
  maskLogic:      true,
  npcMarkers:     true,
  entityMarkers:  true,
  probeRadius:    true,
  crosshair:      true,
  telemetry:      true,
  legend:         true,
};

export const DebugOverlay = ({ pos, manifest, active, zoom, telemetry }) => {
  const [layers, setLayers] = useState(DEFAULTS);

  if (!active) return null;

  const toggle = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // --- GRID ---
  const lines  = [];
  const labels = [];

  if (layers.grid) {
    for (let x = 0; x <= WORLD_W; x += GRID_MINOR) {
      const isMajor = x % GRID_MAJOR === 0;
      lines.push(
        <line key={`v${x}`}
          x1={x * zoom} y1={0} x2={x * zoom} y2={WORLD_H * zoom}
          stroke={isMajor ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.1)'}
          strokeWidth={isMajor ? 1 : 0.5}
        />
      );
      if (isMajor) labels.push(
        <text key={`vl${x}`} x={x * zoom + 3} y={14}
          fill="#00ffff" fontSize={9} fontFamily="monospace"
          style={{ userSelect: 'none' }}>{x}</text>
      );
    }
    for (let y = 0; y <= WORLD_H; y += GRID_MINOR) {
      const isMajor = y % GRID_MAJOR === 0;
      lines.push(
        <line key={`h${y}`}
          x1={0} y1={y * zoom} x2={WORLD_W * zoom} y2={y * zoom}
          stroke={isMajor ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.1)'}
          strokeWidth={isMajor ? 1 : 0.5}
        />
      );
      if (isMajor && y > 0) labels.push(
        <text key={`hl${y}`} x={3} y={y * zoom - 3}
          fill="#00ffff" fontSize={9} fontFamily="monospace"
          style={{ userSelect: 'none' }}>{y}</text>
      );
    }
  }

  // --- CROSSHAIR ---
  const cx    = pos.x * zoom;
  const cy    = pos.y * zoom;
  const ARM   = 12;
  const snapX = Math.round(pos.x / GRID_MINOR) * GRID_MINOR;
  const snapY = Math.round(pos.y / GRID_MINOR) * GRID_MINOR;

  // --- WORLD OVERLAY ---
  const overlay = (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 9000,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {/* MASK OVERLAYS
          screen blend: black pixels vanish, colored zones glow through the world art */}
      {layers.maskLogic && (
        <img src={`${manifest.path}/mask_logic.png`}
          style={{ ...maskImgStyle(0.5, 'screen'), zIndex: 9002 }} alt="" />
      )}

      <svg width={WORLD_W * zoom} height={WORLD_H * zoom}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 9004 }}>

        {lines}
        {labels}

        {/* Entity proximity markers — radius circle + centre dot + label */}
        {layers.entityMarkers && manifest?.entities && Object.values(manifest.entities).map(ent =>
          ent.x != null ? (
            <g key={`ent-${ent.id}`}>
              <circle
                cx={ent.x * zoom} cy={ent.y * zoom}
                r={(ent.radius ?? 50) * zoom}
                fill="rgba(0,255,136,0.05)"
                stroke="rgba(0,255,136,0.5)"
                strokeWidth={1} strokeDasharray="3 3"
              />
              <circle cx={ent.x * zoom} cy={ent.y * zoom}
                r={4} fill="rgba(0,255,136,0.5)" stroke="#00ff88" strokeWidth={1} />
              <text x={ent.x * zoom + 8} y={ent.y * zoom + 4}
                fill="#00ff88" fontSize={9} fontFamily="monospace">
                {ent.id} ({ent.x},{ent.y}) r={ent.radius ?? 50}
              </text>
            </g>
          ) : null
        )}

        {/* NPC spawn markers */}
        {layers.npcMarkers && manifest?.npcs && Object.values(manifest.npcs).map(npc => (
          <g key={`npc-${npc.id}`}>
            <circle cx={npc.spawnX * zoom} cy={npc.spawnY * zoom}
              r={6} fill="rgba(255,255,0,0.3)" stroke="#ffff00" strokeWidth={1} />
            <text x={npc.spawnX * zoom + 8} y={npc.spawnY * zoom + 4}
              fill="#ffff00" fontSize={9} fontFamily="monospace">
              {npc.id} ({npc.spawnX},{npc.spawnY})
            </text>
          </g>
        ))}

        {/* Directional interaction box — matches Stage's BOX_W=60 BOX_D=70 */}
        {layers.probeRadius && (() => {
          const BOX_W = 60, BOX_D = 70;
          const dir = pos.dir || 'DOWN';
          let bx, by, bw, bh;
          switch (dir) {
            case 'UP':         bx = cx - (BOX_W/2)*zoom; by = cy - BOX_D*zoom; bw = BOX_W*zoom; bh = BOX_D*zoom; break;
            case 'LEFT':       bx = cx - BOX_D*zoom;     by = cy - (BOX_W/2)*zoom; bw = BOX_D*zoom; bh = BOX_W*zoom; break;
            case 'RIGHT':      bx = cx;                  by = cy - (BOX_W/2)*zoom; bw = BOX_D*zoom; bh = BOX_W*zoom; break;
            case 'UP_LEFT':    bx = cx - BOX_D*zoom;     by = cy - BOX_D*zoom; bw = BOX_D*zoom; bh = BOX_D*zoom; break;
            case 'UP_RIGHT':   bx = cx;                  by = cy - BOX_D*zoom; bw = BOX_D*zoom; bh = BOX_D*zoom; break;
            case 'DOWN_LEFT':  bx = cx - BOX_D*zoom;     by = cy;              bw = BOX_D*zoom; bh = BOX_D*zoom; break;
            case 'DOWN_RIGHT': bx = cx;                  by = cy;              bw = BOX_D*zoom; bh = BOX_D*zoom; break;
            default:           bx = cx - (BOX_W/2)*zoom; by = cy;              bw = BOX_W*zoom; bh = BOX_D*zoom; break;
          }
          return (
            <rect x={bx} y={by} width={bw} height={bh}
              fill="rgba(0,255,0,0.06)"
              stroke="rgba(0,255,0,0.6)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          );
        })()}

        {/* Crosshair */}
        {layers.crosshair && (<>
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
        </>)}
      </svg>
    </div>
  );

  // --- DEBUG CONTROL PANEL + TELEMETRY (portaled — bypasses willChange:transform) ---
  const BUTTONS = [
    { key: 'grid',          label: 'GRID',           color: '#00ffff' },
    { key: 'maskLogic',     label: 'MASK LOGIC',     color: '#44ff44' },
    { key: 'npcMarkers',    label: 'NPC MARKERS',    color: '#ffff00' },
    { key: 'entityMarkers', label: 'ENTITY MARKERS', color: '#00ff88' },
    { key: 'probeRadius',   label: 'INTERACT BOX',   color: '#44ff44' },
    { key: 'crosshair',     label: 'CROSSHAIR',      color: '#ff4444' },
    { key: 'telemetry',     label: 'TELEMETRY',      color: '#00ffff' },
    { key: 'legend',        label: 'LEGEND',         color: '#aaaaaa' },
  ];

  const hud = createPortal(
    <div style={{
      position: 'fixed', top: 16, right: 16,
      display: 'flex', flexDirection: 'column', gap: 6,
      zIndex: 99999,
    }}>
      {/* Panel header */}
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid rgba(0,255,255,0.2)',
        borderRadius: 3, padding: '6px 12px',
        fontFamily: 'monospace', fontSize: 9,
        color: '#444', letterSpacing: '2px',
      }}>
        DEBUG LAYERS
      </div>

      {/* Toggle buttons */}
      <div style={{
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(0,255,255,0.15)',
        borderRadius: 3, padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        {BUTTONS.map(({ key, label, color }) => (
          <ToggleBtn
            key={key}
            label={label}
            color={color}
            active={layers[key]}
            onToggle={() => toggle(key)}
          />
        ))}
      </div>

      {/* Telemetry (only if toggle on) */}
      {layers.telemetry && (
        <div style={{
          background: 'rgba(0,0,0,0.88)', color: '#00ffff',
          padding: '8px 12px', fontSize: 10, fontFamily: 'monospace',
          border: '1px solid rgba(0,255,255,0.25)', borderRadius: 3,
          display: 'flex', flexDirection: 'column', gap: 4,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#333', fontSize: 9, letterSpacing: '2px' }}>TELEMETRY</span>
          <span><span style={{ color: '#555' }}>XY     </span>
            <span style={{ color: '#fff' }}>{Math.floor(pos.x)}, {Math.floor(pos.y)}</span></span>
          <span><span style={{ color: '#555' }}>TYPE   </span>
            <span style={{ color: typeColor(telemetry?.type), fontWeight: 'bold' }}>
              {telemetry?.type ?? '—'}</span></span>
          <span><span style={{ color: '#555' }}>ENTITY </span>
            <span style={{ color: '#ff88ff' }}>{telemetry?.entityKey ?? '—'}</span></span>
          <span><span style={{ color: '#555' }}>TERRAIN </span>
            <span style={{ color: '#88ff88' }}>{telemetry?.terrain ?? '—'}</span></span>
        </div>
      )}

      {/* Legend (only if toggle on) */}
      {layers.legend && (
        <div style={{
          background: 'rgba(0,0,0,0.8)', padding: '6px 10px',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3,
          fontFamily: 'monospace', fontSize: 9,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ color: '#333', letterSpacing: '2px' }}>MASK LEGEND</span>
          {[
            { color: '#ffffff', label: 'WALK' },
            { color: '#ff4444', label: 'BLOCK' },
            { color: '#ffff00', label: 'HIDE ZONE (crouch)' },
            { color: '#4488ff', label: 'EXIT' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10,
                background: color, borderRadius: 2, flexShrink: 0,
              }} />
              <span style={{ color: '#888' }}>{label}</span>
            </span>
          ))}
        </div>
      )}
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
