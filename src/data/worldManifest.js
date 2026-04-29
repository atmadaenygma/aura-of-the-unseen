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
    // Key must match the RGB color painted on mask_hiding.png (fuzzy-snapped to 0/255).
    // Current mask uses white (255,255,255) for all hiding zones.
    // For a large game with multiple distinct hiding spots, paint each in a unique color
    // and add a corresponding key here.
    hidingSpots: {
      "255,255,255": { id: "under_bed", name: "Under the Bed", type: "HIDE" }
    },
    
    // 3. THE INHABITANTS (mask_npcs.png + Proximity)
    // IMPORTANT: The keys below must match the RGB colors on your mask.
    npcs: {
      "0,255,0": { // PURE GREEN on mask_npcs.png
        id: "silas",
        name: "Old Silas",
        assetPath: "/sprites/npcs/silas_idle.webm",
        spawnX: 848,
        spawnY: 414,
        dialogueKey: "silas_intro" // Points to dialogue.js
      },
      "255,0,0": { // PURE RED on mask_npcs.png
        id: "overseer",
        name: "The Overseer",
        assetPath: "/sprites/npcs/overseer_idle.webm",
        spawnX: 448,
        spawnY: 456,
        // No dialogueKey? He uses the Bark Engine instead
        barks: [
          "Get to work!",
          "Don't you have things that need doin'?",
          "Move along, nigger.",
          "I'm watchin' you, traveler."
        ]
      }
    },

    // 4. TERRAIN SURFACES (mask_terrain.png)
    // Keys must match the RGB colors painted on mask_terrain.png (fuzzy-snapped to 0/255).
    // These are consumed by Stage to update gameState.currentTerrain, which drives
    // footstep audio and future surface-based modifiers.
    //
    // CURRENT STATE: mask_terrain.png is white/black only — all floor reads as "255,255,255".
    // To add surface differentiation, paint zones in distinct colors and add entries here.
    // Suggested color convention:
    //   "255,255,255" = wood floor (default)
    //   "255,165,0"   = carpet / rug
    //   "0,255,0"     = grass / outdoor
    //   "139,90,43"   = mud / dirt (approximates to "255,0,0" after fuzzy snap — use carefully)
    terrainSurfaces: {
      "0,0,0":       { id: "obstacle",    label: "Obstacle",    footstep: null     },
      "255,255,255": { id: "wood_floor",  label: "Wood Floor",  footstep: "wood"   },
      "255,0,0":     { id: "carpet",      label: "Carpet",      footstep: "soft"   },
      "0,255,0":     { id: "grass",       label: "Grass",       footstep: "grass"  },
      "0,0,255":     { id: "threshold",   label: "Threshold",   footstep: "stone"  },
    },

    // 5. DEPTH OVERLAYS (Visual layers)
    overlays: [
      { id: "table_layer", filename: "table_overlay.png", yDepth: 620 }
    ]
  }
};