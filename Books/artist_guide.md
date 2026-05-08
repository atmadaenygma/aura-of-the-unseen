# Aura of the Unseen — Artist Guide

Everything an artist needs to create assets for the game. All colour codes, naming conventions, file formats, folder locations, and workflow instructions.

---

## Colour Palette (UI)

All UI colours are defined in `src/constants/palette.js`. **Never use raw hex values in components** — always reference the named constant. The canonical palette:

| Name | Hex | Use |
|---|---|---|
| `BG` | `#d6cab0` | Warm beige — primary panel background |
| `BG_DARK` | `#c9bca0` | Nested panels |
| `BG_INSET` | `#c0b095` | Image wells, deepest inset |
| `ACCENT` | `#cb7866` | Terracotta — hover, active, borders |
| `TEXT` | `#3a2010` | Primary readable text |
| `TEXT_MID` | `rgba(58,32,16,0.65)` | Secondary text |
| `TEXT_DIM` | `rgba(58,32,16,0.45)` | Hints, labels |
| `QUEST_GOLD` | `#b8952a` | Quest item badges |
| `STOLEN_RED` | `#8b2e1a` | Stolen item badges |
| `PURCHASED_GRN` | `#2e6e3a` | Purchased item badges |
| `STATUS_GOOD` | `#2a7a5a` | Positive / healthy (green) |
| `STATUS_WARN` | `#b08030` | Caution (amber) |
| `STATUS_DANGER` | `#c0392b` | Danger / failure (red) |
| `STATS_BAR` | `#89ceaf` | HUD stats bar background |
| `FACET_COL` | `#3a7a6a` | Dialogue introspection teal |
| `SOURCE_EVIDENCE` | `#2a7a5a` | Journal — evidence (green) |
| `SOURCE_SILAS` | `#b8952a` | Journal — Silas (gold) |
| `SOURCE_OVERSEER` | `#8b2e1a` | Journal — Overseer (red) |

**Fonts:**
- UI labels: `Courier New, monospace`
- Flavour text: `Georgia, serif`
- Main menu title: `NexaRustSlab` → file: `public/fonts/NexaRustSlabDemo-BlackShadow1.otf`
- Main menu buttons: `NexaRustSans` → file: `public/fonts/NexaRustSansDemo-Black.otf`

---

## Mask Painting Reference

All masks are PNG files at the **same pixel dimensions as the room's base image**. Use pure flat colour — no anti-aliasing, no gradients, no soft edges.

### mask_logic.png — Collision & Zones

Determines where Maya can walk, interact, and transition between rooms.

| Paint this colour | Hex | RGB | Meaning |
|---|---|---|---|
| **Black** | `#000000` | `0, 0, 0` | Obstacle — wall, furniture, impassable |
| **White** | `#ffffff` | `255, 255, 255` | Walkable floor |
| **Yellow** | `#ffff00` | `255, 255, 0` | Hide zone — Maya can crouch-hide here |
| **Blue** | `#0000ff` | `0, 0, 255` | Exit / door — transition trigger |
| **Cyan** | `#05fff3` | `5, 255, 243` | Exit / door 2 |
| **Violet** | `#e500ff` | `229, 0, 255` | Exit / door 3 |
| **Red** | `#ff0004` | `255, 0, 4` | Exit / door 4 |
| **Orange** | `#ff8400` | `255, 132, 0` | Exit / door 5 |
| **Green** | `#39b54a` | `57, 181, 74` | Exit / door 6 |

**Rules:**
- Each door in a scene gets its own exit colour — paint the doorway/threshold zone with that colour
- The exit colour painted in room A must be wired in `worldManifest.js` → `exits` map with `to: "room_b_id"`
- Tree trunks, pillars, and building walls = black
- Leave the canopy/upper area white — Maya walks under it (the overlay handles depth)
- Hide zones (under beds, in bushes) = yellow

### mask_terrain.png — Surface Types (Footsteps)

Controls footstep sounds and surface type. Use the same canvas size as the base image.

| Paint this colour | Hex | RGB | Surface | Footstep |
|---|---|---|---|---|
| **Black** | `#000000` | `0, 0, 0` | Obstacle (no sound) | — |
| **White** | `#ffffff` | `255, 255, 255` | Stone / ground (default) | Stone |
| **Green** | `#00ff00` | `0, 255, 0` | Grass | Grass |
| **Yellow** | `#ffff00` | `255, 255, 0` | Dirt / earth path | Dirt |
| **Red** | `#ff0000` | `255, 0, 0` | Soft / carpet | Soft |
| **Blue** | `#0000ff` | `0, 0, 255` | Threshold / stone step | Stone |

**Rules:**
- The terrain mask shape should match the walkable white area of the logic mask
- If no terrain mask exists for a room, everything defaults to walkable with no footstep distinction

---

## Depth Overlays (Foreground Objects)

Used so Maya appears **behind** tall objects (trees, columns, furniture tops) when she walks behind them.

**How it works:**
- The overlay PNG is placed at a `yDepth` value in world coordinates
- If Maya's Y > yDepth → she renders **in front** of the overlay
- If Maya's Y < yDepth → the overlay renders **in front** of her

**Workflow for a tree:**
1. Paint the complete tree on `base.jpg/png`
2. Create a new transparent PNG (same canvas dimensions)
3. Paint ONLY the upper portion of the tree (canopy + trunk above the sorting line)
4. Export as a named file: `tree_front_left.png`, `tree_gate_right.png` etc.
5. Find the `yDepth` by pressing **G** in-game (debug mode), walking to the **front base** of the trunk and reading the Y coordinate
6. Add to `worldManifest.js`:
```js
overlays: [
  { id: "tree_front_left", filename: "tree_front_left.png", yDepth: 480 },
]
```

**Rule: one overlay PNG = one yDepth value.** Trees at different depths need separate PNG files.

**Special overlay flags:**
- `hidingOverlay: true` — overlay jumps to maximum z-index when Maya is hiding (fully conceals her under furniture/bushes)

---

## Sprite Naming Convention

All sprites are `.webm` video files (looping, transparent background, no audio).

### Maya (Protagonist) — `public/sprites/protagonist/`

| Filename | Direction | State |
|---|---|---|
| `new_maya_down_walk.webm` | Down | Walking |
| `new_maya_up_walk.webm` | Up | Walking |
| `new_maya_right_walk.webm` | Right | Walking (also used flipped for left) |
| `new_maya_left_up_walk.webm` | Up-Left | Walking |
| `new_maya_left_down_walk.webm` | Down-Left | Walking |
| `new_maya_up_right_walk.webm` | Up-Right | Walking |
| `new_maya_down_right_idle.webm` | Down / Down-Right / Left / Right | Idle |
| `new_maya_up_left_idle.webm` | Up / Up-Left / Up-Right | Idle |
| `new_maya_down_run.webm` | Down | Running (placeholder) |
| `new_maya_360.webm` | — | 360 discovery video (Journal) |
| `crouch_idle_left.webm` | Left | Crouching idle |
| `crouch_idle_left_down.webm` | Down | Crouching idle |
| `crouch_idle_up.webm` | Up | Crouching idle |
| `crouch_up_left_idle.webm` | Up-Left | Crouching idle |
| `crouch_walk_down.webm` | Down | Crouching walk |
| `crouch_walk_up.webm` | Up | Crouching walk |

**Naming convention for new Maya sprites:**
```
new_maya_{direction}_{state}.webm
```
Directions: `up`, `down`, `left`, `right`, `up_left`, `up_right`, `down_left`, `down_right`
States: `walk`, `run`, `idle`

**White Citizen (aura projection) — in progress:**
- `white_projection_down_idle.webm`
- `white_projection_down_left_walk.webm`
- Follow the same `{projection_name}_{direction}_{state}.webm` convention

### NPCs — `public/sprites/npcs/`

| Filename | Character |
|---|---|
| `silas_idle.webm` | Old Silas |
| `overseer_idle.webm` | The Overseer |
| `overseer_down_idle.webm` | The Overseer (down-facing) |
| `overseer_down_walk.webm` | The Overseer walking down |
| `overseer_down_right_walk.webm` | The Overseer walking down-right |
| `angus_forward_left_idle.webm` | Angus |
| `plantation_owner_idle.webm` | Plantation Owner |

**Naming convention for new NPCs:**
```
{character_name}_{direction}_{state}.webm
```

---

## Portrait Images

**Location:** `public/ui/portraits/`

| Filename | Character | Format |
|---|---|---|
| `new_maya.webp` | Maya (protagonist) | `.webp` |
| `silas_portrait.png` | Old Silas | `.png` |
| `overseer_portrait.png` | The Overseer | `.png` |
| `Angus_portrait.png` | Angus | `.png` |
| `protagonist_portrait.png` | Old Maya portrait (legacy) | `.png` |

**Spec:** Square or portrait-oriented. Used in the dialogue system (tall, full-figure), status panel (small crop), and main menu (rotating display).

**Naming convention:** `{character_id}_portrait.png` or `.webp`

---

## Discovery / 360 Videos

**Location:** `public/discovery/`

| Subfolder | Content |
|---|---|
| `characters/` | 360 rotation videos for people (journal PEOPLE tab) |
| `places/` | 360 / cinematic videos for locations |
| `things/` | Videos/images for notable objects |

**Format:** `.webm` with VP9 codec and alpha channel (`-pix_fmt yuva420p`)
**Conversion command:**
```bash
ffmpeg -i source.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -an output.webm
```

**Current files:**
- `characters/silas_360.webm` — Old Silas
- `characters/01_overseer_360.webm` — The Overseer

**To register a new discovery video**, add the path to the character/place/thing entry in `src/data/cognitions.js`.

---

## Aura Projection Icons

**Location:** `public/ui/projections/`

These are the small icons shown in the Status panel → Abilities accordion.

| Filename | Projection |
|---|---|
| `hidden.png` | Hidden (Social Crypsis) |
| `rat.png` | Rat (Social Crypsis) |
| `wild_dog.png` | Wild Dog (Social Crypsis) |
| `generic_white.png` | White Citizen (Mimicry) — *needed* |
| `distract.png` | Distract (unused) |

**Spec:** Square, any size (displayed at 32×32 in UI). Transparent background. Add new projections at `public/ui/projections/{projection_id}.png`.

---

## Neurological Facet / Ability Images

**Location:** `public/ui/concious_thoughts/`

Used in the dialogue introspection banner and the Journal → Cognitions → Abilities tab.

| Filename | Ability |
|---|---|
| `social_crypsis.png` | Social Crypsis |
| `mimicry.png` | Mimicry |
| `genetic_memory.png` | Genetic Memory |
| `nerve_sense.png` | Nerve Sense |
| `charisma.png` | Charisma |
| `composure.png` | Composure |
| `determination.png` | Determination |
| `intuition.png` | Intuition |
| `knowledge.png` | Knowledge |
| `pain.png` | Pain |
| `perception.png` | Perception |
| `strength.png` | Strength |

**Spec:** Wide banner format (displayed full-width in dialogue). Transparent or dark background.

---

## Background Images

### Main Menu
**Location:** `public/backgrounds/menu/`
- `main_menu_bg.png` — Main menu background

### Loading Screens
**Location:** `public/backgrounds/loading/`

15 images used in rotation on the loading / press-to-start screen.

| Filename |
|---|
| `01_load.png` through `15_load.png` |

To add more: drop the file in the folder and add the path to `src/constants/loadingImages.js`.

### Scene Backgrounds (per room)
**Location:** `public/textures/Whitney Plantation/{room_name}/`

| Filename | Room | Format |
|---|---|---|
| `base.jpg` | test_house | JPG |
| `base.png` | overseers_house_exterior | PNG |

If a room uses PNG instead of JPG, add `baseImage: "base.png"` to the room's entry in `worldManifest.js`.

---

## Room / Level Asset Structure

Each room lives in its own folder under `public/textures/`. The folder name matches the room's `id` in `worldManifest.js`.

```
public/textures/Whitney Plantation/
├── test_house/
│   ├── base.jpg              ← room background
│   ├── mask_logic.png        ← collision / exits / hide zones
│   ├── mask_terrain.png      ← surface types (footsteps)
│   ├── bed_overlay.png       ← foreground depth overlay (yDepth: 420)
│   ├── table_overlay.png     ← foreground depth overlay (yDepth: 560)
│   └── small_table_overlay.png ← foreground depth overlay (yDepth: 650)
│
└── overseers_house_exterior/
    ├── base.png              ← room background
    ├── mask_logic.png        ← collision / exits / hide zones
    ├── mask_terrain.png      ← surface types
    └── overlays.png          ← foreground depth overlays
```

**To add a new room:**
1. Create the folder: `public/textures/Whitney Plantation/{room_id}/`
2. Add `base.jpg` (or `base.png`)
3. Paint `mask_logic.png` and `mask_terrain.png`
4. Add the room entry to `src/data/worldManifest.js`

---

## Audio

**Location:** `public/audio/`

```
audio/
├── music/          ← looping background tracks (.mp3)
│   ├── Chain-Rattle Hollow.mp3   — main menu theme
│   └── Chain-link Amen.mp3       — in-game / level music
│
└── sfx/
    ├── footsteps/  ← surface footstep sounds
    ├── ui/         ← panel open/close, select sounds
    ├── ambient/    ← fire crackle, room atmosphere
    └── interact/   ← container open, item pickup, cooking
```

To register a new music track, add it to `MUSIC_TRACKS` in `src/utils/audio.js`. To register a SFX, add it to `SFX_CATALOG`.

---

## Item Images

Item icons go in `public/ui/items/{item_id}.png`. Set the `image` field on the loot entry in `worldManifest.js`:
```js
{ id: "tin_comb", name: "Tin Comb", description: "...", image: "/ui/items/tin_comb.png" }
```

**Spec:** Square 512×512px. Dark painterly style, isolated object on transparent or near-black background.

---

## Key worldManifest.js Fields Reference

When setting up a new room, these are the fields available:

```js
"room_id": {
  id:             "room_id",
  path:           "/textures/Whitney Plantation/room_id",
  baseImage:      "base.png",      // omit for base.jpg (default)
  worldW:         1280,            // world width in units (default 1280)
  worldH:         800,             // world height in units (default 800)
  spawnPos:       { x: 640, y: 680 }, // where Maya spawns when entering
  characterScale: 1.0,             // Maya + NPC size multiplier (0.85 = 15% smaller)
  moveScale:      1.0,             // Maya movement speed multiplier
  exits: {
    "0,0,255": { to: "other_room_id" },  // blue door → other room
    // add one entry per door colour
  },
  entities:       { ... },         // containers, hearths, etc.
  hidingSpots:    { ... },
  npcs:           { ... },
  terrainSurfaces:{ ... },
  overlays:       [ ... ],         // depth overlay PNGs
}
```
