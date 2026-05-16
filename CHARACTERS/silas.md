# Silas

## Identity
- Name: Silas
- Role: Groundskeeper
- Race: African American
- Age: Late 20s/Early 30s
- Occupation: Groundskeeper, craftsman

## Game Mechanics
- Can Be Mimicked: NO
- Mimicry Complexity: NONE
- Accuracy Items Required: N/A
- Suspicion Threshold: N/A
- Role Category: ALLY

## Perception Stats
- Sight Range: 320
- Hearing Range: 220
- Sight Angle: 100

## Locations
- Primary Location: silas_cabin
- Secondary Location: overseers_house_exterior
- Spawn Points: [(477, 492) from overseers_house_exterior], [(897, 344) from silas_cabin]
- Availability: 0600–2200 (sleeps 2200–0600)

## Appearance
- Asset Path: /sprites/npcs/silas/${direction}_${state}.webm
- Display Name: Silas

## NPC Behavior States
- Default State: LAZY
- Lazy: Performing work tasks, low alertness, no active observation
- Alert: Movement increases, watches surroundings, responds to noises
- Suspicious: Watches Maya or other players more closely, may report to Overseer
- State Transition Triggers: Hears loud noises, sees Maya mimicking others, Overseer questions him

## Suspicion Tracking
- Current Suspicion Level: 0.0
- Suspicion Threshold: 0.9 (very high; trusted by Overseer)
- Suspicion Increases From: Being caught observing Maya, direct questioning by Overseer
- Suspicion Decreases From: Time without incident, successful task completion

## Dialogue & Barks
- Dialogue Keys: [silas_greeting, silas_casual, silas_alert]
- observeCatchBark: NONE (Silas is ally, cannot be observed by Maya)
- observeCatchDialogue: NONE
- alert_bark: "Something's not right..."

## NPC Interactions
- Aura Reactions: 
  - genetic_memory: neutral
  - mimicry: neutral
  - social_crypsis: neutral
- Can Be Traded With: NO
- Can Be Observed: NO (ally status)
- Can Items Be Stolen: NO

## Observation Mechanics
- Observation Time Required: N/A
- Observation Special Flags: ALLY_BLOCK
- Observation XP Reward: NONE

## Relationships With Other NPCs
- The Overseer: Master/servant (Overseer suspects Silas)
- Agnes: Watched by Agnes, increasingly suspicious

## Accuracy Items
- N/A

## Merchant Data
- N/A

## Additional Mechanics
- Ally flag prevents observation in Character.jsx
- Maya barks refusal when attempting to observe: "I don't want to mimic him" or "I have too much respect for him"
- No observation bar appears
- Cannot be added to knownAuras or mimicry dropdown

## Notes
- Test NPC for ally mechanics validation
- Representative of ally NPCs that players cannot mimic
- Silas's suspicion threshold is high because Overseer trusts him (for now)
