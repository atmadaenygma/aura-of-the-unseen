# Mimicry System — Implementation Phases

**Overview**: Maya's ability to acquire and project auras of non-allies. Requires phased implementation due to interdependencies between observation, detection, NPC reactions, aura stability, and social mechanics.

---

## Phase 0: Foundation & Data Structure

**Goal**: Set up all data structures, constants, and character files needed by later phases.

### Files to Modify
| File | Change |
|---|---|
| `src/data/worldManifest.js` | Add to each NPC: `suspicionThreshold`, `observeCatchBark`, `observeCatchDialogue`, `canBeMimicked` |
| `src/constants/palette.js` | Add `MIMICRY_SHIMMER` (FACET_BLUE at 50% opacity for aura overlay) |
| `CHARACTERS/maya.md` | Create character lore + gameplay design doc |

### Data Structure Changes
```js
// worldManifest.js NPC entry
{
  id: 'angus',
  name: 'Agnes',
  role: 'authority',
  canBeMimicked: true,           // NEW
  suspicionThreshold: 0.7,        // NEW: 0–1.0, trigger alert at this level
  observeCatchBark: "Stop staring at me like that.",
  observeCatchDialogue: 'angus_observe_catch',
  // ... existing fields
}

// gameState (App.jsx INITIAL_STATE)
{
  // ... existing ...
  npcSuspicion: {},        // EXISTING but clarify: { npcId: 0–1.0 }
  isWanted: false,         // NEW: authorities alerted, Maya hunted
  // auraStability already exists (100 at start)
}
```

### Verification
- [ ] worldManifest.js has `canBeMimicked`, `suspicionThreshold`, `observeCatchBark`, `observeCatchDialogue` on all NPCs
- [ ] palette.js has MIMICRY_SHIMMER constant
- [ ] CHARACTERS/maya.md exists with Identity, Personality, Auraist Nature, Abilities, Relationships sections

---

## Phase 1: Basic Observation & Ally Refusal

**Goal**: Observation bars work, allies refuse mimicry, sprite changes when mimicry active, HUD shows progress.

**Dependencies**: Phase 0

### Files to Modify
| File | Change |
|---|---|
| `src/components/Character.jsx` | Observation block: add ally check, internal bark, onObservingChange callback, sprite override |
| `src/components/Stage.jsx` | Add `isObservingActive` state, pass to HUD |
| `src/components/HUD.jsx` | Add observation progress bar replacing [E] ENTER |

### Mechanic: Ally Refusal
**When**: Character right-clicks an NPC with mimicry equipped
**Check**: Is `npc.canBeMimicked === true` AND `npc.role !== 'ally'`?
- **If false** (ally or non-mimickable): Maya barks internally "I don't want to mimic him/her" or "I have too much respect for them" — observation block skipped
- **If true** (non-ally): Proceed to observation bar (Phase 1) → detection (Phase 2)

### Mechanic: Observation Progress Bar
**Location**: HUD left strip (replaces [E] ENTER while observing)
**Shows**: "[RT] Agnes" or "[RMB] Agnes" + blue progress bar
**Progress**: `gameState.observedNPCs[npcId]` (0–1.0)
**Clear on**: Release button, NPC moves away, or room transition

### Mechanic: Maya Sprite Change
**When**: `gameState.activeAbility === 'mimicry'` AND `gameState.activeAura` is set
**Visual**: 
- Switch to `/sprites/maya_mimicry/${activeAura}.webm`
- Fallback to normal sprite if file missing
- Add shimmer overlay (MIMICRY_SHIMMER border + `aura-pulse` animation)
- Overlay always visible while mimicry active

### Verification
- [ ] Approach Silas with mimicry equipped, right-click → internal bark fires, no observation bar
- [ ] Approach Agnes with mimicry equipped, right-click → observation bar appears in HUD
- [ ] Release right-click → bar disappears, [E] ENTER returns
- [ ] Equip Agnes aura from STATUS → Maya sprite changes + shimmer visible
- [ ] Walk out of sight → sprite reverts

---

## Phase 2: Detection & Suspicion System

**Goal**: NPCs detect mimicry attempts, track per-NPC suspicion, bark/dialogue on detection.

**Dependencies**: Phase 1

### Files to Modify
| File | Change |
|---|---|
| `src/components/Character.jsx` | Add LOS proximity check during observation; trigger OBSERVE_CAUGHT if detected |
| `src/components/Stage.jsx` | Add `'OBSERVE_CAUGHT'` case in `triggerInteraction`; track NPC suspicion |

### Mechanic: LOS Detection During Observation
**Where**: Character.jsx observation block (lines ~415–440)
**Logic**: While observing, check if Maya is within NPC's inner sight radius (60% of `sightRange`)
```
If detected:
  - Trigger OBSERVE_CAUGHT event
  - Increase NPC suspicion by 0.3 (or config value)
  - NPC barks (observeCatchBark)
  - If role is 'authority': After bark delay, open full interrogation dialogue
  - If role is 'patrol': Alert other patrols (future: Phase 4)
  - If role is 'passerby': Bark only, no escalation
  - Observation block returns early (no progress tick this frame)
```

### Mechanic: Suspicion Tracking
**Data**: `gameState.npcSuspicion = { npcId: 0–1.0 }`
**Triggers**:
- Observation detected → +0.3
- Failed mimicry (Phase 3) → +0.2–0.5 (depends on complexity)
- Successful social interaction (Phase 5) → −0.1

**Threshold**: When `npcSuspicion[npcId] >= npc.suspicionThreshold` → alert authorities (Phase 3)

### Verification
- [ ] Observe Agnes in his sight cone → bark fires, suspicion increases
- [ ] Observe Agnes out of sight → observation fills normally, no bark
- [ ] Multiple detections increase suspicion visible in gameState logs
- [ ] STATUS panel or debug view shows per-NPC suspicion levels

---

## Phase 3: Authority Alert & Wanted State

**Goal**: When suspicion threshold crossed, authorities move toward Maya; wanted flag prevents safe interaction.

**Dependencies**: Phase 2

### Files to Modify
| File | Change |
|---|---|
| `src/components/Stage.jsx` | Add authority arrival loop; set `gameState.isWanted` when suspicion exceeds threshold |
| `src/components/NPC.jsx` or `useNPCAI` | Authority NPCs move toward Maya when wanted |
| `src/components/HUD.jsx` | Show "WANTED" indicator when `gameState.isWanted === true` |

### Mechanic: Authority Alert
**Trigger**: When any NPC's suspicion exceeds their `suspicionThreshold`
**Action**:
- Set `gameState.isWanted = true`
- Authorities (role: 'authority') begin moving toward Maya's location
- Movement is gradual (feel realistic) — ~5–10 second travel time across room
- Gives Maya time to hide or escape

### Mechanic: Wanted State
**While `isWanted === true`**:
- NPCs react with hostility if they see Maya
- Maya cannot initiate friendly dialogue (only interrogation/confrontation)
- Social interactions fail or are unavailable
- Mimicry is still possible but much riskier

**How to Clear**:
- Hide in a safe location (out of all NPC sight/hearing) for 30+ seconds
- OR leave the location (travel to a different room)
- Sets `gameState.isWanted = false`

### Verification
- [ ] Trigger Agnes suspicion threshold → Overseer (authority) begins moving toward Maya
- [ ] HUD shows "WANTED" indicator
- [ ] Maya can hide and wait → wanted flag clears after 30s
- [ ] Maya can flee to different room → wanted flag clears

---

## Phase 4: Aura Stability Drain & Recovery

**Goal**: Aura stability acts as a resource; loitering in public drains it, safe zones recover it.

**Dependencies**: Phase 1 (foundational; doesn't strictly depend on 2–3 but those make it more impactful)

### Files to Modify
| File | Change |
|---|---|
| `src/components/Stage.jsx` | Add loitering drain logic; detect safe vs. public areas |
| `src/utils/gameLoop.js` or `Stage.jsx` | Add aura stability passive recovery in safe zones |
| `src/components/HUD.jsx` | Show aura stability bar (may already exist; ensure it updates visually) |
| `src/data/worldManifest.js` | Mark rooms/zones as `isSafeZone: true/false` (default false for public) |

### Mechanic: Loitering Drain
**Where**: Public areas (non-safe zones)
**Rate**: Drain ~1 per second (or config: 60 per minute)
**Condition**: Only while in public (not hidden in bushes, not in safe zone)
**Reset**: Maya hides or enters safe zone → drain stops

### Mechanic: Passive Recovery
**Where**: Safe zones (e.g., isolated rooms, hidden areas)
**Rate**: Recover ~0.5 per second (slower than drain, encourages risk)
**Condition**: Must be in safe zone + not in combat/alert state

### Mechanic: Active Recovery
**Triggers**:
- Successful social interaction: +5 aura stability
- Eating food Maya likes: +10 aura stability per meal
- **Data needed**: Define which foods Maya likes in `worldManifest.js` food items

### Detection Formula Tie-In
**Detection chance during mimicry**: `baseDetectionChance * (1 - auraStability/100)`
- High stability (80–100): 20–0% detection chance
- Medium stability (40–80): 60–20% detection chance
- Low stability (0–40): 100–60% detection chance

### Verification
- [ ] Stand in public area > 30s → aura stability drains visibly in HUD
- [ ] Enter safe zone → drain stops, passive recovery begins
- [ ] Eat Maya's favorite food → aura stability jumps +10
- [ ] Complete social interaction → aura stability +5
- [ ] Low aura stability → higher detection chance when mimicking

---

## Phase 5: Complex Mimicry & Accuracy

**Goal**: High-value mimicry (e.g., Overseer) requires accuracy items; without them, social interactions fail (oddity detection).

**Dependencies**: Phase 1–4 (full system needed for social consequences)

### Files to Modify
| File | Change |
|---|---|
| `src/data/worldManifest.js` | Add `accuracyItems: ['overseer_diary', 'overseer_letter', ...]` to complex NPCs |
| `src/components/StatusPanel.jsx` | Show accuracy progress when mimicking (items needed vs. collected) |
| `src/components/DialogueSystem.jsx` | Add oddity detection check before dialogue success |
| `src/data/cognitions.js` or social registry | Define which NPCs detect oddities (Overseer's wife, close associates) |

### Mechanic: Accuracy Items
**For complex mimicry targets** (e.g., Overseer):
- Observation unlocks **base form** (can equip, visuals work)
- But social interactions with related NPCs (Overseer's wife, household staff) detect **oddities**
- Collecting 3+ accuracy items (diary, letters, personal effects) unlocks **accurate form**
- With accuracy: oddities suppressed, social interactions succeed normally

### Mechanic: Oddity Detection
**Trigger**: Maya using mimicry form in dialogue with NPC who knows the target closely
**Check**: Does gameState have all accuracy items for this aura?
- **If no**: Dialogue is awkward, NPC becomes suspicious, suspicion +0.2–0.4
- **If yes**: Dialogue proceeds normally, no oddity penalty

### Mechanic: Simple vs. Complex
**Simple targets** (passerby, minor NPCs):
- No accuracy items needed
- Base observation → can use immediately

**Complex targets** (Overseer, authority figures):
- Observation required
- Accuracy items recommended (optional, but social interactions risky without them)

### Verification
- [ ] Observe Overseer → unlock base mimicry form
- [ ] Equip Overseer aura, talk to wife → oddity detected, suspicion increases
- [ ] Collect Overseer's diary, letter, ring → now have accuracy
- [ ] Equip Overseer aura, talk to wife again → oddity suppressed, dialogue succeeds
- [ ] Observe passerby → can equip immediately, no accuracy items needed

---

## Full Feature Verification Checklist

### Phase 1 Complete
- [ ] Basic observation system works (bars, HUD, sprite changes)
- [ ] Ally refusal works (internal barks, no observation)

### Phase 2 Complete
- [ ] Detection during observation works (barks fire, suspicion tracks)
- [ ] Per-NPC suspicion system works (visible in debug logs)

### Phase 3 Complete
- [ ] Authority alerts arrive when threshold crossed
- [ ] Wanted flag set/cleared correctly
- [ ] Wanted state blocks friendly interactions

### Phase 4 Complete
- [ ] Aura stability drains in public
- [ ] Recovery works in safe zones and through food/interactions
- [ ] Detection chance scales with aura stability

### Phase 5 Complete
- [ ] Accuracy items unlock complex mimicry forms
- [ ] Oddity detection works in dialogue
- [ ] Simple targets have no accuracy requirements

---

## Execution Readiness

**Ready to start Phase 0 (Foundation)? Confirm and I'll begin with worldManifest.js updates.**
