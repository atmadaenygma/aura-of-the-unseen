# Aura of the Unseen — Claude Code Instructions

## Colour Scheme — HARD RULE

**NEVER introduce a colour literal (hex or rgba) that is not already defined in `src/constants/palette.js`.**

This is an absolute constraint, not a guideline. Violating it silently corrupts the game's visual identity.

### Correct workflow
1. Check `src/constants/palette.js` first — if the colour you need is there, use the named export.
2. If no existing constant fits, **add it to `palette.js` first** with a descriptive name and comment, then use it.
3. Never write a raw `#rrggbb` or `rgba(...)` value inline in a component — only named constants.

### Exceptions
- **Debug overlay** (`DebugOverlay.jsx`) — uses intentionally distinct colours for dev readability. These are exempt.
- **Console log decorations** (`color: '#d4af37'` in template strings) — exempt.
- **Drop-shadow and text-shadow black** (`rgba(0,0,0,N)`) — overlay/shadow blacks defined under `OVERLAY_*` and `MENU_*` in palette.js are the only permitted black rgba values.

---

## Core Palette Reference

All values below are exported from `src/constants/palette.js`.

| Export name | Value | Role |
|---|---|---|
| `BG` | `#d6cab0` | Primary panel background |
| `BG_DARK` | `#c9bca0` | Nested panels, popovers |
| `BG_INSET` | `#c0b095` | Image wells, deepest inset |
| `BG_GRID` | `rgba(58,32,16,0.06)` | Inventory/grid subtle tint |
| `BG_SLOT` | `rgba(58,32,16,0.07)` | Empty inventory slot |
| `BG_FILLED` | `rgba(58,32,16,0.13)` | Filled inventory slot |
| `TEXT` | `#3a2010` | Primary readable text |
| `TEXT_MID` | `rgba(58,32,16,0.65)` | Secondary text |
| `TEXT_DIM` | `rgba(58,32,16,0.45)` | Hints, labels, placeholders |
| `TEXT_GHOST` | `rgba(58,32,16,0.25)` | Disabled text |
| `BORDER` | `rgba(58,32,16,0.18)` | Subtle dividers |
| `BORDER_MED` | `rgba(58,32,16,0.30)` | Panel edges |
| `BORDER_LIT` | `rgba(58,32,16,0.35)` | Filled-slot border |
| `ACCENT` | `#cb7866` | Hover, active, accent borders |
| `QUEST_GOLD` | `#b8952a` | Quest item badge |
| `GOLD` | `#b89a3a` | XP bars, level labels |
| `STOLEN_RED` | `#8b2e1a` | Stolen items |
| `PURCHASED_GRN` | `#2e6e3a` | Purchased items |
| `STATUS_GOOD` | `#2a7a5a` | Positive / healthy |
| `STATUS_OK` | `#4a8a6a` | Mild positive |
| `STATUS_WARN` | `#b08030` | Caution / amber |
| `STATUS_DANGER` | `#c0392b` | Danger / failure |
| `STATS_BAR` | `#89ceaf` | HUD green stats bar |
| `FACET_COL` | `#3a7a6a` | Dialogue introspection text |
| `FACET_BG` | `rgba(42,90,80,0.07)` | Introspection panel wash |
| `SOURCE_EVIDENCE` | `#2a7a5a` | Journal — evidence (green) |
| `SOURCE_SILAS` | `#b8952a` | Journal — Silas (gold) |
| `SOURCE_OVERSEER` | `#8b2e1a` | Journal — Overseer (red) |
| `FONT` | `Courier New, monospace` | UI labels, keys |
| `FONT_SER` | `Georgia, serif` | Flavour text, descriptions |
| `FONT_TITLE` | `'NexaRustSlab', Impact, ...` | Main menu title |
| `FONT_MENU` | `'NexaRustSans', 'Arial Black', ...` | Main menu buttons |
| `HUD bar height` | `48px` | Fixed — match `HUD_HEIGHT` |

Full list including beige opacity variants and menu overlays: see `src/constants/palette.js`.

---

## Other Rules

- **Never** rename, delete, or adjust opacity on an existing constant without an explicit user request.
- **Never** add a new font family without adding it to `palette.js` under `FONT_*`.
- Components may define local aliases (`const BG = PALETTE.BG`) for brevity, but the value must always trace back to `palette.js`.
