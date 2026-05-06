import React, { useState, useEffect, useRef } from 'react';
import { loadGame } from '../utils/persistence';
import { music as audioMusic, MUSIC_TRACKS } from '../utils/audio';

// ── Custom font loading ────────────────────────────────────────────────────────
// Drop any .ttf / .woff2 into public/fonts/ and update the src below.
// The font-family 'CustomTitle' is referenced by the title element.
// Falls back to Impact → Arial Black → system sans-serif if not present.
const FONT_FACE_STYLE = `
  @font-face {
    font-family: 'NexaRustSlab';
    src: url('/fonts/NexaRustSlabDemo-BlackShadow1.otf') format('opentype');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'NexaRustSans';
    src: url('/fonts/NexaRustSansDemo-Black.otf') format('opentype');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }
`;

// ── Portrait rotation ──────────────────────────────────────────────────────────
// Add new portraits to this list as characters are created.
const PORTRAITS = [
  '/ui/portraits/protagonist_portrait.png',
  '/ui/portraits/silas_portrait.png',
  '/ui/portraits/overseer_portrait.png',
  '/ui/portraits/Angus_portrait.png',
];

// ── Palette ────────────────────────────────────────────────────────────────────
const BG        = '#d6cab0';
const BG_DARK   = '#c9bca0';
const ACCENT    = '#cb7866';
const TEXT      = '#3a2010';
const TEXT_DIM  = 'rgba(58,32,16,0.45)';
const TEXT_MID  = 'rgba(58,32,16,0.65)';
const BORDER    = 'rgba(58,32,16,0.18)';
const BORDER_MED= 'rgba(58,32,16,0.3)';
const FONT      = 'Courier New, monospace';
const FONT_SER  = 'Georgia, serif';

// ── Settings primitives (matches in-game options exactly) ──────────────────────
const SettingsSection = ({ children }) => (
  <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', padding: '14px 16px 6px' }}>
    {children}
  </div>
);
const SettingsRow = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${BORDER}` }}>
    <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: '1px', color: TEXT, textTransform: 'uppercase' }}>{label}</span>
    {children}
  </div>
);
const SettingsSlider = ({ value, onChange, min = 0, max = 100 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width: 130, accentColor: ACCENT, cursor: 'pointer' }} />
    <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT_DIM, width: 28, textAlign: 'right' }}>{value}%</span>
  </div>
);
const SettingsToggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{ width: 44, height: 22, border: 'none', cursor: 'pointer', background: value ? ACCENT : 'rgba(58,32,16,0.15)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 24 : 3, width: 16, height: 16, background: value ? '#fff' : 'rgba(58,32,16,0.4)', transition: 'left 0.2s' }} />
  </button>
);
const SettingsSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ background: 'rgba(58,32,16,0.08)', color: TEXT, border: `1px solid ${BORDER_MED}`, fontFamily: FONT, fontSize: 11, letterSpacing: '1px', padding: '5px 10px', cursor: 'pointer', outline: 'none', textTransform: 'uppercase' }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ── Settings tab content (identical to in-game) ────────────────────────────────
const VideoTab = () => {
  const [quality, setQuality]       = useState('HIGH');
  const [fullscreen, setFullscreen] = useState(false);
  const [vsync, setVsync]           = useState(true);
  return (<>
    <SettingsSection>Display</SettingsSection>
    <SettingsRow label="Fullscreen"><SettingsToggle value={fullscreen} onChange={setFullscreen} /></SettingsRow>
    <SettingsRow label="V-Sync"><SettingsToggle value={vsync} onChange={setVsync} /></SettingsRow>
    <SettingsRow label="Quality">
      <SettingsSelect value={quality} onChange={setQuality} options={[
        { value: 'LOW', label: 'LOW' }, { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'HIGH', label: 'HIGH' }, { value: 'ULTRA', label: 'ULTRA' },
      ]} />
    </SettingsRow>
  </>);
};
const SoundTab = () => {
  const [master, setMaster]   = useState(80);
  const [msc,    setMsc]      = useState(70);
  const [sfx,    setSfx]      = useState(90);
  const [ambient,setAmbient]  = useState(60);
  const [mute,   setMute]     = useState(false);
  return (<>
    <SettingsSection>Volume</SettingsSection>
    <SettingsRow label="Mute All"><SettingsToggle value={mute} onChange={setMute} /></SettingsRow>
    <SettingsRow label="Master"><SettingsSlider value={master} onChange={setMaster} /></SettingsRow>
    <SettingsRow label="Music"><SettingsSlider value={msc} onChange={setMsc} /></SettingsRow>
    <SettingsRow label="Sound Effects"><SettingsSlider value={sfx} onChange={setSfx} /></SettingsRow>
    <SettingsRow label="Ambient"><SettingsSlider value={ambient} onChange={setAmbient} /></SettingsRow>
  </>);
};
const LanguageTab = () => {
  const [lang, setLang]           = useState('EN');
  const [subtitles, setSubtitles] = useState(true);
  const [subSize, setSubSize]     = useState('MEDIUM');
  return (<>
    <SettingsSection>Language</SettingsSection>
    <SettingsRow label="Interface">
      <SettingsSelect value={lang} onChange={setLang} options={[
        { value: 'EN', label: 'English' }, { value: 'FR', label: 'Français' },
        { value: 'DE', label: 'Deutsch' }, { value: 'ES', label: 'Español' },
        { value: 'PT', label: 'Português' }, { value: 'JA', label: '日本語' }, { value: 'ZH', label: '中文' },
      ]} />
    </SettingsRow>
    <SettingsSection>Subtitles</SettingsSection>
    <SettingsRow label="Show Subtitles"><SettingsToggle value={subtitles} onChange={setSubtitles} /></SettingsRow>
    <SettingsRow label="Size">
      <SettingsSelect value={subSize} onChange={setSubSize} options={[
        { value: 'SMALL', label: 'SMALL' }, { value: 'MEDIUM', label: 'MEDIUM' }, { value: 'LARGE', label: 'LARGE' },
      ]} />
    </SettingsRow>
  </>);
};
const GameplayTab = ({ gameState, setGameState }) => {
  const [difficulty, setDifficulty] = useState('STANDARD');
  const [hints, setHints]           = useState(true);
  const textScale = gameState?.textScale ?? 100;
  return (<>
    <SettingsSection>Difficulty</SettingsSection>
    <SettingsRow label="Difficulty">
      <SettingsSelect value={difficulty} onChange={setDifficulty} options={[
        { value: 'GHOST', label: 'GHOST' }, { value: 'STANDARD', label: 'STANDARD' }, { value: 'EXPOSED', label: 'EXPOSED' },
      ]} />
    </SettingsRow>
    <SettingsSection>Accessibility</SettingsSection>
    <SettingsRow label="Hints"><SettingsToggle value={hints} onChange={setHints} /></SettingsRow>
    <SettingsSection>Interface</SettingsSection>
    <SettingsRow label="Text Size">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
        <SettingsSlider value={textScale} min={70} max={160}
          onChange={v => setGameState?.(p => ({ ...p, textScale: v }))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 130, fontFamily: FONT, fontSize: 9, color: TEXT_DIM, letterSpacing: '1px', textTransform: 'uppercase' }}>
          <span>Small</span><span>Big</span>
        </div>
      </div>
    </SettingsRow>
  </>);
};

// ── Options popover ────────────────────────────────────────────────────────────
const OPTIONS_TABS = ['VIDEO', 'SOUND', 'LANGUAGE', 'GAMEPLAY'];
const OptionsPopover = ({ gameState, setGameState, onClose }) => {
  const [tab, setTab] = useState('VIDEO');
  return (
    <div style={{ background: BG, borderTop: `2px solid ${ACCENT}`, width: 380 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '3px', color: TEXT, textTransform: 'uppercase' }}>Options</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DIM, fontFamily: FONT, fontSize: 12 }}>✕</button>
      </div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, padding: '0 8px' }}>
        {OPTIONS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', background: 'none', border: 'none',
            borderBottom: tab === t ? `2px solid ${ACCENT}` : '2px solid transparent',
            color: tab === t ? ACCENT : TEXT_DIM,
            fontFamily: FONT, fontSize: 11, letterSpacing: '1px',
            textTransform: 'uppercase', cursor: 'pointer', marginBottom: -1,
            transition: 'color 0.15s, border-color 0.15s',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {tab === 'VIDEO'    && <VideoTab />}
        {tab === 'SOUND'    && <SoundTab />}
        {tab === 'LANGUAGE' && <LanguageTab />}
        {tab === 'GAMEPLAY' && <GameplayTab gameState={gameState} setGameState={setGameState} />}
      </div>
    </div>
  );
};

// ── Music player (SPECIAL) ─────────────────────────────────────────────────────
const SpecialPopover = ({ onClose }) => {
  const tracks      = Object.entries(MUSIC_TRACKS);
  const [playing,   setPlaying]   = useState(null); // trackId or null
  const [paused,    setPaused]    = useState(false);

  const play = (id) => {
    audioMusic.play(id);
    setPlaying(id);
    setPaused(false);
  };
  const togglePause = () => {
    if (paused) { audioMusic.play(playing); setPaused(false); }
    else        { audioMusic.stop(200);     setPaused(true);  }
  };
  const stop = () => { audioMusic.stop(); setPlaying(null); setPaused(false); };

  return (
    <div style={{ background: BG, borderTop: `2px solid ${ACCENT}`, width: 420 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '3px', color: TEXT, textTransform: 'uppercase' }}>Special — Music</span>
        <button onClick={() => { stop(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DIM, fontFamily: FONT, fontSize: 12 }}>✕</button>
      </div>

      {/* Now playing */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, background: playing ? `${ACCENT}0c` : 'transparent' }}>
        <div style={{ fontFamily: FONT, fontSize: 7, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 8 }}>
          Now Playing
        </div>
        <div style={{ fontFamily: FONT_SER, fontSize: 14, fontStyle: 'italic', color: playing ? TEXT : TEXT_DIM, marginBottom: 14 }}>
          {playing ? (MUSIC_TRACKS[playing] ?? playing) : '— nothing selected —'}
        </div>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: '◀◀', action: () => { if (!playing) return; const ids = Object.keys(MUSIC_TRACKS); const idx = ids.indexOf(playing); play(ids[(idx - 1 + ids.length) % ids.length]); } },
            { label: playing && !paused ? '❚❚' : '▶', action: playing ? togglePause : null },
            { label: '■', action: playing ? stop : null },
            { label: '▶▶', action: () => { if (!playing) return; const ids = Object.keys(MUSIC_TRACKS); const idx = ids.indexOf(playing); play(ids[(idx + 1) % ids.length]); } },
          ].map(({ label, action }) => (
            <button key={label} onClick={action ?? undefined} disabled={!action} style={{
              background: 'transparent', border: `1px solid ${action ? BORDER_MED : BORDER}`,
              color: action ? TEXT : TEXT_DIM, fontFamily: FONT, fontSize: 11,
              padding: '6px 12px', cursor: action ? 'pointer' : 'default',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (action) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; } }}
            onMouseLeave={e => { if (action) { e.currentTarget.style.borderColor = BORDER_MED; e.currentTarget.style.color = TEXT; } }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Track list */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        <div style={{ fontFamily: FONT, fontSize: 7, letterSpacing: '2px', color: TEXT_DIM, textTransform: 'uppercase', padding: '10px 16px 6px' }}>
          Tracks
        </div>
        {tracks.length === 0 ? (
          <div style={{ padding: '10px 16px 16px', fontFamily: FONT_SER, fontSize: 12, fontStyle: 'italic', color: TEXT_DIM, lineHeight: 1.6 }}>
            No tracks loaded yet. Add .mp3 files to{' '}
            <span style={{ fontFamily: FONT, fontSize: 10 }}>public/audio/music/</span>
            {' '}and register them in{' '}
            <span style={{ fontFamily: FONT, fontSize: 10 }}>src/utils/audio.js</span>.
          </div>
        ) : (
          tracks.map(([id, filename]) => {
            const isActive = playing === id;
            return (
              <button key={id} onClick={() => play(id)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '10px 16px',
                background: isActive ? `${ACCENT}14` : 'transparent',
                border: 'none', borderTop: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${isActive ? ACCENT : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `rgba(58,32,16,0.04)`; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '1px', color: isActive ? ACCENT : TEXT, textTransform: 'uppercase' }}>
                  {filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ')}
                </span>
                {isActive && !paused && <span style={{ color: ACCENT, fontSize: 8 }}>▶ PLAYING</span>}
                {isActive && paused   && <span style={{ color: TEXT_DIM, fontSize: 8 }}>❚❚ PAUSED</span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Load popover ───────────────────────────────────────────────────────────────
const LoadPopover = ({ onLoad, onClose }) => {
  const save = loadGame();
  return (
    <div style={{ background: BG, borderTop: `2px solid ${ACCENT}`, width: 340 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '3px', color: TEXT, textTransform: 'uppercase' }}>Load Game</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DIM, fontFamily: FONT, fontSize: 12 }}>✕</button>
      </div>
      <div style={{ padding: '20px 16px' }}>
        {save ? (
          <>
            <div style={{ fontFamily: FONT_SER, fontSize: 13, fontStyle: 'italic', color: TEXT_MID, lineHeight: 1.7, marginBottom: 16 }}>
              A saved game was found. Loading will resume from your last save point.
            </div>
            <button onClick={onLoad} style={{
              background: ACCENT, border: 'none', color: '#fff',
              fontFamily: FONT, fontSize: 10, letterSpacing: '2px',
              padding: '10px 20px', cursor: 'pointer', textTransform: 'uppercase',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Load Save
            </button>
          </>
        ) : (
          <div style={{ fontFamily: FONT_SER, fontSize: 13, fontStyle: 'italic', color: TEXT_DIM, lineHeight: 1.7 }}>
            No saved game found.
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Menu ──────────────────────────────────────────────────────────────────
export const MainMenu = ({ saveSlots, onLoadSlot, onNewGame, gameState, setGameState }) => {
  const [portraitIdx,     setPortraitIdx]     = useState(0);
  const [portraitVisible, setPortraitVisible] = useState(true);
  const [popover,         setPopover]         = useState(null);
  const [slotsOpen,       setSlotsOpen]       = useState(false);
  const [mouse,           setMouse]           = useState({ x: 0.5, y: 0.5 });

  const hasSave = saveSlots?.some(s => !s.empty) ?? false;

  // Play menu music on mount — no stop on unmount so Stage's play() can crossfade
  useEffect(() => {
    audioMusic.play('chain_rattle_hollow');
  }, []);

  // Portrait fade-rotate cycle
  useEffect(() => {
    const hold = setTimeout(() => {
      setPortraitVisible(false);
      setTimeout(() => {
        setPortraitIdx(i => (i + 1) % PORTRAITS.length);
        setPortraitVisible(true);
      }, 900);
    }, 4500);
    return () => clearTimeout(hold);
  }, [portraitIdx]);

  const closePopover   = () => setPopover(null);
  const toggleSlots    = () => setSlotsOpen(o => !o);
  const handleMouseMove = (e) => setMouse({
    x: e.clientX / window.innerWidth,
    y: e.clientY / window.innerHeight,
  });

  const btnStyle = (disabled) => ({
    background: 'transparent', border: 'none',
    color: disabled ? 'rgba(214,202,176,0.3)' : BG,
    fontFamily: "'NexaRustSans', 'Arial Black', sans-serif",
    fontSize: 'clamp(16px, 1.6vw, 22px)',
    letterSpacing: '3px', textTransform: 'uppercase',
    textAlign: 'left', cursor: disabled ? 'default' : 'pointer',
    padding: '6px 0',
    textShadow: '0 1px 14px rgba(0,0,0,0.9)',
    transition: 'color 0.15s, letter-spacing 0.2s',
    display: 'block', width: '100%',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#0a0a0a' }}
      onMouseMove={handleMouseMove}
    >
      <style>{FONT_FACE_STYLE}</style>

      {/* Background image — 30% blur */}
      <img
        src="/backgrounds/menu/main_menu_bg.png"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'blur(3px)', transform: 'scale(1.04)' }}
        alt=""
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />

      {/* Dark gradient — left side for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 35%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.05) 85%, transparent 100%)',
      }} />

      {/* Portrait — right side, fades + tilts with mouse */}
      <div style={{
        position: 'absolute', right: '10vw', bottom: 0, height: '74%',
        zIndex: 5,
        opacity: portraitVisible ? 1 : 0,
        perspective: '700px',
        transition: 'opacity 0.9s ease-in-out',
        pointerEvents: 'none',
        transform: `
          perspective(700px)
          rotateY(${(mouse.x - 0.5) * 14}deg)
          rotateX(${(mouse.y - 0.5) * -9}deg)
          translateY(${(mouse.y - 0.5) * -12}px)
        `,
        transitionProperty: 'opacity, transform',
        transitionDuration: '0.9s, 0.15s',
        transitionTimingFunction: 'ease-in-out, ease-out',
      }}>
        <img
          src={PORTRAITS[portraitIdx]}
          style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'right bottom', display: 'block' }}
          alt=""
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* Left panel — title + menu, z-index 2 so title sits behind portrait */}
      <div style={{
        position: 'absolute', left: '6vw', top: 0, bottom: 0,
        width: '42%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingBottom: '4vh', zIndex: 2,
      }}>
        {/* Game title — 50% smaller than original, height stretched 20% */}
        <div style={{ marginBottom: '2vh', lineHeight: 1 }}>
          <span style={{
            display: 'inline-block',
            fontFamily: "'NexaRustSlab', Impact, 'Arial Black', sans-serif",
            fontWeight: 900, fontSize: 'clamp(41px, 5.1vw, 66px)',
            color: BG, letterSpacing: '2px',
            transform: 'scaleY(1.2)', transformOrigin: 'top left',
            textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5)',
          }}>
            BLACKTRACK
          </span>
        </div>

        {/* Menu items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* CONTINUE + LOAD — share one accordion slot picker */}
          {['CONTINUE', 'LOAD'].map(label => (
            <button key={label}
              onClick={hasSave ? toggleSlots : undefined}
              style={btnStyle(!hasSave)}
              onMouseEnter={e => { if (hasSave) { e.currentTarget.style.color = ACCENT; e.currentTarget.style.letterSpacing = '5px'; } }}
              onMouseLeave={e => { if (hasSave) { e.currentTarget.style.color = BG; e.currentTarget.style.letterSpacing = '3px'; } }}
            >{label}</button>
          ))}

          {/* Slot accordion — drops down below CONTINUE/LOAD */}
          {slotsOpen && (
            <div style={{ marginLeft: 4, marginBottom: 6 }}>
              {(saveSlots ?? []).map(({ slot, empty, savedAt, location }) => (
                <div key={slot} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: empty ? 'rgba(0,0,0,0.25)' : 'rgba(203,120,102,0.15)',
                  borderLeft: `3px solid ${empty ? 'rgba(214,202,176,0.2)' : ACCENT}`,
                  marginBottom: 3,
                  backdropFilter: 'blur(4px)',
                }}>
                  <div>
                    <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '2px', color: empty ? 'rgba(214,202,176,0.35)' : BG, textTransform: 'uppercase' }}>
                      Slot {slot}
                    </div>
                    {!empty && savedAt && (
                      <div style={{ fontFamily: FONT_SER, fontSize: 10, fontStyle: 'italic', color: 'rgba(214,202,176,0.65)', marginTop: 2 }}>
                        {new Date(savedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {location && ` · ${location.replace(/_/g, ' ')}`}
                      </div>
                    )}
                    {empty && (
                      <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '1px', color: 'rgba(214,202,176,0.3)', textTransform: 'uppercase', marginTop: 2 }}>
                        Empty
                      </div>
                    )}
                  </div>
                  {!empty && (
                    <button onClick={() => onLoadSlot(slot)} style={{
                      background: ACCENT, border: 'none', color: '#fff',
                      fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px',
                      padding: '5px 12px', cursor: 'pointer', textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >LOAD</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* NEW GAME */}
          <button style={btnStyle(false)}
            onClick={onNewGame}
            onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.letterSpacing = '5px'; }}
            onMouseLeave={e => { e.currentTarget.style.color = BG; e.currentTarget.style.letterSpacing = '3px'; }}
          >NEW GAME</button>

          {/* OPTIONS */}
          <button style={btnStyle(false)}
            onClick={() => setPopover('options')}
            onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.letterSpacing = '5px'; }}
            onMouseLeave={e => { e.currentTarget.style.color = BG; e.currentTarget.style.letterSpacing = '3px'; }}
          >OPTIONS</button>

          {/* SPECIAL */}
          <button style={btnStyle(false)}
            onClick={() => setPopover('special')}
            onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.letterSpacing = '5px'; }}
            onMouseLeave={e => { e.currentTarget.style.color = BG; e.currentTarget.style.letterSpacing = '3px'; }}
          >SPECIAL</button>
        </div>
      </div>

      {/* Bottom — credit and historical context */}
      <div style={{
        position: 'absolute', bottom: '2.5vh', left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        zIndex: 6, pointerEvents: 'none', padding: '0 6vw',
      }}>
        {/* Outer double-border box */}
        <div style={{
          border: `2px solid ${BG}`,
          padding: 3,
          background: 'transparent',
        }}>
          {/* Inner border */}
          <div style={{
            border: `1px solid rgba(214,202,176,0.45)`,
            padding: '10px 20px',
            background: 'rgba(10,8,6,0.72)',
            backdropFilter: 'blur(6px)',
            textAlign: 'center',
            maxWidth: '68ch',
          }}>
            <div style={{
              fontFamily: "'NexaRustSans', 'Arial Black', sans-serif",
              fontSize: 'clamp(9px, 0.85vw, 12px)',
              letterSpacing: '3px', textTransform: 'uppercase',
              color: BG,
              marginBottom: 7,
            }}>
              A game by DavidYBlue
            </div>
            <div style={{
              fontFamily: FONT_SER, fontStyle: 'italic',
              fontSize: 'clamp(8px, 0.7vw, 10px)',
              color: `rgba(214,202,176,0.7)`,
              lineHeight: 1.7,
            }}>
              The individual stories within this game are rooted in documented truth.
              The transatlantic slave trade and American slavery represent one of history's gravest injustices —
              a wound whose consequences reach into the present day.
              Some names, places, and circumstances have been shaped for narrative.
              The human truth beneath them has not.
            </div>
          </div>
        </div>
      </div>

      {/* Popover backdrop */}
      {popover && (
        <div
          onClick={closePopover}
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ boxShadow: '0 0 80px rgba(0,0,0,0.8)' }}>
            {popover === 'options' && <OptionsPopover gameState={gameState} setGameState={setGameState} onClose={closePopover} />}
            {popover === 'special' && <SpecialPopover onClose={closePopover} />}
            {/* load handled by inline slot accordion */}
          </div>
        </div>
      )}

    </div>
  );
};
