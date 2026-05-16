# The Overseer

## Identity
- Name: [Unknown—referred to as "The Overseer"]
- Role: Plantation Overseer, local authority
- Race: White
- Age: 50s–60s
- Occupation: Plantation Administrator

## Game Mechanics
- Can Be Mimicked: YES
- Mimicry Complexity: COMPLEX
- Accuracy Items Required: 3
- Suspicion Threshold: 0.8
- Role Category: AUTHORITY

## Perception Stats
- Sight Range: 400
- Hearing Range: 300
- Sight Angle: 110

## Locations
- Primary Location: overseers_house_exterior
- Secondary Location: test_house (patrols)
- Spawn Points: [(1139, 652) at overseers_house_exterior], [(1266, 514) at test_house from silas_cabin exit]
- Availability: 0600–1800 (patrols); private evenings 1800–2300

## Appearance
- Asset Path: /sprites/npcs/overseer/${direction}_${state}.webm
- Display Name: The Overseer

## NPC Behavior States
- Default State: ALERT
- Lazy: Rare; mostly administrative work indoors
- Alert: Patrols grounds, watches for disturbances, methodical
- Suspicious: Increased patrols, questions NPCs, reports escalate
- State Transition Triggers: Strange activity reports, Maya's mimicry detected, suspicion threshold breached

## Suspicion Tracking
- Current Suspicion Level: 0.0
- Suspicion Threshold: 0.8
- Suspicion Increases From: Observing Maya, detection by NPCs, inconsistencies in NPC reports
- Suspicion Decreases From: Time without incident (very slow decay)

## Dialogue & Barks
- Dialogue Keys: [overseer_formal, overseer_interrogation, overseer_command]
- observeCatchBark: "What are you doing?"
- observeCatchDialogue: overseer_observe_catch
- alert_bark: "Something is wrong here..."
- interrogation_bark: "I want answers."

## NPC Interactions
- Aura Reactions:
  - genetic_memory: suspicious
  - mimicry: hostile (if detected)
  - social_crypsis: indifferent
- Can Be Traded With: NO
- Can Be Observed: YES
- Can Items Be Stolen: YES (diary, letters, personal effects)

## Observation Mechanics
- Observation Time Required: 360 frames (~6 seconds at 60fps)
- Observation Special Flags: COMPLEX_MIMICRY, ACCURACY_REQUIRED
- Observation XP Reward: 50 XP

## Relationships With Other NPCs
- Agnes: Wife, co-authority, absolute loyalty
- Silas: Employee, increasingly suspicious of hidden intelligence

## Accuracy Items (Required for full mimicry)
- overseer_diary
- overseer_correspondence
- overseer_personal_seal

## Merchant Data
- N/A

## Detection & Interrogation
- If Maya is caught observing: Fires observeCatchBark + observeCatchDialogue
- Role-based response: AUTHORITY role → escalates to full interrogation
- Investigation escalation: Calls Agnes to conduct patrols/interrogations
- Full alert: Sets gameState.wanted = true if suspicion exceeds threshold

## Additional Mechanics
- Proximity aura drain: Being near Overseer drains Maya's aura stability faster (~1.5x normal rate) due to psychological pressure
- Mimicry psychological cost: Inhabiting his aura risks absorbing his certainty and cruelty
- Complex mimicry requirement: Without all 3 accuracy items, social interactions with Agnes or household NPCs will detect oddities
- Base mimicry form: Observation only, can equip but socially risky

## Notes
- Test NPC for complex mimicry, authority role, and detection mechanics
- Represents highest-difficulty mimicry target in test environment
- Accuracy items (diary, letters, seal) must be stolen or discovered to perfect mimicry
- His suspicion escalates slowly but eventually reaches tipping point
