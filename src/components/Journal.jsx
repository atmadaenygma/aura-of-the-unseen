import React, { useState } from 'react';
import { useTextScale } from '../context/TextScaleContext';
import { QUEST_REGISTRY } from '../data/quests';
import {
  ABILITIES_REGISTRY,
  REVELATIONS_REGISTRY,
  PEOPLE_REGISTRY,
  PLACES_REGISTRY,
  THINGS_REGISTRY,
} from '../data/cognitions';

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

// Source attribution colours — explicitly requested by the user
const SOURCE_META = {
  observation: { label: 'OBSERVED',         color: 'rgba(58,32,16,0.5)'  },
  evidence:    { label: 'FROM THE EVIDENCE', color: '#2a7a5a'             },
  silas:       { label: 'SILAS PEMBERTON',   color: '#b8952a'             },
  overseer:    { label: 'THE OVERSEER',      color: '#8b2e1a'             },
};

const COG_TABS = ['ABILITIES', 'REVELATIONS', 'PEOPLE', 'PLACES', 'THINGS'];

// Sidebar button shared across all sub-tabs
const CogSidebarBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? ACCENT : 'transparent',
      border: `1px solid ${active ? ACCENT : BORDER_MED}`,
      color: active ? '#fff' : TEXT_MID,
      fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
      textTransform: 'uppercase', padding: '10px 12px',
      textAlign: 'left', cursor: 'pointer', width: '100%',
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
);

// Knowledge tier renderer — shows unlocked tiers, dims locked ones
const KnowledgeTiers = ({ tiers, level }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {tiers.map((tier, i) => {
      const unlocked   = level >= tier.level;
      const revNum     = String(i + 1).padStart(2, '0');
      const srcMeta    = SOURCE_META[tier.source] ?? SOURCE_META.observation;
      const borderColor = unlocked ? srcMeta.color : BORDER;
      return (
        <div key={i} style={{
          borderLeft: `3px solid ${borderColor}`,
          paddingLeft: 14,
        }}>
          {/* Source label + revelation number */}
          <div style={{ marginBottom: unlocked ? 4 : 6 }}>
            <span style={{
              fontFamily: FONT, fontSize: 7, letterSpacing: '2px',
              color: unlocked ? srcMeta.color : TEXT_DIM,
              textTransform: 'uppercase',
            }}>
              {unlocked ? srcMeta.label : `${srcMeta.label} — REVELATION ${revNum}`}
            </span>
            {unlocked && (
              <span style={{
                fontFamily: FONT, fontSize: 7, letterSpacing: '2px',
                color: srcMeta.color, opacity: 0.6,
                textTransform: 'uppercase', marginLeft: 8,
              }}>
                — REVELATION {revNum}
              </span>
            )}
          </div>
          {/* Content or locked hint */}
          {unlocked ? (
            <div style={{
              fontFamily: FONT_SER, fontSize: 14, color: TEXT,
              lineHeight: 1.8, fontStyle: 'italic',
              whiteSpace: 'pre-line',
            }}>
              {tier.content}
            </div>
          ) : (
            <div style={{
              fontFamily: FONT_SER, fontSize: 12, fontStyle: 'italic',
              color: TEXT_DIM, lineHeight: 1.5,
            }}>
              {tier.lockedHint || '— discover more to unlock'}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// Detail panel shared by REVELATIONS / PEOPLE / PLACES / THINGS
const CogDetailPanel = ({ entry, level }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    {entry.image && (
      <div style={{ background: BG_INSET, padding: 4, marginBottom: 14, border: `1px solid ${BORDER}` }}>
        <img
          src={entry.image}
          style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.9 }}
          alt={entry.name}
          onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
        />
      </div>
    )}
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 14,
    }}>
      <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '3px', color: ACCENT, textTransform: 'uppercase' }}>
        {entry.name}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '1px', color: TEXT_DIM }}>
        KNOWLEDGE {level}
      </div>
    </div>
    <KnowledgeTiers tiers={entry.tiers} level={level} />
  </div>
);

// ── ABILITIES sub-tab ──────────────────────────────────────────────────────────
const AbilitiesPane = ({ gameState }) => {
  const seen     = gameState.seenFacets || [];
  const unlocked = seen.map((id) => ABILITIES_REGISTRY[id]).filter(Boolean);
  const [selected, setSelected] = useState(unlocked[0]?.id || null);
  const active = selected ? ABILITIES_REGISTRY[selected] : null;

  if (unlocked.length === 0) {
    return (
      <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 14, paddingTop: 12 }}>
        No abilities surfaced yet. Engage with the world.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 20, minHeight: 0 }}>
      <div style={{ width: 150, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {unlocked.map((f) => (
          <CogSidebarBtn key={f.id} label={f.name} active={selected === f.id} onClick={() => setSelected(f.id)} />
        ))}
      </div>
      {active && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: BG_INSET, padding: 4, marginBottom: 14, border: `1px solid ${BORDER}` }}>
            <img
              src={`/ui/concious_thoughts/${active.id}.png`}
              style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.9 }}
              alt={active.name}
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
          <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '3px', color: ACCENT, textTransform: 'uppercase', marginBottom: 10 }}>
            {active.name}
          </div>
          <div style={{ fontFamily: FONT_SER, fontSize: 14, color: TEXT, lineHeight: 1.8, fontStyle: 'italic' }}>
            {active.description}
          </div>
        </div>
      )}
    </div>
  );
};

// ── PEOPLE pane — 3-column: selection | media | discovered text ────────────────
const PeoplePane = ({ gameState }) => {
  const knowledge = gameState.knowledge || {};
  const visible   = Object.values(PEOPLE_REGISTRY).filter(e =>
    (knowledge[e.id] || 0) > 0 || (e.unlockFlag && gameState.flags?.[e.unlockFlag])
  );

  const [selected,    setSelected]    = useState(visible[0]?.id || null);
  const [videoErrors, setVideoErrors] = useState({});
  const active = selected ? PEOPLE_REGISTRY[selected] : null;
  const level  = active ? (knowledge[active.id] || 0) : 0;

  const MEDIA_W = 210;
  const MEDIA_H = 280; // 3:4

  if (visible.length === 0) {
    return (
      <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 14, paddingTop: 12 }}>
        No one has made an impression yet. Speak with those you encounter.
      </div>
    );
  }

  const showVideo = active?.video && !videoErrors[active.id];

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 0 }}>

      {/* Col 1 — selection list */}
      <div style={{ width: 150, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {visible.map(e => (
          <CogSidebarBtn key={e.id} label={e.name} active={selected === e.id} onClick={() => setSelected(e.id)} />
        ))}
      </div>

      {/* Col 2 — portrait / 360 video */}
      {active && (
        <div style={{ width: MEDIA_W, height: MEDIA_H, flexShrink: 0 }}>
          <div style={{
            width: MEDIA_W, height: MEDIA_H,
            overflow: 'hidden', position: 'relative',
          }}>
            {showVideo ? (
              <video
                key={active.id}
                src={active.video}
                autoPlay loop muted playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setVideoErrors(p => ({ ...p, [active.id]: true }))}
              />
            ) : active.image ? (
              <img
                src={active.image}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                alt={active.name}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: TEXT_DIM, fontFamily: FONT, fontSize: 7, letterSpacing: '2px',
              }}>
                NO IMAGE
              </div>
            )}
            {/* Format warning overlay — shown when video fails but image is available */}
            {active.video && videoErrors[active.id] && active.image && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(58,32,16,0.7)', padding: '4px 6px',
                fontFamily: FONT, fontSize: 6, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase', textAlign: 'center',
              }}>
                video unsupported — convert to .mp4
              </div>
            )}
          </div>
        </div>
      )}

      {/* Col 3 — discovered information */}
      {active && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '3px', color: ACCENT, textTransform: 'uppercase', marginBottom: 6 }}>
            {active.name}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 7, letterSpacing: '2px', color: TEXT_DIM, marginBottom: 16 }}>
            {active.tiers.filter(t => level >= t.level).length} of {active.tiers.length} REVELATIONS DISCOVERED
          </div>
          <KnowledgeTiers tiers={active.tiers} level={level} />
        </div>
      )}

    </div>
  );
};

// ── Generic knowledge pane (Revelations / Places / Things) ────────────────────
const KnowledgePane = ({ registry, gameState, emptyText }) => {
  const knowledge = gameState.knowledge || {};

  // Show an entry if knowledge[id] > 0 OR if it has an unlockFlag set in flags
  const visible = Object.values(registry).filter((entry) => {
    if (entry.unlockFlag && gameState.flags?.[entry.unlockFlag]) return true;
    return (knowledge[entry.id] || 0) > 0;
  });

  const [selected, setSelected] = useState(visible[0]?.id || null);
  const active = selected ? registry[selected] : null;
  const level  = active ? (knowledge[active.id] || 0) : 0;

  if (visible.length === 0) {
    return (
      <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 14, paddingTop: 12 }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 20, minHeight: 0 }}>
      <div style={{ width: 150, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {visible.map((entry) => (
          <CogSidebarBtn
            key={entry.id}
            label={entry.name}
            active={selected === entry.id}
            onClick={() => setSelected(entry.id)}
          />
        ))}
      </div>
      {active && <CogDetailPanel entry={active} level={level} />}
    </div>
  );
};

// ── CognitionsTab ──────────────────────────────────────────────────────────────
const CognitionsTab = ({ gameState }) => {
  const [subTab, setSubTab] = useState('ABILITIES');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: 0 }}>

      {/* Sub-tab row */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: `1px solid ${BORDER}`,
        marginBottom: 20,
      }}>
        {COG_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            style={{
              background: 'none', border: 'none',
              borderBottom: subTab === t ? `2px solid ${ACCENT}` : '2px solid transparent',
              color: subTab === t ? ACCENT : TEXT_DIM,
              fontFamily: FONT, fontSize: 8, letterSpacing: '2.5px',
              textTransform: 'uppercase',
              padding: '0 16px 10px 0',
              marginBottom: -1,
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Pane content */}
      {subTab === 'ABILITIES'   && <AbilitiesPane gameState={gameState} />}
      {subTab === 'REVELATIONS' && (
        <KnowledgePane
          registry={REVELATIONS_REGISTRY}
          gameState={gameState}
          emptyText="Nothing has been revealed yet. Look closer at the world around you."
        />
      )}
      {subTab === 'PEOPLE' && <PeoplePane gameState={gameState} />}
      {subTab === 'PLACES' && (
        <KnowledgePane
          registry={PLACES_REGISTRY}
          gameState={gameState}
          emptyText="No places recorded. Explore further."
        />
      )}
      {subTab === 'THINGS' && (
        <KnowledgePane
          registry={THINGS_REGISTRY}
          gameState={gameState}
          emptyText="Nothing of note collected. Handle objects with attention."
        />
      )}
    </div>
  );
};

// ── Journal Popover ───────────────────────────────────────────────────────────
export const Journal = ({ gameState }) => {
  const [activeTab, setActiveTab] = useState('OBLIGATIONS');
  const zoom = useTextScale();

  const TABS = ['OBLIGATIONS', 'ECHOES', 'COGNITIONS'];

  return (
    <div
      style={{
        width: 700,
        maxHeight: 600,
        background: BG,
        borderTop: `2px solid ${ACCENT}`,
        borderRight: `1px solid ${BORDER_MED}`,
        borderLeft: `1px solid ${BORDER_MED}`,
        boxShadow: '4px -8px 48px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        zoom,
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
