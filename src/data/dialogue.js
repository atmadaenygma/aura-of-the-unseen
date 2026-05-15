/**
 * AURA OF THE UNSEEN: DIALOGUE LEDGER
 * Content: Silas Branching Tree
 * Status: SYNTACTICALLY LOCKED
 */

export const DIALOGUE_DATA = {
  // THE ENTRY POINT
  "silas_intro": {
    speaker: "Old Silas",
    side: "right",
    text: "Girl. What brings you out this way? Not many venture down this road unless they've got somewhere to be or something to find.",
    introspection: "He looks you over—just another young woman trying to get by. There's nothing about you that strikes him as unusual.",
    options: [
      { text: "(Respectful) 'I'm looking for honest work, sir. Hoping to find my way.'", next: "silas_respectful" },
      { text: "(Cautious) Lower your gaze and say nothing.", next: "silas_cautious" },
      { text: "(Curious) 'You seem to see a lot from this place, sir.'", next: "silas_curious" },
      {
        text: "[Mimic] (Adopt the local speech) 'Just lookin' for a day's wages, sir. Any work you got?'",
        check: { skill: "Mimicry", difficulty: 8 },
        success: "silas_mimicry_success",
        failure: "silas_mimicry_fail"
      }
    ]
  },

  // RESPECTFUL RESPONSE
  "silas_respectful": {
    speaker: "Old Silas",
    side: "right",
    text: "Mm. At least you've got manners. That's rarer than it used to be. Come—sit a moment. I've questions, and you might have answers.",
    options: [
      { text: "Continue", next: "silas_hub" }
    ]
  },

  // CAUTIOUS RESPONSE
  "silas_cautious": {
    speaker: "Old Silas",
    side: "right",
    text: "Wise. A girl who knows when to hold her tongue goes far in this world. I respect that. Come inside—we can talk proper.",
    options: [
      { text: "Continue", next: "silas_hub" }
    ]
  },

  // CURIOUS RESPONSE
  "silas_curious": {
    speaker: "Old Silas",
    side: "right",
    text: "Sharp. You see further than most. Yes, I know things. Travelers tell their stories if you listen long enough. Come—let's talk about where you're from.",
    options: [
      { text: "Continue", next: "silas_hub" }
    ]
  },

  // THE CENTRAL HUB
  "silas_hub": {
    speaker: "Old Silas",
    side: "right",
    text: "Well. You're here now. What is it you're seeking beneath this sun?",
    introspection: "The Hub. From here, you can probe his memories or assess the threat of the house.",
    options: [
      // ── Normal options — hidden after betrayal ──────────────────────────────
      { text: "Tell me about the history of this house.",             next: "branch_history",  requireNoFlag: "silas_betrayed" },
      { text: "Who is the man standing in the yard? (The Overseer)", next: "branch_overseer", requireNoFlag: "silas_betrayed", knowledgeGain: { the_overseer: 2 } },
      {
        text: "[Genetic Memory] (Peer into the wood grain) 'I can feel the history of the hands that built this porch.'",
        facet: "genetic_memory",
        next: "branch_truth",
        requireNoFlag: "silas_betrayed",
      },
      { text: "'You seem troubled. What is it?'", next: "silas_note_request", requireNoFlag: "silas_betrayed", flagTrigger: "silas_quest_asked", questHint: true },
      {
        text: "'I found something in the shelves — a folded note. Is it yours?'",
        next: "silas_note_receive",
        requireItem: "folded_note",
        takeItem: "folded_note",
        requireNoFlag: "silas_betrayed",
      },
      { text: "[Leave] I must continue my journey.", next: null, requireNoFlag: "silas_betrayed" },

      // ── Betrayal confrontation — only visible after silas_betrayed is set ──
      {
        text: "(His eyes are different. He knows.)",
        next: "silas_betrayed_confront",
        requireFlag: "silas_betrayed",
      },
    ]
  },

  // BRANCH: HISTORY
  "branch_history": {
    speaker: "Old Silas",
    side: "right",
    text: "This wood was laid in 1840. Beneath these very boards, people spent months in the dark, praying the hounds wouldn't catch the scent of their fear.",
    introspection: "Fact: Crawlspaces under Southern porches were frequently used as temporary 'Safe Zones' for those escaping via the Underground Railroad.",
    options: [
      { text: "Was anyone ever caught here?", next: "history_trauma" },
      { text: "[Back] Let's discuss something else.", next: "silas_hub" }
    ]
  },

  "history_trauma": {
    speaker: "Old Silas",
    side: "right",
    text: "Caught? No. They were 'reclaimed'. Like you'd reclaim a stray tool. The blood on these boards never dried, even if you can't see it with those eyes.",
    introspection: "Memory Unlocked: The Fugitive Slave Act of 1850. Silas is vibrating with the resonance of that era.",
    impact: -10,
    options: [
        { text: "[Back] I see. Let's talk of other things.", next: "silas_hub" }
    ]
  },

  // BRANCH: THE OVERSEER
  "branch_overseer": {
    speaker: "Old Silas",
    side: "right",
    text: "Him? That's Miller. He's got a nose for 'anomalies'. If he sees you moving too fast, or if your skin starts to flicker... well, he don't ask questions. He just uses the whip.",
    introspection: "NERVE SENSE: Miller's vision cone is 120 degrees. If you are not in Social Crypsis (Kneeling/Slow), detection is 3x faster.",
    facet: "nerve_sense",
    options: [
        { text: "How can I avoid him?", next: "overseer_stealth_tip" },
        { text: "[Back] Enough about Miller.", next: "silas_hub" }
    ]
  },

  "overseer_stealth_tip": {
    speaker: "Old Silas",
    side: "right",
    text: "Stay in the shadows of the furniture. Miller's eyes are trained for movement, not for the unseen details. Kneel when he passes.",
    options: [{ text: "[Back] Understood.", next: "silas_hub" }]
  },

  // BRANCH: TRUTHFUL HISTORY
  "branch_truth": {
    speaker: "Old Silas",
    side: "right",
    facet: "genetic_memory",
    text: "You talk like you were there. Maybe you were. Maybe your kind has always been watching us suffer.",
    introspection: "GENETIC MEMORY: 1888. The Reconstruction era is failing. The 'Unseen' entities are beginning to manifest more frequently as the social fabric of the South tears apart.",
    options: [
        { text: "We do not watch. We survive.", next: "silas_hub" },
        { text: "[Leave] I've heard enough.", next: null }
    ]
  },

  // ── THE FOLDED NOTE QUEST ────────────────────────────────────────────────────

  // Silas mentions the note — accessible from the hub
  "silas_note_request": {
    speaker: "Old Silas",
    side: "right",
    text: "There's a folded note I left in the shelves. My hands shake too badly to go looking. Would you find it for me?",
    introspection: "He isn't asking lightly. Whatever is in that note has weight.",
    options: [
      { text: "'I'll look for it, Silas.'", next: "silas_hub" },
      { text: "'What's written in it?'", next: "silas_note_secret" },
    ]
  },

  "silas_note_secret": {
    speaker: "Old Silas",
    side: "right",
    text: "Names. People who passed through here and kept moving north. I just need to know if mine is among them — or if I was always meant to stay.",
    options: [
      { text: "'I'll find it for you.'", next: "silas_hub" },
    ]
  },

  // Triggered by: GIVE mechanic (pendingGive → giveDialogue) OR dialogue option above.
  // takeItem on every choice ensures the note is removed regardless of which path opened this node.
  // The hub dialogue option also sets takeItem, but that's harmless if the item is already gone.
  "silas_note_receive": {
    speaker: "Old Silas",
    side: "right",
    text: "...You found it.",
    introspection: "He takes it without opening it. His hands have stopped shaking.",
    options: [
      {
        text: "'What does it say?'",
        next: "silas_note_truth",
        takeItem: "folded_note",
        knowledgeGain: { silas_pemberton: 2 },
      },
      {
        text: "'It's yours, Silas. Think nothing of it.'",
        next: "silas_hub",
        takeItem: "folded_note",
        flagTrigger: "silas_note_delivered",
        impact: 5,
        knowledgeGain: { silas_pemberton: 2 },
      },
    ]
  },

  "silas_note_truth": {
    speaker: "Old Silas",
    side: "right",
    text: "It says I was supposed to leave on a train. Winter of '71. Train never came. I stayed. Made a life from what was left. That is all any of us can do.",
    introspection: "MEMORY UNLOCKED: Silas missed the train. The train was freedom. He built his own, slowly, in the remaining years.",
    facet: "genetic_memory",
    options: [
      {
        text: "'You're still here. That matters, Silas.'",
        next: "silas_hub",
        flagTrigger: "silas_note_delivered",
        impact: 5,
        knowledgeGain: { silas_pemberton: 3 },
      },
    ]
  },

  // ── SILAS BETRAYAL CONFRONTATION ────────────────────────────────────────────

  "silas_betrayed_confront": {
    speaker: "Old Silas",
    side: "right",
    text: "Miller told me. Said someone brought him a note. My note. I looked for it in the shelves and it was gone. I thought you were different.",
    introspection: "He doesn't raise his voice. That's worse than if he had.",
    options: [
      {
        text: "'I'm sorry, Silas. I don't know what I was thinking.'",
        next: "silas_betrayed_forgive",
        impact: -10,
      },
      {
        text: "Say nothing. Look at the floor.",
        next: "silas_betrayed_cold",
        impact: -20,
      },
    ]
  },

  "silas_betrayed_forgive": {
    speaker: "Old Silas",
    side: "right",
    text: "Sorry doesn't put the note back. Sorry doesn't undo what Miller knows now. You'd best stay out of my sight for a while. I'll pray I'm wrong about you.",
    options: [
      { text: "[Leave]", next: null },
    ]
  },

  "silas_betrayed_cold": {
    speaker: "Old Silas",
    side: "right",
    text: "That's what I thought. Go on, then.",
    introspection: "He turns away. The conversation is over before it began.",
    options: [
      { text: "[Leave]", next: null },
    ]
  },

  // ── THE OVERSEER — ANTI QUEST ────────────────────────────────────────────────

  "overseer_note_take": {
    speaker: "The Overseer",
    side: "right",
    text: "Ha. Old Silas and his little train. We caught him at the station in the winter of '71 — pulled him off the platform in front of his wife. Dragged him back through the snow. He cried the whole way. Got exactly what was coming to him.",
    introspection: "He snatches it without reading it. To him it is nothing — a scrap. To Silas it was the only proof the train was ever real.",
    options: [
      {
        text: "Say nothing. Walk away.",
        next: null,
        takeItem: "folded_note",
        flagTrigger: "silas_betrayed",
        impact: -20,
        knowledgeGain: { the_overseer: 3, silas_pemberton: 2 },
      },
    ]
  },

  // CHECK RESULTS
  "silas_mimicry_success": {
    speaker: "Maya",
    side: "left",
    facet: "mimicry",
    text: "Just lookin' for a day's wages, Silas. Like anyone else. Just a traveler.",
    introspection: "MIMICRY: Success. The neurological frequency is locked. He sees exactly what he expects to see.",
    options: [{ text: "Return to the conversation.", next: "silas_hub" }]
  },

  "silas_mimicry_fail": {
    speaker: "Old Silas",
    side: "right",
    text: "Laborer? Your voice has the hollow ring of a bell in an empty church. Something's not right about you, girl. I'm watchin' you.",
    introspection: "CRITICAL FAILURE: Suspicion is high. Your accent didn't hold up to scrutiny.",
    impact: -20,
    options: [{ text: "[Try to recover] Wait, Silas...", next: "silas_hub" }]
  },

  // ── OVERSEER: STOLEN GOODS DETECTION ─────────────────────────────────────────

  "overseer_stolen_goods_check": {
    speaker: "The Overseer",
    side: "right",
    text: "Hold on there. I've been watching you — going through the rooms, poking around where you don't belong. Empty that bag. Right now.",
    introspection: "His eyes are on your satchel. He's not asking.",
    options: [
      {
        text: "(Hand over everything stolen.)",
        next: "overseer_stolen_comply",
        clearStolen: true,
        impact: -5,
      },
      {
        text: "'These are my own things, sir. I brought them with me.'",
        next: "overseer_stolen_bluff_success",
        requireFlag: "stolen_bluff_viable",
      },
      {
        text: "'These are my own things, sir. I brought them with me.'",
        next: "overseer_stolen_caught",
        requireNoFlag: "stolen_bluff_viable",
      },
    ]
  },

  "overseer_stolen_comply": {
    speaker: "The Overseer",
    side: "right",
    text: "That's what I thought. Now get out of my sight before I change my mind about letting you walk.",
    introspection: "He takes it all without looking twice. The items are gone. You are dismissed.",
    options: [
      { text: "[Leave]", next: null },
    ]
  },

  "overseer_stolen_bluff_success": {
    speaker: "The Overseer",
    side: "right",
    text: "...*Long look.* Go on then. But I'll be keeping both eyes on you. Don't let me catch you drifting again.",
    introspection: "He lets you pass. For now. Your composure held — just barely.",
    options: [
      { text: "[Leave quietly]", next: null },
    ]
  },

  "overseer_stolen_caught": {
    speaker: "The Overseer",
    side: "right",
    text: "Don't lie to me, girl. I can see it on your face. You think I don't know thieving hands when I see them? You'll be answering for this in irons.",
    introspection: "He calls for the others. There is no talking your way out of this.",
    options: [
      { text: "[You are taken.]", next: null, clearStolen: true, impact: -30, flagTrigger: "detained_by_overseer", knowledgeGain: { the_overseer: 4 } },
    ]
  },

  "angus_catch": {
    speaker: "Angus",
    side: "right",
    portrait: '/ui/portraits/angus_portrait.png',
    text: "Well, well. What do we have here? A little shadow in my house.",
    introspection: "Her eyes are bright. She is pleased to have caught you.",
    options: [
      {
        text: "You think you can hold me?",
        next: "angus_catch_resist",
      },
      {
        text: "[Say nothing. Try to escape with cunning.]",
        next: "angus_catch_cunning",
        check: { skill: "cunning", difficulty: 12 },
        success: "angus_catch_escape",
        failure: "angus_catch_fail",
      },
    ]
  },

  "angus_catch_resist": {
    speaker: "Angus",
    side: "right",
    portrait: null,
    text: "You don't understand what you are, do you? That's what makes you special. That's what he needs. You, moving through the world like you own it. Like you're invisible. But I see you. I always see you.",
    introspection: "She steps closer. Her grip is certain.",
    options: [
      {
        text: "[Try to escape with cunning.]",
        next: "angus_catch_cunning",
        check: { skill: "cunning", difficulty: 12 },
        success: "angus_catch_escape",
        failure: "angus_catch_fail",
      },
    ]
  },

  "angus_catch_cunning": {
    speaker: "Angus",
    side: "right",
    portrait: null,
    text: "My husband talks about women like you. Women who think they're different. But you're not different. You're just... delayed.",
    introspection: "She's distracted by her own voice. For a moment, her grip loosens.",
    options: [
      {
        text: "[Break free and run.]",
        next: null,
        flagTrigger: "escaped_angus",
        impact: -8,
      },
    ]
  },

  "angus_catch_escape": {
    speaker: "Angus",
    side: "right",
    portrait: null,
    text: "You! Get back here!",
    introspection: "You wrench yourself free. Her hands slip. The edge of the room is suddenly close.",
    options: [
      {
        text: "[Run.]",
        next: null,
        flagTrigger: "escaped_angus",
        impact: -5,
      },
    ]
  },

  "angus_catch_fail": {
    speaker: "Angus",
    side: "right",
    portrait: '/ui/portraits/angus_portrait.png',
    text: "I felt that. Oh, you're clever, but not clever enough. My husband is going to love this.",
    introspection: "Her grip tightens. You are caught.",
    options: [
      {
        text: "[You are taken.]",
        next: null,
        flagTrigger: "detained_by_angus",
        impact: -25,
        knowledgeGain: { angus: 3 },
        resetGame: true,
      },
    ]
  },

  "overseer_catch": {
    speaker: "The Overseer",
    side: "right",
    portrait: '/ui/portraits/overseer_portrait.png',
    text: "Well, well. Look what we have here. Thought you could sneak around my property, did you?",
    introspection: "His eyes are cold. There is no mercy in them.",
    options: [
      {
        text: "I wasn't doing anything wrong.",
        next: "overseer_catch_deny",
      },
      {
        text: "[Try to run past him.]",
        next: "overseer_catch_run",
        check: { skill: "athleticism", difficulty: 14 },
        success: "overseer_catch_escape",
        failure: "overseer_catch_fail",
      },
    ]
  },

  "overseer_catch_deny": {
    speaker: "The Overseer",
    side: "right",
    portrait: '/ui/portraits/overseer_portrait.png',
    text: "Wasn't doin' anything wrong? You're trespassin' on my property, and I don't take kindly to liars.",
    introspection: "He steps closer, blocking the path.",
    options: [
      {
        text: "[Try to run past him.]",
        next: "overseer_catch_run",
        check: { skill: "athleticism", difficulty: 14 },
        success: "overseer_catch_escape",
        failure: "overseer_catch_fail",
      },
    ]
  },

  "overseer_catch_run": {
    speaker: "The Overseer",
    side: "right",
    portrait: '/ui/portraits/overseer_portrait.png',
    text: "You think you're faster than me? I've been runnin' these grounds for thirty years.",
    introspection: "He moves with surprising speed for a man his size.",
    options: [
      {
        text: "[Keep running.]",
        next: null,
      },
    ]
  },

  "overseer_catch_escape": {
    speaker: "The Overseer",
    side: "right",
    portrait: '/ui/portraits/overseer_portrait.png',
    text: "Get outta here! And don't let me catch you again!",
    introspection: "You slip past him. The exit is ahead.",
    options: [
      {
        text: "[Run.]",
        next: null,
        flagTrigger: "escaped_overseer",
        impact: -10,
      },
    ]
  },

  "overseer_catch_fail": {
    speaker: "The Overseer",
    side: "right",
    portrait: '/ui/portraits/overseer_portrait.png',
    text: "Thought so. You're comin' with me, and you're gonna answer some questions about what you were doin' here.",
    introspection: "His grip is iron. There is no escape.",
    options: [
      {
        text: "[You are taken.]",
        next: null,
        flagTrigger: "detained_by_overseer",
        impact: -30,
        knowledgeGain: { the_overseer: 2 },
        resetGame: true,
      },
    ]
  },

  "silas_cabin_greeting": {
    speaker: "Old Silas",
    side: "right",
    text: "Welcome. Rest here if you need to. This house holds its secrets close, but I keep what's mine. There's something I need... if you're willing to help.",
    options: [
      { text: "'What do you need?'", next: "silas_cabin_quest" },
      { text: "[Leave]", next: null },
    ]
  },

  "silas_cabin_quest": {
    speaker: "Old Silas",
    side: "right",
    text: "There's a note... folded, hidden somewhere in the house. It was written long ago. I need to know if it still exists. If you find it, bring it to me.",
    options: [
      { text: "'I'll look for it.'", next: null, flagTrigger: "silas_quest_asked", questHint: true },
      { text: "'I already have it.'", next: "silas_cabin_quest_found", requireItem: "folded_note", takeItem: "folded_note" },
      { text: "[Leave]", next: null },
    ]
  },

  "silas_cabin_quest_found": {
    speaker: "Old Silas",
    side: "right",
    text: "You found it... After all these years. Thank you. This means more than you know.",
    options: [
      { text: "[Leave]", next: null, flagTrigger: "silas_note_delivered" },
    ]
  },
};