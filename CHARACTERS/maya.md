# Maya

## Identity
- Name: Maya
- Role: Player Character
- Race: African American
- Age: Mid-20s
- Occupation: Auraist

## Personality

Maya is quiet, observant, and deeply internal. She processes the world through sensation before thought — she feels the weight of a room before she names what is wrong with it. She does not perform bravery; she moves through danger with the stillness of someone who has learned that panic is a luxury she cannot afford.

She carries grief without displaying it. The plantation presses on her constantly, and she absorbs it — cataloguing, remembering, surviving. She is not numb; she feels everything. She simply cannot afford to show it.

**Voice Notes**:
- Speaks rarely and with precision; every word is chosen
- Internal barks are her truest voice — unguarded, honest, sometimes darkly wry
- When she refuses to mimic an ally, her refusal is gentle but absolute: loyalty is the one thing she will not compromise
- She does not explain herself to antagonists; she watches them

**Mannerisms**:
- Pauses before entering any room — reading it
- Touches doorframes, walls, objects; physical contact grounds her perception
- Her stillness is not passivity; she is always calculating

---

## Auraist Nature

Maya is an Auraist — a rare individual whose nervous system extends beyond the skin to read, absorb, and temporarily project the emotional and biological signatures of others. This is not a learned skill; it is what she is.

**How It Works**:
- Observation is somatic: she doesn't study someone, she *receives* them — posture, smell, rhythm, fear, certainty, cruelty
- Mimicry is a full-body experience: she doesn't perform a character, she briefly *becomes* one
- There is no clean boundary between observation and absorption; extended mimicry bleeds into her

**Costs**:
- Inhabiting a cruel aura (e.g., the Overseer, Agnes) is not neutral — it leaves residue
- High mimicry use depletes Aura Stability; this is not metaphorical, it is her body's resource
- She can tell when an aura doesn't fit her — the dissonance registers as physical discomfort
- Some auras are simple (passersby); some are architecturally complex (authority figures with deep social roles)

**Why She Can't Mimic Allies**:
- It isn't a rule she follows; it is a biological revulsion
- Allies' auras contain trust, and trust is not something she is willing to consume
- Her body refuses the intake before her mind has to decide

---

## Game Mechanics
- Can Be Mimicked: NO
- Mimicry Complexity: N/A
- Accuracy Items Required: N/A
- Suspicion Threshold: N/A
- Role Category: ALLY (player-controlled)

## Perception Stats
- Sight Range: 300
- Hearing Range: 250
- Sight Angle: 120

## Locations
- Primary Location: test_house
- Secondary Location: N/A
- Spawn Points: [(816, 459)]
- Availability: Player-controlled

## Appearance
- Asset Path: /sprites/maya/${direction}_${state}.webm
- Display Name: Maya

## NPC Behavior States
- Default State: IDLE
- Lazy: N/A
- Alert: Aura Stability drains faster; detection risk increases
- Suspicious: Wanted state activated; NPCs hostile
- State Transition Triggers: Aura Stability below threshold, caught by NPCs

## Suspicion Tracking
- Current Suspicion Level: N/A
- Suspicion Threshold: N/A
- Suspicion Increases From: N/A
- Suspicion Decreases From: N/A

## Dialogue & Barks
- Dialogue Keys: [internal_barks_on_mimicry_refusal]
- observeCatchBark: "I don't want to mimic them" or "I have too much respect for them"
- observeCatchDialogue: NONE
- ally_refusal_bark: [internal, fires when attempting to observe an ally]

## NPC Interactions
- Aura Reactions: N/A
- Can Be Traded With: NO
- Can Be Observed: NO
- Can Items Be Stolen: NO

## Observation Mechanics
- Observation Time Required: N/A
- Observation Special Flags: NONE
- Observation XP Reward: NONE

## Relationships With Other NPCs
- Silas: None (random NPC)
- The Overseer: None (antagonist NPC)
- Agnes: None (antagonist NPC)

## Accuracy Items
- N/A

## Merchant Data
- N/A

## Core Abilities
| Ability | Status | Unlock Level |
|---|---|---|
| Social Crypsis | Unlocked | 1 |
| Genetic Memory | Unlocked | 1 |
| Nerve Sense | Unlocked | 1 |
| Mimicry | Unlocked | 1 |

## Core Resources
- Aura Stability: Starts 100, drains/recovers based on activity
- Vigor: Starts 100, depletes with activity
- Hunger: Starts 100, depletes over time
- Integrity: Starts 50, affected by deception use
- Mood: Starts 50, affected by events

## Mimicry System Constraints
- Can only mimic non-allies
- Cannot mimic: Silas (ally status)
- Will internally bark refusal when attempting to mimic allies
- Simple mimicry: Observation only, no accuracy items required
- Complex mimicry: Observation + accuracy items required (Overseer, similar authority figures)

## Additional Mechanics
- Typewriter effect: 60ms per character on all dialogue
- Scan line animation: Left-to-right gradient (90deg), always
- Loading screen: Shows on location transition, hides when assets ready
- Sprite change: Uses /sprites/maya_mimicry/${aura_id}.webm when active aura equipped, with shimmer overlay

## Notes
- Test character for Chapter 1 mechanics validation
- Base game loop: observe → acquire aura → equip → use strategically
- Aura Stability is the main resource constraint preventing unlimited mimicry
