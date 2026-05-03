import React, { useState, useEffect, useRef } from 'react';
import { clearSave } from '../utils/persistence';

const BG         = '#d6cab0';
const BG_DARK    = '#c9bca0';
const BG_INSET   = '#c0b095';
const ACCENT     = '#cb7866';
const TEXT       = '#3a2010';
const TEXT_DIM   = 'rgba(58,32,16,0.4)';
const TEXT_MID   = 'rgba(58,32,16,0.65)';
const BORDER     = 'rgba(58,32,16,0.18)';
const BORDER_MED = 'rgba(58,32,16,0.3)';
const GOLD       = '#b89a3a';
const FONT       = 'Courier New, monospace';
const FONT_SER   = 'Georgia, serif';
const HUD_HEIGHT = 48;

// ── Social tier labels ─────────────────────────────────────────────────────────
// Derived from overall NPC suspicion + relationship data
const getSocialStanding = (gameState) => {
  const suspicion = gameState.npcSuspicion || {};
  const avg = Object.values(suspicion).length > 0
    ? Object.values(suspicion).reduce((a, b) => a + b, 0) / Object.values(suspicion).length
    : 0;
  if (avg >= 80) return { label: 'EXPOSED',    color: '#c0392b', desc: 'Her presence is actively questioned. The cover is failing.' };
  if (avg >= 50) return { label: 'SUSPECTED',  color: '#b08030', desc: 'Something has drawn attention. She is being watched.' };
  if (avg >= 20) return { label: 'NOTICED',    color: '#7a6a3a', desc: 'She has registered on someone\'s awareness. Proceed carefully.' };
  return          { label: 'UNREMARKABLE', color: '#4a8a6a', desc: 'She moves through this space without friction. For now.' };
};

// ── Suspicion bar ──────────────────────────────────────────────────────────────
const SuspicionRow = ({ name, value }) => {
  const color = value >= 80 ? '#c0392b' : value >= 50 ? '#b08030' : value >= 20 ? '#7a6a3a' : '#4a8a6a';
  return (
    <div style={{ padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px', color: TEXT, textTransform: 'uppercase' }}>
          {name}
        </span>
        <span style={{ fontFamily: FONT, fontSize: 8, color, letterSpacing: '1px' }}>{Math.round(value)}%</span>
      </div>
      <div style={{ height: 2, background: BORDER_MED }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
};

// ── NPC display names ──────────────────────────────────────────────────────────
const NPC_NAMES = {
  silas_pemberton: 'Silas Pemberton',
  the_overseer:    'The Overseer',
};

export const Menu = ({ gameState, setGameState, onClose }) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleReset = () => {
    clearSave();
    setGameState({
      morphStability: 100, vigor: 100, money: 0.25,
      inventory: [], flags: {}, memories: [], containers: {},
      pendingGive: null, npcSuspicion: {}, currentRoom: 'test_house',
      activeForm: 'SOCIAL_CRYPSIS', observedNPCs: {}, activeAbility: 'NONE',
      nearbyNPC: null, nearbyEntity: null, isMayaHidden: false,
      currentTerrain: null, activeMorph: null, unlockedMorphs: [],
      morphKnowledge: {}, npcRelationships: {}, mayaMood: 50,
      seenFacets: ['genetic_memory', 'nerve_sense', 'social_crypsis', 'mimicry'],
      knowledge: {},
    });
    setConfirmReset(false);
    onClose();
  };

  const unlockedMorphs   = gameState.unlockedMorphs  || [];
  const morphKnowledge   = gameState.morphKnowledge   || {};
  const activeMorphData  = unlockedMorphs.find(m => m.id === gameState.activeMorph);
  const inProgressMorphs = Object.entries(morphKnowledge).filter(([, p]) => p < 100);
  const suspicion        = gameState.npcSuspicion || {};
  const standing         = getSocialStanding(gameState);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: HUD_HEIGHT,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(760px, 96vw)',
        maxHeight: 'calc(100vh - 80px)',
        background: BG,
        borderTop: `2px solid ${ACCENT}`,
        borderLeft: `1px solid ${BORDER_MED}`,
        borderRight: `1px solid ${BORDER_MED}`,
        boxShadow: '0 -8px 60px rgba(0,0,0,0.45)',
        zIndex: 9500,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        color: TEXT,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '20px 32px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        <span style={{ color: GOLD, fontFamily: FONT, fontSize: 13, letterSpacing: '6px', textTransform: 'uppercase' }}>
          THE CENTRAL LEDGER
        </span>
        <span style={{ color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '2px' }}>
          CURRENCY — ${gameState.money.toFixed(2)}
        </span>
      </div>

      {/* Body — 2 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        flex: 1,
        minHeight: 0,
      }}>

        {/* ── COL 1: Neural Mappings ── */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: '24px' }}>
          <div style={{
            fontFamily: FONT, fontSize: 8, letterSpacing: '3px',
            color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 16,
          }}>
            Neural Mappings
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unlockedMorphs.length === 0 && inProgressMorphs.length === 0 && (
              <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 13, paddingTop: 8, lineHeight: 1.6 }}>
                No morphs acquired. Observe NPCs closely to begin mapping their social frequency.
              </div>
            )}

            {unlockedMorphs.map(morph => {
              const active = gameState.activeMorph === morph.id;
              return (
                <button
                  key={morph.id}
                  onClick={() => setGameState(p => ({ ...p, activeMorph: morph.id }))}
                  style={{
                    padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                    background: active ? `${ACCENT}18` : BG_DARK,
                    border: `1px solid ${active ? ACCENT : BORDER}`,
                    color: active ? ACCENT : TEXT,
                    fontFamily: FONT, fontSize: 10, letterSpacing: '2px',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = BORDER_MED; e.currentTarget.style.background = BG_INSET; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = BORDER;     e.currentTarget.style.background = BG_DARK;  } }}
                >
                  {morph.name.toUpperCase()}
                </button>
              );
            })}

            {inProgressMorphs.map(([id, prog]) => (
              <div key={id} style={{
                padding: '10px 14px',
                background: BG_DARK,
                border: `1px dashed ${BORDER_MED}`,
              }}>
                <div style={{ fontFamily: FONT, fontSize: 8, color: TEXT_DIM, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
                  Mapping: {id}
                </div>
                <div style={{ height: 2, background: BORDER_MED }}>
                  <div style={{ height: '100%', width: `${prog}%`, background: ACCENT }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COL 2: Social Status ── */}
        <div style={{ padding: '24px' }}>
          <div style={{
            fontFamily: FONT, fontSize: 8, letterSpacing: '3px',
            color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 16,
          }}>
            Social Standing
          </div>

          {/* Standing indicator */}
          <div style={{
            background: BG_DARK,
            border: `1px solid ${BORDER}`,
            borderLeft: `3px solid ${standing.color}`,
            padding: '12px 14px',
            marginBottom: 20,
          }}>
            <div style={{
              fontFamily: FONT, fontSize: 10, letterSpacing: '2px',
              color: standing.color, textTransform: 'uppercase', marginBottom: 6,
            }}>
              {standing.label}
            </div>
            <div style={{ fontFamily: FONT_SER, fontSize: 13, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.6 }}>
              {standing.desc}
            </div>
          </div>

          {/* Role & cover */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 10 }}>
              Perceived Role
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Position',  value: 'Domestic Servant'        },
                { label: 'Form',      value: gameState.activeForm?.replace(/_/g, ' ') || 'Social Crypsis' },
                { label: 'Morph',     value: activeMorphData?.name || 'None' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: FONT, fontSize: 9, color: TEXT_DIM, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 9, color: TEXT, letterSpacing: '1px' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suspicion levels per NPC */}
          {Object.keys(suspicion).length > 0 && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 8 }}>
                Suspicion
              </div>
              {Object.entries(suspicion).map(([id, val]) => (
                <SuspicionRow
                  key={id}
                  name={NPC_NAMES[id] || id}
                  value={val}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        borderTop: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              background: 'none', color: TEXT_DIM,
              border: `1px solid ${BORDER}`,
              fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
              padding: '7px 16px', cursor: 'pointer',
              textTransform: 'uppercase', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.borderColor = '#c0392b'; }}
            onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM;  e.currentTarget.style.borderColor = BORDER;    }}
          >
            Reset House Quest
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c0392b', fontFamily: FONT, fontSize: 9, letterSpacing: '1px' }}>
              ALL PROGRESS LOST —
            </span>
            <button
              onClick={handleReset}
              style={{
                background: '#c0392b', color: '#fff', border: 'none',
                fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
                padding: '6px 14px', cursor: 'pointer',
              }}
            >
              CONFIRM
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                background: 'none', color: TEXT_MID,
                border: `1px solid ${BORDER_MED}`,
                fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
                padding: '6px 12px', cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            background: ACCENT, color: '#fff',
            border: 'none', fontFamily: FONT,
            fontSize: 10, letterSpacing: '2px',
            padding: '9px 28px', cursor: 'pointer',
            textTransform: 'uppercase', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#b5604f'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ACCENT;    }}
        >
          CLOSE  [ESC]
        </button>
      </div>
    </div>
  );
};
