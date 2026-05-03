# Loot Items — Aura of the Unseen

## Image Spec
- **Aspect ratio:** 1:1 (square)
- **Recommended size:** 512 × 512 px
- **Style:** Dark, painterly, 1880s domestic — isolated object on a transparent or near-black background
- **File path convention:** `/public/ui/items/{id}.png`

---

## test_house

### Large Cabinet
| ID | Name | Description |
|----|------|-------------|
| `folded_cloth` | Folded Cloth | A worn square of rough-spun cotton. Someone's old handkerchief. |
| `broken_button` | Bone Button | Cracked clean through. Carved from bone, common on a working man's coat. |
| `wax_paper` | Wax Paper | Wrapped around something greasy once. Nothing left now. |

### Shelves
| ID | Name | Description |
|----|------|-------------|
| `candle_stub` | Candle Stub | Half a tallow candle. Still has a wick. |
| `small_bottle` | Small Bottle | Brown glass, cork stopper. A few drops of something medicinal remain. |
| `folded_note` | Folded Note | The handwriting is shaky. The message is worse. |

### Dresser (left)
| ID | Name | Description |
|----|------|-------------|
| `tin_comb` | Tin Comb | Missing two teeth. Still works. |
| `dried_flower` | Dried Flower | Pressed flat between papers. Lavender, maybe. Long dead. |

### Small Lamp Stand
| ID | Name | Description |
|----|------|-------------|
| `matches` | Box of Matches | Half-empty. The sulphur tips are still dry. |
| `lamp_wick` | Spare Wick | Rolled cotton, trimmed clean. Someone kept this place maintained. |

### Dresser (right)
| ID | Name | Description |
|----|------|-------------|
| `rag_strip` | Torn Rag | Brownish stain on one end. Could be rust. Could be something else. |
| `copper_coin` | Copper Coin | Worn smooth. You can barely make out the face. |
| `nail` | Iron Nail | Bent but solid. Could still hold something together. |

### Rubbage
| ID | Name | Description |
|----|------|-------------|
| `scrap_paper` | Scrap of Paper | Half-burned at one edge. A list of names, or what's left of one. |
| `old_rag` | Old Rag | Filthy. Smells of ash and sweat. |
| `bent_pin` | Bent Pin | A sewing pin, bent nearly double. Useless as it is. |
| `wood_chip` | Wood Chip | Splintered off something larger. Nothing special. |

---

## Total Items: 17

## Adding an Image to an Item
Set the `image` field on any loot entry in `src/data/worldManifest.js`:

```js
{ id: "tin_comb", name: "Tin Comb", description: "...", image: "/ui/items/tin_comb.png" }
```
