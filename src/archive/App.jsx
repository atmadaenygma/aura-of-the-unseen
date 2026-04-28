import React, { useState, useEffect } from 'react';
import { Stage } from './components/Stage'; // We renamed RoomAlpha to Stage
import { Menu } from './components/Menu';
import { loadGame, saveGame } from './utils/persistence';
import { WORLD_MANIFEST } from './data/worldManifest'; // Your new folder database

export default function App() {
  // 1. Initialize State from Storage or Defaults
  const [gameState, setGameState] = useState(() => {
    return loadGame() || {
      integrity: 100,
      vigor: 100,
      money: 0.25,
      inventory: [],
      flags: {},
      currentRoom: 'PLANTATION_HOUSE_01' // Starting Location
    };
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // 2. Global Key Listeners
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key.toLowerCase() === 'g') setDebugMode(p => !p);
      if (e.key === 'Tab') { e.preventDefault(); setIsMenuOpen(p => !p); }
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  // 3. Persistent Auto-Save
  useEffect(() => { saveGame(gameState); }, [gameState]);

  // 4. Room Transition Function
  const changeRoom = (newRoomID) => {
    setGameState(prev => ({
      ...prev,
      currentRoom: newRoomID
    }));
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* HUD: Pinned to screen */}
      <div style={{ position: 'fixed', top: 30, left: 30, zIndex: 5000, pointerEvents: 'none' }}>
        <div style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Integrity: {Math.floor(gameState.integrity)}%
        </div>
        <div style={{ width: '200px', height: '1px', background: '#222', marginTop: '5px' }}>
          <div style={{ height: '100%', background: '#d4af37', width: `${gameState.integrity}%` }} />
        </div>
      </div>

      {/* THE DYNAMIC STAGE 
          This component now re-loads completely whenever currentRoom changes */}
      <Stage 
        key={gameState.currentRoom} // Forces a fresh load of masks/textures
        locationID={gameState.currentRoom}
        manifest={WORLD_MANIFEST[gameState.currentRoom]}
        gameState={gameState}
        setGameState={setGameState}
        changeRoom={changeRoom}
        debugMode={debugMode}
      />

      {isMenuOpen && (
        <Menu gameState={gameState} onClose={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
}