import React, { useState, useEffect, useRef } from 'react';
import { Stage } from './components/Stage';
import { Menu } from './components/Menu';
import { InventoryUI } from './components/InventoryUI';
import { loadGame, saveGame } from './utils/persistence';
import { WORLD_MANIFEST } from './data/worldManifest';

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const saved = loadGame();
    // Strip pendingGive — it should never survive a reload. If the game was saved
    // mid-give (auto-save or on-change save), the item remains in inventory and
    // the player can select it again intentionally.
    if (saved) return {
      ...saved,
      pendingGive: null,
      // Sanitize arrays that may be missing in saves from before these fields existed
      memories:    Array.isArray(saved.memories)    ? saved.memories    : [],
      inventory:   Array.isArray(saved.inventory)   ? saved.inventory   : [],
      npcSuspicion: saved.npcSuspicion || {},
      containers:   saved.containers   || {},
    };
    return {
    // Core stats
    integrity: 100,
    vigor: 100,
    money: 0.25,
    // Collections
    inventory: [],
    flags: {},
    memories: [],
    containers: {},
    pendingGive: null,
    npcSuspicion: {},
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
    };
  });

  const [isMenuOpen,      setIsMenuOpen]      = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [debugMode,       setDebugMode]       = useState(false);

  // Auto-save ref — always holds the latest gameState without restarting the interval
  const latestGameState = useRef(gameState);
  useEffect(() => { latestGameState.current = gameState; }, [gameState]);

  // Store handler reference so it can be properly removed.
  // Anonymous arrow functions in removeEventListener are no-ops.
  const contextMenuHandler = useRef((e) => e.preventDefault());

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key.toLowerCase() === 'g') setDebugMode(p => !p);
      if (e.key.toLowerCase() === 'i') setIsInventoryOpen(p => !p);
      if (e.key === 'Tab')    { e.preventDefault(); setIsMenuOpen(p => !p); }
      if (e.key === 'Escape') { setIsMenuOpen(false); setIsInventoryOpen(false); }
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

  // Auto-save every 5 minutes (overwrites — single save slot)
  useEffect(() => {
    const id = setInterval(() => {
      saveGame(latestGameState.current);
      console.log('%c[SAVE] Auto-save', 'color:#d4af37');
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

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

      {isInventoryOpen && (
        <InventoryUI
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setIsInventoryOpen(false)}
        />
      )}

      {/* Pending-give indicator */}
      {gameState.pendingGive && (
        <div style={{
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, pointerEvents: 'all',
          background: 'rgba(0,0,0,0.9)',
          border: `1px solid ${gameState.nearbyNPC ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.2)'}`,
          padding: '8px 20px', borderRadius: 3,
          fontFamily: 'monospace', fontSize: 10, letterSpacing: '1px',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
          transition: 'border-color 0.2s',
        }}>
          <span style={{ color: '#d4af37' }}>
            GIVING: {gameState.pendingGive.name.toUpperCase()}
          </span>
          {gameState.nearbyNPC ? (
            <span style={{ color: '#fff', fontWeight: 'bold' }}>
              [E] {gameState.nearbyNPC.name.toUpperCase()}
            </span>
          ) : (
            <span style={{ color: '#444' }}>APPROACH AN NPC AND PRESS [E]</span>
          )}
          <button
            onClick={() => setGameState(p => ({ ...p, pendingGive: null }))}
            style={{
              background: 'none', border: 'none', color: '#333',
              fontFamily: 'monospace', fontSize: 10, cursor: 'pointer',
              letterSpacing: '1px', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >[ESC] CANCEL</button>
        </div>
      )}

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
