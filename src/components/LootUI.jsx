import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTextScale } from '../context/TextScaleContext';

const REVEAL_DELAY_MS = 1600; // ms between each item appearing
const MAX_INVENTORY   = 20;   // total satchel slots
const INV_COLS        = 4;
const INV_ROWS        = 5;

// ── Palette (matches HUD) ─────────────────────────────────────────────────────
const L_BG      = '#d6cab0';
const L_ACCENT  = '#cb7866';
const L_TEXT    = '#3a2010';
const L_BORDER  = 'rgba(58,32,16,0.2)';
const L_FONT    = 'Courier New, monospace';

// ── Single item slot ──────────────────────────────────────────────────────────
const Slot = ({ item, revealed, faded, isDropTarget, onMouseDown, onMouseEnter, onMouseLeave, onMouseUp, size = 72 }) => {
  const empty   = !item;
  const unknown = item && !revealed;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      style={{
        width: size, height: size,
        border: `1px solid ${isDropTarget ? L_ACCENT : empty ? 'rgba(58,32,16,0.12)' : L_BORDER}`,
        borderRadius: 3,
        background: isDropTarget
          ? 'rgba(203,120,102,0.15)'
          : empty
            ? 'rgba(58,32,16,0.05)'
            : unknown
              ? 'rgba(58,32,16,0.12)'
              : 'rgba(58,32,16,0.08)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        cursor: item && revealed ? 'grab' : 'default',
        opacity: faded ? 0.25 : 1,
        transition: 'border-color 0.15s, background 0.15s, opacity 0.2s',
        userSelect: 'none',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {unknown && (
        <span style={{
          color: 'rgba(58,32,16,0.3)', fontSize: 20, fontFamily: 'serif',
          animation: 'pulse 2s ease-in-out infinite',
        }}>?</span>
      )}
      {item && revealed && (<>
        <div style={{
          width: 38, height: 38,
          background: 'rgba(58,32,16,0.06)',
          border: `1px solid ${L_BORDER}`,
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {item.image
            ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
            : <span style={{ color: L_ACCENT, fontSize: 16 }}>✦</span>
          }
        </div>
        <span style={{
          color: 'rgba(58,32,16,0.55)', fontSize: 7, fontFamily: L_FONT,
          textAlign: 'center', letterSpacing: '0.4px', lineHeight: 1.3,
          maxWidth: size - 8, overflow: 'hidden',
        }}>
          {item.name}
        </span>
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

  const [revealed,    setRevealed]    = useState(0);
  const [drag,        setDrag]        = useState(null);   // { item, lootIndex, x, y }
  const [dropTarget,  setDropTarget]  = useState(null);   // inventory slot index
  const [tooltip,     setTooltip]     = useState(null);   // item being hovered

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
    const up   = () => { setDrag(null); setDropTarget(null); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',  up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',  up);
    };
  }, [!!drag]);

  // Drop item into an inventory slot
  const dropIntoSlot = (slotIndex) => {
    if (!drag) return;
    // Count only real items — inventory may be a sparse 20-slot array with nulls,
    // so checking .length would always equal MAX_INVENTORY and block every drop.
    if (inventory.filter(Boolean).length >= MAX_INVENTORY) return;
    // Slot already occupied — deny
    if (inventory[slotIndex] != null) return;

    const newInventory = [...inventory];
    // Fill to the slot with nulls if needed, then place
    while (newInventory.length <= slotIndex) newInventory.push(null);
    newInventory[slotIndex] = drag.item;

    const newTaken = [...(gameState.containers?.[container.id] || []), drag.lootIndex];

    setGameState(p => ({
      ...p,
      inventory:  newInventory,
      containers: { ...(p.containers || {}), [container.id]: newTaken },
    }));
    setDrag(null);
    setDropTarget(null);
  };

  // Build inventory grid (always INV_COLS × INV_ROWS)
  const totalSlots  = INV_COLS * INV_ROWS;
  const invGrid     = Array.from({ length: totalSlots }, (_, i) => inventory[i] ?? null);

  // Visible loot (not yet taken)
  const visibleLoot = loot
    .map((item, i) => ({ item, index: i }))
    .filter(({ index }) => !takenSet.has(index));

  const allRevealed  = revealed >= loot.length;
  const itemsFound   = visibleLoot.filter(({ index }) => index < revealed).length;

  return createPortal(
    <>
      {/* Pulse keyframe — injected once */}
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
          borderRadius: 4,
          boxShadow: '0 8px 60px rgba(58,32,16,0.5)',
          overflow: 'hidden',
          zoom,
        }}>

          {/* ── LEFT PANEL — Container ──────────────────────────────────── */}
          <div style={{ width: 280, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: L_TEXT, fontFamily: L_FONT, fontSize: 13, letterSpacing: '4px', fontWeight: 900, textTransform: 'uppercase' }}>
                {container.name.toUpperCase()}
              </div>
              <div style={{ color: 'rgba(58,32,16,0.45)', fontFamily: L_FONT, fontSize: 9, letterSpacing: '2px', marginTop: 5 }}>
                {!allRevealed
                  ? 'SEARCHING\u2026'
                  : visibleLoot.length === 0
                    ? 'NOTHING REMAINS'
                    : `${itemsFound} ITEM${itemsFound !== 1 ? 'S' : ''} FOUND`
                }
              </div>
            </div>

            {/* Loot grid */}
            {visibleLoot.length === 0 && allRevealed ? (
              <div style={{ color: 'rgba(58,32,16,0.3)', fontFamily: L_FONT, fontSize: 10, paddingTop: 12 }}>
                — EMPTY —
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {visibleLoot.map(({ item, index }) => {
                  const isRevealed = index < revealed;
                  return (
                    <Slot
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

          {/* ── DIVIDER ──────────────────────────────────────────────────── */}
          <div style={{ width: 1, background: L_BORDER, alignSelf: 'stretch' }} />

          {/* ── RIGHT PANEL — Satchel ────────────────────────────────────── */}
          <div style={{ width: 280, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: L_TEXT, fontFamily: L_FONT, fontSize: 13, letterSpacing: '4px', fontWeight: 900, textTransform: 'uppercase' }}>
                SATCHEL
              </div>
              <div style={{ color: 'rgba(58,32,16,0.45)', fontFamily: L_FONT, fontSize: 9, letterSpacing: '2px', marginTop: 5 }}>
                {inventory.filter(Boolean).length} / {MAX_INVENTORY} CARRIED
              </div>
            </div>

            {/* Inventory grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {invGrid.map((item, i) => (
                <Slot
                  key={i}
                  item={item}
                  revealed={true}
                  isDropTarget={!!drag && dropTarget === i && !item}
                  onMouseEnter={() => { if (drag) setDropTarget(i); else if (item) setTooltip(item); }}
                  onMouseLeave={() => { setDropTarget(null); setTooltip(null); }}
                  onMouseUp={(e) => { e.stopPropagation(); dropIntoSlot(i); }}
                />
              ))}
            </div>
          </div>

          {/* ── CLOSE BUTTON ─────────────────────────────────────────────── */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none',
              color: 'rgba(58,32,16,0.4)', fontFamily: L_FONT, fontSize: 16,
              cursor: 'pointer', padding: '4px 8px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = L_ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(58,32,16,0.4)'}
          >✕</button>

          {/* ── TOOLTIP ──────────────────────────────────────────────────── */}
          {tooltip && !drag && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(214,202,176,0.97)',
              borderTop: `1px solid ${L_BORDER}`,
              padding: '10px 20px',
              fontFamily: 'serif', fontSize: 11,
              color: L_TEXT, letterSpacing: '0.5px', lineHeight: 1.6,
            }}>
              <span style={{ color: L_TEXT, fontSize: 10, letterSpacing: '2px', fontFamily: L_FONT, fontWeight: 900 }}>
                {tooltip.name.toUpperCase()}
              </span>
              {tooltip.description && (
                <div style={{ marginTop: 3, color: 'rgba(58,32,16,0.65)' }}>{tooltip.description}</div>
              )}
            </div>
          )}
        </div>

        {/* ── FLOATING DRAG GHOST ────────────────────────────────────────── */}
        {drag && (
          <div style={{
            position: 'fixed',
            left: drag.x - 36, top: drag.y - 36,
            pointerEvents: 'none', zIndex: 10001,
            opacity: 0.8, transform: 'scale(1.05)',
          }}>
            <Slot item={drag.item} revealed={true} />
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
