export const WORLD_MANIFEST = {
  "test_house": {
    id: "test_house",
    path: "/textures/test_house",
    exitTo: "test_house", // Loop for Alpha testing
    
    // 1. STATIC ENTITIES (mask_entities.png)
    entities: {
      "255,0,0": { 
        id: "cabinet", name: "Oak Cabinet", type: "JOURNAL", 
        text: "Hidden in the false bottom: a list of names. Not guests, but property.", 
        impact: -5 
      },
      "255,0,255": { 
        id: "table", name: "Dining Table", type: "READ", 
        text: "The porcelain is cold. The history here is etched into the wood grain.", 
        impact: -2 
      }
    },

    // 2. HIDING SPOTS (mask_hiding.png)
    hidingSpots: {
      "0,255,255": { id: "under_bed", name: "Under the Bed", type: "HIDE" }
    },
    
    // 3. THE INHABITANTS (mask_npcs.png + Proximity)
    // IMPORTANT: The keys below must match the RGB colors on your mask.
    npcs: {
      "0,255,0": { // PURE GREEN on mask_npcs.png
        id: "silas",
        name: "Old Silas",
        assetPath: "/sprites/npcs/silas_idle.webm",
        spawnX: 1100, // Update with 'G' grid
        spawnY: 720,
        dialogueKey: "silas_intro" // Points to dialogue.js
      },
      "255,0,0": { // PURE RED on mask_npcs.png
        id: "overseer",
        name: "The Overseer",
        assetPath: "/sprites/npcs/overseer_idle.webm",
        spawnX: 450, 
        spawnY: 550,
        // No dialogueKey? He uses the Bark Engine instead
        barks: [
          "Get to work!",
          "Don't you have things that need doin'?",
          "Move along, nigger.",
          "I'm watchin' you, traveler."
        ]
      }
    },

    // 4. DEPTH OVERLAYS (Visual layers)
    overlays: [
      { id: "table_layer", filename: "table_overlay.png", yDepth: 620 }
    ]
  }
};