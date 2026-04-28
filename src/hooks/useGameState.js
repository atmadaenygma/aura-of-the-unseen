import { useState, useEffect } from 'react';
import { saveGame, loadGame } from '../utils/persistence';

export const useGameState = () => {
  const [state, setState] = useState(() => {
    const saved = loadGame();
    return saved || {
      integrity: 100,
      vigor: 100,
      money: 0.00,
      inventory: [],
      flags: {}, // "did_talk_to_silas": true, etc.
      memories: [], // Unlocked historical artifacts
      currentRoom: 'ROOM_ALPHA'
    };
  });

  // Auto-save whenever state changes
  useEffect(() => {
    saveGame(state);
  }, [state]);

  const updateFlag = (flagID, value) => {
    setState(prev => ({
      ...prev,
      flags: { ...prev.flags, [flagID]: value }
    }));
  };

  const addInventory = (item) => {
    setState(prev => ({
      ...prev,
      inventory: [...prev.inventory, item]
    }));
  };

  const addMoney = (amount) => {
    setState(prev => ({ ...prev, money: prev.money + amount }));
  };

  return { state, setState, updateFlag, addInventory, addMoney };
};