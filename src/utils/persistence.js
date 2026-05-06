const PREFIX  = 'AURA_LEDGER';
const OLD_KEY = 'AURA_LEDGER_BETA';
const SLOTS   = [1, 2, 3, 4];
const key     = (slot) => `${PREFIX}_SLOT_${slot}`;

// Migrate the original single-slot save into slot 1 on first run
export const migrateOldSave = () => {
  const old = localStorage.getItem(OLD_KEY);
  if (old && !localStorage.getItem(key(1))) {
    localStorage.setItem(key(1), old);
  }
  if (old) localStorage.removeItem(OLD_KEY);
};

export const saveGame  = (state, slot = 1) =>
  localStorage.setItem(key(slot), JSON.stringify({ ...state, _savedAt: Date.now() }));

export const loadGame  = (slot = 1) => {
  const d = localStorage.getItem(key(slot));
  return d ? JSON.parse(d) : null;
};

export const clearSave = (slot = 1) => localStorage.removeItem(key(slot));

export const getSaveSlots = () =>
  SLOTS.map(slot => {
    const raw  = localStorage.getItem(key(slot));
    const data = raw ? JSON.parse(raw) : null;
    return {
      slot,
      empty:    !data,
      savedAt:  data?._savedAt ?? null,
      location: data?.currentRoom ?? null,
    };
  });
