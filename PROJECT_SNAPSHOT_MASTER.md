PROJECT SNAPSHOT: Aura of the Unseen
Version: 3.5 (LOCKED BASELINE)
Architecture: Modular 2.5D Cinema-Plate Engine
Date: [Current Date]
I. Technical Infrastructure
Stack: React + Vite + Vercel.
Deployment: GitHub synced to Vercel (Production Branch: main).
Persistence: src/utils/persistence.js managing LocalStorage (Integrity, Vigor, Money, Flags, Memories).
II. Character & NPC Anatomy (LOCKED)
Protagonist (Maya):
Scale: 85px (Spectral/Micro-scale).
Format: WebM (Alpha Transparency).
Movement: 8-way traversal with Game Loop (3.5 speed walk / 0.8 speed idle).
Mirroring: Hard-coded KINETIC_LOCKED_DATA (mirrors walk_left, walk_up_left, and walk_down_right).
Inhabitants (NPCs):
Scale: 110px (Looming Presence - 30% larger than Maya).
Interaction: Proximity-based (Radius: 80px) + [E] Trigger.
Bark Engine: Supports random text bubbles above heads for non-dialogue NPCs.
III. The Quad-Mask Navigation Legend
Masks located in: public/textures/[room_name]/
Logic Mask:
#FFFFFF (Walk) | #000000 (Wall) | #00FF00 (Item) | #FFFF00 (NPC) | #0000FF (Exit) | #FF00FF (Hide).
Entity Mask: Maps RGB colors to worldManifest.js objects.
NPC Mask: Maps RGB colors to specific NPC IDs (e.g., Silas: 0,255,0).
Terrain Mask: Stores surface data (Wood, Grass, Mud) for future audio triggers.
Fuzzy Logic: Engine treats any color value >240 as 255 to prevent Photoshop export errors.
IV. Cinematic Dialogue UI (LOCKED)
Composition: The Monumental Foreground Sandwich
Portraits: 945px width, anchored to bottom.
Offsets: Maya (Left 8% margin) | Silas (Right 10% margin).
Dialogue Ledger: 450px width, centered.
Styling: 8px Double-Black border, Pure White BG, 7px Backdrop Blur.
History: Scrollable ledger that records Maya's chosen options and NPC responses.
Dice Engine: Integrated 2d6 ivory rolls inside the ledger box.
V. Neurological Facet System
Assets in: /public/ui/concious_thoughts/
Format: 100% width horizontal banners.
Active Facets:
mimicry: The Voice of Cadence.
genetic_memory: The Voice of the Unseen (Truthful History).
nerve_sense: The Voice of Threat.
social_crypsis: The Voice of Shadow.
VI. Current World Manifest (test_house)
NPCs: Silas (Spawn: 1120, 720) | Overseer (Spawn: 450, 550).
Hiding: Under Bed (Logic: Purple | Hiding Mask: Cyan 0,255,255).
Search: Cabinet (Logic: Green | Entity Mask: Red 255,0,0).
Dialogue Tree: Hub-and-Spoke model (silas_hub).
Architect's Closing Note:
Maya is currently a spectral micro-entity navigating an oppressive 1800s environment. The UI is cinematic and oversized, emphasizing the weight of the narrative. The engine is modular—new rooms can be added by creating a folder and a manifest entry.
Next Session Priorities:
Implement the Bento Grid Identity Ledger (Inventory/Menu).
Establish NPC Sight-Line Vision Cones for stealth gameplay.
Add Primary Source Primary Documents to the genetic_memory branches.