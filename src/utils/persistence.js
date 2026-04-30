const SAVE_KEY = 'AURA_LEDGER_BETA';
export const saveGame   = (state) => localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
export const loadGame   = () => { const d = localStorage.getItem(SAVE_KEY); return d ? JSON.parse(d) : null; };
export const clearSave  = () => localStorage.removeItem(SAVE_KEY);