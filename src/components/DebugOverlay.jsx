import React from 'react';

export const DebugOverlay = ({ 
  pos, manifest, active, zoom, navData, stamina, isAtHidingSpot, nearbyEntity 
}) => {
  if (!active) return null;

  const gridSize = 50 * zoom;
  const numCols = Math.ceil((1280 * zoom) / gridSize);
  const numRows = Math.ceil((800 * zoom) / gridSize);
  const TALK_RADIUS = 70 * zoom;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 9000, pointerEvents: 'none', fontFamily: 'monospace' }}>
      
      <div style={{ 
        position: 'fixed', top: 20, right: 20, background: 'rgba(5, 5, 5, 0.95)', 
        border: '1px solid cyan', color: 'cyan', padding: '20px', fontSize: '12px',
        width: '280px', boxShadow: '0 0 30px rgba(0,0,0,1)', pointerEvents: 'auto'
      }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #004444', paddingBottom: '8px', marginBottom: '10px', letterSpacing: '2px' }}>
            SYSTEM TELEMETRY
        </div>
        
        <div>COORDS: <span style={{color: '#fff'}}>{Math.floor(pos.x)}, {Math.floor(pos.y)}</span></div>
        
        <div style={{ borderBottom: '1px solid #004444', margin: '12px 0 8px 0', paddingBottom: '5px', fontWeight: 'bold' }}>
            ENTITY SENSOR
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <span>COLOR READ:</span>
            <div style={{ 
                width: '14px', height: '14px', 
                background: `rgb(${navData?.entityColor || '0,0,0'})`, 
                border: '1px solid #fff' 
            }} />
            <span style={{color: navData?.entityColor ? '#fff' : '#666'}}>{navData?.entityColor || 'NONE'}</span>
        </div>

        <div>NEARBY: <span style={{color: nearbyEntity ? '#00ff00' : '#ff4444'}}>{nearbyEntity?.id || 'NULL'}</span></div>
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#008888' }}>
            * White-Suppression Active: All Floor pixels (#FFFFFF) ignored.
        </div>
      </div>

      <svg width="100%" height="100%">
        {[...Array(numCols)].map((_, i) => (
          <React.Fragment key={`v-${i}`}>
            <line x1={i * gridSize} y1="0" x2={i * gridSize} y2="100%" stroke="rgba(0, 255, 255, 0.1)" strokeWidth="1" />
            {i % 2 === 0 && <text x={i * gridSize + 2} y="15" fill="cyan" fontSize="9" opacity="0.4">{Math.floor((i * gridSize) / zoom)}</text>}
          </React.Fragment>
        ))}
        {[...Array(numRows)].map((_, i) => (
          <React.Fragment key={`h-${i}`}>
            <line x1="0" y1={i * gridSize} x2="100%" y2={i * gridSize} stroke="rgba(0, 255, 255, 0.1)" strokeWidth="1" />
            <text x="2" y={i * gridSize + 12} fill="cyan" fontSize="9" opacity="0.4">{Math.floor((i * gridSize) / zoom)}</text>
          </React.Fragment>
        ))}

        <line x1={pos.x * zoom - 25} y1={pos.y * zoom} x2={pos.x * zoom + 25} y2={pos.y * zoom} stroke="red" strokeWidth="2" />
        <line x1={pos.x * zoom} y1={pos.y * zoom - 25} x2={pos.x * zoom} y2={pos.y * zoom + 25} stroke="red" strokeWidth="2" />
        <circle cx={pos.x * zoom} cy={pos.y * zoom} r="6" fill="none" stroke="red" strokeWidth="2" />
      </svg>
    </div>
  );
};