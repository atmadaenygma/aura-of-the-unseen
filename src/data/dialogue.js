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
    text: "Stranger. You move with a heavy gait for someone so light on their feet. The dust on your boots didn't come from Georgia.",
    introspection: "He is searching your VOC cloud with his instincts. He doesn't see Maya; he sees a ripple in reality.",
    options: [
      { text: "'The road is long, Silas. I am simply tired.'", next: "silas_hub" },
      { 
        text: "[Mimicry] (Match the local drawl) 'Just a laborer lookin' for work in the square, Old Man.'", 
        check: { skill: "Mimicry", difficulty: 8 }, 
        success: "silas_mimicry_success", 
        failure: "silas_mimicry_fail" 
      }
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
      { text: "Who is the man standing in the yard? (The Overseer)", next: "branch_overseer", requireNoFlag: "silas_betrayed" },
      {
        text: "[Genetic Memory] (Peer into the wood grain) 'I can feel the history of the hands that built this porch.'",
        facet: "genetic_memory",
        next: "branch_truth",
        requireNoFlag: "silas_betrayed",
      },
      { text: "'You seem troubled. What is it?'", next: "silas_note_request", requireNoFlag: "silas_betrayed" },
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
      },
      {
        text: "'It's yours, Silas. Think nothing of it.'",
        next: "silas_hub",
        takeItem: "folded_note",
        flagTrigger: "silas_note_delivered",
        impact: 5,
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
    text: "Laborer? Your voice has the hollow ring of a bell in an empty church. You're a ghost in a suit, boy. I'm watchin' you.",
    introspection: "CRITICAL FAILURE: Suspicion is high. Your disguise is losing its grip on his consciousness.",
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
      { text: "[You are taken.]", next: null, clearStolen: true, impact: -30, flagTrigger: "detained_by_overseer" },
    ]
  },
};