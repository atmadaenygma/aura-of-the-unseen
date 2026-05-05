import { getItemDef } from '../data/itemDefs';

export const INV_COLS  = 4;
export const INV_ROWS  = 5;
export const INV_TOTAL = INV_COLS * INV_ROWS;

// ── Index ↔ row/col ────────────────────────────────────────────────────────────
export const toRC  = (i)        => ({ row: Math.floor(i / INV_COLS), col: i % INV_COLS });
export const toIdx = (row, col) => row * INV_COLS + col;

// ── All indices occupied by an item of size {w,h} anchored at anchorIdx ────────
export const getOccupied = (anchorIdx, w, h) => {
  const { row, col } = toRC(anchorIdx);
  const cells = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      cells.push(toIdx(row + r, col + c));
    }
  }
  return cells;
};

// ── Can an item of size {w,h} be placed at anchorIdx in grid? ──────────────────
// skipIndices: treat those cells as free (used when moving an existing item).
export const canPlace = (grid, anchorIdx, w, h, skipIndices = new Set()) => {
  const { row, col } = toRC(anchorIdx);
  if (col + w > INV_COLS) return false;
  if (row + h > INV_ROWS) return false;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const idx = toIdx(row + r, col + c);
      if (skipIndices.has(idx)) continue;
      if (grid[idx] != null) return false;
    }
  }
  return true;
};

// ── Remove an item (and its covered cells) from the grid ──────────────────────
// Returns a new grid array; original is untouched.
export const removeFromGrid = (grid, anchorIdx) => {
  const slot = grid[anchorIdx];
  if (!slot || slot.__ref !== undefined) return grid; // nothing to remove
  const { w, h } = getItemDef(slot.id).size;
  const newGrid = [...grid];
  getOccupied(anchorIdx, w, h).forEach(idx => { newGrid[idx] = null; });
  return newGrid;
};

// ── Place an item at anchorIdx, covering all cells it occupies ────────────────
// Assumes the destination is already free.
export const placeAtGrid = (grid, anchorIdx, item) => {
  const { w, h } = getItemDef(item.id).size;
  const cells = getOccupied(anchorIdx, w, h);
  const newGrid = [...grid];
  newGrid[anchorIdx] = item;
  cells.slice(1).forEach(idx => { newGrid[idx] = { __ref: anchorIdx } });
  return newGrid;
};

// ── Add an item to the grid (handles stacking + auto-placement) ───────────────
// Returns a new grid, or null if there is no room.
export const addItemToGrid = (grid, rawItem) => {
  const item = { count: 1, ...rawItem };
  const def  = getItemDef(item.id);
  const { w, h } = def.size;

  // 1. Try to stack onto an existing slot
  if (def.stackMax > 1) {
    for (let i = 0; i < grid.length; i++) {
      const slot = grid[i];
      if (slot && slot.__ref === undefined && slot.id === item.id) {
        const current = slot.count ?? 1;
        if (current < def.stackMax) {
          const newGrid = [...grid];
          newGrid[i] = { ...slot, count: Math.min(current + item.count, def.stackMax) };
          return newGrid;
        }
      }
    }
  }

  // 2. Find the first anchor position where the item fits
  for (let i = 0; i < INV_TOTAL; i++) {
    if (canPlace(grid, i, w, h)) {
      return placeAtGrid(grid, i, item);
    }
  }

  return null; // satchel is full
};

// ── Count real items (anchors only, not covered cells) ────────────────────────
export const countItems = (grid) =>
  grid.filter(s => s != null && s.__ref === undefined).length;
