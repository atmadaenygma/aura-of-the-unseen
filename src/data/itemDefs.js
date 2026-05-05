// ── Item definitions ───────────────────────────────────────────────────────────
// size    : { w, h } in grid cells.  1×1 = tiny, 1×2 = tall, 1×3 = very tall, 2×2 = large/clothing
// stackMax: how many can share one slot.  1 = no stacking
//
// Items not listed here get the fallback: { size: { w: 1, h: 1 }, stackMax: 1 }

export const ITEM_DEFS = {
  // ── Clothing / large (2×2) ───────────────────────────────────────────────────
  folded_cloth: { size: { w: 2, h: 2 }, stackMax: 3 },
  rough_shirt:  { size: { w: 2, h: 2 }, stackMax: 3 },

  // ── Elongated / tall (1×2) ───────────────────────────────────────────────────
  candle_stub:  { size: { w: 1, h: 2 }, stackMax: 1 },
  small_bottle: { size: { w: 1, h: 2 }, stackMax: 1 },
  tin_comb:     { size: { w: 1, h: 2 }, stackMax: 1 },

  // ── Very tall / cord-like (1×3) ───────────────────────────────────────────────
  lamp_wick:    { size: { w: 1, h: 3 }, stackMax: 1 },

  // ── Stackable small items (1×1) ───────────────────────────────────────────────
  old_rag:      { size: { w: 1, h: 1 }, stackMax: 5  },
  rag_strip:    { size: { w: 1, h: 1 }, stackMax: 5  },
  matches:      { size: { w: 1, h: 1 }, stackMax: 10 },

  // ── Ingredients (1×1, stackable) ─────────────────────────────────────────────
  dried_corn:   { size: { w: 1, h: 1 }, stackMax: 5, category: 'ingredient' },
  flour_scoop:  { size: { w: 1, h: 1 }, stackMax: 3, category: 'ingredient' },
  lard_scrap:   { size: { w: 1, h: 1 }, stackMax: 3, category: 'ingredient' },
  dried_beans:  { size: { w: 1, h: 1 }, stackMax: 5, category: 'ingredient' },
  wild_herbs:   { size: { w: 1, h: 1 }, stackMax: 5, category: 'ingredient' },
  salt_packet:  { size: { w: 1, h: 1 }, stackMax: 3, category: 'ingredient' },
  sweet_potato: { size: { w: 1, h: 1 }, stackMax: 3, category: 'ingredient' },

  // ── Recipe scrolls / cards ───────────────────────────────────────────────────
  recipe_card_cornbread: { size: { w: 1, h: 1 }, stackMax: 1, category: 'recipe_card', teachesRecipe: 'corn_bread'  },
  recipe_card_ash_cake:  { size: { w: 1, h: 1 }, stackMax: 1, category: 'recipe_card', teachesRecipe: 'ash_cake'    },
  recipe_card_bean_stew: { size: { w: 1, h: 1 }, stackMax: 1, category: 'recipe_card', teachesRecipe: 'bean_stew'   },
  recipe_card_yam:       { size: { w: 1, h: 1 }, stackMax: 1, category: 'recipe_card', teachesRecipe: 'yam_piece'   },

  // ── Food / ready to eat ───────────────────────────────────────────────────────
  corn_bread:   { size: { w: 1, h: 1 }, stackMax: 3, category: 'recipe', hungerRestore: 35 },
  ash_cake:     { size: { w: 1, h: 1 }, stackMax: 3, category: 'recipe', hungerRestore: 25 },
  bean_stew:    { size: { w: 1, h: 2 }, stackMax: 1, category: 'recipe', hungerRestore: 50 },
  fatback:      { size: { w: 1, h: 1 }, stackMax: 3, category: 'recipe', hungerRestore: 20 },
  yam_piece:    { size: { w: 1, h: 1 }, stackMax: 3, category: 'recipe', hungerRestore: 30 },

  // ── Small / 1×1 (explicit, no stacking) ──────────────────────────────────────
  broken_button: { size: { w: 1, h: 1 }, stackMax: 1 },
  wax_paper:     { size: { w: 1, h: 1 }, stackMax: 1 },
  folded_note:   { size: { w: 1, h: 1 }, stackMax: 1, questItem: true },
  dried_flower:  { size: { w: 1, h: 1 }, stackMax: 1 },
  copper_coin:   { size: { w: 1, h: 1 }, stackMax: 1 },
  nail:          { size: { w: 1, h: 1 }, stackMax: 1 },
  scrap_paper:   { size: { w: 1, h: 1 }, stackMax: 1 },
  bent_pin:      { size: { w: 1, h: 1 }, stackMax: 1 },
  wood_chip:     { size: { w: 1, h: 1 }, stackMax: 1 },
};

const FALLBACK = { size: { w: 1, h: 1 }, stackMax: 1 };

export const getItemDef = (id) => ITEM_DEFS[id] ?? FALLBACK;
