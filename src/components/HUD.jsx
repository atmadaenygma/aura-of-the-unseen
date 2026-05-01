import React, { useState, useEffect, useRef } from 'react';
import { saveGame } from '../utils/persistence';
import { Journal } from './Journal';
import { InventoryUI } from './InventoryUI';

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
const HudButton = ({ children, onClick, active = false, style = {} }) => {
  const { hovered, bind } = useHover();
  const lit = hovered || active;
  return (
    <button
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
        fontSize: 11,
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
};

// ── Popup item ─────────────────────────────────────────────────────────────────
const PopupItem = ({ label, onClick, danger = false }) => {
  const { hovered, bind } = useHover();
  return (
    <button
      onClick={onClick}
      {...bind}
      style={{
        display: 'block',
        width: '100%',
        padding: '11px 20px',
        background: hovered ? HUD_HOVER : 'transparent',
        color: hovered ? '#fff' : danger ? HUD_HOVER : HUD_TEXT,
        border: 'none',
        borderTop: `1px solid rgba(58,32,16,0.12)`,
        fontFamily: FONT,
        fontSize: 11,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textAlign: 'left',
        cursor: 'pointer',
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
  const [brightness, setBrightness] = useState(50);
  const [contrast,   setContrast]   = useState(50);
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
    <SettingsSection>Image</SettingsSection>
    <SettingsRow label="Brightness"><SettingsSlider value={brightness} onChange={setBrightness} /></SettingsRow>
    <SettingsRow label="Contrast"><SettingsSlider value={contrast} onChange={setContrast} /></SettingsRow>
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

const GameplayContent = () => {
  const [difficulty, setDifficulty] = useState('STANDARD');
  const [autosave,   setAutosave]   = useState(true);
  const [hints,      setHints]      = useState(true);
  const [hud,        setHud]        = useState(true);
  const [camShake,   setCamShake]   = useState(false);
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
    <SettingsRow label="Auto-Save"><SettingsToggle value={autosave} onChange={setAutosave} /></SettingsRow>
    <SettingsRow label="Hints"><SettingsToggle value={hints} onChange={setHints} /></SettingsRow>
    <SettingsRow label="HUD Visible"><SettingsToggle value={hud} onChange={setHud} /></SettingsRow>
    <SettingsRow label="Camera Shake"><SettingsToggle value={camShake} onChange={setCamShake} /></SettingsRow>
  </>);
};

// ── Menu popup ─────────────────────────────────────────────────────────────────
const OPTIONS_TABS = ['VIDEO', 'SOUND', 'LANGUAGE', 'GAMEPLAY'];

const MenuPopup = ({ gameState, onOpenLedger, onReset, onClose }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [optionsView,  setOptionsView]  = useState(null); // null = main list, else tab name

  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: HUD_HEIGHT,
        left: 0,
        background: HUD_BG,
        borderTop: `2px solid ${HUD_HOVER}`,
        borderRight: `1px solid rgba(58,32,16,0.25)`,
        minWidth: optionsView ? 340 : 180,
        zIndex: 9100,
        boxShadow: '2px -4px 20px rgba(0,0,0,0.35)',
      }}
    >
      {optionsView ? (
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
            {optionsView === 'GAMEPLAY' && <GameplayContent />}
          </div>
        </>
      ) : (
        // ── MAIN MENU VIEW ────────────────────────────────────────────────────
        <>
          <PopupItem label="MAIN MENU" onClick={() => { onOpenLedger(); onClose(); }} />
          <PopupItem label="SAVE GAME" onClick={() => { saveGame(gameState); onClose(); }} />
          <PopupItem label="OPTIONS"   onClick={() => setOptionsView('VIDEO')} />

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

// ── Aura alert copy ────────────────────────────────────────────────────────────
const getAuraAlert = (integrity) => {
  if (integrity >= 75) return { headline: 'Your Aura is Strong',        body: 'You move unseen. The world bends around you.',          color: '#2a7a5a' };
  if (integrity >= 50) return { headline: 'Your Aura is Wavering',      body: 'Something has noticed you. Stay cautious.',             color: '#7a6a2a' };
  if (integrity >= 25) return { headline: 'Your Aura is Faltering',     body: 'The veil is thinning. Find shadow before it breaks.',   color: '#c07a2a' };
  return               { headline: 'Your Aura is Critically Low',       body: 'You need to find cover. You are almost fully exposed.', color: '#c0392b' };
};

const AuraStatsBox = ({ integrity, vigor }) => {
  const [hovered, setHovered] = useState(false);
  const alert = getAuraAlert(integrity);

  return (
    <div
      style={{ position: 'relative', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Popover */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: HUD_HEIGHT + 8,
          left: 0,
          background: HUD_BG,
          border: `2px solid ${alert.color}`,
          padding: '12px 16px',
          minWidth: 220,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          zIndex: 9200,
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 10, letterSpacing: '2px',
            color: alert.color, textTransform: 'uppercase', marginBottom: 6,
            fontWeight: 'bold',
          }}>
            {alert.headline}
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 10, color: HUD_TEXT,
            lineHeight: 1.6, letterSpacing: '0.5px',
          }}>
            {alert.body}
          </div>
          <div style={{
            marginTop: 10,
            display: 'flex', gap: 16,
            fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
            color: 'rgba(58,32,16,0.5)', textTransform: 'uppercase',
          }}>
            <span>INTEGRITY <strong style={{ color: alert.color }}>{Math.round(integrity)}%</strong></span>
            <span>VIGOR <strong style={{ color: '#2a7a5a' }}>{Math.round(vigor)}%</strong></span>
          </div>
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
          { label: 'VIGOR',     value: vigor,     color: '#2a7a5a' },
          { label: 'INTEGRITY', value: integrity, color: integrity < 25 ? '#c0392b' : '#2a5a3a' },
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

// ── Main HUD ───────────────────────────────────────────────────────────────────
export const HUD = ({
  gameState,
  setGameState,
  activePanel,
  setActivePanel,
  onOpenLedger,
  onReset,
}) => {
  const { pendingGive, nearbyNPC, nearbyEntity, integrity = 100, vigor = 100 } = gameState;

  const menuOpen    = activePanel === 'menu';
  const journalOpen = activePanel === 'journal';
  const satchelOpen = activePanel === 'satchel';

  const toggle = (panel) => setActivePanel(p => p === panel ? null : panel);

  // Bottom-left action prompt
  let centerText = null;
  if (pendingGive) {
    centerText = nearbyNPC
      ? `[E] GIVE TO ${nearbyNPC.name.toUpperCase()} — ${pendingGive.name.toUpperCase()}`
      : `GIVING: ${pendingGive.name.toUpperCase()} — APPROACH AN NPC`;
  } else if (nearbyEntity?.name && nearbyEntity.logicType !== 'HIDE') {
    centerText = `[E]  ${nearbyEntity.name.toUpperCase()}`;
  }

  const { hovered: statusHovered, bind: statusBind } = useHover();

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
            fontSize: 10,
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
              [ESC] CANCEL
            </button>
          )}
        </div>
      )}

      {/* Fills space left of center */}
      <div style={{ flex: 1 }} />

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

        {/* MENU — popup on hover */}
        <div
          style={{ position: 'relative', flexShrink: 0 }}
          onMouseEnter={() => setActivePanel('menu')}
          onMouseLeave={() => setActivePanel(p => p === 'menu' ? null : p)}
        >
          <HudButton active={menuOpen} style={{ borderLeft: 'none' }}>
            MENU
          </HudButton>
          {menuOpen && (
            <MenuPopup
              gameState={gameState}
              onOpenLedger={onOpenLedger}
              onReset={onReset}
              onClose={() => setActivePanel(null)}
            />
          )}
        </div>

        {/* JOURNAL */}
        <div
          style={{ position: 'relative', flexShrink: 0 }}
          onMouseEnter={() => setActivePanel(p => p && p !== 'journal' ? null : p)}
        >
          <button
            onClick={() => toggle('journal')}
            style={{
              height: HUD_HEIGHT,
              padding: '0 24px',
              background: journalOpen ? HUD_HOVER : 'transparent',
              color: journalOpen ? '#fff' : HUD_TEXT,
              border: 'none',
              borderRight: `1px solid rgba(58,32,16,0.18)`,
              fontFamily: FONT, fontSize: 11,
              letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
          >
            JOURNAL
          </button>
          {journalOpen && <Journal gameState={gameState} />}
        </div>

        {/* STATS BOX — vigor + integrity with aura alert popover */}
        <AuraStatsBox integrity={integrity} vigor={vigor} />

        {/* SATCHEL */}
        <div
          style={{ position: 'relative', flexShrink: 0 }}
          onMouseEnter={() => setActivePanel(p => p && p !== 'satchel' ? null : p)}
        >
          <button
            onClick={() => toggle('satchel')}
            style={{
              height: HUD_HEIGHT,
              padding: '0 24px',
              background: satchelOpen ? HUD_HOVER : 'transparent',
              color: satchelOpen ? '#fff' : HUD_TEXT,
              border: 'none',
              borderLeft:  `1px solid rgba(58,32,16,0.18)`,
              borderRight: `1px solid rgba(58,32,16,0.18)`,
              fontFamily: FONT, fontSize: 11,
              letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
          >
            SATCHEL
          </button>
          {satchelOpen && (
            <InventoryUI
              gameState={gameState}
              setGameState={setGameState}
              onClose={() => setActivePanel(null)}
            />
          )}
        </div>

        {/* STATUS */}
        <button
          {...statusBind}
          onMouseEnter={() => setActivePanel(null)}
          style={{
            height: HUD_HEIGHT,
            padding: '0 24px',
            background: statusHovered ? HUD_HOVER : 'transparent',
            color: statusHovered ? '#fff' : HUD_TEXT,
            border: 'none',
            fontFamily: FONT, fontSize: 11,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            flexShrink: 0,
          }}
        >
          STATUS
        </button>

      </div>

    </div>
  );
};
