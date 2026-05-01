import React, { useState } from 'react';
import { QUEST_REGISTRY } from '../data/quests';
import { FACET_REGISTRY } from '../data/facets';

const HUD_HEIGHT = 48;
const BG         = '#d6cab0';
const BG_INSET   = '#c9bca0';
const ACCENT     = '#cb7866';
const TEXT       = '#3a2010';
const TEXT_DIM   = 'rgba(58,32,16,0.4)';
const TEXT_MID   = 'rgba(58,32,16,0.65)';
const BORDER     = 'rgba(58,32,16,0.18)';
const BORDER_MED = 'rgba(58,32,16,0.3)';
const DONE       = '#2a7a5a';
const FAIL       = '#c0392b';
const FONT       = 'Courier New, monospace';
const FONT_SER   = 'Georgia, serif';

// ── Tab button ────────────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      borderBottom: active ? `2px solid ${ACCENT}` : `2px solid transparent`,
      color: active ? ACCENT : TEXT_DIM,
      fontFamily: FONT,
      fontSize: 9,
      letterSpacing: '3px',
      textTransform: 'uppercase',
      padding: '12px 20px 12px 0',
      marginRight: 4,
      cursor: 'pointer',
      transition: 'color 0.15s, border-color 0.15s',
      flexShrink: 0,
    }}
  >
    {label}
  </button>
);

// ── OBLIGATIONS ───────────────────────────────────────────────────────────────
const ObligationsTab = ({ gameState }) => {
  const visible = QUEST_REGISTRY.filter((q) => q.visibleIf(gameState));

  if (visible.length === 0) {
    return (
      <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 14, paddingTop: 12 }}>
        No obligations recorded.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {visible.map((quest) => {
        const failed  = quest.failedIf(gameState);
        const allDone = !failed && quest.stages.every((s) => s.doneIf(gameState));
        const accentColor = failed ? FAIL : allDone ? DONE : ACCENT;

        return (
          <div key={quest.id} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 16 }}>

            <div style={{
              fontFamily: FONT, fontSize: 10, letterSpacing: '3px',
              color: accentColor, textTransform: 'uppercase', marginBottom: 8,
            }}>
              {quest.title}
              {allDone && <span style={{ marginLeft: 10, fontSize: 8, opacity: 0.8 }}>— COMPLETE</span>}
              {failed  && <span style={{ marginLeft: 10, fontSize: 8, opacity: 0.8 }}>— FAILED</span>}
            </div>

            <div style={{
              fontFamily: FONT_SER, fontSize: 14, color: TEXT,
              lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14,
            }}>
              {quest.premise}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {quest.stages.map((stage, i) => {
                const done = stage.doneIf(gameState);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      fontFamily: FONT, fontSize: 10,
                      color: done ? DONE : TEXT_DIM,
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {done ? '✓' : '○'}
                    </span>
                    <span style={{
                      fontFamily: FONT, fontSize: 10, letterSpacing: '1px',
                      color: done ? DONE : TEXT_MID,
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {stage.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {failed && (
              <div style={{
                marginTop: 12, fontFamily: FONT_SER, fontSize: 13,
                color: FAIL, fontStyle: 'italic', lineHeight: 1.6,
              }}>
                {quest.failText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── ECHOES ────────────────────────────────────────────────────────────────────
const EchoesTab = ({ gameState }) => {
  const memories = (gameState.memories || []).filter(Boolean);

  if (memories.length === 0) {
    return (
      <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 14, paddingTop: 12 }}>
        Nothing has left a mark yet.
      </div>
    );
  }

  const typeColor = (type) => {
    if (type === 'AURA_FAIL') return FAIL;
    if (type === 'GIVE')      return '#7a5a2a';
    return ACCENT;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[...memories].reverse().map((mem, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 18 }}>
          <div style={{
            fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
            color: typeColor(mem.type), textTransform: 'uppercase', marginBottom: 6,
          }}>
            {mem.type || 'ECHO'} — {mem.title}
          </div>
          <div style={{
            fontFamily: FONT_SER, fontSize: 14, color: TEXT,
            lineHeight: 1.7, fontStyle: 'italic',
          }}>
            "{mem.content}"
          </div>
        </div>
      ))}
    </div>
  );
};

// ── COGNITIONS ────────────────────────────────────────────────────────────────
const CognitionsTab = ({ gameState }) => {
  const seen     = gameState.seenFacets || [];
  const unlocked = seen.map((id) => FACET_REGISTRY[id]).filter(Boolean);
  const [selected, setSelected] = useState(unlocked[0]?.id || null);

  if (unlocked.length === 0) {
    return (
      <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 14, paddingTop: 12 }}>
        No cognitions surfaced. Engage with the world.
      </div>
    );
  }

  const active = selected ? FACET_REGISTRY[selected] : null;

  return (
    <div style={{ display: 'flex', gap: 20, minHeight: 0 }}>

      {/* Sidebar */}
      <div style={{ width: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {unlocked.map((facet) => {
          const isActive = selected === facet.id;
          return (
            <button
              key={facet.id}
              onClick={() => setSelected(facet.id)}
              style={{
                background: isActive ? ACCENT : 'transparent',
                border: `1px solid ${isActive ? ACCENT : BORDER_MED}`,
                color: isActive ? '#fff' : TEXT_MID,
                fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
                textTransform: 'uppercase', padding: '10px 12px',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {facet.name}
            </button>
          );
        })}
      </div>

      {/* Detail */}
      {active && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: BG_INSET,
            padding: '4px',
            marginBottom: 14,
            border: `1px solid ${BORDER}`,
          }}>
            <img
              src={`/ui/concious_thoughts/${active.id}.png`}
              style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.9 }}
              alt={active.name}
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 10, letterSpacing: '3px',
            color: ACCENT, textTransform: 'uppercase', marginBottom: 10,
          }}>
            {active.name}
          </div>
          <div style={{
            fontFamily: FONT_SER, fontSize: 14, color: TEXT,
            lineHeight: 1.8, fontStyle: 'italic',
          }}>
            {active.description}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Journal Popover ───────────────────────────────────────────────────────────
export const Journal = ({ gameState }) => {
  const [activeTab, setActiveTab] = useState('OBLIGATIONS');

  const TABS = ['OBLIGATIONS', 'ECHOES', 'COGNITIONS'];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: HUD_HEIGHT,
        left: 0,
        width: 700,
        maxHeight: 600,
        background: BG,
        borderTop: `2px solid ${ACCENT}`,
        borderRight: `1px solid ${BORDER_MED}`,
        borderLeft: `1px solid ${BORDER_MED}`,
        boxShadow: '4px -8px 48px rgba(0,0,0,0.45)',
        zIndex: 9100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tab row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
        background: BG,
      }}>
        {TABS.map((t) => (
          <Tab key={t} label={t} active={activeTab === t} onClick={() => setActiveTab(t)} />
        ))}
      </div>

      {/* Scrollable content */}
      <div
        className="journal-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 32px' }}
      >
        {activeTab === 'OBLIGATIONS' && <ObligationsTab gameState={gameState} />}
        {activeTab === 'ECHOES'      && <EchoesTab      gameState={gameState} />}
        {activeTab === 'COGNITIONS'  && <CognitionsTab  gameState={gameState} />}
      </div>

      <style>{`
        .journal-scroll::-webkit-scrollbar       { width: 5px; }
        .journal-scroll::-webkit-scrollbar-track { background: ${BG_INSET}; }
        .journal-scroll::-webkit-scrollbar-thumb { background: ${ACCENT}; }
      `}</style>
    </div>
  );
};
