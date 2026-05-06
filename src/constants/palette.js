/**
 * AURA OF THE UNSEEN — CANONICAL COLOUR PALETTE
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL COLOURS IN THE GAME.
 *
 * RULE: No hex or rgba colour literal may appear anywhere in the codebase
 * unless it is defined here first and explicitly named.
 *
 * TO ADD A COLOUR: define it in this file with a descriptive name and comment
 * explaining its intended use. Do not introduce new colours in component files.
 *
 * DEBUG OVERLAY COLOURS are exempt — they are intentionally distinct, only
 * rendered in dev mode, and should not bleed into the UI palette.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Panel / surface ────────────────────────────────────────────────────────────
export const BG          = '#d6cab0';   // warm beige — primary panel background
export const BG_DARK     = '#c9bca0';   // slightly darker variant — nested panels, popovers
export const BG_INSET    = '#c0b095';   // deepest inset — image wells, drag targets
export const BG_GRID     = 'rgba(58,32,16,0.06)';  // subtle tint over BG — inventory/grid areas
export const BG_SLOT     = 'rgba(58,32,16,0.07)';  // empty inventory slot
export const BG_FILLED   = 'rgba(58,32,16,0.13)';  // filled inventory slot

// ── Text ───────────────────────────────────────────────────────────────────────
export const TEXT        = '#3a2010';              // primary readable text
export const TEXT_MID    = 'rgba(58,32,16,0.65)'; // secondary / supporting text
export const TEXT_DIM    = 'rgba(58,32,16,0.45)'; // placeholder, labels, hints
export const TEXT_GHOST  = 'rgba(58,32,16,0.25)'; // disabled / muted text

// ── Borders ────────────────────────────────────────────────────────────────────
export const BORDER      = 'rgba(58,32,16,0.18)'; // subtle dividers
export const BORDER_MED  = 'rgba(58,32,16,0.30)'; // panel edges, popovers
export const BORDER_LIT  = 'rgba(58,32,16,0.35)'; // filled-slot border
export const BORDER_DARK = 'rgba(58,32,16,0.50)'; // strong borders

// ── Accent / interactive ───────────────────────────────────────────────────────
export const ACCENT      = '#cb7866';   // terracotta — hover, active, accent borders
export const ACCENT_DIM  = 'rgba(203,120,102,0.15)'; // faint accent background tint
export const ACCENT_MID  = 'rgba(203,120,102,0.45)'; // inner double-border, faded accent

// ── Quest / item origin ────────────────────────────────────────────────────────
export const QUEST_GOLD      = '#b8952a'; // quest item badge, gold highlight
export const GOLD            = '#b89a3a'; // XP bars, level labels (StatusPanel/HUD)
export const GOLD_CONSOLE    = '#d4af37'; // console log decorations only — not for UI
export const STOLEN_RED      = '#8b2e1a'; // items taken without permission
export const PURCHASED_GRN   = '#2e6e3a'; // items legitimately bought

// ── Status / state indicators ──────────────────────────────────────────────────
export const STATUS_GOOD     = '#2a7a5a'; // positive, healthy, trusted — full green
export const STATUS_OK       = '#4a8a6a'; // cordial, mild positive
export const STATUS_PRESENT  = '#4a6a8a'; // neutral-watchful (mood: PRESENT)
export const STATUS_WARN     = '#b08030'; // caution — amber, unsettled, suspected
export const STATUS_NOTICE   = '#7a6a3a'; // low-level awareness
export const STATUS_DANGER   = '#c0392b'; // danger, failure, critical
export const STATUS_MORPH    = '#2a5a3a'; // morph stability at healthy level
export const STATUS_GIVE     = '#7a5a2a'; // GIVE memory type label (journal)

// ── Stats bar (HUD green strip) ────────────────────────────────────────────────
export const STATS_BAR       = '#89ceaf'; // the green HUD stats bar background
export const STATS_GIVEMODE  = '#658963'; // darker green — active give mode indicator
export const STATS_CONNECTED = '#5a9a5a'; // gamepad connected dot

// ── Dice check ────────────────────────────────────────────────────────────────
export const DICE_SUCCESS    = '#006600'; // DiceCheck success result
export const DICE_FAIL       = '#880000'; // DiceCheck failure result

// ── Dialogue introspection / neurological facets ───────────────────────────────
// These are intentionally teal-adjacent to signal Maya's perception layer.
// They must remain distinct from the main UI palette but live here for control.
export const FACET_COL   = '#3a7a6a'; // introspection text and label (DialogueSystem)
export const FACET_BG    = 'rgba(42,90,80,0.07)'; // introspection panel wash

// ── Facet consciousness colours (facets.js — cognitive ability icons) ──────────
export const FACET_TEAL   = '#008080'; // genetic memory
export const FACET_PURPLE = '#7a3a8a'; // nerve sense
export const FACET_OLIVE  = '#5a6a2a'; // social crypsis
export const FACET_BLUE   = '#2a5a7a'; // mimicry

// ── Journal — rival truth source colours (explicitly requested) ───────────────
export const SOURCE_OBSERVATION = 'rgba(58,32,16,0.5)'; // Maya's own observation
export const SOURCE_EVIDENCE    = '#2a7a5a'; // physical evidence / documentation (green)
export const SOURCE_SILAS       = '#b8952a'; // Silas's testimony (gold)
export const SOURCE_OVERSEER    = '#8b2e1a'; // The Overseer's account (dark red)

// ── Main menu overlays (dark, not used in game UI) ────────────────────────────
export const MENU_BG         = '#0a0a0a'; // menu canvas fallback background
export const MENU_BOX_BG     = 'rgba(10,8,6,0.72)'; // credit box background
export const OVERLAY_HEAVY   = 'rgba(0,0,0,0.88)';  // modal backdrops
export const OVERLAY_MED     = 'rgba(0,0,0,0.72)';
export const OVERLAY_LIGHT   = 'rgba(0,0,0,0.55)';
export const OVERLAY_FAINT   = 'rgba(0,0,0,0.25)';

// ── Typography ────────────────────────────────────────────────────────────────
export const FONT     = 'Courier New, monospace';
export const FONT_SER = 'Georgia, serif';
export const FONT_TITLE = "'NexaRustSlab', Impact, 'Arial Black', sans-serif";
export const FONT_MENU  = "'NexaRustSans', 'Arial Black', sans-serif";

// ── Convenience: beige at various opacities (derived from BG #d6cab0) ─────────
export const BG_75   = 'rgba(214,202,176,0.75)';
export const BG_70   = 'rgba(214,202,176,0.70)';
export const BG_65   = 'rgba(214,202,176,0.65)';
export const BG_50   = 'rgba(214,202,176,0.50)';
export const BG_45   = 'rgba(214,202,176,0.45)';
export const BG_35   = 'rgba(214,202,176,0.35)';
export const BG_30   = 'rgba(214,202,176,0.30)';
export const BG_20   = 'rgba(214,202,176,0.20)';
