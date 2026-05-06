import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTextScale } from '../context/TextScaleContext';
import { getItemDef } from '../data/itemDefs';
import { RECIPES } from '../data/recipes';
import {
  INV_COLS, INV_ROWS, INV_TOTAL,
  toRC, getOccupied,
  canPlace, removeFromGrid, placeAtGrid, countItems,
} from '../utils/inventoryHelpers';

const SLOT_SIZE  = 64;
const GAP        = 3;

// ── HUD colour palette (matches the rest of the UI — do not change) ───────────
const BG         = '#d6cab0';
const BG_DARK    = '#c9bca0';
const BG_GRID    = 'rgba(58,32,16,0.06)'; // subtle inset tint over BG
const BG_SLOT    = 'rgba(58,32,16,0.07)';
const BG_FILLED  = 'rgba(58,32,16,0.13)';
const ACCENT        = '#cb7866';
const QUEST_GOLD    = '#b8952a';
const STOLEN_RED    = '#8b2e1a';   // muted dark red — item was taken
const PURCHASED_GRN = '#2e6e3a';   // muted dark green — item was bought
const TEXT       = '#3a2010';
const TEXT_DIM   = 'rgba(58,32,16,0.45)';
const TEXT_MID   = 'rgba(58,32,16,0.65)';
const BORDER     = 'rgba(58,32,16,0.18)';
const BORDER_MED = 'rgba(58,32,16,0.3)';
const BORDER_LIT = 'rgba(58,32,16,0.35)';
const FONT       = 'Courier New, monospace';
const FONT_SER   = 'Georgia, serif';

const spanPx = (cells) => cells * SLOT_SIZE + (cells - 1) * GAP;

const TABS = [
  { id: 'satchel',      label: 'SATCHEL'     },
  { id: 'quest',        label: 'QUEST ITEMS' },
  { id: 'ingredients',  label: 'INGREDIENTS' },
  { id: 'recipes',      label: 'FOOD'        },
  { id: 'recipe_cards', label: 'RECIPES'     },
];

// ── Action popover ─────────────────────────────────────────────────────────────
const ORIGIN_META = {
  stolen:    { label: 'STOLEN',    color: STOLEN_RED    },
  purchased: { label: 'PURCHASED', color: PURCHASED_GRN },
};

const ActionPopover = ({ item, isQuest, onDrop, onEat, onLearn, onRead, onInspect, onGive, onEnter, onLeave }) => {
  const def          = getItemDef(item.id);
  const isFood       = !!(def.hungerRestore);
  const isRecipeCard = def.category === 'recipe_card';
  const isReadable   = !!(def.readable);
  const originMeta   = item.origin ? ORIGIN_META[item.origin] : null;
  return (
  <div
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    style={{
      position: 'absolute',
      bottom: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      background: BG_DARK,
      border: `1px solid ${isQuest ? QUEST_GOLD : BORDER_MED}`,
      padding: '10px 12px',
      width: 170,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
      pointerEvents: 'all',
    }}
  >
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: TEXT, fontFamily: FONT, fontSize: 9, letterSpacing: '2px', marginBottom: 4 }}>
        {item.name.toUpperCase()}
        {(item.count ?? 1) > 1 && (
          <span style={{ color: ACCENT, marginLeft: 6 }}>×{item.count}</span>
        )}
        {isQuest && (
          <span style={{ color: QUEST_GOLD, marginLeft: 6, fontSize: 8, letterSpacing: '1px' }}>QUEST</span>
        )}
      </div>
      {originMeta && (
        <div style={{
          display: 'inline-block',
          color: originMeta.color,
          fontFamily: FONT, fontSize: 7, letterSpacing: '1.5px',
          border: `1px solid ${originMeta.color}`,
          padding: '1px 5px',
          marginBottom: 6,
        }}>
          {originMeta.label}
        </div>
      )}
      {item.description && (
        <div style={{ color: TEXT_MID, fontFamily: FONT_SER, fontSize: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
          {item.description}
        </div>
      )}
    </div>

    <div style={{ height: 1, background: BORDER, margin: '8px 0' }} />

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {[
        { label: 'DROP',    fn: onDrop,    color: '#c0392b', hide: isQuest || isRecipeCard },
        { label: 'EAT',     fn: onEat,     color: '#4a8a6a', hide: !isFood       },
        { label: 'LEARN',   fn: onLearn,   color: '#4a6a9a', hide: !isRecipeCard },
        { label: 'READ',    fn: onRead,    color: QUEST_GOLD, hide: !isReadable  },
        { label: 'INSPECT', fn: onInspect, color: TEXT_MID  },
        { label: 'GIVE',    fn: onGive,    color: ACCENT    },
      ].filter(btn => !btn.hide).map(({ label, fn, color }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); fn(); }}
          style={{
            background: 'transparent',
            border: `1px solid ${BORDER}`,
            color,
            fontFamily: FONT, fontSize: 9,
            padding: '4px 8px',
            cursor: 'pointer', letterSpacing: '1px',
            transition: 'all 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = color; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = BORDER; }}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
  );
};

// ── Inspect modal ──────────────────────────────────────────────────────────────
const InspectModal = ({ item, onClose }) => createPortal(
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 10100,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: BG,
        border: `2px solid ${ACCENT}`,
        padding: '32px 36px',
        maxWidth: 360, textAlign: 'center',
        boxShadow: '0 0 60px rgba(0,0,0,0.7)',
      }}
    >
      <div style={{
        width: 80, height: 80, margin: '0 auto 20px',
        background: BG_SLOT,
        border: `1px solid ${BORDER_MED}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.image
          ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          : <span style={{ color: ACCENT, fontSize: 34 }}>✦</span>
        }
      </div>
      <div style={{ color: TEXT, fontFamily: FONT, fontSize: 13, letterSpacing: '3px', marginBottom: 12 }}>
        {item.name.toUpperCase()}
        {(item.count ?? 1) > 1 && (
          <span style={{ color: ACCENT, fontSize: 11, marginLeft: 8 }}>×{item.count}</span>
        )}
      </div>
      <div style={{ color: TEXT_MID, fontFamily: FONT_SER, fontSize: 13, lineHeight: 1.7, fontStyle: 'italic' }}>
        {item.description || 'Nothing remarkable about it.'}
      </div>
      {item.origin && ORIGIN_META[item.origin] && (
        <div style={{
          marginTop: 14,
          display: 'inline-block',
          color: ORIGIN_META[item.origin].color,
          fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
          border: `1px solid ${ORIGIN_META[item.origin].color}`,
          padding: '2px 8px',
        }}>
          {ORIGIN_META[item.origin].label}
        </div>
      )}
      <div style={{ marginTop: 16, color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '2px' }}>
        CLICK TO CLOSE
      </div>
    </div>
  </div>,
  document.body
);

// ── Read modal (readable quest items e.g. folded note) ────────────────────────
const ReadModal = ({ item, onClose }) => {
  const def   = getItemDef(item.id);
  const lines = Array.isArray(def.readContent) ? def.readContent : [def.readContent ?? ''];
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10100,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: BG,
          border: `1px solid ${BORDER_MED}`,
          borderTop: `2px solid ${QUEST_GOLD}`,
          padding: '36px 40px',
          maxWidth: 340,
          boxShadow: '0 0 60px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{
          fontFamily: FONT, fontSize: 8, letterSpacing: '3px',
          color: QUEST_GOLD, textTransform: 'uppercase', marginBottom: 20,
        }}>
          {item.name.toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {lines.map((line, i) =>
            line === '' ? (
              <div key={i} style={{ height: 10 }} />
            ) : (
              <div key={i} style={{
                fontFamily: FONT_SER, fontSize: 14, fontStyle: 'italic',
                color: TEXT, lineHeight: 1.7,
              }}>
                {line}
              </div>
            )
          )}
        </div>
        <div style={{ marginTop: 24, color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '2px' }}>
          CLICK TO CLOSE
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Filtered tab grid (quest / ingredients / food) ────────────────────────────
const FilteredGrid = ({ items, onDrop, onEat, onLearn, onRead, onInspect, onGive }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const hoverTimer = useRef(null);

  const showPopoverFor = (i) => { clearTimeout(hoverTimer.current); setHoveredIdx(i); };
  const hidePopover    = ()  => { hoverTimer.current = setTimeout(() => setHoveredIdx(null), 180); };
  const keepPopover    = ()  => clearTimeout(hoverTimer.current);

  const gridWidth = spanPx(INV_COLS);

  if (items.length === 0) {
    return (
      <div style={{ background: BG_GRID, padding: 3, boxShadow: 'inset 0 1px 4px rgba(58,32,16,0.12)' }}>
        <div style={{
          width: gridWidth, padding: '24px 0', textAlign: 'center',
          color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
        }}>
          — nothing here —
        </div>
      </div>
    );
  }

  // Pad to a full last row
  const rows  = Math.ceil(items.length / INV_COLS);
  const cells = [...items, ...Array(rows * INV_COLS - items.length).fill(null)];

  return (
    <div style={{ background: BG_GRID, padding: 3, boxShadow: 'inset 0 1px 4px rgba(58,32,16,0.12)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${INV_COLS}, ${SLOT_SIZE}px)`,
        gap: GAP,
        width: gridWidth,
      }}>
        {cells.map((item, i) => (
          <SlotCell
            key={i}
            item={item}
            faded={false}
            isDropTarget={false}
            gridStyle={{ gridColumn: `${(i % INV_COLS) + 1}`, gridRow: `${Math.floor(i / INV_COLS) + 1}` }}
            showPopover={hoveredIdx === i}
            onSlotEnter={() => { if (item) showPopoverFor(i); }}
            onSlotLeave={hidePopover}
            onPopoverEnter={keepPopover}
            onPopoverLeave={hidePopover}
            onMouseDown={undefined}
            onMouseUp={undefined}
            onDrop={item ? () => onDrop(item) : undefined}
            onEat={item ? () => onEat(item) : undefined}
            onLearn={item ? () => onLearn?.(item) : undefined}
            onRead={item ? () => onRead?.(item) : undefined}
            onInspect={item ? () => onInspect(item) : undefined}
            onGive={item ? () => onGive(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// ── Recipes tab pane ──────────────────────────────────────────────────────────
const RecipesTabPane = ({ scrollItems, knownRecipes, onLearn, onInspect, onGive, onDrop }) => {
  const hasScrolls = scrollItems.length > 0;
  const hasKnown   = knownRecipes.length > 0;

  if (!hasScrolls && !hasKnown) {
    return (
      <div style={{ background: BG_GRID, padding: 3, boxShadow: 'inset 0 1px 4px rgba(58,32,16,0.12)' }}>
        <div style={{
          width: spanPx(INV_COLS), padding: '24px 0', textAlign: 'center',
          color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
        }}>
          — no recipes found —
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Recipe cards in satchel */}
      {hasScrolls && (
        <div>
          <div style={{
            fontFamily: FONT, fontSize: 8, letterSpacing: '2px', color: TEXT_DIM,
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            In Your Satchel
          </div>
          <FilteredGrid
            items={scrollItems}
            onDrop={onDrop}
            onEat={() => {}}
            onLearn={onLearn}
            onInspect={onInspect}
            onGive={onGive}
          />
        </div>
      )}

      {/* Known recipes reference list */}
      {hasKnown && (
        <div>
          <div style={{
            fontFamily: FONT, fontSize: 8, letterSpacing: '2px', color: TEXT_DIM,
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            Known Recipes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {knownRecipes.map(recipeId => {
              const recipe = RECIPES[recipeId];
              if (!recipe) return null;
              return (
                <div key={recipeId} style={{
                  background: BG_GRID, border: `1px solid ${BORDER}`,
                  padding: '10px 12px',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    marginBottom: 6,
                  }}>
                    <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px', color: TEXT }}>
                      {recipe.name.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 7, color: TEXT_DIM, letterSpacing: '1px' }}>
                      yields {recipe.yields.name} ×{recipe.yields.count}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    {recipe.ingredients.map(ing => (
                      <span key={ing.id} style={{
                        fontFamily: FONT, fontSize: 7, letterSpacing: '1px', color: TEXT_MID,
                        border: `1px solid ${BORDER}`, padding: '1px 5px',
                      }}>
                        {ing.name} ×{ing.count}
                      </span>
                    ))}
                  </div>
                  <div style={{
                    fontFamily: FONT_SER, fontSize: 10, fontStyle: 'italic',
                    color: TEXT_DIM, lineHeight: 1.4,
                  }}>
                    {recipe.note}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Single slot cell ───────────────────────────────────────────────────────────
const SlotCell = ({
  item,
  faded,
  isDropTarget,
  gridStyle,
  onMouseDown,
  onMouseUp,
  onSlotEnter,
  onSlotLeave,
  showPopover,
  onPopoverEnter,
  onPopoverLeave,
  onDrop,
  onEat,
  onLearn,
  onRead,
  onInspect,
  onGive,
}) => {
  const def     = item ? getItemDef(item.id) : null;
  const isQuest = !!def?.questItem;
  const { w = 1, h = 1 } = def?.size ?? {};
  const cellW = spanPx(w);
  const cellH = spanPx(h);
  const draggable = item && !isQuest;

  // Icon size scales with cell — fills most of the pocket
  const iconSize = Math.round(Math.min(cellW, cellH) * 0.44);

  return (
    <div
      style={{ position: 'relative', width: cellW, height: cellH, flexShrink: 0, ...gridStyle }}
      onMouseEnter={onSlotEnter}
      onMouseLeave={onSlotLeave}
    >
      <div
        onMouseDown={draggable ? onMouseDown : undefined}
        onMouseUp={onMouseUp}
        style={{
          width: '100%', height: '100%',
          border: `1px solid ${
            isDropTarget ? ACCENT
            : isQuest    ? QUEST_GOLD
            : item       ? BORDER_LIT
            :              BORDER
          }`,
          background: isDropTarget
            ? `${ACCENT}20`
            : isQuest ? `${QUEST_GOLD}10`
            : item    ? BG_FILLED
            :           BG_SLOT,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          cursor: draggable ? 'grab' : 'default',
          opacity: faded ? 0.2 : 1,
          transition: 'border-color 0.15s, background 0.15s, opacity 0.2s',
          userSelect: 'none', boxSizing: 'border-box',
        }}
      >
        {item && (<>
          {/* Icon — sits directly in the pocket, no inner box */}
          {item.image
            ? <img
                src={item.image}
                style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0 }}
                alt=""
              />
            : <span style={{
                color: isQuest ? QUEST_GOLD : ACCENT,
                fontSize: iconSize,
                lineHeight: 1,
                flexShrink: 0,
              }}>✦</span>
          }

          {/* Name label */}
          <span style={{
            color: TEXT_MID,
            fontSize: 7,
            fontFamily: FONT,
            textAlign: 'center',
            letterSpacing: '0.3px',
            lineHeight: 1.2,
            maxWidth: cellW - 8,
            overflow: 'hidden',
          }}>
            {item.name}
          </span>

          {/* Quest badge — top-left */}
          {isQuest && (
            <div style={{
              position: 'absolute', top: 3, left: 3,
              background: QUEST_GOLD,
              color: '#fff',
              fontFamily: FONT, fontSize: 7,
              padding: '1px 3px',
              lineHeight: 1.4,
              pointerEvents: 'none',
            }}>Q</div>
          )}

          {/* Origin badge — top-right */}
          {item.origin === 'stolen' && (
            <div style={{
              position: 'absolute', top: 3, right: 3,
              background: STOLEN_RED,
              color: '#fff',
              fontFamily: FONT, fontSize: 7,
              padding: '1px 3px',
              lineHeight: 1.4,
              pointerEvents: 'none',
            }}>S</div>
          )}
          {item.origin === 'purchased' && (
            <div style={{
              position: 'absolute', top: 3, right: 3,
              background: PURCHASED_GRN,
              color: '#fff',
              fontFamily: FONT, fontSize: 7,
              padding: '1px 3px',
              lineHeight: 1.4,
              pointerEvents: 'none',
            }}>P</div>
          )}

          {/* Stack count — bottom-right */}
          {(item.count ?? 1) > 1 && (
            <div style={{
              position: 'absolute', bottom: 3, right: 4,
              color: ACCENT,
              fontFamily: FONT, fontSize: 8,
              lineHeight: 1,
              pointerEvents: 'none',
            }}>
              ×{item.count}
            </div>
          )}
        </>)}
      </div>

      {showPopover && item && (
        <ActionPopover
          item={item}
          isQuest={isQuest}
          onEnter={onPopoverEnter}
          onLeave={onPopoverLeave}
          onDrop={onDrop}
          onEat={onEat}
          onLearn={onLearn}
          onRead={onRead}
          onInspect={onInspect}
          onGive={onGive}
        />
      )}
    </div>
  );
};

// ── Satchel inventory UI ───────────────────────────────────────────────────────
export const InventoryUI = ({ gameState, setGameState, onClose }) => {
  const rawInventory = gameState.inventory || [];
  const grid = Array.from({ length: INV_TOTAL }, (_, i) => rawInventory[i] ?? null);

  const [drag,        setDrag]        = useState(null);
  const [dropTarget,  setDropTarget]  = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [inspectItem, setInspectItem] = useState(null);
  const [readingItem, setReadingItem] = useState(null);
  const [activeTab,   setActiveTab]   = useState('satchel');
  const hoverTimer = useRef(null);

  useEffect(() => {
    if (!drag) return;
    const move = (e) => setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : null);
    const up   = () => { setDrag(null); setDropTarget(null); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',  up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',  up);
    };
  }, [!!drag]);

  const showPopoverFor = (i) => { clearTimeout(hoverTimer.current); if (!drag) setHoveredSlot(i); };
  const hidePopover    = ()  => { hoverTimer.current = setTimeout(() => setHoveredSlot(null), 180); };
  const keepPopover    = ()  => clearTimeout(hoverTimer.current);

  const dragDef   = drag ? getItemDef(drag.item.id) : null;
  const { w: dw = 1, h: dh = 1 } = dragDef?.size ?? {};
  const clearedGrid = drag ? removeFromGrid(grid, drag.anchorIdx) : grid;
  const dropValid   = dropTarget !== null && drag && canPlace(clearedGrid, dropTarget, dw, dh);
  const dropCells   = dropValid ? new Set(getOccupied(dropTarget, dw, dh)) : new Set();

  const dropIntoSlot = (toIndex) => {
    if (!drag) return;
    if (drag.anchorIdx === toIndex) { setDrag(null); setDropTarget(null); return; }
    const def     = getItemDef(drag.item.id);
    const { w, h } = def.size;
    const cleared = removeFromGrid(grid, drag.anchorIdx);
    if (!canPlace(cleared, toIndex, w, h)) { setDrag(null); setDropTarget(null); return; }
    setGameState(p => ({ ...p, inventory: placeAtGrid(cleared, toIndex, drag.item) }));
    setDrag(null); setDropTarget(null);
  };

  const dropItem = (anchorIdx) => {
    const slot = grid[anchorIdx];
    if (!slot || getItemDef(slot.id).questItem) return;
    setGameState(p => ({ ...p, inventory: removeFromGrid(grid, anchorIdx) }));
    setHoveredSlot(null);
  };

  const giveItem = (item) => {
    setGameState(p => ({ ...p, pendingGive: item }));
    onClose();
  };

  const readItem = (anchorIdx) => {
    const slot = grid[anchorIdx];
    if (!slot) return;
    const def = getItemDef(slot.id);
    if (!def.readable) return;
    setHoveredSlot(null);
    setReadingItem(slot);
    // Reading the note unlocks knowledge about the people mentioned in it
    if (def.knowledgeGain) {
      setGameState(p => {
        const k = { ...(p.knowledge || {}) };
        Object.entries(def.knowledgeGain).forEach(([id, level]) => {
          k[id] = Math.max(k[id] ?? 0, level);
        });
        return { ...p, knowledge: k };
      });
    }
  };

  const learnRecipe = (anchorIdx) => {
    const slot = grid[anchorIdx];
    if (!slot) return;
    const def = getItemDef(slot.id);
    if (!def.teachesRecipe) return;
    setGameState(p => {
      const inv   = Array.from({ length: INV_TOTAL }, (_, i) => (p.inventory || [])[i] ?? null);
      inv[anchorIdx] = null;
      const known = p.knownRecipes || [];
      if (known.includes(def.teachesRecipe)) return { ...p, inventory: inv };
      return { ...p, inventory: inv, knownRecipes: [...known, def.teachesRecipe] };
    });
    setHoveredSlot(null);
  };

  const eatItem = (anchorIdx) => {
    const slot = grid[anchorIdx];
    if (!slot) return;
    const restore = getItemDef(slot.id).hungerRestore ?? 0;
    setGameState(p => {
      const inv = Array.from({ length: INV_TOTAL }, (_, i) => (p.inventory || [])[i] ?? null);
      if ((slot.count ?? 1) > 1) {
        inv[anchorIdx] = { ...slot, count: slot.count - 1 };
      } else {
        // remove anchor and all __ref covers
        inv.forEach((s, i) => {
          if (i === anchorIdx || (s?.__ref === anchorIdx)) inv[i] = null;
        });
      }
      return {
        ...p,
        inventory: inv,
        hunger: Math.min(100, (p.hunger ?? 100) + restore),
      };
    });
    setHoveredSlot(null);
  };

  const zoom      = useTextScale();
  const itemCount = countItems(grid);
  const gridWidth = spanPx(INV_COLS);

  // Anchor items for filtered tabs
  const anchorItems = grid
    .map((slot, i) => (slot && slot.__ref === undefined ? { ...slot, _anchorIdx: i } : null))
    .filter(Boolean);

  const tabItems = {
    quest:        anchorItems.filter(it => !!getItemDef(it.id).questItem),
    ingredients:  anchorItems.filter(it => getItemDef(it.id).category === 'ingredient'),
    recipes:      anchorItems.filter(it => getItemDef(it.id).category === 'recipe'),
    recipe_cards: anchorItems.filter(it => getItemDef(it.id).category === 'recipe_card'),
  };

  const knownRecipes  = gameState.knownRecipes || [];
  const satchelCount  = anchorItems.filter(it => {
    const d = getItemDef(it.id);
    return !d.questItem && d.category !== 'ingredient' && d.category !== 'recipe' && d.category !== 'recipe_card';
  }).length;
  const activeCount   = activeTab === 'satchel'      ? satchelCount
    : activeTab === 'recipe_cards' ? knownRecipes.length
    : (tabItems[activeTab]?.length ?? 0);

  return (
    <>
      <div style={{
        background: BG,
        borderTop: `2px solid ${ACCENT}`,
        borderLeft: `1px solid ${BORDER_MED}`,
        borderRight: `1px solid ${BORDER_MED}`,
        boxShadow: '4px -8px 40px rgba(0,0,0,0.4)',
        padding: '12px 14px 14px',
        zoom,
      }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginBottom: 10 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${active ? ACCENT : 'transparent'}`,
                  color: active ? TEXT : TEXT_DIM,
                  fontFamily: FONT, fontSize: 8, letterSpacing: '1.5px',
                  padding: '0 10px 7px', cursor: 'pointer',
                  marginBottom: -1,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${BORDER}`,
        }}>
          <span style={{ color: TEXT, fontFamily: FONT, fontSize: 11, letterSpacing: '3px' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </span>
          <span style={{ color: TEXT_DIM, fontFamily: FONT, fontSize: 8, letterSpacing: '2px' }}>
            {activeCount} item{activeCount !== 1 ? 's' : ''}
          </span>
        </div>

        {activeTab === 'satchel' ? (
          /* Grid — subtle inset to read as a contained pocket area */
          <div style={{
            background: BG_GRID, padding: 3,
            boxShadow: 'inset 0 1px 4px rgba(58,32,16,0.12)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${INV_COLS}, ${SLOT_SIZE}px)`,
              gridTemplateRows: `repeat(${INV_ROWS}, ${SLOT_SIZE}px)`,
              gap: GAP, width: gridWidth,
            }}>
              {Array.from({ length: INV_TOTAL }, (_, i) => {
                const slot = grid[i];
                if (slot !== null && slot.__ref !== undefined) return null;
                const { row, col } = toRC(i);

                // Items belonging to other tabs are hidden from the satchel view.
                // They remain in the grid (occupying their positions) but render as empty.
                const slotDef   = slot ? getItemDef(slot.id) : null;
                const isTabItem = slot && (
                  slotDef?.questItem ||
                  slotDef?.category === 'ingredient' ||
                  slotDef?.category === 'recipe' ||
                  slotDef?.category === 'recipe_card'
                );
                const item = isTabItem ? null : slot;
                // Preserve the original span size so excluded multi-cell items
                // leave a correctly-sized empty space rather than collapsing to 1×1.
                const { w: ew = 1, h: eh = 1 } = (isTabItem ? slotDef?.size : null) ?? {};

                return (
                  <SlotCell
                    key={i}
                    item={item}
                    faded={drag?.anchorIdx === i}
                    isDropTarget={dropCells.has(i)}
                    gridStyle={{
                      gridColumn: `${col + 1}`, gridRow: `${row + 1}`,
                      ...(isTabItem ? { width: spanPx(ew), height: spanPx(eh) } : {}),
                    }}
                    showPopover={hoveredSlot === i && !drag}
                    onSlotEnter={() => { if (drag) setDropTarget(i); else showPopoverFor(i); }}
                    onSlotLeave={() => { if (drag) setDropTarget(null); else hidePopover(); }}
                    onPopoverEnter={keepPopover}
                    onPopoverLeave={hidePopover}
                    onMouseDown={item ? (e) => {
                      e.preventDefault();
                      setHoveredSlot(null);
                      setDrag({ item, anchorIdx: i, x: e.clientX, y: e.clientY });
                    } : undefined}
                    onMouseUp={(e) => { e.stopPropagation(); dropIntoSlot(i); }}
                    onDrop={() => dropItem(i)}
                    onEat={() => eatItem(i)}
                    onLearn={() => learnRecipe(i)}
                    onRead={() => readItem(i)}
                    onInspect={() => { setHoveredSlot(null); setInspectItem(item); }}
                    onGive={() => giveItem(item)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          activeTab === 'recipe_cards' ? (
            <RecipesTabPane
              scrollItems={tabItems.recipe_cards ?? []}
              knownRecipes={knownRecipes}
              onLearn={(item) => learnRecipe(item._anchorIdx)}
              onInspect={(item) => setInspectItem(item)}
              onGive={(item) => giveItem(item)}
              onDrop={(item) => dropItem(item._anchorIdx)}
            />
          ) : (
          <FilteredGrid
            items={tabItems[activeTab] ?? []}
            onDrop={(item) => dropItem(item._anchorIdx)}
            onEat={(item) => eatItem(item._anchorIdx)}
            onLearn={(item) => learnRecipe(item._anchorIdx)}
            onRead={(item) => readItem(item._anchorIdx)}
            onInspect={(item) => setInspectItem(item)}
            onGive={(item) => giveItem(item)}
          />
          )
        )}
      </div>

      {/* Drag ghost — only active on satchel tab */}
      {drag && activeTab === 'satchel' && createPortal(
        (() => {
          const { w, h } = getItemDef(drag.item.id).size;
          const gw = spanPx(w);
          const gh = spanPx(h);
          const iconSize = Math.round(Math.min(gw, gh) * 0.44);
          return (
            <div style={{
              position: 'fixed',
              left: drag.x - gw / 2, top: drag.y - gh / 2,
              width: gw, height: gh,
              pointerEvents: 'none', zIndex: 10001,
              opacity: 0.9, transform: 'scale(1.07)',
            }}>
              <div style={{
                width: '100%', height: '100%',
                border: `1px solid ${ACCENT}`, background: BG_DARK,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
              }}>
                <span style={{ color: ACCENT, fontSize: iconSize, lineHeight: 1 }}>✦</span>
                <span style={{ color: TEXT_MID, fontSize: 7, fontFamily: FONT, textAlign: 'center', maxWidth: gw - 8 }}>
                  {drag.item.name}
                </span>
                {(drag.item.count ?? 1) > 1 && (
                  <span style={{ color: ACCENT, fontFamily: FONT, fontSize: 8 }}>×{drag.item.count}</span>
                )}
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {inspectItem && (
        <InspectModal item={inspectItem} onClose={() => setInspectItem(null)} />
      )}

      {readingItem && (
        <ReadModal item={readingItem} onClose={() => setReadingItem(null)} />
      )}
    </>
  );
};
