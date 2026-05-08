# BLACKTRACK — Chapter & Release Plan

---

## The Chapters

### CHAPTER 1 — The Gold Coast: Barracoons *(Free Demo)*

The opening chapter. Set on the Gold Coast of West Africa (modern-day Ghana).
Maya navigates the Barracoons — the large holding pens where enslaved people were kept
before being loaded onto ships.

**Status:** Planning
**Chapter ID in code:** `1`
**Location type:** Coastal West Africa, 18th–19th century
**Tone:** Dread, disorientation, the last sight of home

---

### CHAPTER 2 — The Slave Ship *(Middle Passage)*

The crossing. Maya is aboard the ship during the transatlantic voyage.
The environment is close, brutal, and claustrophobic.

**Status:** Planning
**Chapter ID in code:** `2`
**Location type:** Below-deck interior, open ocean
**Tone:** Survival, memory, endurance

---

### CHAPTER 3 — The American Island *(Fictitious, USA-modelled)*

A fictional island designed to compact the full American historical story
into one navigable location. All major real-life historical figures
and events represented in one area — so the player experiences the
full arc without needing to jump across decades and geography.

**Status:** Concept
**Chapter ID in code:** `3`
**Location type:** Plantation, city, port, courthouse — all on one island
**Tone:** The full weight of American history in one place

---

### DEVELOPER SANDBOX *(Not part of the game)*

**Chapter ID in code:** `0`

The following rooms are internal testing grounds only. They are accessible
in debug mode but never shown to players and are not part of any chapter:

- `test_house` — Whitney Plantation interior prototype
- `overseers_house_exterior` — Exterior prototype

---

## Release Model

### Free Demo
- Chapter 1 only (Gold Coast / Barracoons)
- Fully playable from start to end of Chapter 1
- Save file is preserved

### Full Game (Paid)
- Chapters 1 + 2 + 3
- Player enters a **license key** after purchase
- Their Chapter 1 save carries over automatically — no replaying
- One unified build, no re-download needed

### Key principle
> If you played the demo, buying the full game picks up exactly where you left off.

---

## How the Chapter System Works (Technical)

The chapter gate is live. When Maya tries to enter any room belonging to
a locked chapter, she sees a "Get the Full Game" screen instead of transitioning.

### Chapter registry — `src/data/worldManifest.js`
```js
export const CHAPTER_REGISTRY = {
  0: { title: 'Developer Sandbox',           free: true  },
  1: { title: 'The Gold Coast — Barracoons', free: true  },
  2: { title: 'The Slave Ship',              free: false },
  3: { title: 'The American Island',         free: false },
};
```

### Every room must have a `chapter` field
```js
"barracoons_entrance": {
  chapter: 1,   // ← required
  id: "barracoons_entrance",
  path: "/textures/chapter_01/barracoons_entrance",
  ...
}
```

### Unlocked chapters live in game state
```js
unlockedChapters: [1]   // demo — only chapter 1
unlockedChapters: [1, 2, 3]   // full game after license key
```

---

## YOUR NEW WORKFLOW — Read This Before Creating Any New Room

### 1. Every new room needs a chapter number
When you create a room entry in `worldManifest.js`, the FIRST thing to add is:
```js
chapter: 1,   // or 2 or 3
```
If you forget this, the room defaults to chapter 1 (accessible in demo).
If it should be chapter 2 or 3, **always set it explicitly.**

### 2. Organise assets by chapter folder
From now on, all new scene assets go in chapter-specific folders:

```
public/textures/
├── _dev/                    ← prototype/test rooms only
│   └── (current test rooms stay here eventually)
│
├── chapter_01/              ← Gold Coast / Barracoons
│   └── barracoons_entrance/
│       ├── base.jpg
│       ├── mask_logic.png
│       ├── mask_terrain.png
│       └── overlays/
│
├── chapter_02/              ← The Slave Ship
│   └── ship_hold/
│       └── ...
│
└── chapter_03/              ← The American Island
    └── island_port/
        └── ...
```

The `path` field in the manifest must match the folder:
```js
path: "/textures/chapter_01/barracoons_entrance",
```

### 3. Sprites and audio organised by chapter
```
public/sprites/chapter_01/   ← Gold Coast specific characters
public/sprites/chapter_02/   ← Ship-specific characters
public/sprites/shared/       ← Maya and characters that appear in multiple chapters

public/audio/music/chapter_01/
public/audio/music/chapter_02/
```

### 4. Discovery content organised by chapter
```
public/discovery/characters/chapter_01/
public/discovery/places/chapter_01/
```

### 5. When connecting rooms across chapters
If a room in Chapter 1 has an exit that leads into Chapter 2, the player
will automatically see the **"Get the Full Game"** screen when they try to enter.
You do NOT need to do anything extra — the gate fires automatically.

Just make sure:
- The Chapter 1 exit room has the correct `exits` map with the Chapter 2 room id
- The Chapter 2 room has `chapter: 2` set

### 6. Testing locked chapters during development
To test Chapter 2 or 3 rooms during development, temporarily change
your game state in the browser console:

```js
// In browser dev console:
// (this only lasts until page refresh — does not affect saved data)
```

Or add a debug menu option that unlocks all chapters when debug mode (`G`) is active.

### 7. The purchase URL
In `src/components/ChapterGateUI.jsx`, update this line when your store is live:
```js
window.open('https://your-store-link-here.com', '_blank')
```

---

## Distribution Plan

**Platform:** itch.io (primary — best fit for this subject matter and audience)
**Pricing model:** Free demo / Paid full game
**License keys:** Generated on purchase, entered in-game to unlock Chapters 2 & 3

**Consider also:**
- Steam (larger audience, native demo system, Steamworks handles DRM)
- Direct web play for the demo (broadest reach for free chapter)

---

## Notes / Still To Plan

- [ ] Chapter 1 specific rooms, layout, and story beats (Barracoons)
- [ ] Chapter 1 NPC roster and dialogue
- [ ] Chapter 1 asset list — what needs to be made
- [ ] Chapter 2 mechanics — what does gameplay look like on a ship?
- [ ] Chapter 2 room layout and NPC roster
- [ ] Chapter 3 island map design and historical character list
- [ ] License key generation and validation system
- [ ] End-of-Chapter-1 screen / "buy to continue" moment
- [ ] Store URL for ChapterGateUI purchase button
- [ ] Pricing strategy
- [ ] Whether to release chapters 2 & 3 together or separately
- [ ] Localisation / language support planning
- [ ] Accessibility considerations per chapter environment
- [ ] Move current dev rooms to `_dev/` folder (low priority)
