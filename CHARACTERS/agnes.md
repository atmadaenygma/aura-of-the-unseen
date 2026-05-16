# Agnes

## Identity
- Name: Agnes
- Role: Plantation Enforcer, Overseer's Wife
- Race: White
- Age: Late 40s
- Occupation: Enforcer, household authority

## Game Mechanics
- Can Be Mimicked: YES
- Mimicry Complexity: STANDARD
- Accuracy Items Required: 0
- Suspicion Threshold: 0.6
- Role Category: AUTHORITY

## Perception Stats
- Sight Range: 350
- Hearing Range: 280
- Sight Angle: 105

## Locations
- Primary Location: overseers_house_exterior
- Secondary Location: test_house (patrols)
- Spawn Points: [(1139, 652) at overseers_house_exterior], patrol routes on grounds
- Availability: All hours except 2300–0500 (sleeps)

## Appearance
- Asset Path: /sprites/npcs/agnes/${direction}_${state}.webm
- Display Name: Agnes

## NPC Behavior States
- Default State: ALERT
- Lazy: Rare; mostly patrolling or conducting interrogations
- Alert: Active patrolling, watches for disturbances, methodical sweeps
- Suspicious: Increases patrol frequency, stops and questions NPCs, searches areas
- State Transition Triggers: Overseer's suspicion, direct observation, inconsistencies in NPC behavior

## Suspicion Tracking
- Current Suspicion Level: 0.0
- Suspicion Threshold: 0.6
- Suspicion Increases From: Being caught observing, direct interrogation, Overseer's reports
- Suspicion Decreases From: Time without incident, successful patrol completion

## Dialogue & Barks
- Dialogue Keys: [agnes_greeting, agnes_interrogation, agnes_command]
- observeCatchBark: "Stop staring at me like that."
- observeCatchDialogue: agnes_observe_catch
- alert_bark: "Something's not right."
- interrogation_bark: "Talk. Now."

## NPC Interactions
- Aura Reactions:
  - genetic_memory: suspicious
  - mimicry: hostile (if detected)
  - social_crypsis: indifferent
- Can Be Traded With: NO
- Can Be Observed: YES
- Can Items Be Stolen: NO

## Observation Mechanics
- Observation Time Required: 360 frames (~6 seconds at 60fps)
- Observation Special Flags: STANDARD_MIMICRY
- Observation XP Reward: 40 XP

## Relationships With Other NPCs
- The Overseer: Husband, shares authority, absolute loyalty
- Silas: Suspect, watches constantly, high suspicion

## Accuracy Items
- N/A (standard mimicry, no accuracy items required)

## Merchant Data
- N/A

## Detection & Interrogation
- If Maya is caught observing: Fires observeCatchBark, does NOT escalate to dialogue (just bark)
- Role-based response: AUTHORITY role → immediate action (restraint, pursuit, or interrogation)
- Quicker to act: Agnes responds to threats faster than Overseer (lower suspicion threshold: 0.6 vs 0.8)
- Interrogation capability: Can extract information from other NPCs if they're present
- Investigation escalation: Reports findings directly to Overseer

## Additional Mechanics
- Mimicry psychological cost: Her aura is simpler but colder; using it suppresses empathy and warmth
- Base mimicry form: Observation fills, can equip immediately (no accuracy items needed)
- Authority mimicry: Allows Maya to issue orders, access patrolled areas
- State propagation: Agnes's alertness level affects other patrol NPCs (future mechanic)

## Additional Mechanics
- Quicker detection: Lower threshold (0.6) means she suspects sooner than Overseer
- Patrol patterns: Regular sweeps make her detection risk consistent
- Interrogation mechanic: Can question other NPCs to extract information about Maya

## Notes
- Test NPC for standard mimicry, authority role, and faster threat detection
- Represents mid-difficulty mimicry target in test environment
- Her quicker response time (lower suspicion threshold) makes her a primary threat
- Using her aura is mechanically simpler but psychologically risky
- Can be evaded but harder to negotiate with than passerby NPCs
