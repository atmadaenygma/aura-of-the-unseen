export const WORLD_MANIFEST = {
  "test_house": {
    id: "test_house",
    path: "/textures/test_house",
    exitTo: "test_house", // Loop for Alpha testing

    // 1. STATIC ENTITIES — proximity-based detection (x, y, radius in world units)
    //
    // Workflow:
    //   1. Enable debug mode — walk Maya next to the object
    //   2. Read the XY coords from the crosshair/telemetry bar
    //   3. Set x,y to the object's centre, radius to taste (40–70 is typical)
    //   4. No mask painting needed — mask_entities.png is no longer used
    //
    // Maya triggers [E] when Math.hypot(maya.x - ent.x, maya.y - ent.y) < radius
    entities: {
      large_cabinet: {
        id: "large_cabinet", name: "Large Cabinet", type: "CONTAINER",
        x: 202, y: 474, radius: 55,
        loot: [
          { id: "folded_cloth", name: "Folded Cloth",    description: "A worn square of rough-spun cotton. Someone's old handkerchief." },
          { id: "broken_button", name: "Bone Button",    description: "Cracked clean through. Carved from bone, common on a working man's coat." },
          { id: "wax_paper",    name: "Wax Paper",       description: "Wrapped around something greasy once. Nothing left now." },
        ]
      },
      shelves: {
        id: "shelves", name: "Shelves", type: "CONTAINER",
        x: 503, y: 302, radius: 50,
        loot: [
          { id: "candle_stub",  name: "Candle Stub",     description: "Half a tallow candle. Still has a wick." },
          { id: "small_bottle", name: "Small Bottle",    description: "Brown glass, cork stopper. A few drops of something medicinal remain." },
          { id: "folded_note",  name: "Folded Note",     description: "The handwriting is shaky. The message is worse." },
        ]
      },
      dresser_1: {
        id: "dresser_1", name: "Dresser", type: "CONTAINER",
        x: 593, y: 355, radius: 50,
        loot: [
          { id: "tin_comb",    name: "Tin Comb",         description: "Missing two teeth. Still works." },
          { id: "dried_flower", name: "Dried Flower",    description: "Pressed flat between papers. Lavender, maybe. Long dead." },
        ]
      },
      small_lamp_stand: {
        id: "small_lamp_stand", name: "Small Lamp Stand", type: "READ",
        x: 781, y: 331, radius: 40,
        text: "",
        impact: 0
      },
      dresser_2: {
        id: "dresser_2", name: "Dresser", type: "CONTAINER",
        x: 922, y: 298, radius: 50,
        loot: [
          { id: "rag_strip",   name: "Torn Rag",         description: "Brownish stain on one end. Could be rust. Could be something else." },
          { id: "copper_coin", name: "Copper Coin",      description: "Worn smooth. You can barely make out the face." },
          { id: "nail",        name: "Iron Nail",        description: "Bent but solid. Could still hold something together." },
        ]
      },
      rubbage: {
        id: "rubbage", name: "Rubbage", type: "CONTAINER",
        x: 606, y: 740, radius: 50,
        loot: [
          { id: "scrap_paper", name: "Scrap of Paper",   description: "Half-burned at one edge. A list of names, or what's left of one." },
          { id: "old_rag",     name: "Old Rag",          description: "Filthy. Smells of ash and sweat." },
          { id: "bent_pin",    name: "Bent Pin",         description: "A sewing pin, bent nearly double. Useless as it is." },
          { id: "wood_chip",   name: "Wood Chip",        description: "Splintered off something larger. Nothing special." },
        ]
      },
    },

    // 2. HIDING SPOTS (mask_hiding.png)
    // Key must match the RGB color painted on mask_hiding.png (fuzzy-snapped to 0/255).
    hidingSpots: {
      "255,255,255": { id: "under_bed", name: "Under the Bed", type: "HIDE" }
    },

    // 3. THE INHABITANTS (mask_npcs.png disabled — manifest coordinates are authoritative)
    npcs: {
      "0,255,0": {
        id: "silas",
        name: "Old Silas",
        assetPath: "/sprites/npcs/silas_idle.webm",
        spawnX: 848,
        spawnY: 414,
        dialogueKey: "silas_intro",
        gives: {
          folded_note:  { giveDialogue: "silas_note_receive" },
          tin_comb:     { text: "I have no use for that.",  takes: false },
          dried_flower: { text: "My wife will like this.",  takes: true  },
          defaultBarks: [
            "I don't need that.",
            "What's that for?",
            "That's kind of you, but no.",
            "I'm alright, child.",
          ],
        }
      },
      "255,0,0": {
        id: "overseer",
        name: "The Overseer",
        assetPath: "/sprites/npcs/overseer_idle.webm",
        scale: 1.39,
        spawnX: 448,
        spawnY: 456,
        barks: [
          "Get to work!",
          "Don't you have things that need doin'?",
          "Move along, nigger.",
          "I'm watchin' you, traveler."
        ],
        gives: {
          folded_note:  { giveDialogue: "overseer_note_take" },
          tin_comb:     { text: "Why did you steal that from me? Give it back.", takes: true  },
          dried_flower: { text: "Stop playing and get back to work.",            takes: false },
          defaultBarks: [
            "Why are you playing around?",
            "What do you want?",
            "Get back to work.",
            "Stop pestering me.",
          ],
          suspicion: {
            gainPerGive:  1,
            threshold:    3,
            warningBark:  "I'm on to you, girl. Don't test me.",
            failureBark:  "That's enough. I see exactly what you're doing. Your kind always thinks they're clever.",
          },
        }
      }
    },

    // 4. TERRAIN SURFACES (mask_terrain.png)
    // Keys match RGB colors on the mask (fuzzy-snapped to 0/255).
    terrainSurfaces: {
      "0,0,0":       { id: "obstacle",   label: "Obstacle",   footstep: null    },
      "255,255,255": { id: "wood_floor", label: "Wood Floor", footstep: "wood"  },
      "255,0,0":     { id: "carpet",     label: "Carpet",     footstep: "soft"  },
      "0,255,0":     { id: "grass",      label: "Grass",      footstep: "grass" },
      "0,0,255":     { id: "threshold",  label: "Threshold",  footstep: "stone" },
    },

    // 5. DEPTH OVERLAYS
    //
    // yDepth — the world-space Y of the object's front edge.
    //   Maya's zIndex = Math.floor(pos.y). If yDepth > Maya's y, overlay renders in front.
    //   Use the debug crosshair to find the front edge Y of each piece of furniture.
    //
    // hidingOverlay:true — this overlay jumps to zIndex 9500 when isMayaHidden is true,
    //   covering Maya completely so she appears to be under the furniture.
    overlays: [
      { id: "table_overlay",       filename: "table_overlay.png",       yDepth: 560, hidingOverlay: true  },
      { id: "bed_overlay",         filename: "bed_overlay.png",         yDepth: 420, hidingOverlay: true  },
      { id: "small_table_overlay", filename: "small_table_overlay.png", yDepth: 650, hidingOverlay: true },
    ]
  }
};
