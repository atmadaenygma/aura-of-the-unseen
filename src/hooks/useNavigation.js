import { useEffect, useState, useRef, useCallback } from 'react';

export const useNavigation = (logicUrl, terrainUrl) => {
  // Named canvas refs — explicit, no object recreation on render
  const logicCanvas   = useRef(document.createElement('canvas'));
  const terrainCanvas = useRef(document.createElement('canvas'));

  // Cached context refs — getContext() is called once per load, not 60fps
  const logicCtx   = useRef(null);
  const terrainCtx = useRef(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadMask = (url, canvas, ctxRef, name) => new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // willReadFrequently: true — all canvases are sampled 60fps
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctxRef.current = ctx;
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
      loadMask(terrainUrl, terrainCanvas.current, terrainCtx, 'TERRAIN'),
    ]).then(() => setIsReady(true));
  }, [logicUrl, terrainUrl]);

  const checkPixel = useCallback((x, y, w, h) => {
    if (!isReady) return { type: 'BLOCK' };

    const px = Math.floor((x / w) * logicCanvas.current.width);
    const py = Math.floor((y / h) * logicCanvas.current.height);

    // Fuzzy read: any channel > 220 → 255, prevents Photoshop compression errors
    const fuzzyRead = (ctx) => {
      const d = ctx.getImageData(px, py, 1, 1).data;
      return `${d[0] > 220 ? 255 : 0},${d[1] > 220 ? 255 : 0},${d[2] > 220 ? 255 : 0}`;
    };

    const d = logicCtx.current.getImageData(px, py, 1, 1).data;
    const [r, g, b, a] = d;

    // Logic Mask Legend (mask_logic.png):
    // Black  (0,0,0)       = BLOCK     — wall / impassable furniture / chair legs
    // White  (255,255,255) = WALK      — open floor
    // Yellow (255,255,0)   = HIDE_ZONE — under-furniture floor, crouch-only passable
    // Blue   (0,0,255)     = EXIT      — room transition trigger
    let type = 'WALK';
    if (a < 10 || (r < 40 && g < 40 && b < 40)) type = 'BLOCK';
    else if (r > 200 && g > 200 && b < 50)       type = 'HIDE_ZONE';
    else if (b > 200 && r < 50  && g < 50)       type = 'EXIT';

    const terrainKey = fuzzyRead(terrainCtx.current);

    // Terrain mask reinforces walls.
    // Black on mask_terrain.png = obstacle. Only overrides WALK (not HIDE_ZONE/EXIT).
    if (type === 'WALK' && terrainKey === '0,0,0') {
      type = 'BLOCK';
    }

    return { type, terrain: terrainKey };
  }, [isReady]);

  return { checkPixel, isReady };
};
