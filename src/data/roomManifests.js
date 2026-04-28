export const ROOM_ALPHA_MANIFEST = {
  id: "ROOM_ALPHA",
  entities: [
    {
      id: "table",
      name: "THE DINING TABLE",
      trigger: { x: [200, 450], y: [500, 700] }, // Coordinates on your 1280x800 screen
      text: "The porcelain was cold. We stood in the corners, quiet as dust, witnessing the end of an age.",
      source: "Slave Narrative, 1888",
      impact: -12 // Self-Control drain
    },
    {
      id: "cabinet",
      name: "THE LACKEY'S CABINET",
      trigger: { x: [450, 600], y: [300, 450] },
      text: "Hidden behind the fine linens, I found a scrap of paper—a map of the stars. Someone else was planning an escape.",
      source: "Archival Fragment, Georgia",
      impact: -5
    },
    {
      id: "bed",
      name: "THE MASTER'S REST",
      trigger: { x: [750, 1100], y: [350, 550] },
      text: "The bed was soft, but the air around it was heavy with the weight of generations of theft.",
      source: "The Unseen Records",
      impact: -15
    }
  ]
};