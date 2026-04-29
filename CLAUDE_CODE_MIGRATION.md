PROJECT SNAPSHOT: Aura of the Unseen (v4.5)
Theme: 1880s Biological Social-Stealth RPG
Inspiration: Disco Elysium (Dialogue/State), 2.5D Cinema-Plate Engine.
I. Core Logic: The Quad-Mask Sensory Engine
The game uses four invisible PNG masks to handle physics and world-state.
mask_logic.png:
White (#FFFFFF): Walkable.
Black (#000000): Wall/Block.
Green (#00FF00): Interaction (Solid Object).
Purple (#FF00FF): Hiding Zone (Solid Object).
Blue (#0000FF): Exit/Threshold.
mask_entities.png: Maps RGB colors to items/lore in worldManifest.js.
mask_hiding.png: Maps RGB colors to hiding spot IDs.
mask_terrain.png: Stores surface data for audio/footsteps.
Feature (LOCKED): Fuzzy color matching (>220 treats as 255) to prevent Photoshop compression errors.
Physicality (NEW): INTERACT and HIDE_ZONE logic types now return BLOCK to the movement controller while returning DATA to the UI.
II. The Universal Actor: Maya
Asset Type: WebM (Alpha Transparency) | Base Scale: 85px.
Mirroring Matrix (LOCKED):
Walk Side: Uses walk_left.webm. Mirrored for RIGHT.
Walk Diag-Down: Uses walk_down_right.webm. Mirrored for DOWN_LEFT.
Walk Diag-Up: Uses walk_up_left.webm. Mirrored for UP_RIGHT.
Idles: down_idle.webm, left_idle.webm. Playback: 0.8x (Walk is 1.0x).
Physics: 8-way traversal, Sprint (Shift), Jump (Gravity physics), Crouch (C).
III. The Dialogue Ledger (Disco Elysium Style)
Visual Specs (LOCKED):
Portraits: Foreground Layer (Z: 100), 945px width.
Offsets: Maya (8% Left), Silas (10% Right).
Ledger: 450px width, Centered (Z: 10). 8px Double-Black border. 7px Blur.
Facets: 100% width horizontal banners in /ui/concious_thoughts/.
History: Scrollable vertical log of all choices and responses.
Rolls: Integrated 2d6 ivory dice rolls inside the text box.
IV. Technical Manifest Example (test_house)
code
JavaScript
npcs: {
  "0,255,0": { id: "silas", name: "Old Silas", spawnX: 1100, spawnY: 720, dialogueKey: "silas_intro" },
  "255,0,0": { id: "overseer", name: "Overseer", spawnX: 450, spawnY: 550, barks: ["Work!", "Move!"] }
}
V. Critical Code Snippets for Reference
1. The Solid Interaction Fix (useNavigation.js)
code
JavaScript
// Logic Check inside checkPixel
let type = 'WALK';
if (la < 10 || (lr < 40 && lg < 40 && lb < 40)) type = 'BLOCK';
else if (lg > 200 && lr < 50) type = 'INTERACT_BLOCK'; // Stop Maya but allow [E]
else if (lr > 200 && lb > 200) type = 'HIDE_BLOCK';     // Stop Maya but allow [C]
else if (lb > 200) type = 'EXIT';
2. The Movement Interceptor (Character.jsx)
code
JavaScript
const res = checkCollision(nX, nY);
// Movement is strictly limited to WALK or EXIT pixels
if (res.type === 'WALK' || res.type === 'EXIT') {
  pos.current.x = nX;
  pos.current.y = nY;
}
// INTERACT_BLOCK and HIDE_BLOCK trigger the prompt but stop the feet.
VI. Project Pathing
Textures: public/textures/[location_id]/ (base.jpg, mask_logic.png, etc).
NPCs: public/sprites/npcs/.
UI: public/ui/portraits/ and public/ui/concious_thoughts/.
Architect's Transfer Note:
"Claude, the project is a high-fidelity 2.5D RPG. The movement engine and dialogue UI are visually and logically locked. Use the PROJECT SNAPSHOT to maintain coordinate and scale integrity. We are currently in the process of mapping the test_house manifest and are ready to implement NPC Sight-Lines."