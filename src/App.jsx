import React, { useState, useEffect, useRef } from 'react';
import { Stage } from './components/Stage';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { LoadingScreen } from './components/LoadingScreen';
import { loadGame, saveGame, clearSave, migrateOldSave, getSaveSlots } from './utils/persistence';
import { WORLD_MANIFEST } from './data/worldManifest';
import { TextScaleContext } from './context/TextScaleContext';

// Migrate any pre-multi-slot save to slot 1 on first load
migrateOldSave();

// ── Design resolution ─────────────────────────────────────────────────────────
const DESIGN_W = 1920;
const DESIGN_H = 1080;
const HUD_H    = 48;

// ── Error boundary — catches silent JS crashes and shows them instead of black ─
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#cb7866', background: '#1a0f08', height: '100vh', padding: 40, fontFamily: 'Courier New', fontSize: 14, whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
          <div style={{ fontSize: 18, marginBottom: 20, color: '#d6cab0' }}>GAME ERROR — check the console for details</div>
          {String(this.state.error)}
          {'\n\n'}
          {this.state.error?.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

function GameViewport({ children }) {
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const compute = () => {
      const availH = window.innerHeight - HUD_H;
      const scale  = Math.min(window.innerWidth / DESIGN_W, availH / DESIGN_H);
      setViewport({
        scale,
        x: Math.floor((window.innerWidth - DESIGN_W * scale) / 2),
        y: Math.floor((availH            - DESIGN_H * scale) / 2),
      });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: HUD_H, background: '#000', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width:  DESIGN_W,
        height: DESIGN_H,
        transformOrigin: 'top left',
        transform: `scale(${viewport.scale})`,
        left: viewport.x,
        top:  viewport.y,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

const BASE_FACETS = ['genetic_memory', 'nerve_sense', 'social_crypsis', 'mimicry'];

const INITIAL_STATE = {
  auraStability: 100,
  vigor: 100,
  money: 0.25,
  inventory: [],
  flags: {},
  memories: [],
  containers: {},
  pendingGive: null,
  npcSuspicion: {},
  currentRoom: 'test_house',
  activeForm: 'SOCIAL_CRYPSIS',
  observedNPCs: {},
  activeAbility: 'NONE',
  nearbyNPC: null,
  nearbyEntity: null,
  isMayaHidden: false,
  currentTerrain: null,
  activeAura: null,
  knownAuras: [],
  unlockedChapters: [1],   // Chapter 1 always free — add 2/3 when license key entered
  licenseKey: null,
  auraKnowledge: {},
  seenFacets: [...BASE_FACETS],
  knowledge: { maya: 1 },
  mayaMood: 50,
  npcRelationships: {},
  integrity: 50,
  hunger: 100,
  knownRecipes: [],
  activeProjection: 'hidden',
  equippedAbility: null,
  abilityLevels: { genetic_memory: 1, nerve_sense: 1, social_crypsis: 1, mimicry: 1 },
  abilityXP:     { genetic_memory: 0, nerve_sense: 0, social_crypsis: 0, mimicry: 0 },
  textScale:     100,
};

const hydrateLoad = (saved) => ({
  ...INITIAL_STATE,   // Start from a complete base so missing fields get defaults
  ...saved,           // Overlay saved fields on top
  pendingGive:      null,
  memories:         Array.isArray(saved.memories)  ? saved.memories  : [],
  inventory:        Array.isArray(saved.inventory) ? saved.inventory : [],
  npcSuspicion:     saved.npcSuspicion    || {},
  containers:       saved.containers      || {},
  knowledge:        { maya: 1, ...(saved.knowledge || {}) },
  mayaMood:         saved.mayaMood        ?? 50,
  npcRelationships: saved.npcRelationships || {},
  integrity:        saved.integrity        ?? 50,
  hunger:           saved.hunger           ?? 100,
  knownRecipes:     Array.isArray(saved.knownRecipes) ? saved.knownRecipes : [],
  activeProjection: saved.activeProjection ?? 'hidden',
  activeAbility:    saved.activeAbility    || 'NONE',
  equippedAbility:  saved.equippedAbility  ?? null,
  knownAuras:        Array.isArray(saved.knownAuras) ? saved.knownAuras : [],
  unlockedChapters:  Array.isArray(saved.unlockedChapters) ? saved.unlockedChapters : [1],
  licenseKey:        saved.licenseKey ?? null,
  observedNPCs:     saved.observedNPCs     || {},
  abilityLevels:    saved.abilityLevels    || { genetic_memory: 1, nerve_sense: 1, social_crypsis: 1, mimicry: 1 },
  abilityXP:        saved.abilityXP        || { genetic_memory: 0, nerve_sense: 0, social_crypsis: 0, mimicry: 0 },
  textScale:        saved.textScale        ?? 100,
  currentRoom:      WORLD_MANIFEST[saved.currentRoom] ? saved.currentRoom : 'test_house',
  seenFacets:       Array.isArray(saved.seenFacets)
    ? [...new Set([...BASE_FACETS, ...saved.seenFacets])]
    : [...BASE_FACETS],
});

const safeLoad = (slot) => {
  try {
    const raw = loadGame(slot);
    if (!raw) return null;
    return hydrateLoad(raw);
  } catch (e) {
    console.error('[SAVE] Failed to load slot', slot, e);
    return null;
  }
};

export default function App() {
  const [gameState, setGameState] = useState(() =>
    safeLoad(1) ?? { ...INITIAL_STATE }
  );

  const [showMenu,    setShowMenu]    = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [debugMode,   setDebugMode]   = useState(false);

  const latestGameState = useRef(gameState);
  useEffect(() => { latestGameState.current = gameState; }, [gameState]);

  const contextMenuHandler = useRef((e) => e.preventDefault());
  useEffect(() => {
    const handleKeys = (e) => { if (e.key.toLowerCase() === 'g') setDebugMode(p => !p); };
    const preventContext = contextMenuHandler.current;
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('contextmenu', preventContext);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  // Auto-save to slot 1 on every state change
  useEffect(() => { saveGame(gameState, 1); }, [gameState]);

  // Auto-save every 5 minutes
  useEffect(() => {
    const id = setInterval(() => {
      saveGame(latestGameState.current, 1);
      console.log('%c[SAVE] Auto-save', 'color:#d4af37');
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleReset = () => { clearSave(1); setGameState({ ...INITIAL_STATE }); };
  const handleLoad  = (slot = 1) => {
    const s = safeLoad(slot);
    if (s) setGameState(s);
  };

  if (showMenu) {
    return (
      <TextScaleContext.Provider value={(gameState.textScale ?? 100) / 100}>
        <MainMenu
          saveSlots={getSaveSlots()}
          onLoadSlot={(slot) => {
            const s = safeLoad(slot);
            setGameState(s ?? { ...INITIAL_STATE });
            setShowMenu(false);
            setShowLoading(true);
          }}
          onNewGame={() => {
            const fresh = { ...INITIAL_STATE, currentRoom: 'test_house' };
            setGameState(fresh);
            saveGame(fresh, 2);
            setShowMenu(false);
            // Go straight to game — no loading screen for new game
          }}
          gameState={gameState}
          setGameState={setGameState}
        />
      </TextScaleContext.Provider>
    );
  }

  if (showLoading) {
    return (
      <TextScaleContext.Provider value={(gameState.textScale ?? 100) / 100}>
        <LoadingScreen onContinue={() => setShowLoading(false)} />
      </TextScaleContext.Provider>
    );
  }

  // Always use test_house until more rooms exist
  const currentRoom     = WORLD_MANIFEST[gameState.currentRoom] ? gameState.currentRoom : 'test_house';
  const currentManifest = WORLD_MANIFEST[currentRoom];

  return (
    <ErrorBoundary>
      <TextScaleContext.Provider value={(gameState.textScale ?? 100) / 100}>
        <GameViewport>
          <Stage
            key={currentRoom}
            locationID={currentRoom}
            manifest={currentManifest}
            gameState={gameState}
            setGameState={setGameState}
            debugMode={debugMode}
          />
        </GameViewport>
        <HUD
          gameState={gameState}
          setGameState={setGameState}
          onLoad={handleLoad}
          onReset={handleReset}
          onDebug={() => setDebugMode(p => !p)}
        />
      </TextScaleContext.Provider>
    </ErrorBoundary>
  );
}
