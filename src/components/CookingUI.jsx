import React from 'react';
import { createPortal } from 'react-dom';
import { RECIPES } from '../data/recipes';
import { getItemDef } from '../data/itemDefs';
import { addItemToGrid } from '../utils/inventoryHelpers';
import { useTextScale } from '../context/TextScaleContext';

const INV_TOTAL  = 20;
const BG         = '#d6cab0';
const BG_DARK    = '#c9bca0';
const BG_GRID    = 'rgba(58,32,16,0.06)';
const ACCENT     = '#cb7866';
const TEXT       = '#3a2010';
const TEXT_DIM   = 'rgba(58,32,16,0.45)';
const TEXT_MID   = 'rgba(58,32,16,0.65)';
const BORDER     = 'rgba(58,32,16,0.18)';
const BORDER_MED = 'rgba(58,32,16,0.3)';
const FONT       = 'Courier New, monospace';
const FONT_SER   = 'Georgia, serif';
const COOK_GREEN = '#2a7a5a';
const MISS_RED   = '#c0392b';

export const CookingUI = ({ entity, gameState, setGameState, onClose }) => {
  const zoom         = useTextScale();
  const knownRecipes = gameState.knownRecipes || [];
  const grid         = Array.from({ length: INV_TOTAL }, (_, i) => (gameState.inventory || [])[i] ?? null);

  const getCount = (itemId) =>
    grid.reduce((total, slot) => {
      if (!slot || slot.__ref !== undefined || slot.id !== itemId) return total;
      return total + (slot.count ?? 1);
    }, 0);

  const canCook = (recipe) =>
    recipe.ingredients.every(ing => getCount(ing.id) >= ing.count);

  const cook = (recipe) => {
    if (!canCook(recipe)) return;
    setGameState(p => {
      let inv = Array.from({ length: INV_TOTAL }, (_, i) => (p.inventory || [])[i] ?? null);

      // Consume ingredients (all 1×1 — no __ref covers to clean up)
      for (const { id, count: needed } of recipe.ingredients) {
        let remaining = needed;
        for (let i = 0; i < inv.length && remaining > 0; i++) {
          const slot = inv[i];
          if (!slot || slot.__ref !== undefined || slot.id !== id) continue;
          const have = slot.count ?? 1;
          if (have <= remaining) { inv[i] = null; remaining -= have; }
          else { inv[i] = { ...slot, count: have - remaining }; remaining = 0; }
        }
      }

      // Add yielded food to inventory
      const foodItem = {
        id:          recipe.yields.id,
        name:        recipe.yields.name,
        description: recipe.yields.description,
        count:       recipe.yields.count,
      };
      const placed = addItemToGrid(inv, foodItem);
      if (placed) inv = placed;

      return { ...p, inventory: inv };
    });
  };

  // Ingredients the player currently carries
  const carriedIngredients = grid
    .filter(slot => slot && slot.__ref === undefined && getItemDef(slot.id).category === 'ingredient')
    .map(slot => ({ ...slot }));

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9800,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: BG,
          borderTop: `2px solid ${ACCENT}`,
          border: `1px solid ${BORDER_MED}`,
          width: 580, maxHeight: '78vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0,0,0,0.6)',
          zoom,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px 10px',
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '3px', color: TEXT }}>
              {entity.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '2px', color: TEXT_DIM, marginTop: 2 }}>
              COOKING FIRE
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '1px',
              padding: '4px 10px', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_DIM; }}
          >
            CLOSE
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left — known recipes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', borderRight: `1px solid ${BORDER}` }}>
            <div style={{
              fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
              color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 10,
            }}>
              Known Recipes
            </div>

            {knownRecipes.length === 0 ? (
              <div style={{
                fontFamily: FONT_SER, fontSize: 12, fontStyle: 'italic',
                color: TEXT_DIM, lineHeight: 1.7,
              }}>
                You don't know any recipes yet. Find recipe cards and read them.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {knownRecipes.map(recipeId => {
                  const recipe   = RECIPES[recipeId];
                  if (!recipe) return null;
                  const cookable = canCook(recipe);

                  return (
                    <div key={recipeId} style={{
                      background: BG_GRID,
                      border: `1px solid ${cookable ? ACCENT : BORDER}`,
                      padding: '10px 12px',
                    }}>
                      {/* Name + yields */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                        marginBottom: 8,
                      }}>
                        <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', color: TEXT }}>
                          {recipe.name.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 7, color: TEXT_DIM, letterSpacing: '1px' }}>
                          yields {recipe.yields.name} ×{recipe.yields.count}
                        </span>
                      </div>

                      {/* Ingredient checklist */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                        {recipe.ingredients.map(ing => {
                          const have   = getCount(ing.id);
                          const enough = have >= ing.count;
                          return (
                            <div key={ing.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                              <span style={{ fontFamily: FONT, fontSize: 8, color: enough ? TEXT : TEXT_DIM, letterSpacing: '0.5px' }}>
                                {ing.name}
                              </span>
                              <span style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '1px', color: enough ? COOK_GREEN : MISS_RED }}>
                                {have}/{ing.count} {enough ? '✓' : '✗'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Instruction */}
                      <div style={{
                        fontFamily: FONT_SER, fontSize: 10, fontStyle: 'italic',
                        color: TEXT_DIM, lineHeight: 1.5, marginBottom: 10,
                      }}>
                        {recipe.note}
                      </div>

                      {/* Cook button */}
                      <button
                        onClick={() => cook(recipe)}
                        disabled={!cookable}
                        style={{
                          background: cookable ? ACCENT : 'transparent',
                          border: `1px solid ${cookable ? ACCENT : BORDER}`,
                          color: cookable ? '#fff' : TEXT_DIM,
                          fontFamily: FONT, fontSize: 9, letterSpacing: '2px',
                          padding: '5px 14px',
                          cursor: cookable ? 'pointer' : 'default',
                          transition: 'opacity 0.15s',
                          textTransform: 'uppercase',
                        }}
                        onMouseEnter={e => { if (cookable) e.currentTarget.style.opacity = '0.82'; }}
                        onMouseLeave={e => { if (cookable) e.currentTarget.style.opacity = '1'; }}
                      >
                        {cookable ? 'COOK' : 'MISSING INGREDIENTS'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — ingredients in satchel */}
          <div style={{ width: 170, flexShrink: 0, overflowY: 'auto', padding: '14px 14px' }}>
            <div style={{
              fontFamily: FONT, fontSize: 8, letterSpacing: '2px',
              color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 10,
            }}>
              Your Ingredients
            </div>

            {carriedIngredients.length === 0 ? (
              <div style={{ fontFamily: FONT, fontSize: 8, color: TEXT_DIM, letterSpacing: '1px', lineHeight: 1.7 }}>
                — none —
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {carriedIngredients.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: `1px solid ${BORDER}`,
                  }}>
                    <span style={{ fontFamily: FONT, fontSize: 8, color: TEXT, letterSpacing: '0.5px' }}>
                      {item.name}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 8, color: ACCENT }}>
                      ×{item.count ?? 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
