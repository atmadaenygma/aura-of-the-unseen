// ── NPC Observation Registry ─────────────────────────────────────────────────
// Drives the Mimicry ability: how long Maya must observe each NPC and
// whether special conditions (items / knowledge) are required to unlock
// their form.
//
// timeRequired: frames of right-click hold at 60fps needed to reach 100%.
// special:      if true, reaching 100% observation is NOT enough alone.
//               Maya must also have the listed items and knowledge entries
//               before the form is unlocked.

export const NPC_OBSERVATION = {
  silas_pemberton: {
    timeRequired: 360,  // ~6 seconds at 60fps
    special: false,
  },
  the_overseer: {
    timeRequired: 720,  // ~12 seconds at 60fps
    special: true,
    itemsRequired:     ['personal_letter', 'signet_ring'],
    knowledgeRequired: ['the_overseer_system'],
    lockedMessage:
      'You do not yet know enough of this person to map their frequency. Gather more evidence first.',
  },
};

// Fallback for any NPC not explicitly listed
export const DEFAULT_OBSERVATION = {
  timeRequired: 360,
  special: false,
};

// ── Ability XP / Level table ──────────────────────────────────────────────────
// Index = level. Value = cumulative XP required to reach that level.
export const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500];
export const MAX_ABILITY_LEVEL = XP_PER_LEVEL.length - 1; // 5

// ── Passive Ability Definitions ───────────────────────────────────────────────
// Genetic Memory and Nerve Sense are always active. Their effects scale by level.
export const PASSIVE_ABILITIES = [
  {
    id: 'genetic_memory',
    name: 'Genetic Memory',
    img: '/ui/concious_thoughts/genetic_memory.png',
    levelDesc: [
      'Fragments of ancestral memory surface near historical objects.',
      'Ancestral knowledge flows more readily. Historical tiers unlock faster.',
      'Deep memory resonance. Artefacts carry full ancestral context.',
      'You feel the weight of generations. Knowledge becomes instinct.',
      'The full continuum of memory is open to you.',
    ],
    xpSource: 'Gained by discovering artefacts and unlocking knowledge entries.',
  },
  {
    id: 'nerve_sense',
    name: 'Nerve Sense',
    img: '/ui/concious_thoughts/nerve_sense.png',
    levelDesc: [
      'A subtle awareness of nearby intent. Threats register faintly.',
      'Wider emotional reading. NPC suspicion levels become perceptible.',
      'Deep threat detection. You sense hostility before it manifests.',
      'You read the room at a glance. Nothing escapes your perception.',
      'Total situational awareness. The social field is transparent to you.',
    ],
    xpSource: 'Gained by moving through high-suspicion spaces undetected.',
  },
];
