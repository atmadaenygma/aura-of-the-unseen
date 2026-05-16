// ── Chapter registry ───────────────────────────────────────────────────────────
// Each chapter defines its number, title, and the unlock state.
// chapter: 0 = developer sandbox (always accessible, not shown to players)
// chapter: 1 = Gold Coast / Barracoons (free demo — always unlocked)
// chapter: 2 = The Slave Ship / Middle Passage (requires purchase)
// chapter: 3 = The American Island (requires purchase)
export const CHAPTER_REGISTRY = {
  0: { title: 'Developer Sandbox',          free: true,  description: 'Internal testing rooms. Not part of the game.' },
  1: { title: 'The Gold Coast — Barracoons', free: true,  description: 'The last sight of home. The holding pens of the Gold Coast before the crossing.' },
  2: { title: 'The Slave Ship',             free: false, description: 'The Middle Passage. Below deck, across the Atlantic.' },
  3: { title: 'The American Island',        free: false, description: 'A fictional island that holds the full weight of American history in one place.' },
};

export const WORLD_MANIFEST = {
  "test_house": {
    id: "test_house",
    chapter: 0,    // DEV ONLY — not part of any chapter
    path: "/textures/Whitney Plantation/test_house",
    spawnPos:       { x: 1139, y: 652 },
    spawnPoints: {
      entry: { x: 1139, y: 652 },
      from: {
        "overseers_house_exterior": { x: 1139, y: 652 }
      }
    },
    exits: {
      "0,0,255": { to: "overseers_house_exterior" },
      // "05fff3":  { to: "room_id", label: "Door Name" },
      // "e500ff":  { to: "room_id", label: "Door Name" },
      // "ff0004":  { to: "room_id", label: "Door Name" },
      // "ff8400":  { to: "room_id", label: "Door Name" },
      // "39b54a":  { to: "room_id", label: "Door Name" },
    },
    characterScale: 0.85,

    // 1. STATIC ENTITIES â€” proximity-based detection (x, y, radius in world units)
    //
    // Workflow:
    //   1. Enable debug mode â€” walk Maya next to the object
    //   2. Read the XY coords from the crosshair/telemetry bar
    //   3. Set x,y to the object's centre, radius to taste (40â€“70 is typical)
    //   4. No mask painting needed â€” mask_entities.png is no longer used
    //
    // Maya triggers [E] when Math.hypot(maya.x - ent.x, maya.y - ent.y) < radius
    entities: {
      large_cabinet: {
        id: "large_cabinet", name: "Large Cabinet", type: "CONTAINER",
        x: 202, y: 474, radius: 55,
        loot: [
          { id: "rough_shirt",   name: "Rough Shirt",    description: "Coarse undyed linen. Stitched by hand and worn down to nothing at the elbows." },
          { id: "folded_cloth",  name: "Folded Cloth",   description: "A worn square of rough-spun cotton. Someone's old handkerchief." },
          { id: "broken_button", name: "Bone Button",    description: "Cracked clean through. Carved from bone, common on a working man's coat." },
          { id: "wax_paper",     name: "Wax Paper",      description: "Wrapped around something greasy once. Nothing left now." },
          { id: "flour_scoop",        name: "Scoop of Flour",       description: "Rough-ground, gritty. Enough for one small flat bread." },
          { id: "lard_scrap",         name: "Lard Scrap",            description: "A hard knob of rendered fat. Smells faintly of wood smoke." },
          { id: "recipe_card_bean_stew", name: "Recipe: Bean Stew",  description: "Written on the inside of a flour sack. The measurements are in handfuls and guesses." },
        ]
      },
      shelves: {
        id: "shelves", name: "Shelves", type: "CONTAINER",
        x: 503, y: 302, radius: 50,
        loot: [
          { id: "candle_stub",  name: "Candle Stub",  description: "Half a tallow candle. Still has a wick." },
          { id: "small_bottle", name: "Small Bottle", description: "Brown glass, cork stopper. A few drops of something medicinal remain." },
          { id: "folded_note",  name: "Folded Note",  description: "The handwriting is shaky. The message is worse." },
          { id: "salt_packet",           name: "Pinch of Salt",        description: "Rough salt in a twist of paper. Stretched as thin as it'll go." },
          { id: "wild_herbs",            name: "Wild Herbs",            description: "Pulled from the yard. Thyme, maybe. Dried to nothing but still fragrant." },
          { id: "recipe_card_cornbread", name: "Recipe: Cornbread",     description: "Scrawled in a careful hand on a scrap of brown paper. The ink is faded but legible." },
        ]
      },
      dresser_1: {
        id: "dresser_1", name: "Dresser", type: "CONTAINER",
        x: 593, y: 355, radius: 50,
        loot: [
          { id: "tin_comb",     name: "Tin Comb",     description: "Missing two teeth. Still works." },
          { id: "dried_flower", name: "Dried Flower", description: "Pressed flat between papers. Lavender, maybe. Long dead." },
          { id: "corn_bread",           name: "Cornbread",             description: "Dense and flat. Still warm from the fire." },
          { id: "dried_beans",          name: "Dried Beans",           description: "A handful of black-eyed peas. Hard as pebbles. Need a long soak." },
          { id: "recipe_card_ash_cake", name: "Recipe: Ash Cake",      description: "Pressed flat from years of being carried in a pocket. Someone memorized this before passing it on." },
        ]
      },
      small_lamp_stand: {
        id: "small_lamp_stand", name: "Small Lamp Stand", type: "CONTAINER",
        x: 781, y: 331, radius: 40,
        loot: [
          { id: "matches",      name: "Box of Matches", description: "Half-empty. The sulphur tips are still dry." },
          { id: "lamp_wick",    name: "Spare Wick",     description: "Rolled cotton, trimmed clean. Someone kept this place maintained." },
          { id: "sweet_potato", name: "Sweet Potato",   description: "Soft in places, solid in others. Still good." },
          { id: "ash_cake",     name: "Ash Cake",       description: "Cornmeal pressed flat and cooked on the hearthstone. Gritty but filling." },
        ]
      },
      dresser_2: {
        id: "dresser_2", name: "Dresser", type: "CONTAINER",
        x: 922, y: 298, radius: 50,
        loot: [
          { id: "rag_strip",   name: "Torn Rag",    description: "Brownish stain on one end. Could be rust. Could be something else." },
          { id: "copper_coin", name: "Copper Coin", description: "Worn smooth. You can barely make out the face." },
          { id: "nail",        name: "Iron Nail",   description: "Bent but solid. Could still hold something together." },
          { id: "fatback",     name: "Fatback",     description: "Salted pork fat, wrapped in cloth. Chewed slow." },
          { id: "yam_piece",   name: "Boiled Yam",  description: "Plain, boiled. Fills the stomach if not the spirit." },
        ]
      },
      hearth: {
        id: "hearth", name: "Hearth", type: "COOKING",
        x: 300, y: 570, radius: 70,
        // NOTE: calibrate x/y in debug mode â€” walk Maya to the hearth and read coords
      },
      rubbage: {
        id: "rubbage", name: "Rubbage", type: "CONTAINER",
        x: 606, y: 740, radius: 50,
        loot: [
          { id: "scrap_paper", name: "Scrap of Paper", description: "Half-burned at one edge. A list of names, or what's left of one." },
          { id: "old_rag",     name: "Old Rag",        description: "Filthy. Smells of ash and sweat." },
          { id: "bent_pin",    name: "Bent Pin",       description: "A sewing pin, bent nearly double. Useless as it is." },
          { id: "wood_chip",   name: "Wood Chip",      description: "Splintered off something larger. Nothing special." },
          { id: "dried_corn",       name: "Dried Corn",        description: "Shriveled kernels in a cloth pouch. Could be ground or boiled." },
          { id: "recipe_card_yam",  name: "Recipe: Boiled Yam", description: "A strip of cloth with instructions worked into the weave in dark thread. An old woman's hand." },
        ]
      },
    },

    // 2. HIDING SPOTS (mask_hiding.png)
    // Key must match the RGB color painted on mask_hiding.png (fuzzy-snapped to 0/255).
    hidingSpots: {
      "255,255,255": { id: "under_bed", name: "Under the Bed", type: "HIDE" }
    },

    // 3. THE INHABITANTS (mask_npcs.png disabled â€” manifest coordinates are authoritative)
    npcs: {
      angus: {
        id: 'angus',
        name: 'Angus',
        assetPath: '/sprites/npcs/angus_forward_left_idle.webm',
        scale: 2.03,
        spawnX: 407,
        spawnY: 433,
        role: 'authority',
        barks: [
          'Why are you in my house',
          'Get you',
          'You ain\'t supposed to be here',
          'I\'m gonna call the catchers on you',
          'You know my husband is the overseer',
          'Aaaghhhh, a nigger'
        ],

        // Movement
        walkRadius: 350,
        idleChance: 0.75,
        moveSpeed: 0.7,

        // Sensing
        sightRange: 220,
        sightAngle: 75,
        hearingRange: 130,

        // Aura reactions
        auraReactions: {
          rat: { effect: 'flee', fleeRadius: 350 }
        },

        // Catch dialogue
        catchDialogue: 'angus_catch'
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
    // yDepth â€” the world-space Y of the object's front edge.
    //   Maya's zIndex = Math.floor(pos.y). If yDepth > Maya's y, overlay renders in front.
    //   Use the debug crosshair to find the front edge Y of each piece of furniture.
    //
    // hidingOverlay:true â€” this overlay jumps to zIndex 9500 when isMayaHidden is true,
    //   covering Maya completely so she appears to be under the furniture.
    overlays: [
      { id: "table_overlay",       filename: "table_overlay.png",       yDepth: 560, hidingOverlay: true  },
      { id: "bed_overlay",         filename: "bed_overlay.png",         yDepth: 420, hidingOverlay: true  },
      { id: "small_table_overlay", filename: "small_table_overlay.png", yDepth: 650, hidingOverlay: true },
    ]
  },

  "overseers_house_exterior": {
    id:        "overseers_house_exterior",
    chapter:   0,    // DEV ONLY — not part of any chapter
    path:      "/textures/Whitney Plantation/overseers_house_exterior",
    baseImage: "base.png",
    worldW:         2000,
    worldH:         900,
    spawnPos:       { x: 1322, y: 560 },
    spawnPoints: {
      entry: { x: 1322, y: 560 },
      from: {
        "test_house":   { x: 1266, y: 514 },
        "silas_cabin":  { x: 897,  y: 344 }
      }
    },
    characterScale: 0.5,   // Maya appears at 50% her normal size in this room
    moveScale:      0.44,  // 56% slower movement in this room
    exits: {
      "0,0,255": { to: "test_house" },
      "e500ff":  { to: "silas_cabin", label: "Silas' Cabin" },
      // "05fff3":  { to: "room_id", label: "Door Name" },
      // "ff0004":  { to: "room_id", label: "Door Name" },
      // "ff8400":  { to: "room_id", label: "Door Name" },
      // "39b54a":  { to: "room_id", label: "Door Name" },
    },

    // No mask_terrain.png yet â€” useNavigation handles missing terrain gracefully.
    // Paint mask_terrain.png when surface types (grass, stone path, etc.) are needed.

    entities:    {},
    hidingSpots: {},
    npcs: {
      overseer: {
        id: 'overseer',
        name: 'The Overseer',
        assetPath: '/sprites/npcs/overseer_idle.webm',
        scale: 1.52,
        spawnX: 968,
        spawnY: 598,
        role: 'authority',
        barks: [
          'Get back to work!',
          'Don\'t you have things that need doin\'?',
          'I\'m watchin\' you, traveler.',
          'Stop standin\' around.'
        ],

        // Movement
        walkRadius: 250,
        idleChance: 0.8,
        moveSpeed: 0.6,

        // Sensing
        sightRange: 300,
        sightAngle: 90,
        hearingRange: 160,

        // Aura reactions
        auraReactions: {},

        // Catch dialogue
        catchDialogue: 'overseer_catch'
      }
    },

    terrainSurfaces: {
      "0,0,0":       { id: "obstacle", label: "Obstacle", footstep: null    },
      "255,255,255": { id: "ground",   label: "Ground",   footstep: "stone" },
    },

    // yDepth: 9999 ensures this overlay always renders in front of Maya
    overlays: [
      { id: "behind_the_slave_quarters_fence", filename: "behind_the_slave_quarters_fence.png", yDepth: 278 },
      { id: "behind_the_slave_quarters_fence_mid", filename: "behind_the_slave_quarters_fence.png", yDepth: 290 },
      { id: "behind_the_slave_quarters_fence_far", filename: "behind_the_slave_quarters_fence.png", yDepth: 312 },
      { id: "left_roofing_overseers_house",  filename: "left_roofing_overseers_house.png",  yDepth: 293 },
      { id: "left_tree_bottom",              filename: "Left_tree_bottom.png",              yDepth: 597 },
      { id: "left_tree_bottom_mid",         filename: "Left_tree_bottom.png",              yDepth: 676 },
      { id: "mid_tree_bottom",               filename: "mid_tree_bottom.png",              yDepth: 817 },
      { id: "mid_tree_bottom_right",        filename: "mid_tree_bottom.png",              yDepth: 876 },
      { id: "mid_tree_bottom_far",          filename: "mid_tree_bottom.png",              yDepth: 885 },
      { id: "lower_roofing_overseers_house", filename: "lower_roofing_overseers_house.png", yDepth: 9999 },
      { id: "fence_rail",             filename: "fence rail.png",             yDepth: 620 },
      { id: "overseers_support03",    filename: "overseers_support03.png",    yDepth: 618 },
      { id: "overseers_support04",    filename: "overseers_support04.png",    yDepth: 679 },
      { id: "overseers_support02",    filename: "overseers_support02.png",    yDepth: 519 },
      { id: "small_tree_lower_right", filename: "small_tree_lower_right.png", yDepth: 770 },
      { id: "overseers_support01",    filename: "overseers_support01.png",    yDepth: 510 },
      { id: "tree_in_front_of_fence", filename: "tree_in_front_of_fence.png", yDepth: 533 },
      { id: "fence_front_section",    filename: "fence_front_section.png",    yDepth: 509 },
      { id: "tree_behind_fence",      filename: "tree_behind_fence.png",      yDepth: 487 },
      { id: "street_pole",            filename: "street_pole.png",            yDepth: 413 },
      { id: "upper_tree_a",           filename: "upper_tree_a.png",           yDepth: 234 },
      { id: "upper_tree_b",           filename: "upper_tree_b.png",           yDepth: 82  },
    ],
  },

  "silas_cabin": {
    id:        "silas_cabin",
    chapter:   0,    // DEV ONLY — not part of any chapter
    path:      "/textures/Whitney Plantation/silas_cabin",
    baseImage: "silas_cabin.png",
    worldW:         1632,   // 1920 × 0.85 (15% smaller)
    worldH:         918,    // 1080 × 0.85
    spawnPos:       { x: 463, y: 492 },
    spawnPoints: {
      entry: { x: 463, y: 492 },
      from: {
        "overseers_house_exterior": { x: 477, y: 492 }
      }
    },
    characterScale: 1.1,    // 1.3 × 0.85 (Maya 10% bigger than normal)
    moveScale:      0.85,   // 1 × 0.85 (85% normal movement speed)
    exits: {
      "e500ff": { to: "overseers_house_exterior", label: "Outside" },
    },

    entities:    {},
    hidingSpots: {},
    npcs: {
      old_silas: {
        id: 'old_silas',
        name: 'Old Silas',
        assetPath: '/sprites/npcs/silas_idle.webm',
        scale: 1.1,
        spawnX: 989,    // 1163 × 0.85
        spawnY: 476,    // 560 × 0.85
        role: 'ally',
        barks: [],
        dialogueKey: 'silas_intro',

        // Movement
        walkRadius: 100,
        idleChance: 0.9,
        moveSpeed: 0.3,

        // Sensing
        sightRange: 150,
        sightAngle: 60,
        hearingRange: 80,

        // Aura reactions
        auraReactions: {},

        // Catch dialogue
        catchDialogue: null,
      }
    },

    terrainSurfaces: {
      "0,0,0":       { id: "obstacle",   label: "Obstacle",   footstep: null    },
      "255,255,255": { id: "wood_floor", label: "Wood Floor", footstep: "wood"  },
      "255,0,0":     { id: "carpet",     label: "Carpet",     footstep: "soft"  },
      "0,255,0":     { id: "grass",      label: "Grass",      footstep: "grass" },
      "0,0,255":     { id: "threshold",  label: "Threshold",  footstep: "stone" },
    },

    overlays: [
      { id: "bed_01",                 filename: "overlay_bed_01.png",                 yDepth: 555 },   // 653 × 0.85
      { id: "bed_02",                 filename: "overlay_bed_02.png",                 yDepth: 751 },   // 883 × 0.85
      { id: "bed_bottom_left",        filename: "overlay_bed_bottom_left.png",        yDepth: 895 },   // 1053 × 0.85
      { id: "bed_tip_near_door",      filename: "overlay_bed_tip_near_door.png",      yDepth: 585 },   // 688 × 0.85
    ],
  }
};
