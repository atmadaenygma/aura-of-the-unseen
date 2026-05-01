/**
 * AURA OF THE UNSEEN: OBLIGATIONS REGISTRY
 * Each quest defines its own visibility and stage-completion logic
 * against live gameState — no separate "quest state" to keep in sync.
 */

export const QUEST_REGISTRY = [
  {
    id: 'the_folded_note',
    title: 'THE FOLDED NOTE',
    premise:
      "Silas left something in the shelves. His hands shake too badly to fetch it himself. " +
      "He didn't say what was written inside — only that he needed to know if his name was among the names.",
    stages: [
      {
        text: 'Find out what Silas needs.',
        doneIf: (gs) =>
          (gs.inventory || []).some((i) => i?.id === 'folded_note') ||
          !!gs.flags?.silas_note_delivered ||
          !!gs.flags?.silas_betrayed,
      },
      {
        text: 'Retrieve the folded note from somewhere in the house.',
        doneIf: (gs) =>
          !!gs.flags?.silas_note_delivered || !!gs.flags?.silas_betrayed,
      },
      {
        text: 'Return the note to its rightful owner.',
        doneIf: (gs) => !!gs.flags?.silas_note_delivered,
      },
    ],
    failedIf: (gs) => !!gs.flags?.silas_betrayed,
    failText:
      "You gave the note to the Overseer. He laughed. Silas knows what was done — and by whom.",
    visibleIf: () => true,
  },
];
