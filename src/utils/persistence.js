const SAVE_KEY = 'AURA_LEDGER_BETA';
export const saveGame = (state) => localStorage.setItem(SAVE_KEY, JSON.stringify({...state, timestamp: Date.now()}));
export const loadGame = () => {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? JSON.parse(data) : null;
};