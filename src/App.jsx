import React, { useState, useEffect, useRef } from 'react';
import { Stage } from './components/Stage';
import { Menu } from './components/Menu';
import { HUD } from './components/HUD';
import { OptionsPanel } from './components/OptionsPanel';
import { loadGame, saveGame, clearSave } from './utils/persistence';
import { WORLD_MANIFEST } from './data/worldManifest';

const INITIAL_STATE = {
  integrity: 100,
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
  seenFacets: [],
};

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const saved = loadGame();
    if (saved) return {
      ...saved,
      pendingGive: null,
      memories:    Array.isArray(saved.memories)  ? saved.memories  : [],
      inventory:   Array.isArray(saved.inventory) ? saved.inventory : [],
      npcSuspicion: saved.npcSuspicion || {},
      containers:   saved.containers   || {},
    };
    return { ...INITIAL_STATE };
  });

  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [activePanel,    setActivePanel]    = useState(null); // 'menu' | 'journal' | 'satchel' | null
  const [optionsTab,     setOptionsTab]     = useState(null); // null = closed, else 'VIDEO'|'SOUND'|etc.
  const [debugMode,      setDebugMode]      = useState(false);

  // Auto-save ref
  const latestGameState = useRef(gameState);
  useEffect(() => { latestGameState.current = gameState; }, [gameState]);

  const contextMenuHandler = useRef((e) => e.preventDefault());

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key.toLowerCase() === 'g') setDebugMode(p => !p);
      if (e.key.toLowerCase() === 'i') setActivePanel(p => p === 'satchel' ? null : 'satchel');
      if (e.key.toLowerCase() === 'j') setActivePanel(p => p === 'journal' ? null : 'journal');
      if (e.key === 'Tab') {
        e.preventDefault();
        setActivePanel(p => p === 'menu' ? null : 'menu');
      }
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setActivePanel(null);
        setOptionsTab(null);
      }
    };
    const preventContext = contextMenuHandler.current;
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('contextmenu', preventContext);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  // Save on every state change
  useEffect(() => { saveGame(gameState); }, [gameState]);

  // Auto-save every 5 minutes
  useEffect(() => {
    const id = setInterval(() => {
      saveGame(latestGameState.current);
      console.log('%c[SAVE] Auto-save', 'color:#d4af37');
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleReset = () => {
    clearSave();
    setGameState({ ...INITIAL_STATE });
  };

  const currentManifest = WORLD_MANIFEST[gameState.currentRoom];
  if (!currentManifest) return (
    <div style={{ color: 'red', background: '#000', height: '100vh', padding: 50, fontFamily: 'serif' }}>
      REGISTRY ERROR: Room "{gameState.currentRoom}" not found in WORLD_MANIFEST.
    </div>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <Stage
        key={gameState.currentRoom}
        locationID={gameState.currentRoom}
        manifest={currentManifest}
        gameState={gameState}
        setGameState={setGameState}
        debugMode={debugMode}
      />

      {isMenuOpen && (
        <Menu
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {optionsTab && (
        <OptionsPanel
          initialTab={optionsTab}
          onClose={() => setOptionsTab(null)}
        />
      )}

      <HUD
        gameState={gameState}
        setGameState={setGameState}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        onOpenLedger={() => { setIsMenuOpen(true); setActivePanel(null); }}
        onOpenOptions={(tab) => { setOptionsTab(tab); setActivePanel(null); }}
        onReset={handleReset}
      />
    </div>
  );
}
