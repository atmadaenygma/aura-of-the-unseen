# CHARACTER TEMPLATE

Use this structure for all character/NPC files. Maintain exact section order and formatting for program consistency.

---

## Identity
- Name:
- Role:
- Race:
- Age:
- Occupation:

## Game Mechanics
- Can Be Mimicked: [YES/NO]
- Mimicry Complexity: [NONE/SIMPLE/STANDARD/COMPLEX]
- Accuracy Items Required: [NUMBER or NONE]
- Suspicion Threshold: [VALUE 0–1.0]
- Role Category: [ALLY/AUTHORITY/PASSERBY/PATROL/MERCHANT]

## Perception Stats
- Sight Range: [PIXELS]
- Hearing Range: [PIXELS]
- Sight Angle: [DEGREES]

## Locations
- Primary Location: [LOCATION_ID]
- Secondary Location: [LOCATION_ID or NONE]
- Spawn Points: [COORDINATES or LIST]
- Availability: [TIME WINDOW or ALWAYS]

## Appearance
- Asset Path: [SPRITE_PATH]
- Display Name: [NAME_AS_SHOWN_IN_GAME]

## NPC Behavior States
- Default State: [LAZY/ALERT/SUSPICIOUS/IDLE]
- Lazy: [DESCRIPTION OF BEHAVIOR]
- Alert: [DESCRIPTION OF BEHAVIOR]
- Suspicious: [DESCRIPTION OF BEHAVIOR]
- State Transition Triggers: [WHAT CHANGES STATE]

## Suspicion Tracking
- Current Suspicion Level: [0–1.0]
- Suspicion Threshold: [VALUE]
- Suspicion Increases From: [LIST]
- Suspicion Decreases From: [LIST]

## Dialogue & Barks
- Dialogue Keys: [LIST_OF_ALL_DIALOGUE_IDS]
- observeCatchBark: "[TEXT]"
- observeCatchDialogue: [KEY or NONE]
- [OTHER BARK KEYS]

## NPC Interactions
- Aura Reactions: [JSON or LIST]
  - genetic_memory: [REACTION]
  - mimicry: [REACTION]
  - social_crypsis: [REACTION]
- Can Be Traded With: [YES/NO]
- Can Be Observed: [YES/NO]
- Can Items Be Stolen: [YES/NO]

## Observation Mechanics
- Observation Time Required: [FRAMES or SECONDS]
- Observation Special Flags: [NONE or LIST]
- Observation XP Reward: [AMOUNT or NONE]

## Relationships With Other NPCs
- [NPC_NAME]: [BRIEF MECHANICAL RELATIONSHIP or NONE]

## Accuracy Items (if applicable)
- Item 1: [ITEM_ID]
- Item 2: [ITEM_ID]
- Item 3: [ITEM_ID]

## Merchant Data (if MERCHANT role)
- Inventory: [ITEM_LIST or NONE]
- Prices: [CONFIG or NONE]
- Trade Types: [BUY/SELL/BARTER or NONE]

## Additional Mechanics
[Any special behaviors or systems not covered above]

## Notes
[Implementation notes, flags, or reminders]
