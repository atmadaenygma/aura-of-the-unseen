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

// ── Social Crypsis projection forms ───────────────────────────────────────────
// Icon naming convention:
//   Ability icons  → /ui/concious_thoughts/{ability_id}.png   (existing)
//   Projection icons → /ui/projections/{form_id}.png          (new — drop files here)
//     hidden.png · rat.png · wild_animal.png · generic_white.png

const SOCIAL_FORMS = [
  {
    id:   'hidden',
    name: 'Hidden',
    img:  '/ui/projections/hidden.png',
    desc: 'Your presence can be felt but not seen. You can pass through spaces, but those sensitive to the unseen may detect a disturbance.',
  },
  {
    id:   'rat',
    name: 'Rat',
    img:  '/ui/projections/rat.png',
    desc: 'Projects the impression of something small, unwanted, and beneath notice. Causes an instinctive disgust response in those nearby.',
  },
  {
    id:   'wild_animal',
    name: 'Wild Dog',
    img:  '/ui/projections/wild_dog.png',
    desc: 'Projects deep instinctual fear. Those who sense it will freeze or flee. Unpredictable — use with care in enclosed spaces.',
  },
];

// ── Mimicry base form (always available) ──────────────────────────────────────
const GENERIC_WHITE_FORM = {
  id:   'generic_white',
  name: 'White Citizen',
  img:  '/ui/projections/generic_white.png',
  desc: 'Projects the social standing of a white citizen of the era. Grants passage through white spaces and civil conversation. The frequency is unstable — prolonged use draws scrutiny.',
};

// ── Accordion sub-components ───────────────────────────────────────────────────
const AccordionHeader = ({ label, img, desc, level, isOpen, isRunning, isActive, onToggle, onActivate, onDeactivate }) => (
  <div
    onClick={onToggle}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', cursor: 'pointer',
      background: isRunning ? `${ACCENT}20` : isActive ? `${ACCENT}10` : BG_DARK,
      borderBottom: isOpen ? `1px solid ${BORDER}` : 'none',
      transition: 'background 0.15s',
      userSelect: 'none',
    }}
  >
    {/* Left — icon + text */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        background: BG_INSET, border: `1px solid ${isRunning ? ACCENT : isActive ? `${ACCENT}80` : BORDER_MED}`,
        overflow: 'hidden',
      }}>
        {img && (
          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }} alt={label}
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <span style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '2.5px', color: isRunning ? ACCENT : isActive ? ACCENT : TEXT, textTransform: 'uppercase' }}>
            {label}
          </span>
          {isRunning && <span style={{ fontFamily: FONT, fontSize: 7, color: ACCENT, letterSpacing: '1px' }}>◆ ACTIVE</span>}
          <span style={{ fontFamily: FONT, fontSize: 7, color: GOLD, letterSpacing: '1px' }}>LVL {level}</span>
        </div>
        {desc && (
          <div style={{ fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.3 }}>
            {desc}
          </div>
        )}
      </div>
    </div>

    {/* Right — action button + arrow */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 10 }}
      onClick={e => e.stopPropagation()}
    >
      {isRunning ? (
        <button onClick={onDeactivate} style={{
          background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT,
          fontFamily: FONT, fontSize: 7, letterSpacing: '1px', padding: '4px 8px',
          cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}18`; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          DEACTIVATE
        </button>
      ) : (
        <button onClick={onActivate} style={{
          background: ACCENT, border: `1px solid ${ACCENT}`, color: '#fff',
          fontFamily: FONT, fontSize: 7, letterSpacing: '1px', padding: '4px 8px',
          cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          MAKE ACTIVE
        </button>
      )}
      <span style={{
        color: TEXT_DIM, fontSize: 9, display: 'inline-block',
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}>▶</span>
    </div>
  </div>
);

const FormRow = ({ name, img, desc, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      width: '100%', padding: '10px 14px',
      background: selected ? `${ACCENT}12` : 'transparent',
      border: 'none',
      borderLeft: `3px solid ${selected ? ACCENT : 'transparent'}`,
      borderBottom: `1px solid ${BORDER}`,
      cursor: 'pointer', textAlign: 'left',
      transition: 'background 0.12s, border-color 0.12s',
    }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = `rgba(58,32,16,0.04)`; }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
  >
    {/* Form icon */}
    <div style={{
      width: 32, height: 32, flexShrink: 0,
      background: BG_INSET, border: `1px solid ${selected ? ACCENT : BORDER_MED}`,
      overflow: 'hidden', marginTop: 1,
    }}>
      {img && (
        <img
          src={img}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          alt={name}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      )}
    </div>
    <div style={{ flex: 1 }}>
    <span style={{
      fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px',
      color: selected ? ACCENT : TEXT, textTransform: 'uppercase',
      display: 'block', marginBottom: 4,
    }}>
      {name}
      {selected && <span style={{ marginLeft: 8, fontSize: 7, letterSpacing: '1px' }}>◆ SELECTED</span>}
    </span>
    <span style={{ fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.4 }}>
      {desc}
    </span>
    </div>
  </button>
);

const MorphsPane = ({ gameState, setGameState }) => {
  const equipped       = gameState.equippedAbility;
  const activeProj     = gameState.activeProjection ?? 'hidden';
  const activeMorph    = gameState.activeMorph;
  const unlockedMorphs = gameState.unlockedMorphs || [];
  const observedNPCs   = gameState.observedNPCs   || {};
  const inProgress     = Object.entries(observedNPCs).filter(([, p]) => p > 0 && p < 1.0);

  const activeAbility = gameState.activeAbility ?? 'NONE';
  const [open, setOpen] = useState(equipped ?? 'social_crypsis');
  const toggle = (id) => setOpen(o => o === id ? null : id);

  const selectSocialForm = (formId) => {
    setGameState(p => ({ ...p, equippedAbility: 'social_crypsis', activeProjection: formId, activeAbility: 'social_crypsis' }));
  };
  const selectMimicryForm = (morphId) => {
    setGameState(p => ({ ...p, equippedAbility: 'mimicry', activeMorph: morphId, activeAbility: 'mimicry' }));
  };
  const activate   = (id) => setGameState(p => ({ ...p, activeAbility: id }));
  const deactivate = ()   => setGameState(p => ({ ...p, activeAbility: 'NONE' }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Ability accordion ── */}
      <div>
        <SectionLabel>Active Ability</SectionLabel>
        <div style={{ border: `1px solid ${BORDER_MED}` }}>

          {/* Social Crypsis */}
          <div style={{
            borderBottom: `1px solid ${BORDER_MED}`,
            borderLeft: `3px solid ${activeAbility === 'social_crypsis' ? ACCENT : 'transparent'}`,
            transition: 'border-color 0.2s',
          }}>
            <AccordionHeader
              label="Social Crypsis"
              img="/ui/concious_thoughts/social_crypsis.png"
              desc={ABILITY_REGISTRY.social_crypsis.desc}
              level={gameState.abilityLevels?.social_crypsis ?? 1}
              isOpen={open === 'social_crypsis'}
              isActive={equipped === 'social_crypsis'}
              isRunning={activeAbility === 'social_crypsis'}
              onToggle={() => toggle('social_crypsis')}
              onActivate={() => activate('social_crypsis')}
              onDeactivate={deactivate}
            />
            {open === 'social_crypsis' && (
              <div>
                {SOCIAL_FORMS.map(form => (
                  <FormRow
                    key={form.id}
                    name={form.name}
                    img={form.img}
                    desc={form.desc}
                    selected={equipped === 'social_crypsis' && activeProj === form.id}
                    onClick={() => selectSocialForm(form.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mimicry */}
          <div style={{
            borderLeft: `3px solid ${activeAbility === 'mimicry' ? ACCENT : 'transparent'}`,
            transition: 'border-color 0.2s',
          }}>
            <AccordionHeader
              label="Mimicry"
              img="/ui/concious_thoughts/mimicry.png"
              desc={ABILITY_REGISTRY.mimicry.desc}
              level={gameState.abilityLevels?.mimicry ?? 1}
              isOpen={open === 'mimicry'}
              isActive={equipped === 'mimicry'}
              isRunning={activeAbility === 'mimicry'}
              onToggle={() => toggle('mimicry')}
              onActivate={() => activate('mimicry')}
              onDeactivate={deactivate}
            />
            {open === 'mimicry' && (
              <div>
                <FormRow
                  name={GENERIC_WHITE_FORM.name}
                  img={GENERIC_WHITE_FORM.img}
                  desc={GENERIC_WHITE_FORM.desc}
                  selected={equipped === 'mimicry' && activeMorph === 'generic_white'}
                  onClick={() => selectMimicryForm('generic_white')}
                />
                {unlockedMorphs.map(morph => (
                  <FormRow
                    key={morph.id}
                    name={morph.name}
                    img={`/ui/portraits/${morph.id}_portrait.png`}
                    desc={`Absorbed form. Projects the complete social frequency of ${morph.name}.`}
                    selected={equipped === 'mimicry' && activeMorph === morph.id}
                    onClick={() => selectMimicryForm(morph.id)}
                  />
                ))}
                {unlockedMorphs.length === 0 && (
                  <div style={{
                    padding: '10px 14px',
                    fontFamily: FONT_SER, fontSize: 11, fontStyle: 'italic',
                    color: TEXT_DIM, lineHeight: 1.6,
                    borderTop: `1px solid ${BORDER}`,
                  }}>
                    Observe an NPC until fully mapped to absorb their form.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── In-progress observations ── */}
      {inProgress.length > 0 && (
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
            {RIGHT_TABS.map(t => {
              const morphRunning = t === 'MORPHS' && gameState.activeAbility && gameState.activeAbility !== 'NONE';
              const isCurrent    = rightTab === t;
              return (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                style={{
                  background: morphRunning && !isCurrent ? `${ACCENT}10` : 'none',
                  border: 'none',
                  borderBottom: isCurrent ? `2px solid ${ACCENT}` : morphRunning ? `2px solid ${ACCENT}60` : '2px solid transparent',
                  color: isCurrent ? ACCENT : morphRunning ? ACCENT : TEXT_DIM,
                  fontFamily: FONT, fontSize: 8, letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  padding: '10px 20px 10px 0',
                  marginBottom: -1,
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                }}
              >
                {t}{morphRunning && !isCurrent ? ' ◆' : ''}
              </button>
              );
            })}
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
