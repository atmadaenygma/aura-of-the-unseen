// ── Recipe definitions ──────────────────────────────────────────────────────────
// ingredients : array of { id, name, count } — items consumed on cooking
// yields      : { id, name, count, description } — item produced
// note        : flavour instruction shown in the cooking UI
// requiresFire: always true — cooking requires a hearth, kitchen, or open fire

export const RECIPES = {
  corn_bread: {
    id:   'corn_bread',
    name: 'Cornbread',
    ingredients: [
      { id: 'flour_scoop', name: 'Scoop of Flour', count: 1 },
      { id: 'lard_scrap',  name: 'Lard Scrap',     count: 1 },
    ],
    yields: {
      id: 'corn_bread', name: 'Cornbread', count: 2,
      description: 'Dense and flat. Still warm from the fire.',
    },
    note: 'Mix flour and lard into a rough dough. Press flat. Cook on an oiled pan or directly on the hearthstone.',
    requiresFire: true,
  },

  ash_cake: {
    id:   'ash_cake',
    name: 'Ash Cake',
    ingredients: [
      { id: 'dried_corn',  name: 'Dried Corn',    count: 2 },
      { id: 'salt_packet', name: 'Pinch of Salt', count: 1 },
    ],
    yields: {
      id: 'ash_cake', name: 'Ash Cake', count: 1,
      description: 'Cornmeal pressed flat and cooked on the hearthstone. Gritty but filling.',
    },
    note: 'Grind the corn to meal. Add salt and enough water to bind. Press into a flat round. Cook in the hot ash at the edge of the fire.',
    requiresFire: true,
  },

  bean_stew: {
    id:   'bean_stew',
    name: 'Bean Stew',
    ingredients: [
      { id: 'dried_beans', name: 'Dried Beans',   count: 2 },
      { id: 'salt_packet', name: 'Pinch of Salt', count: 1 },
      { id: 'wild_herbs',  name: 'Wild Herbs',    count: 1 },
      { id: 'lard_scrap',  name: 'Lard Scrap',    count: 1 },
    ],
    yields: {
      id: 'bean_stew', name: 'Bean Stew', count: 1,
      description: 'Black-eyed peas cooked down to mush. Eaten with a spoon or the fingers.',
    },
    note: 'Soak the beans if you have the time. Otherwise boil hard. Season with salt, herbs, and a knob of fat. Cook until thick.',
    requiresFire: true,
  },

  yam_piece: {
    id:   'yam_piece',
    name: 'Boiled Yam',
    ingredients: [
      { id: 'sweet_potato', name: 'Sweet Potato', count: 1 },
    ],
    yields: {
      id: 'yam_piece', name: 'Boiled Yam', count: 1,
      description: 'Plain, boiled. Fills the stomach if not the spirit.',
    },
    note: 'Scrub clean. Boil whole in water until soft. Add salt if you have it.',
    requiresFire: true,
  },
};
