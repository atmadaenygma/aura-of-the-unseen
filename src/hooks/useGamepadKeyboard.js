import { useEffect } from 'react';

// ── Gamepad → keyboard/scroll bridge ──────────────────────────────────────────
// Enables full controller navigation of any standard HTML UI (buttons, sliders,
// selects, toggles) without requiring cursor mode.
//
// Controls when active:
//   D-pad Up / Left stick up     → focus previous element
//   D-pad Down / Left stick down → focus next element
//   D-pad Left                   → ArrowLeft on focused element (decreases slider)
//   D-pad Right                  → ArrowRight on focused element (increases slider)
//   A / Cross                    → click focused element
//   B / Circle                   → Escape
//   Right stick Y axis           → scroll nearest scrollable container
//
// Usage: call useGamepadKeyboard(true) in any component that has UI to navigate.
// Pass false (or omit) to disable without unmounting.

const FOCUSABLE = 'button:not([disabled]), input[type="range"], select, [tabindex]:not([tabindex="-1"])';

const getFocusable = () =>
  Array.from(document.querySelectorAll(FOCUSABLE)).filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

const findScrollable = (el) => {
  let node = el?.parentElement;
  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 2)
      return node;
    node = node.parentElement;
  }
  return null;
};

const fireKey = (el, key) => {
  if (!el) return;
  ['keydown', 'keyup'].forEach(type =>
    el.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }))
  );
};

export const useGamepadKeyboard = (active = true) => {
  useEffect(() => {
    if (!active) return;

    let frame;
    const prev    = {};
    let   scrollAccum = 0;

    const poll = () => {
      const pads = navigator.getGamepads?.() ?? [];
      let gp = null;
      for (let i = 0; i < pads.length; i++) {
        if (pads[i]?.mapping === 'standard') { gp = pads[i]; break; }
      }
      if (!gp) {
        for (let i = 0; i < pads.length; i++) { if (pads[i]) { gp = pads[i]; break; } }
      }

      if (gp) {
        const btn  = (i) => !!(gp.buttons[i]?.pressed) || (gp.buttons[i]?.value ?? 0) > 0.5;
        const just = (i) => btn(i) && !prev[i];

        const all     = getFocusable();
        const focused = document.activeElement;
        const idx     = all.indexOf(focused);

        // ── Focus navigation ──────────────────────────────────────────────
        const dUp   = just(12) || (gp.axes[1] < -0.5 && !(prev._ly < -0.5));
        const dDown = just(13) || (gp.axes[1] > 0.5  && !(prev._ly > 0.5));

        if (dUp) {
          if (idx > 0)           all[idx - 1].focus();
          else if (all.length)   all[all.length - 1].focus();
        }
        if (dDown) {
          if (idx < all.length - 1) all[idx + 1].focus();
          else if (all.length)      all[0].focus();
        }

        // ── Value adjustment (sliders, selects, toggles) ──────────────────
        if (just(14)) fireKey(focused, 'ArrowLeft');   // D-pad left
        if (just(15)) fireKey(focused, 'ArrowRight');  // D-pad right

        // ── Confirm / back ────────────────────────────────────────────────
        if (just(0))  focused?.click?.();              // A / Cross
        if (just(1))  fireKey(focused, 'Escape');      // B / Circle

        // ── Scroll (right stick Y, or left bumper/trigger fallback) ───────
        const ry = gp.axes.length > 3 ? gp.axes[3] : 0;
        if (Math.abs(ry) > 0.18) {
          scrollAccum += ry * 6;
          if (Math.abs(scrollAccum) >= 1) {
            const container = findScrollable(focused) ?? findScrollable(document.activeElement);
            if (container) container.scrollTop += scrollAccum;
            scrollAccum = 0;
          }
        } else {
          scrollAccum = 0;
        }

        // ── Store previous state ──────────────────────────────────────────
        gp.buttons.forEach((b, i) => { prev[i] = btn(i); });
        prev._ly = gp.axes[1];
      }

      frame = requestAnimationFrame(poll);
    };

    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [active]);
};
