/**
 * readNPCSpawns
 *
 * Reads mask_npcs.png and returns a map of { colorKey: { x, y } } in world coordinates.
 *
 * Workflow:
 *   1. Open your room's .psd in Photoshop
 *   2. On the NPC_MASK layer, paint ONE pixel (or small 2-3px dot) in the NPC's unique color
 *      at the exact position where their feet should be.
 *   3. Export mask_npcs.png
 *   4. The engine reads this file once on load and overwrites spawnX/spawnY in the manifest.
 *
 * Color convention (match worldManifest.js NPC keys):
 *   "0,255,0"   = Silas (pure green)
 *   "255,0,0"   = Overseer (pure red)
 *   "255,255,0" = next NPC (yellow) — add to manifest
 *   etc.
 *
 * Rules:
 *   - Use pure 0/255 values only (no anti-aliasing)
 *   - Black (0,0,0) and transparent pixels are ignored
 *   - If a color appears multiple times, the LAST pixel found wins (paint a single dot)
 */
export const readNPCSpawns = (maskUrl, worldWidth = 1280, worldHeight = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img    = new Image();
    img.crossOrigin = 'anonymous';
    img.src = maskUrl;

    img.onload = () => {
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const spawns = {};

      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const i = (py * width + px) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

          if (a < 10) continue;                          // transparent
          if (r < 40 && g < 40 && b < 40) continue;    // black = empty

          // Fuzzy snap — matches the same logic used in useNavigation checkPixel
          const fr = r > 220 ? 255 : 0;
          const fg = g > 220 ? 255 : 0;
          const fb = b > 220 ? 255 : 0;
          const key = `${fr},${fg},${fb}`;

          // Convert mask pixel position → world coordinate
          const worldX = Math.round((px / width)  * worldWidth);
          const worldY = Math.round((py / height) * worldHeight);

          spawns[key] = { x: worldX, y: worldY };
        }
      }

      console.log(`%c [NPC MASK] ${Object.keys(spawns).length} spawn(s) read`, 'color: #ffff00', spawns);
      resolve(spawns);
    };

    img.onerror = () => {
      console.warn(`[NPC MASK] mask_npcs.png not found at ${maskUrl} — using manifest coordinates`);
      resolve({});
    };
  });
};
