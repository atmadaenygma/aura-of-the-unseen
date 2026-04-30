import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const INV_COLS    = 4;
const INV_ROWS    = 5;
const TOTAL_SLOTS = INV_COLS * INV_ROWS;
const SLOT_SIZE   = 72;

// ── Action popover ─────────────────────────────────────────────────────────────
const ActionPopover = ({ item, onDrop, onUse, onInspect, onGive, onEnter, onLeave }) => (
  <div
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    style={{
      position: 'absolute',
      bottom: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      background: 'rgba(8,6,3,0.99)',
      border: '1px solid rgba(212,175,55,0.25)',
      borderRadius: 3,
      padding: '10px 12px',
      width: 180,
      boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
      pointerEvents: 'all',
    }}
  >
    {/* Item info */}
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: 9, letterSpacing: '2px', marginBottom: 4 }}>
        {item.name.toUpperCase()}
      </div>
      {item.description && (
        <div style={{ color: '#444', fontFamily: 'serif', fontSize: 10, lineHeight: 1.5 }}>
          {item.description}
        </div>
      )}
    </div>

    {/* Divider */}
    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

    {/* Action buttons */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {[
        { label: 'DROP',    fn: onDrop,    color: '#cc4444' },
        { label: 'USE',     fn: onUse,     color: '#888888' },
        { label: 'INSPECT', fn: onInspect, color: '#888888' },
        { label: 'GIVE',    fn: onGive,    color: '#d4af37' },
      ].map(({ label, fn, color }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); fn(); }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${color === '#888888' ? 'rgba(255,255,255,0.08)' : `rgba(${color === '#d4af37' ? '212,175,55' : '204,68,68'},0.3)`}`,
            color,
            fontFamily: 'monospace', fontSize: 9,
            padding: '4px 8px', borderRadius: 2,
            cursor: 'pointer', letterSpacing: '1px',
            transition: 'all 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

// ── Inspect modal ──────────────────────────────────────────────────────────────
const InspectModal = ({ item, onClose }) => createPortal(
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 10100,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: 'rgba(8,6,3,0.99)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 4, padding: '32px 36px',
        maxWidth: 360, textAlign: 'center',
        boxShadow: '0 0 60px rgba(0,0,0,0.9)',
      }}
    >
      <div style={{
        width: 80, height: 80, margin: '0 auto 20px',
        background: 'rgba(212,175,55,0.08)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.image
          ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          : <span style={{ color: '#d4af37', fontSize: 32 }}>✦</span>
        }
      </div>
      <div style={{ color: '#d4af37', fontFamily: 'serif', fontSize: 15, letterSpacing: '3px', marginBottom: 12 }}>
        {item.name.toUpperCase()}
      </div>
      <div style={{ color: '#666', fontFamily: 'serif', fontSize: 12, lineHeight: 1.7 }}>
        {item.description || 'Nothing remarkable about it.'}
      </div>
      <div style={{ marginTop: 20, color: '#333', fontFamily: 'monospace', fontSize: 9, letterSpacing: '2px' }}>
        CLICK TO CLOSE
      </div>
    </div>
  </div>,
  document.body
);

// ── Single slot ────────────────────────────────────────────────────────────────
const Slot = ({
  item, faded, isDropTarget,
  onMouseDown, onMouseUp,
  showPopover, onSlotEnter, onSlotLeave,
  onPopoverEnter, onPopoverLeave,
  onDrop, onUse, onInspect, onGive,
}) => (
  <div
    style={{ position: 'relative', width: SLOT_SIZE, height: SLOT_SIZE, flexShrink: 0 }}
    onMouseEnter={onSlotEnter}
    onMouseLeave={onSlotLeave}
  >
    <div
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        width: '100%', height: '100%',
        border: `1px solid ${isDropTarget ? '#d4af37' : item ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 3,
        background: isDropTarget
          ? 'rgba(212,175,55,0.08)'
          : item ? 'rgba(20,14,8,0.95)' : 'rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        cursor: item ? 'grab' : 'default',
        opacity: faded ? 0.2 : 1,
        transition: 'border-color 0.15s, background 0.15s, opacity 0.2s',
        userSelect: 'none', boxSizing: 'border-box',
      }}
    >
      {item && (<>
        <div style={{
          width: 38, height: 38,
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {item.image
            ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
            : <span style={{ color: '#d4af37', fontSize: 16 }}>✦</span>
          }
        </div>
        <span style={{
          color: '#888', fontSize: 7, fontFamily: 'monospace',
          textAlign: 'center', letterSpacing: '0.4px', lineHeight: 1.3,
          maxWidth: SLOT_SIZE - 8, overflow: 'hidden',
        }}>
          {item.name}
        </span>
      </>)}
    </div>

    {showPopover && item && (
      <ActionPopover
        item={item}
        onEnter={onPopoverEnter}
        onLeave={onPopoverLeave}
        onDrop={onDrop}
        onUse={onUse}
        onInspect={onInspect}
        onGive={onGive}
      />
    )}
  </div>
);

// ── InventoryUI ────────────────────────────────────────────────────────────────
export const InventoryUI = ({ gameState, setGameState, onClose }) => {
  const inventory = gameState.inventory || [];

  const [drag,          setDrag]          = useState(null);
  const [dropTarget,    setDropTarget]    = useState(null);
  const [hoveredSlot,   setHoveredSlot]   = useState(null);
  const [inspectItem,   setInspectItem]   = useState(null);
  const hoverTimer      = useRef(null);

  // Esc or [I] closes (unless inspect modal is open)
  useEffect(() => {
    const fn = (e) => {
      if (inspectItem) return; // let InspectModal handle it
      if (e.key === 'Escape' || e.key.toLowerCase() === 'i') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, inspectItem]);

  // Global mouse tracking during drag
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

  const showPopover = (i) => {
    clearTimeout(hoverTimer.current);
    if (!drag) setHoveredSlot(i);
  };
  const hidePopover = () => {
    hoverTimer.current = setTimeout(() => setHoveredSlot(null), 180);
  };
  const keepPopover = () => clearTimeout(hoverTimer.current);

  // Move item between slots
  const dropIntoSlot = (toIndex) => {
    if (!drag) return;
    if (drag.fromIndex === toIndex) { setDrag(null); setDropTarget(null); return; }
    const newInv = Array.from({ length: TOTAL_SLOTS }, (_, i) => inventory[i] ?? null);
    [newInv[drag.fromIndex], newInv[toIndex]] = [newInv[toIndex], newInv[drag.fromIndex]];
    setGameState(p => ({ ...p, inventory: newInv }));
    setDrag(null); setDropTarget(null);
  };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const dropItem = (slotIndex) => {
    const newInv = Array.from({ length: TOTAL_SLOTS }, (_, i) => inventory[i] ?? null);
    newInv[slotIndex] = null;
    setGameState(p => ({ ...p, inventory: newInv }));
    setHoveredSlot(null);
  };

  const giveItem = (item) => {
    setGameState(p => ({ ...p, pendingGive: item }));
    onClose();
  };

  const grid      = Array.from({ length: TOTAL_SLOTS }, (_, i) => inventory[i] ?? null);
  const itemCount = grid.filter(Boolean).length;

  return createPortal(
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          background: 'rgba(8,6,3,0.99)',
          border: '1px solid rgba(212,175,55,0.18)',
          borderRadius: 4,
          padding: '24px 24px 24px',
          boxShadow: '0 0 80px rgba(0,0,0,0.9)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ color: '#d4af37', fontFamily: 'serif', fontSize: 13, letterSpacing: '4px' }}>
              SATCHEL
            </div>
            <div style={{ color: '#333', fontFamily: 'monospace', fontSize: 9, letterSpacing: '2px', marginTop: 5 }}>
              {itemCount} / {TOTAL_SLOTS} CARRIED
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            width: INV_COLS * (SLOT_SIZE + 8) - 8,
            overflow: 'visible',
          }}>
            {grid.map((item, i) => (
              <Slot
                key={i}
                item={item}
                faded={drag?.fromIndex === i}
                isDropTarget={!!drag && dropTarget === i && drag.fromIndex !== i}
                showPopover={hoveredSlot === i && !drag}
                onSlotEnter={() => showPopover(i)}
                onSlotLeave={hidePopover}
                onPopoverEnter={keepPopover}
                onPopoverLeave={hidePopover}
                onMouseDown={item ? (e) => {
                  e.preventDefault();
                  setHoveredSlot(null);
                  setDrag({ item, fromIndex: i, x: e.clientX, y: e.clientY });
                } : undefined}
                onMouseUp={(e) => { e.stopPropagation(); dropIntoSlot(i); }}
                onMouseEnterSlot={() => { if (drag) setDropTarget(i); }}
                onMouseLeaveSlot={() => setDropTarget(null)}
                onDrop={() => dropItem(i)}
                onUse={() => { /* TODO: use item effects */ }}
                onInspect={() => { setHoveredSlot(null); setInspectItem(item); }}
                onGive={() => giveItem(item)}
              />
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none',
              color: '#333', fontFamily: 'monospace', fontSize: 16,
              cursor: 'pointer', padding: '4px 8px', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >✕</button>
        </div>

        {/* Floating drag ghost */}
        {drag && (
          <div style={{
            position: 'fixed',
            left: drag.x - 36, top: drag.y - 36,
            pointerEvents: 'none', zIndex: 10001,
            opacity: 0.8, transform: 'scale(1.05)',
          }}>
            <div style={{
              width: SLOT_SIZE, height: SLOT_SIZE,
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: 3, background: 'rgba(20,14,8,0.95)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <span style={{ color: '#d4af37', fontSize: 16 }}>✦</span>
              <span style={{ color: '#888', fontSize: 7, fontFamily: 'monospace' }}>{drag.item.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Inspect modal — rendered outside the backdrop */}
      {inspectItem && (
        <InspectModal item={inspectItem} onClose={() => setInspectItem(null)} />
      )}
    </>,
    document.body
  );
};
