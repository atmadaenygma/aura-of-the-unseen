# Creative Reference — Aura of the Unseen

Design canvas: **1920 × 1080 px**  
Text zoom range: **80 % – 140 %** (affects UI panels; portraits and world textures are unaffected)

---

## Mask Color System

The engine reads five PNG mask files per room. Each mask is the same pixel dimensions as the room texture (currently **1264 × 848 px**, ratio **79 : 53**). Colors must be painted as **pure primaries** (channel values exactly 0 or 255). The engine fuzzy-snaps any value > 220 → 255 and < 220 → 0 to forgive minor compression artifacts.

---

### `mask_logic.png` — Navigation & Collision  ✅ Active

Controls where Maya can walk, where she hides, and where room exits are.

| Color | Hex | RGB | Meaning |
|---|---|---|---|
| Black | `#000000` | (0, 0, 0) | **BLOCK** — wall, impassable furniture, chair legs |
| White | `#FFFFFF` | (255, 255, 255) | **WALK** — open floor, fully passable |
| Yellow | `#FFFF00` | (255, 255, 0) | **HIDE_ZONE** — under-furniture floor; passable, and Maya is hidden when crouching here |
| Blue | `#0000FF` | (0, 0, 255) | **EXIT** — room transition trigger |

---

### `mask_terrain.png` — Surface Properties  ✅ Active

Overlays WALK pixels to define footstep sounds and surface type. Black reinforces walls from mask_logic.

| Color | Hex | RGB | Surface ID | Footstep |
|---|---|---|---|---|
| Black | `#000000` | (0, 0, 0) | `obstacle` | none |
| White | `#FFFFFF` | (255, 255, 255) | `wood_floor` | wood |
| Red | `#FF0000` | (255, 0, 0) | `carpet` | soft |
| Green | `#00FF00` | (0, 255, 0) | `grass` | grass |
| Blue | `#0000FF` | (0, 0, 255) | `threshold` | stone |

---

### `mask_npcs.png` — NPC Spawn Points  ⚠️ Disabled

Paint one pixel at each NPC's foot position. Currently **disabled** — manifest `spawnX / spawnY` coordinates are authoritative instead. Listed here for when the system is re-enabled.

| Color | Hex | RGB | NPC |
|---|---|---|---|
| Green | `#00FF00` | (0, 255, 0) | Old Silas |
| Red | `#FF0000` | (255, 0, 0) | The Overseer |
| Yellow | `#FFFF00` | (255, 255, 0) | *(reserved — next NPC)* |

> Rule: paint **one pixel** per NPC at exact foot position. If a color appears more than once, the last pixel found wins.

---

### `mask_hiding.png` — Named Hiding Spots  ⚠️ Unused

Intended to register named hiding spots. Currently the HIDE_ZONE mechanism in mask_logic (yellow pixels) handles hiding automatically. Listed for future use.

| Color | Hex | RGB | Spot ID | Name |
|---|---|---|---|---|
| White | `#FFFFFF` | (255, 255, 255) | `under_bed` | Under the Bed |

---

### `mask_entities.png` — Entity Collision  ❌ Deprecated

No longer read by the engine. Entities are detected via manifest proximity hitboxes `(x, y, radius)` instead. Do not paint new content here.

---

### Fuzzy Snap Rule (all masks)

```
channel > 220  →  255
channel ≤ 220  →  0
```

Always paint with pure 0 / 255 values. Never use anti-aliasing or soft brushes on mask layers.

---

---

## Image Asset Specifications

---

### Portraits — `public/ui/portraits/`

Rendered height-controlled in the dialogue system. All portraits share the same source height (816 px currently). Recommended source height: **900 px**, width at natural aspect ratio.

| File | Aspect Ratio | Recommended Size | Current Size | Current KB | Notes |
|---|---|---|---|---|---|
| `protagonist_portrait.png` | **83 : 102** | 730 × 900 | 664 × 816 | 882 KB | Maya — width-controlled at 500 px |
| `silas_portrait.png` | **694 : 815** ≈ 17 : 20 | 768 × 900 | 694 × 815 | 664 KB | NPC — height-controlled at 780 px |
| `overseer_portrait.png` | **387 : 272** ≈ 10 : 7 | 1286 × 900 | 1161 × 816 | 1625 KB | NPC wide format — height-controlled at 780 px |
| `Angus_portrait.png` | **407 : 408** ≈ 1 : 1 | 900 × 900 | 814 × 816 | 984 KB | Nearly square |

> **Rule for new portrait art:** target **900 px tall** at the character's natural proportions. At zoom 1.4× Maya renders at ~700 px wide and NPCs at ~1090 px tall — 900 px provides adequate quality with ~15 % headroom.

---

### Facet / Consciousness Thought Banners — `public/ui/concious_thoughts/`

Displayed at **100 % of the dialogue box width** (450 px CSS; max ~630 px at zoom 1.4×).  
Current images are 3–5× oversize and account for **~90 MB** of assets that can shrink to under 5 MB.

#### Square ability icons (1 : 1)

| File | Aspect Ratio | Recommended Size | Current Size | Current KB | Projected KB |
|---|---|---|---|---|---|
| `charisma.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 8152 KB | ~300 KB |
| `composure.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 7027 KB | ~260 KB |
| `determination.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 8484 KB | ~310 KB |
| `intuition.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 7153 KB | ~260 KB |
| `knowledge.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 7078 KB | ~260 KB |
| `pain.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 7217 KB | ~265 KB |
| `perception.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 7562 KB | ~280 KB |
| `strength.png` | **1 : 1** | 700 × 700 | 2048 × 2048 | 7965 KB | ~295 KB |

> **Rule for new square facet art:** export at **700 × 700 px**, PNG with transparency.

#### Landscape ability banners (≈ 16 : 9)

| File | Aspect Ratio | Recommended Size | Current Size | Current KB | Projected KB |
|---|---|---|---|---|---|
| `genetic_memory.png` | **184 : 103** ≈ 16 : 9 | 700 × 392 | 2944 × 1648 | 6606 KB | ~220 KB |
| `mimicry.png` | **184 : 103** ≈ 16 : 9 | 700 × 392 | 2944 × 1648 | 8102 KB | ~270 KB |
| `nerve_sense.png` | **184 : 103** ≈ 16 : 9 | 700 × 392 | 2944 × 1648 | 9160 KB | ~300 KB |
| `social_crypsis.png` | **184 : 103** ≈ 16 : 9 | 700 × 392 | 2944 × 1648 | 7920 KB | ~265 KB |

> **Rule for new landscape ability art:** export at **700 × 392 px** (16 : 9), PNG with transparency.

#### Other

| File | Aspect Ratio | Recommended Size | Current Size | Current KB | Notes |
|---|---|---|---|---|---|
| `dialogue_frame.png` | **831 : 1288** ≈ 2 : 3 | 450 × 698 | 831 × 1288 | 208 KB | Well-sized; minor reduction optional |
| `overseer_portrait.png` | **615 : 824** ≈ 3 : 4 | 450 × 603 | 1230 × 1648 | 2167 KB | Confirm usage — possible duplicate of portraits/ |

---

### Item Thumbnails — `public/ui/items/` *(future)*

Displayed inside **36 × 36 px** icon slots (up to ~50 px at zoom 1.4×).

| Type | Aspect Ratio | Recommended Size | Minimum |
|---|---|---|---|
| Item icon | **1 : 1** | 128 × 128 | 64 × 64 |

> PNG with transparency. Expected file size ~5–15 KB per icon.

---

### World Textures — `public/textures/`

Rendered in the 1920 × 1080 design canvas. All layers for a room share the same dimensions.

| File | Aspect Ratio | Current Size | Current KB | Notes |
|---|---|---|---|---|
| `room.png` | **79 : 53** | 1264 × 848 | 1860 KB | Main room; compress with optipng → ~900 KB |
| `base.jpg` | **79 : 53** | unknown | 780 KB | Background base |
| `*_overlay.png` | **79 : 53** | 1264 × 848 | 78–119 KB | Well-sized |
| `mask_*.png` | **79 : 53** | 1264 × 848 | 9–59 KB | Well-sized |

> **Rule for new rooms:** all layers (room, base, overlays, all masks) must share the same pixel dimensions at ratio **79 : 53**. Recommended: **1264 × 848 px**.

---

## Optimization Priority

| Priority | Action | Estimated Saving |
|---|---|---|
| 🔴 Critical | Resize 8× square facet PNGs: 2048 → 700 px | ~55 MB → ~2 MB |
| 🔴 Critical | Resize 4× landscape ability PNGs: 2944 → 700 px wide | ~32 MB → ~1 MB |
| 🟡 Medium | Resize Overseer (concious_thoughts): 1230 → 450 px wide | 2167 KB → ~350 KB |
| 🟢 Low | Re-export character portraits at 900 px tall | ~500–700 KB saving |
| 🟢 Low | Lossless compress `room.png` with optipng | ~900 KB saving |

**Total current UI asset size:** ~100 MB  
**After recommended resizes:** ~6–8 MB
