import React, { useState, useEffect, useRef } from 'react';
import { Stage } from './components/Stage';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { LoadingScreen } from './components/LoadingScreen';
import { loadGame, saveGame, clearSave, migrateOldSave, getSaveSlots } from './utils/persistence';
migrateOldSave();
import { WORLD_MANIFEST } from './data/worldManifest';
import { TextScaleContext } from './context/TextScaleContext';

// ── Design resolution ─────────────────────────────────────────────────────────
// The entire game is authored at this canvas size. GameViewport scales it to
// fit any screen while preserving aspect ratio (letterbox / pillarbox).
const DESIGN_W = 1920;
const DESIGN_H = 1080;

// Physical height reserved for the HUD bar — must match HUD_HEIGHT in HUD.jsx.
// The game canvas is constrained to the space above this so the HUD never
// overlaps gameplay content.
const HUD_H = 48;

function GameViewport({ children }) {
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const compute = () => {
      // Only use the screen area above the HUD bar for scaling.
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
    // Outer shell — covers only the area above the HUD bar.
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: HUD_H, background: '#000', overflow: 'hidden' }}>
      {/* Inner canvas — fixed design size, CSS-scaled to fit */}
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
  morphStability: 100,
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
  activeMorph: null,
  unlockedMorphs: [],
  morphKnowledge: {},
  seenFacets: [...BASE_FACETS],
  knowledge: {},
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
  ...saved,
  pendingGive:      null,
  memories:         Array.isArray(saved.memories)  ? saved.memories  : [],
  inventory:        Array.isArray(saved.inventory) ? saved.inventory : [],
  npcSuspicion:     saved.npcSuspicion    || {},
  containers:       saved.containers      || {},
  knowledge:        saved.knowledge       || {},
  mayaMood:         saved.mayaMood        ?? 50,
  npcRelationships: saved.npcRelationships || {},
  integrity:        saved.integrity        ?? 50,
  hunger:           saved.hunger           ?? 100,
  knownRecipes:     Array.isArray(saved.knownRecipes) ? saved.knownRecipes : [],
  activeAbility:    saved.activeAbility    || 'NONE',
  activeProjection: saved.activeProjection ?? 'hidden',
  equippedAbility:  saved.equippedAbility  ?? null,
  unlockedMorphs:   Array.isArray(saved.unlockedMorphs) ? saved.unlockedMorphs : [],
  observedNPCs:     saved.observedNPCs     || {},
  abilityLevels:    saved.abilityLevels    || { genetic_memory: 1, nerve_sense: 1, social_crypsis: 1, mimicry: 1 },
  abilityXP:        saved.abilityXP        || { genetic_memory: 0, nerve_sense: 0, social_crypsis: 0, mimicry: 0 },
  textScale:        saved.textScale        ?? 100,
  seenFacets:       Array.isArray(saved.seenFacets)
    ? [...new Set([...BASE_FACETS, ...saved.seenFacets])]
    : [...BASE_FACETS],
});

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const saved = loadGame(1);
    return saved ? hydrateLoad(saved) : { ...INITIAL_STATE };
  });

  const [showMenu,    setShowMenu]    = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Auto-save ref
  const latestGameState = useRef(gameState);
  useEffect(() => { latestGameState.current = gameState; }, [gameState]);

  const contextMenuHandler = useRef((e) => e.preventDefault());

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key.toLowerCase() === 'g') setDebugMode(p => !p);
    };
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
      saveGame(latestGameState.current);
      console.log('%c[SAVE] Auto-save', 'color:#d4af37');
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleReset = () => {
    clearSave(1);
    setGameState({ ...INITIAL_STATE });
  };

  const handleLoad = (slot = 1) => {
    const saved = loadGame(slot);
    if (saved) setGameState(hydrateLoad(saved));
  };

  if (showMenu) {
    return (
      <TextScaleContext.Provider value={(gameState.textScale ?? 100) / 100}>
        <MainMenu
          saveSlots={getSaveSlots()}
          onLoadSlot={(slot) => {
            const saved = loadGame(slot);
            if (saved) setGameState(hydrateLoad(saved));
            setShowMenu(false);
            setShowLoading(true);
          }}
          onNewGame={() => {
            setGameState({ ...INITIAL_STATE });
            setShowMenu(false);
            setShowLoading(true);
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

  const currentManifest = WORLD_MANIFEST[gameState.currentRoom];
  if (!currentManifest) return (
    <div style={{ color: 'red', background: '#000', height: '100vh', padding: 50, fontFamily: 'serif' }}>
      REGISTRY ERROR: Room "{gameState.currentRoom}" not found in WORLD_MANIFEST.
    </div>
  );

  return (
    <TextScaleContext.Provider value={(gameState.textScale ?? 100) / 100}>
      <GameViewport>
        <Stage
          key={gameState.currentRoom}
          locationID={gameState.currentRoom}
          manifest={currentManifest}
          gameState={gameState}
          setGameState={setGameState}
          debugMode={debugMode}
        />
      </GameViewport>

      {/* HUD lives outside GameViewport so it occupies its own physical strip
          at the bottom of the screen and never overlaps gameplay content. */}
      <HUD
        gameState={gameState}
        setGameState={setGameState}
        onLoad={handleLoad}
        onReset={handleReset}
        onDebug={() => setDebugMode(p => !p)}
      />
    </TextScaleContext.Provider>
  );
}
