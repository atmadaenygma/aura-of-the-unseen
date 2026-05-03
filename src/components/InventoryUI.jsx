import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTextScale } from '../context/TextScaleContext';

const INV_COLS    = 4;
const INV_ROWS    = 5;
const TOTAL_SLOTS = INV_COLS * INV_ROWS;
const SLOT_SIZE   = 68;
const GAP         = 6;
const HUD_HEIGHT  = 48;

const BG          = '#d6cab0';
const BG_DARK     = '#c9bca0';
const BG_SLOT     = 'rgba(58,32,16,0.07)';
const BG_FILLED   = 'rgba(58,32,16,0.13)';
const ACCENT      = '#cb7866';
const TEXT        = '#3a2010';
const TEXT_DIM    = 'rgba(58,32,16,0.45)';
const TEXT_MID    = 'rgba(58,32,16,0.65)';
const BORDER      = 'rgba(58,32,16,0.18)';
const BORDER_MED  = 'rgba(58,32,16,0.3)';
const FONT        = 'Courier New, monospace';
const FONT_SER    = 'Georgia, serif';

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
      background: BG_DARK,
      border: `1px solid ${BORDER_MED}`,
      padding: '10px 12px',
      width: 170,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
      pointerEvents: 'all',
    }}
  >
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: TEXT, fontFamily: FONT, fontSize: 9, letterSpacing: '2px', marginBottom: 4 }}>
        {item.name.toUpperCase()}
      </div>
      {item.description && (
        <div style={{ color: TEXT_MID, fontFamily: FONT_SER, fontSize: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
          {item.description}
        </div>
      )}
    </div>

    <div style={{ height: 1, background: BORDER, margin: '8px 0' }} />

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {[
        { label: 'DROP',    fn: onDrop,    color: '#c0392b' },
        { label: 'USE',     fn: onUse,     color: TEXT_MID  },
        { label: 'INSPECT', fn: onInspect, color: TEXT_MID  },
        { label: 'GIVE',    fn: onGive,    color: ACCENT    },
      ].map(({ label, fn, color }) => (
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

// ── Inspect modal ──────────────────────────────────────────────────────────────
const InspectModal = ({ item, onClose }) => createPortal(
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 10100,
      background: 'rgba(0,0,0,0.85)',
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
          : <span style={{ color: ACCENT, fontSize: 32 }}>✦</span>
        }
      </div>
      <div style={{ color: TEXT, fontFamily: FONT, fontSize: 13, letterSpacing: '3px', marginBottom: 12 }}>
        {item.name.toUpperCase()}
      </div>
      <div style={{ color: TEXT_MID, fontFamily: FONT_SER, fontSize: 13, lineHeight: 1.7, fontStyle: 'italic' }}>
        {item.description || 'Nothing remarkable about it.'}
      </div>
      <div style={{ marginTop: 20, color: TEXT_DIM, fontFamily: FONT, fontSize: 9, letterSpacing: '2px' }}>
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
        border: `1px solid ${isDropTarget ? ACCENT : item ? BORDER_MED : BORDER}`,
        background: isDropTarget
          ? `${ACCENT}18`
          : item ? BG_FILLED : BG_SLOT,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        cursor: item ? 'grab' : 'default',
        opacity: faded ? 0.25 : 1,
        transition: 'border-color 0.15s, background 0.15s, opacity 0.2s',
        userSelect: 'none', boxSizing: 'border-box',
      }}
    >
      {item && (<>
        <div style={{
          width: 36, height: 36,
          background: `${ACCENT}18`,
          border: `1px solid ${ACCENT}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {item.image
            ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
            : <span style={{ color: ACCENT, fontSize: 15 }}>✦</span>
          }
        </div>
        <span style={{
          color: TEXT_MID, fontSize: 7, fontFamily: FONT,
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

// ── Satchel Popover ────────────────────────────────────────────────────────────
export const InventoryUI = ({ gameState, setGameState, onClose }) => {
  const inventory = gameState.inventory || [];

  const [drag,        setDrag]        = useState(null);
  const [dropTarget,  setDropTarget]  = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [inspectItem, setInspectItem] = useState(null);
  const hoverTimer = useRef(null);

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

  const showPopoverFor = (i) => { clearTimeout(hoverTimer.current); if (!drag) setHoveredSlot(i); };
  const hidePopover    = ()  => { hoverTimer.current = setTimeout(() => setHoveredSlot(null), 180); };
  const keepPopover    = ()  => clearTimeout(hoverTimer.current);

  const dropIntoSlot = (toIndex) => {
    if (!drag) return;
    if (drag.fromIndex === toIndex) { setDrag(null); setDropTarget(null); return; }
    const newInv = Array.from({ length: TOTAL_SLOTS }, (_, i) => inventory[i] ?? null);
    [newInv[drag.fromIndex], newInv[toIndex]] = [newInv[toIndex], newInv[drag.fromIndex]];
    setGameState(p => ({ ...p, inventory: newInv }));
    setDrag(null); setDropTarget(null);
  };

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

  const zoom      = useTextScale();
  const grid      = Array.from({ length: TOTAL_SLOTS }, (_, i) => inventory[i] ?? null);
  const itemCount = grid.filter(Boolean).length;
  const gridWidth = INV_COLS * (SLOT_SIZE + GAP) - GAP;

  return (
    <>
      <div style={{
        background: BG,
        borderTop: `2px solid ${ACCENT}`,
        borderLeft: `1px solid ${BORDER_MED}`,
        borderRight: `1px solid ${BORDER_MED}`,
        boxShadow: '4px -8px 40px rgba(0,0,0,0.4)',
        padding: '18px 20px 20px',
        zoom,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 14, paddingBottom: 10,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <span style={{ color: TEXT, fontFamily: FONT, fontSize: 11, letterSpacing: '3px' }}>
            SATCHEL
          </span>
          <span style={{ color: TEXT_DIM, fontFamily: FONT, fontSize: 8, letterSpacing: '2px' }}>
            {itemCount} / {TOTAL_SLOTS}
          </span>
        </div>

        {/* Grid */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: GAP,
          width: gridWidth,
          overflow: 'visible',
        }}>
          {grid.map((item, i) => (
            <Slot
              key={i}
              item={item}
              faded={drag?.fromIndex === i}
              isDropTarget={!!drag && dropTarget === i && drag.fromIndex !== i}
              showPopover={hoveredSlot === i && !drag}
              onSlotEnter={() => { showPopoverFor(i); if (drag) setDropTarget(i); }}
              onSlotLeave={() => { hidePopover(); setDropTarget(null); }}
              onPopoverEnter={keepPopover}
              onPopoverLeave={hidePopover}
              onMouseDown={item ? (e) => {
                e.preventDefault();
                setHoveredSlot(null);
                setDrag({ item, fromIndex: i, x: e.clientX, y: e.clientY });
              } : undefined}
              onMouseUp={(e) => { e.stopPropagation(); dropIntoSlot(i); }}
              onDrop={() => dropItem(i)}
              onUse={() => { /* TODO */ }}
              onInspect={() => { setHoveredSlot(null); setInspectItem(item); }}
              onGive={() => giveItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Drag ghost — needs to float above everything */}
      {drag && createPortal(
        <div style={{
          position: 'fixed',
          left: drag.x - SLOT_SIZE / 2, top: drag.y - SLOT_SIZE / 2,
          pointerEvents: 'none', zIndex: 10001,
          opacity: 0.85, transform: 'scale(1.06)',
        }}>
          <div style={{
            width: SLOT_SIZE, height: SLOT_SIZE,
            border: `1px solid ${ACCENT}`,
            background: BG_DARK,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ color: ACCENT, fontSize: 15 }}>✦</span>
            <span style={{ color: TEXT_MID, fontSize: 7, fontFamily: FONT }}>{drag.item.name}</span>
          </div>
        </div>,
        document.body
      )}

      {/* Inspect modal */}
      {inspectItem && (
        <InspectModal item={inspectItem} onClose={() => setInspectItem(null)} />
      )}
    </>
  );
};
