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
      { text: "Tell me about the history of this house.", next: "branch_history" },
      { text: "Who is the man standing in the yard? (The Overseer)", next: "branch_overseer" },
      { 
        text: "[Genetic Memory] (Peer into the wood grain) 'I can feel the history of the hands that built this porch.'", 
        facet: "genetic_memory",
        next: "branch_truth" 
      },
      { text: "[Leave] I must continue my journey.", next: null }
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
  }
};