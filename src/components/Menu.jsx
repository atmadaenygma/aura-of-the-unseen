import React, { useState } from 'react';
import { clearSave } from '../utils/persistence';

/**
 * AURA OF THE UNSEEN: IDENTITY LEDGER v2.0
 * Bento Grid organization for Morphs, Inventory, and Journal.
 */
export const Menu = ({ gameState, setGameState, onClose }) => {
  const [activeTab,     setActiveTab]     = useState('IDENTITIES');
  const [confirmReset,  setConfirmReset]  = useState(false);

  const resetHouseQuest = () => {
    clearSave();
    setGameState({
      integrity:      100,
      vigor:          100,
      money:          0.25,
      inventory:      [],
      flags:          {},
      memories:       [],
      containers:     {},
      pendingGive:    null,
      npcSuspicion:   {},
      currentRoom:    'test_house',
      activeForm:     'SOCIAL_CRYPSIS',
      observedNPCs:   {},
      activeAbility:  'NONE',
      nearbyNPC:      null,
      isMayaHidden:   false,
      currentTerrain: null,
      activeMorph:    null,
      unlockedMorphs: [],
      morphKnowledge: {},
    });
    setConfirmReset(false);
    onClose();
  };

  const equipMorph = (id) => {
    setGameState(p => ({ ...p, activeMorph: id }));
  };

  // Safe access — these fields may not exist in saves from before the morph system
  const unlockedMorphs = gameState.unlockedMorphs || [];
  const morphKnowledge = gameState.morphKnowledge || {};
  const activeMorphData = unlockedMorphs.find(m => m.id === gameState.activeMorph);
  const inProgressMorphs = Object.entries(morphKnowledge).filter(([, prog]) => prog < 100);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20000,
      background: 'rgba(2, 5, 5, 0.98)', backdropFilter: 'blur(20px)',
      padding: '60px', fontFamily: 'serif', color: '#ccc',
    }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <h1 style={{ color: '#d4af37', letterSpacing: '8px', margin: 0 }}>THE CENTRAL LEDGER</h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#888' }}>CURRENCY: ${gameState.money.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr', gap: '30px', marginTop: '40px', height: '70vh' }}>

        {/* COLUMN 1: SELF & STATS */}
        <div style={{ borderRight: '1px solid #222', paddingRight: '20px' }}>
          <div style={{ width: '100%', aspectRatio: '1/1.2', background: '#050505', border: '1px solid #222', overflow: 'hidden' }}>
            <img src="/ui/portraits/protagonist_portrait.png" style={{ width: '100%', opacity: 0.7 }} alt="Maya" />
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ color: '#d4af37', fontSize: '11px' }}>ACTIVE MORPH</div>
            <div style={{ color: '#00ffff', fontSize: '16px', fontStyle: 'italic', marginTop: '5px' }}>
              {activeMorphData?.name || 'NONE'}
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ color: '#555', fontSize: '10px', letterSpacing: '2px' }}>INTEGRITY</div>
            <div style={{ height: '2px', background: '#111', marginTop: '6px' }}>
              <div style={{ background: gameState.integrity < 25 ? '#f00' : '#d4af37', height: '100%', width: `${gameState.integrity}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ color: '#555', fontSize: '10px', letterSpacing: '2px' }}>VIGOR</div>
            <div style={{ height: '2px', background: '#111', marginTop: '6px' }}>
              <div style={{ background: '#00ff88', height: '100%', width: `${gameState.vigor || 0}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* COLUMN 2: MORPH BANK & NEURAL MAPPINGS */}
        <div>
          <h3 style={{ color: '#555', fontSize: '10px', letterSpacing: '3px', margin: '0 0 20px 0' }}>NEURAL MAPPINGS</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {unlockedMorphs.length === 0 && inProgressMorphs.length === 0 && (
              <div style={{ color: '#333', fontSize: '12px', fontStyle: 'italic', padding: '20px 0' }}>
                No morphs acquired. Observe NPCs to begin mapping.
              </div>
            )}

            {unlockedMorphs.map(morph => (
              <button
                key={morph.id}
                onClick={() => equipMorph(morph.id)}
                style={{
                  padding: '15px',
                  background: gameState.activeMorph === morph.id ? '#00ffff11' : '#080808',
                  border: `1px solid ${gameState.activeMorph === morph.id ? '#00ffff' : '#222'}`,
                  color: '#fff', textAlign: 'left', cursor: 'pointer',
                }}
              >
                {morph.name.toUpperCase()}
              </button>
            ))}

            {inProgressMorphs.map(([id, prog]) => (
              <div key={id} style={{ padding: '10px', background: '#050505', border: '1px dashed #333' }}>
                <div style={{ fontSize: '10px', color: '#666' }}>MAPPING: {id.toUpperCase()}</div>
                <div style={{ height: '2px', background: '#111', marginTop: '5px' }}>
                  <div style={{ background: '#00ffff', height: '100%', width: `${prog}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: BELONGINGS (Inventory) */}
        <div style={{ borderLeft: '1px solid #222', paddingLeft: '20px' }}>
          <h3 style={{ color: '#555', fontSize: '10px', letterSpacing: '3px', margin: '0 0 20px 0' }}>BELONGINGS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {(gameState.inventory || []).length === 0 && (
              <div style={{ color: '#333', fontSize: '12px', fontStyle: 'italic', padding: '10px 0', gridColumn: 'span 2' }}>
                Nothing carried.
              </div>
            )}
            {(gameState.inventory || []).filter(Boolean).map((item, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1/1', border: '1px solid #222', background: '#080808',
                  padding: '10px', fontSize: '10px', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RESET — bottom left, two-step confirm so it can't be hit by accident */}
      <div style={{ position: 'absolute', bottom: '60px', left: '60px' }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              background: 'none', color: '#333', padding: '12px 24px',
              border: '1px solid #222', cursor: 'pointer', fontFamily: 'serif',
              letterSpacing: '2px', fontSize: '11px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#cc4444'; e.currentTarget.style.borderColor = '#cc4444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#333';    e.currentTarget.style.borderColor = '#222'; }}
          >
            RESET HOUSE QUEST
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#cc4444', fontFamily: 'monospace', fontSize: 10, letterSpacing: '1px' }}>
              ALL PROGRESS WILL BE LOST
            </span>
            <button
              onClick={resetHouseQuest}
              style={{
                background: '#cc4444', color: '#fff', padding: '10px 20px',
                border: 'none', cursor: 'pointer', fontFamily: 'serif',
                letterSpacing: '2px', fontSize: '11px', fontWeight: 'bold',
              }}
            >
              CONFIRM
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                background: 'none', color: '#555', padding: '10px 16px',
                border: '1px solid #333', cursor: 'pointer', fontFamily: 'monospace',
                fontSize: '10px', letterSpacing: '1px',
              }}
            >
              CANCEL
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'absolute', bottom: '60px', right: '60px',
          background: '#d4af37', color: '#000', padding: '12px 40px',
          border: 'none', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'serif',
          letterSpacing: '2px',
        }}
      >
        RETURN [ESC]
      </button>
    </div>
  );
};
