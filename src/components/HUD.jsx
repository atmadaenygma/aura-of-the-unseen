import React, { useState, useEffect, useRef } from 'react';
import { saveGame, loadGame } from '../utils/persistence';
import { Journal } from './Journal';
import { InventoryUI } from './InventoryUI';
import { StatusPanel } from './StatusPanel';
import { useTextScale } from '../context/TextScaleContext';

const HUD_BG     = '#d6cab0';
const HUD_HOVER  = '#cb7866';
const HUD_TEXT   = '#3a2010';
const HUD_HEIGHT = 48;
const FONT       = 'Courier New, monospace';

// ── Shared hover hook ──────────────────────────────────────────────────────────
const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    bind: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  };
};

// ── HUD button ─────────────────────────────────────────────────────────────────
const HudButton = React.forwardRef(({ children, onClick, active = false, style = {} }, ref) => {
  const { hovered, bind } = useHover();
  const zoom = useTextScale();
  const lit = hovered || active;
  return (
    <button
      ref={ref}
      onClick={onClick}
      {...bind}
      style={{
        height: HUD_HEIGHT,
        padding: '0 24px',
        background: lit ? HUD_HOVER : 'transparent',
        color: lit ? '#fff' : HUD_TEXT,
        border: 'none',
        borderRight: `1px solid rgba(58,32,16,0.18)`,
        fontFamily: FONT,
        fontSize: `${11 * zoom}px`,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
});

// ── Popup item ─────────────────────────────────────────────────────────────────
const PopupItem = ({ label, onClick, danger = false, muted = false }) => {
  const { hovered, bind } = useHover();
  const zoom = useTextScale();
  const disabled = muted;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      {...(disabled ? {} : bind)}
      style={{
        display: 'block',
        width: '100%',
        padding: '11px 20px',
        background: !disabled && hovered ? HUD_HOVER : 'transparent',
        color: disabled ? 'rgba(58,32,16,0.25)' : hovered ? '#fff' : danger ? HUD_HOVER : HUD_TEXT,
        border: 'none',
        borderTop: `1px solid rgba(58,32,16,0.12)`,
        fontFamily: FONT,
        fontSize: `${11 * zoom}px`,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  );
};

// ── Inline settings components (HUD beige theme) ───────────────────────────────
const SettingsSection = ({ children }) => (
  <div style={{
    fontFamily: FONT, fontSize: 8, letterSpacing: '3px',
    color: 'rgba(58,32,16,0.4)', textTransform: 'uppercase',
    padding: '12px 16px 5px',
  }}>
    {children}
  </div>
);

const SettingsRow = ({ label, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px',
    borderTop: `1px solid rgba(58,32,16,0.1)`,
  }}>
    <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px', color: HUD_TEXT, textTransform: 'uppercase' }}>
      {label}
    </span>
    {children}
  </div>
);

const SettingsSlider = ({ value, onChange, min = 0, max = 100 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: 100, accentColor: HUD_HOVER, cursor: 'pointer' }}
    />
    <span style={{ fontFamily: FONT, fontSize: 9, color: 'rgba(58,32,16,0.5)', width: 24, textAlign: 'right' }}>
      {value}%
    </span>
  </div>
);

const SettingsToggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 40, height: 20, border: 'none', cursor: 'pointer',
      background: value ? HUD_HOVER : 'rgba(58,32,16,0.15)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', top: 2,
      left: value ? 22 : 2,
      width: 16, height: 16,
      background: value ? '#fff' : 'rgba(58,32,16,0.4)',
      transition: 'left 0.2s',
    }} />
  </button>
);

const SettingsSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      background: 'rgba(58,32,16,0.08)', color: HUD_TEXT,
      border: `1px solid rgba(58,32,16,0.25)`,
      fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
      padding: '4px 8px', cursor: 'pointer', outline: 'none',
      textTransform: 'uppercase',
    }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ── Settings tab content ───────────────────────────────────────────────────────
const VideoContent = () => {
  const [quality,    setQuality]    = useState('HIGH');
  const [fullscreen, setFullscreen] = useState(false);
  const [vsync,      setVsync]      = useState(true);
  return (<>
    <SettingsSection>Display</SettingsSection>
    <SettingsRow label="Fullscreen"><SettingsToggle value={fullscreen} onChange={setFullscreen} /></SettingsRow>
    <SettingsRow label="V-Sync"><SettingsToggle value={vsync} onChange={setVsync} /></SettingsRow>
    <SettingsRow label="Quality">
      <SettingsSelect value={quality} onChange={setQuality} options={[
        { value: 'LOW',    label: 'LOW'    },
        { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'HIGH',   label: 'HIGH'   },
        { value: 'ULTRA',  label: 'ULTRA'  },
      ]} />
    </SettingsRow>
  </>);
};

const SoundContent = () => {
  const [master,  setMaster]  = useState(80);
  const [music,   setMusic]   = useState(70);
  const [sfx,     setSfx]     = useState(90);
  const [ambient, setAmbient] = useState(60);
  const [mute,    setMute]    = useState(false);
  return (<>
    <SettingsSection>Volume</SettingsSection>
    <SettingsRow label="Mute All"><SettingsToggle value={mute} onChange={setMute} /></SettingsRow>
    <SettingsRow label="Master"><SettingsSlider value={master} onChange={setMaster} /></SettingsRow>
    <SettingsRow label="Music"><SettingsSlider value={music} onChange={setMusic} /></SettingsRow>
    <SettingsRow label="Sound Effects"><SettingsSlider value={sfx} onChange={setSfx} /></SettingsRow>
    <SettingsRow label="Ambient"><SettingsSlider value={ambient} onChange={setAmbient} /></SettingsRow>
  </>);
};

const LanguageContent = () => {
  const [lang,      setLang]      = useState('EN');
  const [subtitles, setSubtitles] = useState(true);
  const [subSize,   setSubSize]   = useState('MEDIUM');
  return (<>
    <SettingsSection>Language</SettingsSection>
    <SettingsRow label="Interface">
      <SettingsSelect value={lang} onChange={setLang} options={[
        { value: 'EN', label: 'English'   },
        { value: 'FR', label: 'Français'  },
        { value: 'DE', label: 'Deutsch'   },
        { value: 'ES', label: 'Español'   },
        { value: 'PT', label: 'Português' },
        { value: 'JA', label: '日本語'     },
        { value: 'ZH', label: '中文'       },
      ]} />
    </SettingsRow>
    <SettingsSection>Subtitles</SettingsSection>
    <SettingsRow label="Show Subtitles"><SettingsToggle value={subtitles} onChange={setSubtitles} /></SettingsRow>
    <SettingsRow label="Size">
      <SettingsSelect value={subSize} onChange={setSubSize} options={[
        { value: 'SMALL',  label: 'SMALL'  },
        { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'LARGE',  label: 'LARGE'  },
      ]} />
    </SettingsRow>
  </>);
};

const GameplayContent = ({ gameState, setGameState }) => {
  const [difficulty, setDifficulty] = useState('STANDARD');
  const [hints,      setHints]      = useState(true);
  const textScale = gameState?.textScale ?? 100;
  return (<>
    <SettingsSection>Difficulty</SettingsSection>
    <SettingsRow label="Difficulty">
      <SettingsSelect value={difficulty} onChange={setDifficulty} options={[
        { value: 'GHOST',    label: 'GHOST'    },
        { value: 'STANDARD', label: 'STANDARD' },
        { value: 'EXPOSED',  label: 'EXPOSED'  },
      ]} />
    </SettingsRow>
    <SettingsSection>Accessibility</SettingsSection>
    <SettingsRow label="Hints"><SettingsToggle value={hints} onChange={setHints} /></SettingsRow>
    <SettingsSection>Interface</SettingsSection>
    <SettingsRow label="Text Size">
      <SettingsSlider
        value={textScale}
        min={80}
        max={140}
        onChange={v => setGameState(p => ({ ...p, textScale: v }))}
      />
    </SettingsRow>
  </>);
};

// ── Controls view ──────────────────────────────────────────────────────────────
const CONTROL_GROUPS = [
  {
    heading: 'Movement',
    rows: [
      { keys: 'W A S D',  pad: 'Left Stick / D-Pad',  action: 'Move'         },
      { keys: 'Shift',    pad: 'LT / LB',              action: 'Sprint'       },
      { keys: 'C',        pad: 'B / Circle',           action: 'Crouch'       },
    ],
  },
  {
    heading: 'Actions',
    rows: [
      { keys: 'E',              pad: 'A / Cross',            action: 'Interact'          },
      { keys: 'Right-click',    pad: 'RB / RT',              action: 'Ability Toggle'    },
      { keys: 'Hold R-click',   pad: 'Hold RB/RT near NPC',  action: 'Observe (Mimicry)' },
      { keys: '—',              pad: 'X / Square',           action: 'Toggle Cursor'     },
      { keys: '—',              pad: 'A (cursor on)',        action: 'Click'             },
      { keys: '—',              pad: 'B (cursor on)',        action: 'Right-click'       },
    ],
  },
  {
    heading: 'Interface',
    rows: [
      { keys: 'Tab',  pad: 'Start / Options',  action: 'Menu'          },
      { keys: 'J',    pad: 'Back / Select',    action: 'Journal'       },
      { keys: 'I',    pad: 'Y / Triangle',     action: 'Satchel'       },
      { keys: 'Esc',  pad: '—',               action: 'Close All'     },
      { keys: 'G',    pad: '—',               action: 'Debug Overlay' },
    ],
  },
];

const KeyBadge = ({ label }) => (
  <span style={{
    fontFamily: FONT, fontSize: 8, letterSpacing: '0.5px',
    color: 'rgba(58,32,16,0.55)',
    background: 'rgba(58,32,16,0.06)',
    border: `1px solid rgba(58,32,16,0.18)`,
    padding: '2px 6px',
    whiteSpace: 'nowrap',
    display: 'inline-block',
  }}>
    {label}
  </span>
);

const ControlsView = ({ onBack }) => {
  const zoom = useTextScale();
  return (
    <div style={{ minWidth: 380, zoom }}>
      <button
        onClick={onBack}
        onMouseEnter={e => { e.currentTarget.style.color = HUD_TEXT; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(58,32,16,0.45)'; }}
        style={{
          display: 'block', width: '100%',
          padding: '9px 16px',
          background: 'transparent', border: 'none',
          borderBottom: `1px solid rgba(58,32,16,0.15)`,
          fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
          color: 'rgba(58,32,16,0.45)', textTransform: 'uppercase',
          cursor: 'pointer', textAlign: 'left',
          transition: 'color 0.15s',
        }}
      >
        ← MENU
      </button>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 110px 110px',
        padding: '6px 16px 4px',
        borderBottom: `1px solid rgba(58,32,16,0.12)`,
      }}>
        {['ACTION', 'KEYBOARD', 'CONTROLLER'].map(h => (
          <span key={h} style={{
            fontFamily: FONT, fontSize: 7, letterSpacing: '2px',
            color: 'rgba(58,32,16,0.35)', textTransform: 'uppercase',
            textAlign: h === 'ACTION' ? 'left' : 'center',
          }}>{h}</span>
        ))}
      </div>

      <div style={{ maxHeight: 420, overflowY: 'auto', padding: '4px 0 8px' }}>
        {CONTROL_GROUPS.map(({ heading, rows }) => (
          <div key={heading}>
            <div style={{
              fontFamily: FONT, fontSize: 8, letterSpacing: '3px',
              color: 'rgba(58,32,16,0.4)', textTransform: 'uppercase',
              padding: '10px 16px 5px',
            }}>
              {heading}
            </div>
            {rows.map(({ keys, pad, action }) => (
              <div
                key={action}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 110px 110px',
                  alignItems: 'center',
                  padding: '5px 16px',
                  borderTop: `1px solid rgba(58,32,16,0.07)`,
                  gap: 4,
                }}
              >
                <span style={{
                  fontFamily: FONT, fontSize: 9, letterSpacing: '0.8px',
                  color: HUD_TEXT, textTransform: 'uppercase',
                }}>
                  {action}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <KeyBadge label={keys} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <KeyBadge label={pad} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Menu popup ─────────────────────────────────────────────────────────────────
const OPTIONS_TABS = ['VIDEO', 'SOUND', 'LANGUAGE', 'GAMEPLAY'];

const MenuPopup = ({ gameState, setGameState, onLoad, onReset, onClose, onDebug }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [optionsView,  setOptionsView]  = useState(null); // null = main list, 'controls', or options tab name
  const hasSave = !!loadGame();
  const zoom = useTextScale();

  return (
    <div
      style={{
        background: HUD_BG,
        borderTop: `2px solid ${HUD_HOVER}`,
        borderRight: `1px solid rgba(58,32,16,0.25)`,
        minWidth: (optionsView && optionsView !== 'controls') ? 340 : optionsView === 'controls' ? 380 : 180,
        zoom,
        boxShadow: '2px -4px 20px rgba(0,0,0,0.35)',
      }}
    >
      {optionsView === 'controls' ? (
        // ── CONTROLS VIEW ────────────────────────────────────────────────────
        <ControlsView onBack={() => setOptionsView(null)} />
      ) : optionsView ? (
        // ── OPTIONS VIEW ──────────────────────────────────────────────────────
        <>
          {/* Back */}
          <button
            onClick={() => setOptionsView(null)}
            onMouseEnter={e => { e.currentTarget.style.color = HUD_TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(58,32,16,0.45)'; }}
            style={{
              display: 'block', width: '100%',
              padding: '9px 16px',
              background: 'transparent', border: 'none',
              borderBottom: `1px solid rgba(58,32,16,0.15)`,
              fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
              color: 'rgba(58,32,16,0.45)', textTransform: 'uppercase',
              cursor: 'pointer', textAlign: 'left',
              transition: 'color 0.15s',
            }}
          >
            ← MENU
          </button>

          {/* Tab strip */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid rgba(58,32,16,0.15)`,
            padding: '0 8px',
          }}>
            {OPTIONS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setOptionsView(tab)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: 'none', border: 'none',
                  borderBottom: optionsView === tab
                    ? `2px solid ${HUD_HOVER}`
                    : '2px solid transparent',
                  color: optionsView === tab ? HUD_HOVER : 'rgba(58,32,16,0.4)',
                  fontFamily: FONT, fontSize: 8, letterSpacing: '1.5px',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {optionsView === 'VIDEO'    && <VideoContent    />}
            {optionsView === 'SOUND'    && <SoundContent    />}
            {optionsView === 'LANGUAGE' && <LanguageContent />}
            {optionsView === 'GAMEPLAY' && <GameplayContent gameState={gameState} setGameState={setGameState} />}
          </div>
        </>
      ) : (
        // ── MAIN MENU VIEW ────────────────────────────────────────────────────
        <>
          <PopupItem label="SAVE GAME" onClick={() => { saveGame(gameState); onClose(); }} />
          <PopupItem
            label="LOAD GAME"
            onClick={() => { if (hasSave) { onLoad(); onClose(); } }}
            muted={!hasSave}
          />
          <PopupItem label="OPTIONS"   onClick={() => setOptionsView('VIDEO')} />
          <PopupItem label="CONTROLS"  onClick={() => setOptionsView('controls')} />
          <PopupItem label="DEBUG [G]" onClick={() => { onDebug?.(); onClose(); }} />

          {/* RESET — two-step confirm */}
          {!confirmReset ? (
            <PopupItem label="RESET" onClick={() => setConfirmReset(true)} danger />
          ) : (
            <div style={{ padding: '10px 20px', borderTop: `1px solid rgba(58,32,16,0.12)` }}>
              <div style={{
                fontFamily: FONT, fontSize: 9, color: HUD_HOVER,
                letterSpacing: '1px', marginBottom: 8,
              }}>
                ALL PROGRESS LOST
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onReset(); onClose(); }}
                  style={{
                    fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
                    background: HUD_HOVER, color: '#fff', border: 'none',
                    padding: '5px 12px', cursor: 'pointer',
                  }}
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  style={{
                    fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
                    background: 'transparent', color: HUD_TEXT,
                    border: `1px solid rgba(58,32,16,0.3)`,
                    padding: '5px 12px', cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          <PopupItem label="QUIT" onClick={() => window.location.reload()} />
        </>
      )}
    </div>
  );
};


// ── Draggable panel wrapper ────────────────────────────────────────────────────
const DraggablePanel = ({ position, zIndex, onDrag, onClose, onFocus, children }) => {
  const handleBarMouseDown = (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    onFocus();
    const ox = e.clientX - position.x, oy = e.clientY - position.y;
    const move = (ev) => onDrag({ x: ev.clientX - ox, y: ev.clientY - oy });
    const up   = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  return (
    <div
      onMouseDown={onFocus}
      style={{ position: 'fixed', left: position.x, top: position.y, zIndex, userSelect: 'none' }}
    >
      <div
        onMouseDown={handleBarMouseDown}
        style={{
          height: 24,
          background: '#89ceaf',
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 2,
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.2)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace',
            padding: '0 7px',
            height: 18,
            lineHeight: '18px',
            borderRadius: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
        >✕</button>
      </div>
      {children}
    </div>
  );
};

// ── Rooms where moving without concealment is actively dangerous ───────────────
// Add city / public / overseen location IDs here as they are built.
const CONCEALMENT_REQUIRED = new Set([
  'city_square',
  'market_street',
  'plantation_road',
  'town_hall',
  'docks',
]);

const AuraStatsBox = ({ morphStability, vigor, hunger, activeMorph, activeAbility, currentRoom }) => {
  const [hovered, setHovered] = useState(false);
  const zoom = useTextScale();
  const stabilityColor  = morphStability < 25 ? '#c0392b' : morphStability < 50 ? '#b08030' : '#2a5a3a';
  const hungerColor     = hunger < 25 ? '#c0392b' : hunger < 55 ? '#b08030' : '#2a7a5a';
  const isIdle          = !activeMorph && (!activeAbility || activeAbility === 'NONE');
  const inDangerZone    = CONCEALMENT_REQUIRED.has(currentRoom);

  return (
  <div
    style={{ position: 'relative', flexShrink: 0 }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
    {/* Hover popover */}
    {hovered && (
      <div style={{
        position: 'absolute',
        bottom: HUD_HEIGHT + 8,
        left: '50%',
        transform: 'translateX(-50%)',
        background: HUD_BG,
        border: `1px solid rgba(58,32,16,0.3)`,
        borderTop: `2px solid ${stabilityColor}`,
        padding: '12px 16px',
        minWidth: 200,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        zIndex: 9200,
        zoom,
      }}>
        {[
          { label: 'Morph Stability', value: morphStability, color: stabilityColor },
          { label: 'Vigor',           value: vigor,          color: '#2a7a5a'       },
          { label: 'Hunger',          value: hunger ?? 100,  color: hungerColor     },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
              color: 'rgba(58,32,16,0.5)', textTransform: 'uppercase', marginBottom: 4,
            }}>
              <span>{label}</span>
              <strong style={{ color }}>{Math.round(value)}%</strong>
            </div>
            <div style={{ height: 2, background: 'rgba(58,32,16,0.18)' }}>
              <div style={{ height: '100%', width: `${value}%`, background: color, transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
        {isIdle && (
          <div style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: `1px solid rgba(58,32,16,0.12)`,
            fontFamily: 'Georgia, serif',
            fontSize: 11,
            fontStyle: 'italic',
            color: inDangerZone ? '#c0392b' : 'rgba(58,32,16,0.45)',
            lineHeight: 1.5,
          }}>
            {inDangerZone
              ? 'You are exposed. In the city, a Black woman moving without concealment draws immediate suspicion. Activate an ability or remain hidden.'
              : 'No morph or aura ability active.'}
          </div>
        )}
      </div>
    )}

    {/* Bar strip */}
  <div style={{
    height: HUD_HEIGHT,
    background: '#89ceaf',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    padding: '0 20px',
    borderRight: `1px solid rgba(58,32,16,0.18)`,
    cursor: 'default',
  }}>
    {[
      { label: 'VIGOR',           value: vigor,          color: '#2a7a5a'    },
      { label: 'MORPH STABILITY', value: morphStability, color: stabilityColor },
      { label: 'HUNGER',          value: hunger ?? 100,  color: hungerColor  },
    ].map(({ label, value, color }) => (
      <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
          color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase',
        }}>
          {label}
        </span>
        <div style={{ width: 64, height: 3, background: 'rgba(0,0,0,0.18)', borderRadius: 2 }}>
          <div style={{
            height: '100%', width: `${value}%`,
            background: color, borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    ))}
  </div>
  </div>
  );
};

// ── Gamepad indicator ─────────────────────────────────────────────────────────
const useGamepadConnected = () => {
  const [connected,    setConnected]    = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  useEffect(() => {
    const check = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      setConnected(Array.from(pads).some(p => p?.mapping === 'standard'));
    };
    check();
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => { check(); };
    const onCursor     = (e) => setCursorActive(e.detail);
    window.addEventListener('gamepadconnected',    onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    window.addEventListener('gp-cursor-mode',      onCursor);
    return () => {
      window.removeEventListener('gamepadconnected',    onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
      window.removeEventListener('gp-cursor-mode',      onCursor);
    };
  }, []);
  return { connected, cursorActive };
};

// ── Main HUD ───────────────────────────────────────────────────────────────────
export const HUD = ({
  gameState,
  setGameState,
  onLoad,
  onReset,
  onDebug,
}) => {
  const { pendingGive, nearbyNPC, nearbyEntity, morphStability = 100, vigor = 100, hunger = 100, activeMorph = null, activeAbility = 'NONE', currentRoom } = gameState;

  const zoom = useTextScale();
  const { connected: gamepadConnected, cursorActive } = useGamepadConnected();

  // ── Multi-panel state ──────────────────────────────────────────────────────
  const [openPanels, setOpenPanels] = useState(new Set());
  const [positions,  setPositions]  = useState({});
  const zCounter = useRef(9101);
  const [zMap,    setZMap]          = useState({});

  // Button refs — used to place each panel above its own button
  const menuBtnRef    = useRef(null);
  const journalBtnRef = useRef(null);
  const satchelBtnRef = useRef(null);
  const statusBtnRef  = useRef(null);

  // Panel widths (physical px) and approximate heights for default placement.
  // Panels open with their bottom flush against the top of the HUD bar.
  const PANEL_META = {
    menu:    { w: 200, h: 260 },
    journal: { w: 700, h: 640 },
    satchel: { w: 295, h: 430 },
    status:  { w: 860, h: 660 },
  };

  // Returns a default {x, y} in physical screen space.
  // x is centred under the button that opened the panel; y places the panel
  // bottom flush against the HUD bar (window.innerHeight - HUD_HEIGHT).
  const getDefaultPos = (key) => {
    const meta   = PANEL_META[key] ?? { w: 300, h: 400 };
    const btnRef = { menu: menuBtnRef, journal: journalBtnRef, satchel: satchelBtnRef, status: statusBtnRef }[key];
    let cx = window.innerWidth / 2;
    if (btnRef?.current) {
      const rect = btnRef.current.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
    }
    return {
      x: Math.max(10, Math.min(window.innerWidth  - meta.w - 10, cx - meta.w / 2)),
      y: Math.max(10, window.innerHeight - HUD_HEIGHT - meta.h - 8),
    };
  };

  const bringToFront = (key) => { zCounter.current += 1; setZMap(m => ({ ...m, [key]: zCounter.current })); };
  const openPanel    = (key) => {
    setOpenPanels(s => new Set(s).add(key));
    setPositions(p => p[key] ? p : { ...p, [key]: getDefaultPos(key) });
    bringToFront(key);
  };
  const closePanel = (key) => setOpenPanels(s => { const n = new Set(s); n.delete(key); return n; });
  const movePanel  = (key, pos) => setPositions(p => ({ ...p, [key]: pos }));

  // Keyboard shortcuts (Tab=menu, J=journal, I=satchel, Esc=close all)
  useEffect(() => {
    const fn = (e) => {
      if (e.key.toLowerCase() === 'i') { openPanels.has('satchel') ? closePanel('satchel') : openPanel('satchel'); }
      if (e.key.toLowerCase() === 'j') { openPanels.has('journal') ? closePanel('journal') : openPanel('journal'); }
      if (e.key === 'Tab') { e.preventDefault(); openPanels.has('menu') ? closePanel('menu') : openPanel('menu'); }
      if (e.key === 'Escape') setOpenPanels(new Set());
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [openPanels]); // re-registers when panels open/close so it closes over fresh state

  // Bottom-left action prompt — key hint swaps to controller label when a pad is active
  const interactHint = gamepadConnected ? '[A]'     : '[E]';
  const cancelHint   = gamepadConnected ? '[START]' : '[ESC]';
  let centerText = null;
  if (pendingGive) {
    centerText = nearbyNPC
      ? `${interactHint} GIVE TO ${nearbyNPC.name.toUpperCase()} — ${pendingGive.name.toUpperCase()}`
      : `GIVING: ${pendingGive.name.toUpperCase()} — APPROACH AN NPC`;
  } else if (nearbyEntity?.name && nearbyEntity.logicType !== 'HIDE') {
    centerText = `${interactHint}  ${nearbyEntity.name.toUpperCase()}`;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: HUD_HEIGHT,
      background: HUD_BG,
      borderTop: `1px solid rgba(58,32,16,0.3)`,
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 9000,
      fontFamily: FONT,
      userSelect: 'none',
    }}>

      {/* LEFT — current action box, content-sized, only when active */}
      {centerText && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 20px',
          background: '#658963',
          borderRight: `1px solid rgba(58,32,16,0.2)`,
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: FONT,
            fontSize: `${10 * zoom}px`,
            letterSpacing: '1.5px',
            color: '#fff',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            {centerText}
          </span>
          {pendingGive && (
            <button
              onClick={() => setGameState(p => ({ ...p, pendingGive: null }))}
              style={{
                fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                border: `1px solid rgba(255,255,255,0.3)`,
                padding: '3px 8px', cursor: 'pointer',
                textTransform: 'uppercase', flexShrink: 0,
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            >
              {cancelHint} CANCEL
            </button>
          )}
        </div>
      )}

      {/* Fills space left of center */}
      <div style={{ flex: 1 }} />

      {/* RIGHT — gamepad indicator */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 16px',
        borderLeft: `1px solid rgba(58,32,16,0.18)`,
        gap: 6,
        flexShrink: 0,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: cursorActive ? '#cb7866' : gamepadConnected ? '#5a9a5a' : 'rgba(58,32,16,0.2)',
          transition: 'background 0.3s',
        }} />
        <span style={{
          fontFamily: FONT,
          fontSize: `${9 * zoom}px`,
          letterSpacing: '1.5px',
          color: gamepadConnected ? HUD_TEXT : 'rgba(58,32,16,0.3)',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>
          {cursorActive ? 'CUR' : 'CTR'}
        </span>
      </div>

      {/* CENTER — button group, absolutely centered in the bar */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        height: HUD_HEIGHT,
        display: 'flex',
        alignItems: 'stretch',
        borderLeft:  `1px solid rgba(58,32,16,0.18)`,
        borderRight: `1px solid rgba(58,32,16,0.18)`,
      }}>

        {/* MENU — click to open */}
        <HudButton
          ref={menuBtnRef}
          active={openPanels.has('menu')}
          style={{ borderLeft: 'none' }}
          onClick={() => openPanels.has('menu') ? closePanel('menu') : openPanel('menu')}
        >
          MENU
        </HudButton>

        {/* JOURNAL — click to open */}
        <button
          ref={journalBtnRef}
          onClick={() => openPanels.has('journal') ? closePanel('journal') : openPanel('journal')}
          style={{
            height: HUD_HEIGHT, padding: '0 24px',
            background: openPanels.has('journal') ? HUD_HOVER : 'transparent',
            color: openPanels.has('journal') ? '#fff' : HUD_TEXT,
            border: 'none', borderRight: `1px solid rgba(58,32,16,0.18)`,
            fontFamily: FONT, fontSize: `${11 * zoom}px`,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s', flexShrink: 0,
          }}
        >
          JOURNAL
        </button>

        {/* STATS BOX — vigor + morphStability with aura alert popover (hover, unchanged) */}
        <AuraStatsBox morphStability={morphStability} vigor={vigor} hunger={hunger} activeMorph={activeMorph} activeAbility={activeAbility} currentRoom={currentRoom} />

        {/* SATCHEL — click to open */}
        <button
          ref={satchelBtnRef}
          onClick={() => openPanels.has('satchel') ? closePanel('satchel') : openPanel('satchel')}
          style={{
            height: HUD_HEIGHT, padding: '0 24px',
            background: openPanels.has('satchel') ? HUD_HOVER : 'transparent',
            color: openPanels.has('satchel') ? '#fff' : HUD_TEXT,
            border: 'none',
            borderLeft:  `1px solid rgba(58,32,16,0.18)`,
            borderRight: `1px solid rgba(58,32,16,0.18)`,
            fontFamily: FONT, fontSize: `${11 * zoom}px`,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s', flexShrink: 0,
          }}
        >
          SATCHEL
        </button>

        {/* STATUS — click to open */}
        <button
          ref={statusBtnRef}
          onClick={() => openPanels.has('status') ? closePanel('status') : openPanel('status')}
          style={{
            height: HUD_HEIGHT, padding: '0 24px',
            background: openPanels.has('status') ? HUD_HOVER : 'transparent',
            color: openPanels.has('status') ? '#fff' : HUD_TEXT,
            border: 'none',
            fontFamily: FONT, fontSize: `${11 * zoom}px`,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s', flexShrink: 0,
          }}
        >
          STATUS
        </button>

      </div>

      {/* DRAGGABLE PANELS — position: fixed, rendered inside HUD div but escape stacking context */}
      {openPanels.has('menu') && positions.menu && (
        <DraggablePanel
          position={positions.menu} zIndex={zMap.menu ?? 9101}
          onDrag={p => movePanel('menu', p)}
          onClose={() => closePanel('menu')}
          onFocus={() => bringToFront('menu')}
        >
          <MenuPopup
            gameState={gameState} setGameState={setGameState}
            onLoad={onLoad} onReset={onReset}
            onClose={() => closePanel('menu')}
            onDebug={onDebug}
          />
        </DraggablePanel>
      )}
      {openPanels.has('journal') && positions.journal && (
        <DraggablePanel
          position={positions.journal} zIndex={zMap.journal ?? 9101}
          onDrag={p => movePanel('journal', p)}
          onClose={() => closePanel('journal')}
          onFocus={() => bringToFront('journal')}
        >
          <Journal gameState={gameState} />
        </DraggablePanel>
      )}
      {openPanels.has('satchel') && positions.satchel && (
        <DraggablePanel
          position={positions.satchel} zIndex={zMap.satchel ?? 9101}
          onDrag={p => movePanel('satchel', p)}
          onClose={() => closePanel('satchel')}
          onFocus={() => bringToFront('satchel')}
        >
          <InventoryUI
            gameState={gameState} setGameState={setGameState}
            onClose={() => closePanel('satchel')}
          />
        </DraggablePanel>
      )}
      {openPanels.has('status') && positions.status && (
        <DraggablePanel
          position={positions.status} zIndex={zMap.status ?? 9101}
          onDrag={p => movePanel('status', p)}
          onClose={() => closePanel('status')}
          onFocus={() => bringToFront('status')}
        >
          <StatusPanel gameState={gameState} setGameState={setGameState} />
        </DraggablePanel>
      )}

    </div>
  );
};
