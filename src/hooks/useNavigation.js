import { useEffect, useState, useRef, useCallback } from 'react';

export const useNavigation = (logicUrl, entityUrl, hideUrl, terrainUrl) => {
  // Named canvas refs — explicit, no object recreation on render
  const logicCanvas  = useRef(document.createElement('canvas'));
  const entityCanvas = useRef(document.createElement('canvas'));
  const hideCanvas   = useRef(document.createElement('canvas'));
  const terrainCanvas = useRef(document.createElement('canvas'));

  // Cached context refs — getContext() is called once per load, not 60fps
  const logicCtx   = useRef(null);
  const entityCtx  = useRef(null);
  const hideCtx    = useRef(null);
  const terrainCtx = useRef(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadMask = (url, canvas, ctxRef, name) => new Promise((resolve) => {
      const img = new Image();
      img.src = url; // No Date.now() — let the CDN/browser cache work correctly
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // willReadFrequently: true on ALL canvases — they are all sampled 60fps
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctxRef.current = ctx; // Cache the context — never call getContext() at runtime again
        console.log(`%c [SENSORS] ${name} ONLINE (${img.width}x${img.height})`, 'color: #00ffff');
        resolve(true);
      };
      img.onerror = () => {
        console.error(`[CRITICAL] ${name} MISSING at: ${url}`);
        resolve(false);
      };
    });

    setIsReady(false);
    Promise.all([
      loadMask(logicUrl,   logicCanvas.current,   logicCtx,   'LOGIC'),
      loadMask(entityUrl,  entityCanvas.current,  entityCtx,  'ENTITY'),
      loadMask(hideUrl,    hideCanvas.current,    hideCtx,    'HIDING'),
      loadMask(terrainUrl, terrainCanvas.current, terrainCtx, 'TERRAIN'),
    ]).then(() => setIsReady(true));
  }, [logicUrl, entityUrl, hideUrl, terrainUrl]);

  // Stable after isReady → true. useCallback([isReady]) means Stage's checkCollision
  // wrapper will also stabilize, preventing needless game loop restarts in Character.
  const checkPixel = useCallback((x, y, w, h) => {
    if (!isReady) return { type: 'BLOCK' };

    // Scale player coordinates to mask pixel space
    const px = Math.floor((x / w) * logicCanvas.current.width);
    const py = Math.floor((y / h) * logicCanvas.current.height);

    // Fuzzy read: any channel > 220 is treated as 255 to prevent Photoshop compression errors
    const fuzzyRead = (ctx) => {
      const d = ctx.getImageData(px, py, 1, 1).data;
      return `${d[0] > 220 ? 255 : 0},${d[1] > 220 ? 255 : 0},${d[2] > 220 ? 255 : 0}`;
    };

    const d = logicCtx.current.getImageData(px, py, 1, 1).data;
    const [r, g, b, a] = d;

    // Logic Mask Legend (mask_logic.png):
    // Black  (0,0,0)       = BLOCK (wall/impassable)
    // White  (255,255,255) = WALK
    // Green  (0,255,0)     = INTERACT — stops Maya, signals [E] to inspect
    // Purple (255,0,255)   = HIDE_ZONE — walkable, signals [C] to hide (optional)
    // Blue   (0,0,255)     = EXIT (room threshold)
    //
    // HIDE_ZONE secondary detection:
    // HIDE_ZONE is also derived automatically from mask_hiding.png having any non-black
    // pixel. Designers only need to paint mask_hiding.png — the logic mask purple is additive.
    let type = 'WALK';
    if (a < 10 || (r < 40 && g < 40 && b < 40))    type = 'BLOCK';
    else if (g > 200 && r < 50 && b < 50)           type = 'INTERACT';
    else if (r > 200 && b > 200)                    type = 'HIDE_ZONE';
    else if (b > 200 && r < 50 && g < 50)           type = 'EXIT';

    const hideKey    = fuzzyRead(hideCtx.current);
    const terrainKey = fuzzyRead(terrainCtx.current);

    // Pass 1 — hiding mask upgrades WALK → HIDE_ZONE.
    // Must run before the terrain check so hiding spots under furniture
    // (which read black on the terrain mask) are not overridden to BLOCK.
    if (type === 'WALK' && hideKey !== '0,0,0') {
      type = 'HIDE_ZONE';
    }

    // Pass 2 — terrain mask reinforces walls.
    // Black (0,0,0) on mask_terrain.png means obstacle/wall.
    // Only applies when the logic mask AND hiding mask have not already
    // assigned a meaningful zone (INTERACT, HIDE_ZONE, EXIT) at this pixel.
    if (type === 'WALK' && terrainKey === '0,0,0') {
      type = 'BLOCK';
    }

    // Pass 3 — interaction proximity probe.
    // Problem: INTERACT zones physically stop Maya before she steps onto them.
    // Her feet land on a WALK pixel, so checkPixel at her position returns WALK
    // when idle — the prompt never shows unless she keeps pressing keys.
    //
    // Fix: when Maya is on a WALK pixel, sample four points outward (N/S/E/W)
    // at INTERACT_PROBE_DIST world units. If any probe hits a green pixel,
    // treat Maya as adjacent to that object and return INTERACT with its entity key.
    // This makes [E] available whether Maya is moving, idle, or approaching from any side.
    let entityKey = fuzzyRead(entityCtx.current);

    if (type === 'WALK') {
      const INTERACT_PROBE_DIST = 22; // world units — tune if needed
      const maskW = logicCanvas.current.width;
      const maskH = logicCanvas.current.height;
      // Convert world-unit probe distance to mask-pixel range
      const probeStep = Math.max(1, Math.round((INTERACT_PROBE_DIST / w) * maskW));

      // Scan from 1 → probeStep in each cardinal direction.
      // A single far-point sample (the old approach) skips over narrow INTERACT zones
      // when Maya is stopped right at the boundary. Scanning step-by-step catches
      // the adjacent pixel whether she's moving toward it or standing still.
      // willReadFrequently:true makes each getImageData a cheap CPU array read.
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      probeSearch:
      for (const [dpx, dpy] of dirs) {
        for (let s = 1; s <= probeStep; s++) {
          const ppx = Math.max(0, Math.min(maskW - 1, px + dpx * s));
          const ppy = Math.max(0, Math.min(maskH - 1, py + dpy * s));
          const pd  = logicCtx.current.getImageData(ppx, ppy, 1, 1).data;

          if (pd[1] > 200 && pd[0] < 50 && pd[2] < 50) { // green = INTERACT
            const ed = entityCtx.current.getImageData(ppx, ppy, 1, 1).data;
            entityKey = `${ed[0] > 220 ? 255 : 0},${ed[1] > 220 ? 255 : 0},${ed[2] > 220 ? 255 : 0}`;
            type = 'INTERACT';
            break probeSearch;
          }
          // Black pixel = wall — no point scanning further in this direction
          if (pd[3] < 10 || (pd[0] < 40 && pd[1] < 40 && pd[2] < 40)) break;
        }
      }
    }

    return {
      type,
      entityKey,
      hideKey,
      terrain: terrainKey,
    };
  }, [isReady]);

  return { checkPixel, isReady };
};
