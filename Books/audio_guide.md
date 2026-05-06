# Audio Guide — Aura of the Unseen

## Folder Structure

```
public/audio/
├── music/              ← looping background tracks
│   └── (drop .mp3 / .ogg files here)
│
└── sfx/
    ├── footsteps/      ← surface-based footstep sounds
    ├── ui/             ← panel open/close, item select, loot
    ├── ambient/        ← room atmosphere, fire crackle, wind
    └── interact/       ← container open, item pickup, cooking
```

---

## File Spec

| Property | Value |
|---|---|
| Format | `.mp3` (primary) or `.ogg` (fallback) |
| Sample rate | 44 100 Hz |
| Bit rate | 192 kbps minimum for music, 128 kbps for SFX |
| Music | Stereo, normalised to −14 LUFS integrated |
| SFX | Mono or stereo, peak below −1 dBTP |

---

## Adding a Music Track

1. Drop the file into `public/audio/music/` — e.g. `test_house_ambient.mp3`
2. Register it in `src/utils/audio.js` under `MUSIC_TRACKS`:
   ```js
   test_house_ambient: 'test_house_ambient.mp3',
   ```
3. Play it from anywhere in the game:
   ```js
   import { music } from '../utils/audio';
   music.play('test_house_ambient');   // fades in over 1 s
   music.stop();                       // fades out over 0.8 s
   ```

The manager handles fade-in / fade-out automatically. Only one track plays at a time.

---

## Adding a Sound Effect

1. Drop the file into the right subfolder, e.g. `public/audio/sfx/ui/ui_open.mp3`
2. Register it in `src/utils/audio.js` under `SFX_CATALOG`:
   ```js
   ui_open: { folder: 'ui', file: 'ui_open.mp3' },
   ```
3. Fire it anywhere:
   ```js
   import { sfx } from '../utils/audio';
   sfx.play('ui_open');
   ```

---

## Planned Sound Slots

### Music
| Track ID | Description | Location |
|---|---|---|
| `test_house_ambient` | Quiet interior — creak of floorboards, distant wind | test_house |
| `plantation_tension` | Low dread underscore for high-suspicion moments | all rooms |
| `safe_moment` | Soft, resolved — plays when hidden or trusted | hide zones |

### Footsteps
| SFX ID | Surface | Trigger |
|---|---|---|
| `footstep_wood` | Wood floor | `terrainSurface.id === 'wood_floor'` |
| `footstep_soft` | Carpet / rug | `terrainSurface.id === 'carpet'` |
| `footstep_grass` | Grass / earth | `terrainSurface.id === 'grass'` |
| `footstep_stone` | Threshold / stone | `terrainSurface.id === 'threshold'` |

### UI
| SFX ID | When |
|---|---|
| `ui_open` | Any panel opens (satchel, journal, status) |
| `ui_close` | Any panel closes |
| `ui_select` | Dialogue option confirmed |
| `ui_loot` | Item picked up from loot screen |

### Interact
| SFX ID | When |
|---|---|
| `container_open` | Container loot screen opens |
| `item_pickup` | Item moved into satchel |
| `cooking_fire` | Cooking UI opens |
| `item_eat` | Food eaten from inventory |

### Ambient
| SFX ID | Description |
|---|---|
| `fire_crackle` | Hearth entity nearby |
| `room_creak` | Random low-frequency room ambience |

---

## Volume Hierarchy

```
masterVolume (0–1)
├── musicVolume  × masterVolume  → track.volume
└── sfxVolume    × masterVolume  → one-shot.volume
```

All three levels are exposed in `src/utils/audio.js` and wired to the HUD Settings → Sound sliders (TODO: connect `setMasterVolume`, `music.setVolume`, `sfx.setVolume` to the sliders in `HUD.jsx → SoundContent`).
