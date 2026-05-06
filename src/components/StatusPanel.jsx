import React, { useState } from 'react';
import { PASSIVE_ABILITIES, XP_PER_LEVEL, MAX_ABILITY_LEVEL } from '../data/npcObservation';
import { useTextScale } from '../context/TextScaleContext';

const HUD_HEIGHT = 48;
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

const RIGHT_TABS = ['MORPHS', 'SOCIAL'];

// ── NPC display names — covers both worldManifest ids and registry ids ─────────
const NPC_NAMES = {
  silas:           'Old Silas',
  silas_pemberton: 'Old Silas',
  overseer:        'The Overseer',
  the_overseer:    'The Overseer',
};

const PORTRAIT_MAP = {
  silas:           '/ui/portraits/silas_portrait.png',
  silas_pemberton: '/ui/portraits/silas_portrait.png',
  overseer:        '/ui/portraits/overseer_portrait.png',
  the_overseer:    '/ui/portraits/overseer_portrait.png',
};

// ── Mood ───────────────────────────────────────────────────────────────────────
const getMood = (mood = 50) => {
  if (mood >= 75) return { label: 'COMPOSED',  color: '#2a7a5a', desc: 'Centred. The veil holds.' };
  if (mood >= 50) return { label: 'PRESENT',   color: '#4a6a8a', desc: 'Steady, but watchful.' };
  if (mood >= 25) return { label: 'UNSETTLED', color: '#b08030', desc: 'Something is wearing at her.' };
  return           { label: 'FRACTURED', color: '#c0392b', desc: 'The mask is slipping.' };
};

// ── Relationship tier ──────────────────────────────────────────────────────────
const getRelTier = (score = 50) => {
  if (score >= 81) return { label: 'TRUSTED',     color: '#2a7a5a' };
  if (score >= 61) return { label: 'CORDIAL',      color: '#4a8a6a' };
  if (score >= 41) return { label: 'NEUTRAL',      color: TEXT_MID  };
  if (score >= 21) return { label: 'DISTRUSTFUL',  color: '#b08030' };
  return            { label: 'HOSTILE',       color: '#c0392b' };
};

// ── Social standing ────────────────────────────────────────────────────────────
const getSocialStanding = (gameState) => {
  const suspicion = gameState.npcSuspicion || {};
  const vals = Object.values(suspicion);
  const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  if (avg >= 80) return { label: 'EXPOSED',     color: '#c0392b', desc: 'Her presence is actively questioned. The cover is failing.' };
  if (avg >= 50) return { label: 'SUSPECTED',   color: '#b08030', desc: 'Something has drawn attention. She is being watched.' };
  if (avg >= 20) return { label: 'NOTICED',     color: '#7a6a3a', desc: "She has registered on someone's awareness. Proceed carefully." };
  return          { label: 'UNREMARKABLE', color: '#4a8a6a', desc: 'She moves through this space without friction. For now.' };
};

// ── Shared primitives ──────────────────────────────────────────────────────────
const StatBar = ({ label, value, color }) => (
  <div>
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
      color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 5,
    }}>
      <span>{label}</span>
      <span style={{ color }}>{Math.round(value)}%</span>
    </div>
    <div style={{ height: 2, background: BORDER_MED }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, transition: 'width 0.4s' }} />
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: FONT, fontSize: 8, letterSpacing: '3px',
    color: TEXT_DIM, textTransform: 'uppercase',
    paddingBottom: 8, marginBottom: 8,
    borderBottom: `1px solid ${BORDER}`,
  }}>
    {children}
  </div>
);

// ── SELF tab ───────────────────────────────────────────────────────────────────
const SelfPane = ({ gameState }) => {
  const { morphStability = 100, vigor = 100, hunger = 100, mayaMood = 50, activeMorph, unlockedMorphs = [] } = gameState;
  const mood           = getMood(mayaMood);
  const activeMorphData = unlockedMorphs.find(m => m.id === activeMorph);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Portrait row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{
          width: 80, height: 96, flexShrink: 0,
          background: BG_INSET, border: `1px solid ${BORDER_MED}`, overflow: 'hidden',
        }}>
          <img
            src="/ui/portraits/protagonist_portrait.png"
            style={{ width: '100%', display: 'block', opacity: 0.85 }}
            alt="Maya"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 7, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 3 }}>Identity</div>
            <div style={{ fontFamily: FONT_SER, fontSize: 15, fontStyle: 'italic', color: TEXT }}>Maya</div>
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 7, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 3 }}>Active Form</div>
            <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '1px', color: activeMorphData ? ACCENT : TEXT_MID }}>
              {activeMorphData?.name || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionLabel>Vitals</SectionLabel>
        <StatBar label="Morph Stability" value={morphStability} color={morphStability < 25 ? '#c0392b' : ACCENT} />
        <StatBar label="Vigor"          value={vigor}          color="#4a8a6a" />
        <StatBar label="Hunger"         value={hunger}         color={hunger < 25 ? '#c0392b' : hunger < 55 ? '#b08030' : '#4a8a6a'} />
      </div>

      {/* Mood */}
      <div>
        <SectionLabel>Disposition</SectionLabel>
        <div style={{
          background: BG_DARK, border: `1px solid ${BORDER}`,
          borderLeft: `3px solid ${mood.color}`,
          padding: '10px 12px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '2px', color: mood.color, textTransform: 'uppercase' }}>
              {mood.label}
            </span>
            <div style={{ width: 70, height: 2, background: BORDER_MED }}>
              <div style={{ height: '100%', width: `${mayaMood}%`, background: mood.color, transition: 'width 0.4s' }} />
            </div>
          </div>
          <div style={{ fontFamily: FONT_SER, fontSize: 12, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.5 }}>
            {mood.desc}
          </div>
        </div>
      </div>

    </div>
  );
};

// ── MORPHS tab ─────────────────────────────────────────────────────────────────
const ABILITY_REGISTRY = {
  social_crypsis: {
    id: 'social_crypsis',
    name: 'Social Crypsis',
    desc: 'Blend into surroundings. While hidden, Morph Stability drains slowly.',
    img: '/ui/concious_thoughts/social_crypsis.png',
  },
  mimicry: {
    id: 'mimicry',
    name: 'Mimicry',
    desc: 'Read the social frequency of those nearby. Right-click near an NPC to observe them.',
    img: '/ui/concious_thoughts/mimicry.png',
  },
};

const AVAILABLE_ABILITIES = ['social_crypsis', 'mimicry'];

const MorphsPane = ({ gameState, setGameState }) => {
  const equipped       = gameState.equippedAbility;
  const unlockedMorphs = gameState.unlockedMorphs || [];
  const observedNPCs   = gameState.observedNPCs   || {};
  const inProgress     = Object.entries(observedNPCs).filter(([, p]) => p > 0 && p < 1.0);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('ability_id');
    if (!id) return;
    setGameState(p => ({
      ...p,
      equippedAbility: id,
      // Deactivate the outgoing ability if it was running
      activeAbility: (p.equippedAbility && p.activeAbility === p.equippedAbility) ? 'NONE' : p.activeAbility,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Equip slot ── */}
      <div>
        <SectionLabel>Equipped Ability</SectionLabel>
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            minHeight: 76,
            background: BG_INSET,
            border: `1px dashed ${equipped ? ACCENT : BORDER_MED}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: equipped ? 'flex-start' : 'center',
            padding: equipped ? '10px 12px' : 0,
            gap: equipped ? 12 : 0,
            transition: 'border-color 0.2s',
          }}
        >
          {equipped ? (() => {
            const ab = ABILITY_REGISTRY[equipped];
            return (
              <>
                <div style={{
                  width: 48, height: 48, flexShrink: 0,
                  background: BG_DARK, overflow: 'hidden',
                  border: `1px solid ${BORDER_MED}`,
                }}>
                  <img src={ab.img}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    alt={ab.name}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', color: ACCENT, textTransform: 'uppercase', marginBottom: 4 }}>
                    {ab.name}
                  </div>
                  <div style={{ fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.4 }}>
                    {ab.desc}
                  </div>
                </div>
                <button
                  onClick={() => setGameState(p => ({
                    ...p,
                    equippedAbility: null,
                    activeAbility: p.activeAbility === p.equippedAbility ? 'NONE' : p.activeAbility,
                  }))}
                  style={{
                    background: 'none', border: `1px solid ${BORDER}`, cursor: 'pointer',
                    color: TEXT_DIM, fontFamily: FONT, fontSize: 7, letterSpacing: '1.5px',
                    padding: '4px 8px', flexShrink: 0, textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_DIM; }}
                >
                  Remove
                </button>
              </>
            );
          })() : (
            <span style={{ fontFamily: FONT, fontSize: 8, color: TEXT_DIM, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Drag an ability here to equip
            </span>
          )}
        </div>
      </div>

      {/* ── Ability cards ── */}
      <div>
        <SectionLabel>Available Abilities</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AVAILABLE_ABILITIES.map(id => {
            const ab         = ABILITY_REGISTRY[id];
            const isEquipped = equipped === id;
            const level      = gameState.abilityLevels?.[id] || 1;
            const xp         = gameState.abilityXP?.[id]     || 0;
            const nextXP     = XP_PER_LEVEL[Math.min(level, MAX_ABILITY_LEVEL)];
            const prevXP     = XP_PER_LEVEL[Math.max(0, level - 1)];
            const prog       = nextXP > prevXP ? Math.max(0, Math.min(1, (xp - prevXP) / (nextXP - prevXP))) : 1;
            const isMax      = level >= MAX_ABILITY_LEVEL;
            return (
                  <div
                    key={id}
                    draggable={!isEquipped}
                    onDragStart={e => e.dataTransfer.setData('ability_id', id)}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      padding: '10px 12px',
                      background: isEquipped ? `${ACCENT}12` : BG_DARK,
                      border: `1px solid ${isEquipped ? ACCENT : BORDER}`,
                      opacity: isEquipped ? 0.55 : 1,
                      cursor: isEquipped ? 'default' : 'grab',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, flexShrink: 0,
                      background: BG_INSET, overflow: 'hidden',
                      border: `1px solid ${BORDER_MED}`,
                    }}>
                      <img src={ab.img}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt={ab.name}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3,
                      }}>
                        <span style={{
                          fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
                          color: isEquipped ? ACCENT : TEXT, textTransform: 'uppercase',
                        }}>
                          {ab.name}
                          {isEquipped && (
                            <span style={{ marginLeft: 8, fontSize: 7, color: ACCENT, letterSpacing: '1px' }}>◆ EQUIPPED</span>
                          )}
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 7, color: GOLD, letterSpacing: '1px', flexShrink: 0 }}>
                          {isMax ? 'MASTERED' : `LVL ${level}`}
                        </span>
                      </div>
                      <div style={{ fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.4, marginBottom: isMax ? 0 : 5 }}>
                        {ab.desc}
                      </div>
                      {!isMax && (
                        <div style={{ height: 1, background: BORDER_MED }}>
                          <div style={{ height: '100%', width: `${prog * 100}%`, background: GOLD, transition: 'width 0.6s' }} />
                        </div>
                      )}
                    </div>
                  </div>
            );
          })}
        </div>
      </div>

      {/* ── Known Forms (always visible once mimicry is available or morphs exist) ── */}
      {(equipped === 'mimicry' || unlockedMorphs.length > 0) && (
        <div>
          <SectionLabel>Known Forms</SectionLabel>
          {unlockedMorphs.length === 0 ? (
            <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 12, lineHeight: 1.7 }}>
              No forms absorbed yet. Observe an NPC until fully mapped.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {unlockedMorphs.map(morph => {
                const active = gameState.activeMorph === morph.id;
                return (
                  <button
                    key={morph.id}
                    onClick={() => setGameState(p => ({ ...p, activeMorph: active ? null : morph.id }))}
                    style={{
                      padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                      background: active ? `${ACCENT}18` : BG_DARK,
                      border: `1px solid ${active ? ACCENT : BORDER}`,
                      color: active ? ACCENT : TEXT,
                      fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
                      textTransform: 'uppercase', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = BORDER_MED; e.currentTarget.style.background = BG_INSET; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = BORDER;     e.currentTarget.style.background = BG_DARK;  } }}
                  >
                    {morph.name.toUpperCase()}
                    {active && <span style={{ marginLeft: 8, fontSize: 7 }}>◆ ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── In-progress observations (only when Mimicry equipped) ── */}
      {equipped === 'mimicry' && inProgress.length > 0 && (
        <div>
          <SectionLabel>Observing</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inProgress.map(([id, prog]) => (
              <div key={id} style={{ padding: '10px 14px', background: BG_DARK, border: `1px dashed ${BORDER_MED}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: FONT, fontSize: 8, color: TEXT_DIM, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Mapping: {NPC_NAMES[id] || id}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 7, color: TEXT_DIM }}>{Math.round(prog * 100)}%</span>
                </div>
                <div style={{ height: 2, background: BORDER_MED }}>
                  <div style={{ height: '100%', width: `${prog * 100}%`, background: ACCENT, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Passive Abilities (always active, level up through play) ── */}
      <div>
        <SectionLabel>Passive Abilities</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PASSIVE_ABILITIES.map(ab => {
            const level  = gameState.abilityLevels?.[ab.id] || 1;
            const xp     = gameState.abilityXP?.[ab.id]     || 0;
            const nextXP = XP_PER_LEVEL[Math.min(level, MAX_ABILITY_LEVEL)];
            const prevXP = XP_PER_LEVEL[Math.max(0, level - 1)];
            const prog   = nextXP > prevXP ? Math.max(0, Math.min(1, (xp - prevXP) / (nextXP - prevXP))) : 1;
            const isMax  = level >= MAX_ABILITY_LEVEL;
            return (
              <div key={ab.id} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 12px',
                background: BG_DARK,
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: BG_INSET, overflow: 'hidden',
                  border: `1px solid ${BORDER_MED}`,
                }}>
                  <img src={ab.img}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    alt={ab.name}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4,
                  }}>
                    <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', color: TEXT, textTransform: 'uppercase' }}>
                      {ab.name}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 7, color: GOLD, letterSpacing: '1px', flexShrink: 0 }}>
                      {isMax ? 'MASTERED' : `LVL ${level}`}
                    </span>
                  </div>
                  <div style={{ fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.4, marginBottom: isMax ? 0 : 6 }}>
                    {ab.levelDesc[Math.min(level - 1, ab.levelDesc.length - 1)]}
                  </div>
                  {!isMax && (
                    <>
                      <div style={{ height: 1, background: BORDER_MED, marginBottom: 3 }}>
                        <div style={{ height: '100%', width: `${prog * 100}%`, background: GOLD, transition: 'width 0.6s' }} />
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: 7, color: TEXT_DIM, letterSpacing: '1px' }}>
                        {ab.xpSource}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// ── SOCIAL tab ─────────────────────────────────────────────────────────────────
const SocialPane = ({ gameState }) => {
  const suspicion        = gameState.npcSuspicion     || {};
  const npcRelationships = gameState.npcRelationships || {};
  const standing         = getSocialStanding(gameState);
  const activeMorph      = gameState.unlockedMorphs?.find(m => m.id === gameState.activeMorph);

  // Relationships: only show NPCs with a score set
  const relEntries = Object.entries(npcRelationships).map(([id, val]) => ({
    id,
    name:  NPC_NAMES[id] || id,
    score: typeof val === 'object' ? val.score : val,
    note:  typeof val === 'object' ? val.note  : null,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Standing */}
      <div>
        <SectionLabel>Standing</SectionLabel>
        <div style={{
          background: BG_DARK, border: `1px solid ${BORDER}`,
          borderLeft: `3px solid ${standing.color}`,
          padding: '10px 12px', marginBottom: 12,
        }}>
          <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '2px', color: standing.color, textTransform: 'uppercase', marginBottom: 5 }}>
            {standing.label}
          </div>
          <div style={{ fontFamily: FONT_SER, fontSize: 12, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.6 }}>
            {standing.desc}
          </div>
        </div>

        {/* Perceived role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { label: 'Position', value: 'Domestic Servant' },
            { label: 'Form',     value: gameState.activeForm?.replace(/_/g, ' ') || 'Social Crypsis' },
            { label: 'Morph',    value: activeMorph?.name || 'None' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontFamily: FONT, fontSize: 8, color: TEXT_DIM, letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: FONT, fontSize: 9, color: TEXT, letterSpacing: '1px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suspicion */}
      {Object.keys(suspicion).length > 0 && (
        <div>
          <SectionLabel>Suspicion</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Object.entries(suspicion).map(([id, val]) => {
              const color = val >= 80 ? '#c0392b' : val >= 50 ? '#b08030' : val >= 20 ? '#7a6a3a' : '#4a8a6a';
              return (
                <div key={id} style={{ padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {PORTRAIT_MAP[id] && (
                        <div style={{ width: 36, height: 36, flexShrink: 0, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                          <img src={PORTRAIT_MAP[id]} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} alt="" />
                        </div>
                      )}
                      <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px', color: TEXT, textTransform: 'uppercase' }}>
                        {NPC_NAMES[id] || id}
                      </span>
                    </div>
                    <span style={{ fontFamily: FONT, fontSize: 8, color, letterSpacing: '1px' }}>{Math.round(val)}%</span>
                  </div>
                  <div style={{ height: 2, background: BORDER_MED }}>
                    <div style={{ height: '100%', width: `${val}%`, background: color, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationships */}
      <div>
        <SectionLabel>Relationships</SectionLabel>
        {relEntries.length === 0 ? (
          <div style={{ color: TEXT_DIM, fontFamily: FONT_SER, fontStyle: 'italic', fontSize: 12, lineHeight: 1.6 }}>
            No meaningful interactions recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {relEntries.map(({ id, name, score, note }) => {
              const tier   = getRelTier(score);
              const filled = Math.round((score / 100) * 5);
              return (
                <div key={id} style={{ padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {PORTRAIT_MAP[id] && (
                        <div style={{ width: 36, height: 36, flexShrink: 0, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                          <img src={PORTRAIT_MAP[id]} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} alt="" />
                        </div>
                      )}
                      <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px', color: TEXT, textTransform: 'uppercase' }}>{name}</span>
                    </div>
                    <span style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '2px', color: tier.color, textTransform: 'uppercase' }}>{tier.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: note ? 5 : 0 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ width: 14, height: 3, background: i < filled ? tier.color : BORDER_MED, transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  {note && (
                    <div style={{ fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.5 }}>
                      {note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

// ── StatusPanel ────────────────────────────────────────────────────────────────
export const StatusPanel = ({ gameState, setGameState }) => {
  const [rightTab, setRightTab] = useState('MORPHS');
  const zoom = useTextScale();

  return (
    <div style={{
      width: 860,
      height: 620,
      zoom,
      background: BG,
      borderTop: `2px solid ${ACCENT}`,
      borderLeft: `1px solid ${BORDER_MED}`,
      boxShadow: '-6px -8px 48px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: FONT,
    }}>

      {/* ── Full-width header ── */}
      <div style={{
        padding: '13px 24px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: FONT, fontSize: 11, letterSpacing: '6px',
          color: GOLD, textTransform: 'uppercase',
        }}>
          THE CENTRAL LEDGER
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left column — SELF (always visible) */}
        <div
          className="status-scroll"
          style={{
            width: 290,
            flexShrink: 0,
            borderRight: `1px solid ${BORDER_MED}`,
            overflowY: 'auto',
            padding: '18px 20px 24px',
          }}
        >
          <SelfPane gameState={gameState} />
        </div>

        {/* Right column — MORPHS / SOCIAL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Right tab bar */}
          <div style={{
            padding: '0 20px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            flexShrink: 0,
          }}>
            {RIGHT_TABS.map(t => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: rightTab === t ? `2px solid ${ACCENT}` : '2px solid transparent',
                  color: rightTab === t ? ACCENT : TEXT_DIM,
                  fontFamily: FONT, fontSize: 8, letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  padding: '10px 20px 10px 0',
                  marginBottom: -1,
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Right scrollable content */}
          <div
            className="status-scroll"
            style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 24px' }}
          >
            {rightTab === 'MORPHS' && <MorphsPane gameState={gameState} setGameState={setGameState} />}
            {rightTab === 'SOCIAL' && <SocialPane gameState={gameState} />}
          </div>

        </div>
      </div>

      <style>{`
        .status-scroll::-webkit-scrollbar       { width: 4px; }
        .status-scroll::-webkit-scrollbar-track { background: ${BG_INSET}; }
        .status-scroll::-webkit-scrollbar-thumb { background: ${ACCENT}; }
      `}</style>
    </div>
  );
};
