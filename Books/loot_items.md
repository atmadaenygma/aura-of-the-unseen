# Loot Items — Aura of the Unseen

## Image Spec
- **Aspect ratio:** 1:1 (square)
- **Recommended size:** 512 × 512 px
- **Style:** Dark, painterly, 1880s domestic — isolated object on a transparent or near-black background
- **File path convention:** `/public/ui/items/{id}.png`

---

## Item Categories

| Category | `itemDefs` field | Tab shown in | Notes |
|---|---|---|---|
| General | *(none)* | SATCHEL only | Default for all unlisted items |
| Quest | `questItem: true` | QUEST ITEMS | Cannot be dropped |
| Ingredient | `category: 'ingredient'` | INGREDIENTS | Consumed when cooking at a fire |
| Food | `category: 'recipe'` | FOOD | Has `hungerRestore` — shows EAT action |
| Recipe Card | `category: 'recipe_card'` | RECIPES | Has `teachesRecipe` — shows LEARN action; consumed on use |

---

## test_house

### Large Cabinet
| ID | Name | Description | Category |
|----|------|-------------|----------|
| `rough_shirt` | Rough Shirt | Coarse undyed linen. Stitched by hand and worn down to nothing at the elbows. | General |
| `folded_cloth` | Folded Cloth | A worn square of rough-spun cotton. Someone's old handkerchief. | General |
| `broken_button` | Bone Button | Cracked clean through. Carved from bone, common on a working man's coat. | General |
| `wax_paper` | Wax Paper | Wrapped around something greasy once. Nothing left now. | General |
| `flour_scoop` | Scoop of Flour | Rough-ground, gritty. Enough for one small flat bread. | Ingredient |
| `lard_scrap` | Lard Scrap | A hard knob of rendered fat. Smells faintly of wood smoke. | Ingredient |
| `recipe_card_bean_stew` | Recipe: Bean Stew | Written on the inside of a flour sack. The measurements are in handfuls and guesses. | Recipe Card |

### Shelves
| ID | Name | Description | Category |
|----|------|-------------|----------|
| `candle_stub` | Candle Stub | Half a tallow candle. Still has a wick. | General |
| `small_bottle` | Small Bottle | Brown glass, cork stopper. A few drops of something medicinal remain. | General |
| `folded_note` | Folded Note | The handwriting is shaky. The message is worse. | Quest |
| `salt_packet` | Pinch of Salt | Rough salt in a twist of paper. Stretched as thin as it'll go. | Ingredient |
| `wild_herbs` | Wild Herbs | Pulled from the yard. Thyme, maybe. Dried to nothing but still fragrant. | Ingredient |
| `recipe_card_cornbread` | Recipe: Cornbread | Scrawled in a careful hand on a scrap of brown paper. The ink is faded but legible. | Recipe Card |

### Dresser (left)
| ID | Name | Description | Category |
|----|------|-------------|----------|
| `tin_comb` | Tin Comb | Missing two teeth. Still works. | General |
| `dried_flower` | Dried Flower | Pressed flat between papers. Lavender, maybe. Long dead. | General |
| `corn_bread` | Cornbread | Dense and flat. Still warm from the fire. | Food (+35 hunger) |
| `dried_beans` | Dried Beans | A handful of black-eyed peas. Hard as pebbles. Need a long soak. | Ingredient |
| `recipe_card_ash_cake` | Recipe: Ash Cake | Pressed flat from years of being carried in a pocket. Someone memorized this before passing it on. | Recipe Card |

### Small Lamp Stand
| ID | Name | Description | Category |
|----|------|-------------|----------|
| `matches` | Box of Matches | Half-empty. The sulphur tips are still dry. | General |
| `lamp_wick` | Spare Wick | Rolled cotton, trimmed clean. Someone kept this place maintained. | General |
| `sweet_potato` | Sweet Potato | Soft in places, solid in others. Still good. | Ingredient |
| `ash_cake` | Ash Cake | Cornmeal pressed flat and cooked on the hearthstone. Gritty but filling. | Food (+25 hunger) |

### Dresser (right)
| ID | Name | Description | Category |
|----|------|-------------|----------|
| `rag_strip` | Torn Rag | Brownish stain on one end. Could be rust. Could be something else. | General |
| `copper_coin` | Copper Coin | Worn smooth. You can barely make out the face. | General |
| `nail` | Iron Nail | Bent but solid. Could still hold something together. | General |
| `fatback` | Fatback | Salted pork fat, wrapped in cloth. Chewed slow. | Food (+20 hunger) |
| `yam_piece` | Boiled Yam | Plain, boiled. Fills the stomach if not the spirit. | Food (+30 hunger) |

### Rubbage
| ID | Name | Description | Category |
|----|------|-------------|----------|
| `scrap_paper` | Scrap of Paper | Half-burned at one edge. A list of names, or what's left of one. | General |
| `old_rag` | Old Rag | Filthy. Smells of ash and sweat. | General |
| `bent_pin` | Bent Pin | A sewing pin, bent nearly double. Useless as it is. | General |
| `wood_chip` | Wood Chip | Splintered off something larger. Nothing special. | General |
| `dried_corn` | Dried Corn | Shriveled kernels in a cloth pouch. Could be ground or boiled. | Ingredient |
| `recipe_card_yam` | Recipe: Boiled Yam | A strip of cloth with instructions worked into the weave in dark thread. An old woman's hand. | Recipe Card |

### Hearth *(COOKING entity — calibrate x/y in debug mode)*
The hearth is a `COOKING` type entity. Pressing `[E]` near it opens the Cooking UI. No loot — only a fire to cook at.

---

## All Ingredients

| ID | Name | Stack | Description |
|----|------|-------|-------------|
| `dried_corn` | Dried Corn | ×5 | Shriveled kernels in a cloth pouch. Could be ground or boiled. |
| `flour_scoop` | Scoop of Flour | ×3 | Rough-ground, gritty. Enough for one small flat bread. |
| `lard_scrap` | Lard Scrap | ×3 | A hard knob of rendered fat. Smells faintly of wood smoke. |
| `dried_beans` | Dried Beans | ×5 | A handful of black-eyed peas. Hard as pebbles. Need a long soak. |
| `wild_herbs` | Wild Herbs | ×5 | Pulled from the yard. Thyme, maybe. Dried to nothing but still fragrant. |
| `salt_packet` | Pinch of Salt | ×3 | Rough salt in a twist of paper. Stretched as thin as it'll go. |
| `sweet_potato` | Sweet Potato | ×3 | Soft in places, solid in others. Still good. |

Ingredients show an **EAT** action only when combined into food. Raw, they can be **GIVEN** to NPCs or **DROPPED**. Combining requires a cooking fire (future feature).

---

## All Food

| ID | Name | Stack | Hunger Restored | Description |
|----|------|-------|-----------------|-------------|
| `corn_bread` | Cornbread | ×3 | +35 | Dense and flat. Still warm from the fire. |
| `ash_cake` | Ash Cake | ×3 | +25 | Cornmeal pressed flat and cooked on the hearthstone. Gritty but filling. |
| `bean_stew` | Bean Stew | ×1 | +50 | Black-eyed peas cooked down to mush. Eaten with a spoon or the fingers. |
| `fatback` | Fatback | ×3 | +20 | Salted pork fat, wrapped in cloth. Chewed slow. |
| `yam_piece` | Boiled Yam | ×3 | +30 | Plain, boiled. Fills the stomach if not the spirit. |

Food items show an **EAT** action in the inventory popover. Eating consumes one unit from the stack and restores the listed hunger amount (capped at 100). Food can also be **GIVEN** to NPCs or **DROPPED** (and **STOLEN** if taken from containers).

---

---

## All Recipe Cards

| ID | Name | Teaches | Description |
|----|------|---------|-------------|
| `recipe_card_cornbread` | Recipe: Cornbread | `corn_bread` | Scrawled in a careful hand on a scrap of brown paper. |
| `recipe_card_ash_cake` | Recipe: Ash Cake | `ash_cake` | Pressed flat from years of being carried in a pocket. |
| `recipe_card_bean_stew` | Recipe: Bean Stew | `bean_stew` | Written on the inside of a flour sack. |
| `recipe_card_yam` | Recipe: Boiled Yam | `yam_piece` | A strip of cloth with words worked into the weave in dark thread. |

Reading a recipe card (LEARN action) removes the card from inventory and permanently adds the recipe to `gameState.knownRecipes`. If the recipe is already known, the card is still removed.

---

## Cooking System

Cooking requires a **COOKING** entity in the world (hearth, kitchen fire, open fire). Press `[E]` near it to open the Cooking UI.

| Recipe | Ingredients | Yields | Hunger |
|--------|-------------|--------|--------|
| Cornbread | Flour ×1 + Lard ×1 | Cornbread ×2 | +35 |
| Ash Cake | Dried Corn ×2 + Salt ×1 | Ash Cake ×1 | +25 |
| Bean Stew | Dried Beans ×2 + Salt ×1 + Herbs ×1 + Lard ×1 | Bean Stew ×1 | +50 |
| Boiled Yam | Sweet Potato ×1 | Boiled Yam ×1 | +30 |

Recipe data lives in `src/data/recipes.js`. To add a new recipe, add an entry there and a matching `recipe_card_*` item in `itemDefs.js`.

---

## Total Items: 33 (17 general/quest + 7 ingredients + 5 food + 4 recipe cards)

## Adding an Image to an Item
Set the `image` field on any loot entry in `src/data/worldManifest.js`:

```js
{ id: "corn_bread", name: "Cornbread", description: "...", image: "/ui/items/corn_bread.png" }
```

## Adding a New Food or Ingredient
1. Add the item to `src/data/itemDefs.js` with `category: 'ingredient'` or `category: 'recipe'`
2. For food, add `hungerRestore: N` (integer, 1–100)
3. Add it to a container's `loot` array in `src/data/worldManifest.js`
4. Document it in this file
