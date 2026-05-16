# Revelation Types — Maya's Consciousness System

Maya perceives and unlocks different types of knowledge throughout the game. Each revelation type has an abstract name, a visual identifier (graphic asset), and a trigger mechanism (dialogue prefix or game event).

## Active Revelation Types

| Abstract Name | Current Trigger | Asset File | Status |
|---|---|---|---|
| **Contextual Imprint** | `Fact:` prefix in dialogue | `perception.png` | ✓ Active |
| **Memetic Acquisition** | `Memory Unlocked:` / `MEMORY UNLOCKED:` prefix | `knowledge.png` | ✓ Active |
| **Neural Attunement** | `NERVE SENSE:` prefix in dialogue | `nerve_sense.png` | ✓ Active (legacy name) |
| **Ancestral Resonance** | `GENETIC MEMORY:` prefix in dialogue | `genetic_memory.png` | ✓ Active (legacy name) |
| **Somatic Projection** | `MIMICRY:` prefix in dialogue | `mimicry.png` | ✓ Active (legacy name) |

---

## Future Revelation Types

These are placeholder names for new revelation categories. Create new graphics using these file names:

| Abstract Name | Purpose | Suggested File |
|---|---|---|
| **Cognitive Fracture** | Triggered when a critical check fails; Maya's consciousness fractures momentarily | `cognitive_fracture.png` |
| **Empathic Resonance** | When Maya strongly resonates with an NPC's emotional state | `empathic_resonance.png` |
| **Phasic Stillness** | When Maya enters a meditative or protective stillness state | `phasic_stillness.png` |
| **Volitional Surge** | When Maya's willpower manifests visibly or overcomes resistance | `volitional_surge.png` |
| **Liminal Sensing** | When Maya senses something at the threshold between states (alive/dead, present/absent) | `liminal_sensing.png` |
| **Somatic Disruption** | When pain or physical trauma triggers a revelation | `somatic_disruption.png` |
| **Behavioral Subsumption** | When Maya successfully subsumes into a social role or disguise | `behavioral_subsumption.png` |
| **Kinetic Assertion** | When Maya demonstrates supernatural physical power | `kinetic_assertion.png` |

---

## Design Notes

- All revelation type names follow a consistent pattern: **[Adjective/Qualifier] [Process/State Noun]**
- The names evoke a sci-fi/paranormal aesthetic aligned with the game's mysterious atmosphere
- Each graphic should visually represent the revelation type's essence
- Asset files are stored in `public/ui/concious_thoughts/` and displayed full-width in the dialogue revelation banner
- The revelation label appears in uppercase (CSS `textTransform`) below the graphic and above the revelation text
