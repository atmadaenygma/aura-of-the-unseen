import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTextScale } from '../context/TextScaleContext';
import { getItemDef } from '../data/itemDefs';
import { addItemToGrid, countItems, INV_COLS, INV_TOTAL, toRC } from '../utils/inventoryHelpers';

const REVEAL_DELAY_MS = 1600;

// ── Palette (matches HUD — do not change) ─────────────────────────────────────
const L_BG       = '#d6cab0';
const L_BG_DARK  = '#c9bca0';
const L_ACCENT   = '#cb7866';
const L_TEXT     = '#3a2010';
const L_BORDER   = 'rgba(58,32,16,0.2)';
const L_FONT     = 'Courier New, monospace';
const L_FONT_SER = 'Georgia, serif';

// Shared with InventoryUI badges
const BG_SLOT       = 'rgba(58,32,16,0.07)';
const BG_FILLED     = 'rgba(58,32,16,0.13)';
const BG_GRID       = 'rgba(58,32,16,0.06)';
const BORDER_LIT    = 'rgba(58,32,16,0.35)';
const TEXT_MID      = 'rgba(58,32,16,0.65)';
const TEXT_DIM      = 'rgba(58,32,16,0.45)';
const QUEST_GOLD    = '#b8952a';
const STOLEN_RED    = '#8b2e1a';
const PURCHASED_GRN = '#2e6e3a';

const SLOT_SIZE = 64;
const GAP       = 3;
const spanPx    = (n) => n * SLOT_SIZE + (n - 1) * GAP;

// ── Loot-side slot (left panel) — single cell with progressive reveal ──────────
const LootSlot = ({ item, revealed, faded, onMouseDown, onMouseEnter, onMouseLeave, size = 68 }) => {
  const unknown = item && !revealed;
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: size, height: size,
        border: `1px solid ${item ? L_BORDER : 'rgba(58,32,16,0.12)'}`,
        background: unknown ? 'rgba(58,32,16,0.12)' : item ? 'rgba(58,32,16,0.08)' : 'rgba(58,32,16,0.05)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        cursor: item && revealed ? 'grab' : 'default',
        opacity: faded ? 0.25 : 1,
        transition: 'opacity 0.2s',
        userSelect: 'none', boxSizing: 'border-box', flexShrink: 0,
      }}
    >
      {unknown && (
        <span style={{ color: 'rgba(58,32,16,0.3)', fontSize: 20, fontFamily: 'serif' }}>?</span>
      )}
      {item && revealed && (<>
        {item.image
          ? <img src={item.image} style={{ width: Math.round(size * 0.44), height: Math.round(size * 0.44), objectFit: 'contain' }} alt="" />
          : <span style={{ color: L_ACCENT, fontSize: Math.round(size * 0.22), lineHeight: 1 }}>✦</span>
        }
        <span style={{
          color: TEXT_MID, fontSize: 7, fontFamily: L_FONT,
          textAlign: 'center', letterSpacing: '0.3px', lineHeight: 1.2,
          maxWidth: size - 8, overflow: 'hidden',
        }}>
          {item.name}
        </span>
      </>)}
    </div>
  );
};

// ── Satchel-side slot (right panel) — mirrors InventoryUI exactly ──────────────
const SatchelSlot = ({ slot, index, isDragOver, onMouseEnter, onMouseLeave, onMouseUp }) => {
  // __ref slots are covered by a multi-cell anchor — render nothing
  if (slot !== null && slot.__ref !== undefined) return null;

  const item    = slot; // null or anchor item
  const def     = item ? getItemDef(item.id) : null;
  const isQuest = !!def?.questItem;
  const { w = 1, h = 1 } = def?.size ?? {};
  const { row, col } = toRC(index);

  const cellW    = spanPx(w);
  const cellH    = spanPx(h);
  const iconSize = Math.round(Math.min(cellW, cellH) * 0.44);

  return (
    <div
      style={{
        position: 'relative',
        width: cellW, height: cellH,
        gridColumn: `${col + 1} / span ${w}`,
        gridRow:    `${row + 1} / span ${h}`,
        border: `1px solid ${
          isDragOver && !item ? L_ACCENT
          : isQuest           ? QUEST_GOLD
          : item              ? BORDER_LIT
          :                     'rgba(58,32,16,0.18)'
        }`,
        background: isDragOver && !item
          ? `${L_ACCENT}18`
          : isQuest ? `${QUEST_GOLD}12`
          : item    ? BG_FILLED
          :           BG_SLOT,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        cursor: 'default',
        boxSizing: 'border-box',
        userSelect: 'none',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
    >
      {item && (<>
        {item.image
          ? <img src={item.image} style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0 }} alt="" />
          : <span style={{ color: isQuest ? QUEST_GOLD : L_ACCENT, fontSize: iconSize, lineHeight: 1, flexShrink: 0 }}>✦</span>
        }
        <span style={{
          color: TEXT_MID, fontSize: 7, fontFamily: L_FONT,
          textAlign: 'center', letterSpacing: '0.3px', lineHeight: 1.2,
          maxWidth: cellW - 8, overflow: 'hidden',
        }}>
          {item.name}
        </span>

        {/* Quest badge — top-left */}
        {isQuest && (
          <div style={{
            position: 'absolute', top: 3, left: 3,
            background: QUEST_GOLD, color: '#fff',
            fontFamily: L_FONT, fontSize: 7, padding: '1px 3px', lineHeight: 1.4,
            pointerEvents: 'none',
          }}>Q</div>
        )}

        {/* Origin badge — top-right */}
        {item.origin === 'stolen' && (
          <div style={{
            position: 'absolute', top: 3, right: 3,
            background: STOLEN_RED, color: '#fff',
            fontFamily: L_FONT, fontSize: 7, padding: '1px 3px', lineHeight: 1.4,
            pointerEvents: 'none',
          }}>S</div>
        )}
        {item.origin === 'purchased' && (
          <div style={{
            position: 'absolute', top: 3, right: 3,
            background: PURCHASED_GRN, color: '#fff',
            fontFamily: L_FONT, fontSize: 7, padding: '1px 3px', lineHeight: 1.4,
            pointerEvents: 'none',
          }}>P</div>
        )}

        {/* Stack count — bottom-right */}
        {(item.count ?? 1) > 1 && (
          <div style={{
            position: 'absolute', bottom: 3, right: 4,
            color: L_ACCENT, fontFamily: L_FONT, fontSize: 8, lineHeight: 1,
            pointerEvents: 'none',
          }}>×{item.count}</div>
        )}
      </>)}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const LootUI = ({ container, gameState, setGameState, onClose }) => {
  const zoom      = useTextScale();
  const loot      = container.loot || [];
  const inventory = gameState.inventory || [];
  const takenSet  = new Set(gameState.containers?.[container.id] || []);

  const [revealed, setRevealed] = useState(0);
  const [drag,     setDrag]     = useState(null);  // { item, lootIndex, x, y }
  const [tooltip,  setTooltip]  = useState(null);
  const [dragOver, setDragOver] = useState(false); // any satchel slot hovered during drag

  // Progressive reveal
  useEffect(() => {
    if (revealed >= loot.length) return;
    const t = setTimeout(() => setRevealed(r => r + 1), REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [revealed, loot.length]);

  // Esc to close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Global mouse tracking while dragging
  useEffect(() => {
    if (!drag) return;
    const move = (e) => setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : null);
    const up   = () => { setDrag(null); setDragOver(false); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',  up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',  up);
    };
  }, [!!drag]);

  // Drop into satchel — auto-places, stamps stolen
  const dropIntoSlot = () => {
    if (!drag) return;
    const baseGrid = Array.from({ length: INV_TOTAL }, (_, i) => inventory[i] ?? null);
    const newGrid  = addItemToGrid(baseGrid, { ...drag.item, origin: 'stolen' });
    if (!newGrid) return;

    const newTaken = [...(gameState.containers?.[container.id] || []), drag.lootIndex];
    setGameState(p => ({
      ...p,
      inventory:  newGrid,
      containers: { ...(p.containers || {}), [container.id]: newTaken },
    }));
    setDrag(null);
    setDragOver(false);
  };

  const invGrid     = Array.from({ length: INV_TOTAL }, (_, i) => inventory[i] ?? null);
  const visibleLoot = loot
    .map((item, i) => ({ item, index: i }))
    .filter(({ index }) => !takenSet.has(index));

  const allRevealed = revealed >= loot.length;
  const itemsFound  = visibleLoot.filter(({ index }) => index < revealed).length;

  // Drag ghost size matches item def
  const ghostDef  = drag ? getItemDef(drag.item.id) : null;
  const { w: gw = 1, h: gh = 1 } = ghostDef?.size ?? {};
  const ghostW    = spanPx(gw);
  const ghostH    = spanPx(gh);
  const ghostIcon = Math.round(Math.min(ghostW, ghostH) * 0.44);

  const gridWidth = spanPx(INV_COLS);

  return createPortal(
    <>
      <style>{`@keyframes loot-pulse { 0%,100%{opacity:.2} 50%{opacity:.6} }`}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(58,32,16,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          display: 'flex', gap: 0,
          background: L_BG,
          border: `1px solid ${L_BORDER}`,
          boxShadow: '0 8px 60px rgba(58,32,16,0.5)',
          overflow: 'hidden',
          zoom,
        }}>

          {/* ── LEFT — Container loot ──────────────────────────────────────── */}
          <div style={{ width: 280, padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: L_TEXT, fontFamily: L_FONT, fontSize: 13, letterSpacing: '4px', fontWeight: 900, textTransform: 'uppercase' }}>
                {container.name.toUpperCase()}
              </div>
              <div style={{ color: TEXT_DIM, fontFamily: L_FONT, fontSize: 9, letterSpacing: '2px', marginTop: 5 }}>
                {!allRevealed
                  ? 'SEARCHING\u2026'
                  : visibleLoot.length === 0
                    ? 'NOTHING REMAINS'
                    : `${itemsFound} ITEM${itemsFound !== 1 ? 'S' : ''} FOUND`
                }
              </div>
            </div>

            {visibleLoot.length === 0 && allRevealed ? (
              <div style={{ color: TEXT_DIM, fontFamily: L_FONT, fontSize: 10, paddingTop: 12 }}>
                — EMPTY —
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {visibleLoot.map(({ item, index }) => {
                  const isRevealed = index < revealed;
                  return (
                    <LootSlot
                      key={index}
                      item={item}
                      revealed={isRevealed}
                      faded={drag?.lootIndex === index}
                      onMouseDown={isRevealed ? (e) => {
                        e.preventDefault();
                        setTooltip(null);
                        setDrag({ item, lootIndex: index, x: e.clientX, y: e.clientY });
                      } : undefined}
                      onMouseEnter={() => !drag && isRevealed && setTooltip(item)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* ── DIVIDER ───────────────────────────────────────────────────── */}
          <div style={{ width: 1, background: L_BORDER, alignSelf: 'stretch' }} />

          {/* ── RIGHT — Satchel (matches InventoryUI) ─────────────────────── */}
          <div style={{ padding: '24px 14px 20px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 10, paddingBottom: 8,
              borderBottom: `1px solid rgba(58,32,16,0.18)`,
              width: gridWidth,
            }}>
              <span style={{ color: L_TEXT, fontFamily: L_FONT, fontSize: 11, letterSpacing: '3px' }}>
                SATCHEL
              </span>
              <span style={{ color: TEXT_DIM, fontFamily: L_FONT, fontSize: 8, letterSpacing: '2px' }}>
                {countItems(invGrid)} item{countItems(invGrid) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Grid — inset pocket area matching InventoryUI */}
            <div style={{
              background: BG_GRID,
              padding: 3,
              boxShadow: 'inset 0 1px 4px rgba(58,32,16,0.12)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${INV_COLS}, ${SLOT_SIZE}px)`,
                gridTemplateRows: `repeat(5, ${SLOT_SIZE}px)`,
                gap: GAP,
                width: gridWidth,
              }}>
                {invGrid.map((slot, i) => (
                  <SatchelSlot
                    key={i}
                    slot={slot}
                    index={i}
                    isDragOver={!!drag && dragOver}
                    onMouseEnter={() => {
                      if (drag) setDragOver(true);
                      else if (slot && slot.__ref === undefined) setTooltip(slot);
                    }}
                    onMouseLeave={() => {
                      setDragOver(false);
                      setTooltip(null);
                    }}
                    onMouseUp={(e) => { e.stopPropagation(); dropIntoSlot(); }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── CLOSE BUTTON ─────────────────────────────────────────────── */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none',
              color: TEXT_DIM, fontFamily: L_FONT, fontSize: 16,
              cursor: 'pointer', padding: '4px 8px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = L_ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = TEXT_DIM}
          >✕</button>

          {/* ── TOOLTIP ──────────────────────────────────────────────────── */}
          {tooltip && !drag && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(214,202,176,0.97)',
              borderTop: `1px solid ${L_BORDER}`,
              padding: '10px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <span style={{ color: L_TEXT, fontSize: 10, letterSpacing: '2px', fontFamily: L_FONT, fontWeight: 900 }}>
                  {tooltip.name.toUpperCase()}
                </span>
                {tooltip.origin === 'stolen' && (
                  <span style={{ color: STOLEN_RED, fontFamily: L_FONT, fontSize: 7, letterSpacing: '1.5px', border: `1px solid ${STOLEN_RED}`, padding: '1px 4px' }}>
                    STOLEN
                  </span>
                )}
                {tooltip.origin === 'purchased' && (
                  <span style={{ color: PURCHASED_GRN, fontFamily: L_FONT, fontSize: 7, letterSpacing: '1.5px', border: `1px solid ${PURCHASED_GRN}`, padding: '1px 4px' }}>
                    PURCHASED
                  </span>
                )}
              </div>
              {tooltip.description && (
                <div style={{ fontFamily: L_FONT_SER, fontSize: 11, color: 'rgba(58,32,16,0.65)', lineHeight: 1.6 }}>
                  {tooltip.description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── DRAG GHOST — sized to item's actual footprint ──────────────── */}
        {drag && (
          <div style={{
            position: 'fixed',
            left: drag.x - ghostW / 2,
            top:  drag.y - ghostH / 2,
            width: ghostW, height: ghostH,
            pointerEvents: 'none', zIndex: 10001,
            opacity: 0.85, transform: 'scale(1.06)',
          }}>
            <div style={{
              width: '100%', height: '100%',
              border: `1px solid ${L_ACCENT}`,
              background: L_BG_DARK,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
              <span style={{ color: L_ACCENT, fontSize: ghostIcon, lineHeight: 1 }}>✦</span>
              <span style={{ color: TEXT_MID, fontSize: 7, fontFamily: L_FONT, textAlign: 'center', maxWidth: ghostW - 8 }}>
                {drag.item.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
