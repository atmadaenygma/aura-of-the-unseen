import React, { useState, useEffect, useRef } from 'react';
import { Stage } from './components/Stage';
import { Menu } from './components/Menu';
import { loadGame, saveGame } from './utils/persistence';
import { WORLD_MANIFEST } from './data/worldManifest';

export default function App() {
  const [gameState, setGameState] = useState(() => loadGame() || {
    // Core stats
    integrity: 100,
    vigor: 100,
    money: 0.25,
    // Collections
    inventory: [],
    flags: {},
    memories: [],
    // World
    currentRoom: 'test_house',
    // Neurological states
    activeForm: 'SOCIAL_CRYPSIS',
    observedNPCs: {},
    activeAbility: 'NONE',
    nearbyNPC: null,
    isMayaHidden: false,
    // Terrain (drives footstep audio and future surface modifiers)
    currentTerrain: null,
    // Morph system (Identity Ledger)
    activeMorph: null,
    unlockedMorphs: [],
    morphKnowledge: {},
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Store handler reference so it can be properly removed.
  // Anonymous arrow functions in removeEventListener are no-ops.
  const contextMenuHandler = useRef((e) => e.preventDefault());

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key.toLowerCase() === 'g') setDebugMode(p => !p);
      if (e.key === 'Tab')    { e.preventDefault(); setIsMenuOpen(p => !p); }
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    const preventContext = contextMenuHandler.current;

    window.addEventListener('keydown', handleKeys);
    window.addEventListener('contextmenu', preventContext);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  useEffect(() => { saveGame(gameState); }, [gameState]);

  const currentManifest = WORLD_MANIFEST[gameState.currentRoom];
  if (!currentManifest) return (
    <div style={{ color: 'red', background: '#000', height: '100vh', padding: 50, fontFamily: 'serif' }}>
      REGISTRY ERROR: Room "{gameState.currentRoom}" not found in WORLD_MANIFEST.
    </div>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* HUD */}
      <div style={{ position: 'fixed', top: 30, left: 30, zIndex: 9999, pointerEvents: 'none', fontFamily: 'serif' }}>
        <div style={{ width: '250px', marginBottom: '10px' }}>
          <div style={{ color: '#d4af37', fontSize: '9px', letterSpacing: '3px' }}>INTEGRITY</div>
          <div style={{ height: '2px', background: '#222', marginTop: '4px' }}>
            <div style={{
              height: '100%',
              background: gameState.integrity < 25 ? '#f00' : '#d4af37',
              width: `${gameState.integrity}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

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
    </div>
  );
}
