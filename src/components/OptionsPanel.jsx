import React, { useState } from 'react';

const BG      = 'rgba(8,5,2,0.98)';
const GOLD    = '#d4af37';
const ACCENT  = '#cb7866';
const DIM     = '#444';
const MUTED   = '#666';
const BODY    = '#bbb';
const BORDER  = '#1a1510';
const FONT    = 'Courier New, monospace';
const FONT_SER = 'Georgia, serif';

// ── Shared controls ────────────────────────────────────────────────────────────
const Row = ({ label, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: `1px solid ${BORDER}`,
  }}>
    <span style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '2px', color: BODY, textTransform: 'uppercase' }}>
      {label}
    </span>
    {children}
  </div>
);

const Slider = ({ value, onChange, min = 0, max = 100 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: 140, accentColor: ACCENT, cursor: 'pointer' }}
    />
    <span style={{ fontFamily: FONT, fontSize: 9, color: MUTED, width: 28, textAlign: 'right' }}>
      {value}%
    </span>
  </div>
);

const Toggle = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onChange(!value)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 48, height: 24, border: 'none', cursor: 'pointer',
        background: value ? ACCENT : '#222',
        transition: 'background 0.2s',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 26 : 3,
        width: 18, height: 18,
        background: value ? '#fff' : '#555',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </button>
  );
};

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      background: '#111', color: BODY, border: `1px solid #333`,
      fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
      padding: '6px 10px', cursor: 'pointer', outline: 'none',
      textTransform: 'uppercase',
    }}
  >
    {options.map(o => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: FONT, fontSize: 8, letterSpacing: '3px', color: DIM,
    textTransform: 'uppercase', paddingTop: 24, paddingBottom: 8,
    borderBottom: `1px solid ${BORDER}`,
  }}>
    {children}
  </div>
);

// ── Tab content ────────────────────────────────────────────────────────────────
const VideoTab = () => {
  const [quality,    setQuality]    = useState('HIGH');
  const [fullscreen, setFullscreen] = useState(false);
  const [vsync,      setVsync]      = useState(true);
  const [brightness, setBrightness] = useState(50);
  const [contrast,   setContrast]   = useState(50);

  return (
    <div>
      <SectionLabel>Display</SectionLabel>
      <Row label="Fullscreen">
        <Toggle value={fullscreen} onChange={setFullscreen} />
      </Row>
      <Row label="V-Sync">
        <Toggle value={vsync} onChange={setVsync} />
      </Row>
      <Row label="Quality">
        <Select value={quality} onChange={setQuality} options={[
          { value: 'LOW',    label: 'LOW'    },
          { value: 'MEDIUM', label: 'MEDIUM' },
          { value: 'HIGH',   label: 'HIGH'   },
          { value: 'ULTRA',  label: 'ULTRA'  },
        ]} />
      </Row>
      <SectionLabel>Image</SectionLabel>
      <Row label="Brightness">
        <Slider value={brightness} onChange={setBrightness} />
      </Row>
      <Row label="Contrast">
        <Slider value={contrast} onChange={setContrast} />
      </Row>
    </div>
  );
};

const SoundTab = () => {
  const [master,  setMaster]  = useState(80);
  const [music,   setMusic]   = useState(70);
  const [sfx,     setSfx]     = useState(90);
  const [ambient, setAmbient] = useState(60);
  const [mute,    setMute]    = useState(false);

  return (
    <div>
      <SectionLabel>Volume</SectionLabel>
      <Row label="Mute All">
        <Toggle value={mute} onChange={setMute} />
      </Row>
      <Row label="Master">
        <Slider value={master} onChange={setMaster} />
      </Row>
      <Row label="Music">
        <Slider value={music} onChange={setMusic} />
      </Row>
      <Row label="Sound Effects">
        <Slider value={sfx} onChange={setSfx} />
      </Row>
      <Row label="Ambient">
        <Slider value={ambient} onChange={setAmbient} />
      </Row>
    </div>
  );
};

const LanguageTab = () => {
  const [lang,      setLang]      = useState('EN');
  const [subtitles, setSubtitles] = useState(true);
  const [subSize,   setSubSize]   = useState('MEDIUM');

  return (
    <div>
      <SectionLabel>Language</SectionLabel>
      <Row label="Interface Language">
        <Select value={lang} onChange={setLang} options={[
          { value: 'EN', label: 'English'    },
          { value: 'FR', label: 'Français'   },
          { value: 'DE', label: 'Deutsch'    },
          { value: 'ES', label: 'Español'    },
          { value: 'PT', label: 'Português'  },
          { value: 'JA', label: '日本語'      },
          { value: 'ZH', label: '中文'        },
        ]} />
      </Row>
      <SectionLabel>Subtitles</SectionLabel>
      <Row label="Show Subtitles">
        <Toggle value={subtitles} onChange={setSubtitles} />
      </Row>
      <Row label="Subtitle Size">
        <Select value={subSize} onChange={setSubSize} options={[
          { value: 'SMALL',  label: 'SMALL'  },
          { value: 'MEDIUM', label: 'MEDIUM' },
          { value: 'LARGE',  label: 'LARGE'  },
        ]} />
      </Row>
    </div>
  );
};

const GameplayTab = () => {
  const [difficulty, setDifficulty] = useState('STANDARD');
  const [autosave,   setAutosave]   = useState(true);
  const [hints,      setHints]      = useState(true);
  const [hud,        setHud]        = useState(true);
  const [camShake,   setCamShake]   = useState(false);

  return (
    <div>
      <SectionLabel>Difficulty</SectionLabel>
      <Row label="Difficulty">
        <Select value={difficulty} onChange={setDifficulty} options={[
          { value: 'GHOST',    label: 'GHOST — Unseen'   },
          { value: 'STANDARD', label: 'STANDARD'         },
          { value: 'EXPOSED',  label: 'EXPOSED — Brutal' },
        ]} />
      </Row>
      <SectionLabel>Accessibility</SectionLabel>
      <Row label="Auto-Save">
        <Toggle value={autosave} onChange={setAutosave} />
      </Row>
      <Row label="Interaction Hints">
        <Toggle value={hints} onChange={setHints} />
      </Row>
      <Row label="HUD Visible">
        <Toggle value={hud} onChange={setHud} />
      </Row>
      <Row label="Camera Shake">
        <Toggle value={camShake} onChange={setCamShake} />
      </Row>
    </div>
  );
};

// ── Main OptionsPanel ──────────────────────────────────────────────────────────
const TABS = ['VIDEO', 'SOUND', 'LANGUAGE', 'GAMEPLAY'];

export const OptionsPanel = ({ initialTab = 'VIDEO', onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20000,
      background: BG, backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, color: BODY,
    }}>
      {/* Header */}
      <div style={{
        padding: '48px 60px 0',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 28,
        }}>
          <h1 style={{ color: GOLD, letterSpacing: '8px', margin: 0, fontSize: 22, fontFamily: FONT }}>
            OPTIONS
          </h1>
          <button
            onClick={onClose}
            style={{
              background: GOLD, color: '#000', padding: '10px 32px',
              border: 'none', fontWeight: 'bold', cursor: 'pointer',
              fontFamily: FONT, letterSpacing: '2px', fontSize: 10,
            }}
          >
            RETURN [ESC]
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: 'none', border: 'none',
                borderBottom: activeTab === t ? `2px solid ${ACCENT}` : '2px solid transparent',
                color: activeTab === t ? ACCENT : DIM,
                fontFamily: FONT, fontSize: 9, letterSpacing: '3px',
                textTransform: 'uppercase',
                padding: '0 0 12px 0', marginRight: 36,
                cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 60px 80px',
        maxWidth: 560,
      }}>
        {activeTab === 'VIDEO'    && <VideoTab    />}
        {activeTab === 'SOUND'    && <SoundTab    />}
        {activeTab === 'LANGUAGE' && <LanguageTab />}
        {activeTab === 'GAMEPLAY' && <GameplayTab />}
      </div>
    </div>
  );
};
