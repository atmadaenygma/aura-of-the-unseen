import { useEffect, useState, useRef, useCallback } from 'react';

export const useNavigation = (logicUrl, terrainUrl, imageScale = 1, noCollision = false) => {
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

    if (noCollision || !logicCtx.current) return { type: 'WALK', terrain: '255,255,255' };

    // objectFit: cover — the image is scaled so its smallest dimension fills the world,
    // then centred. Reverse that transform to find which source pixel is at world (x,y).
    const imgW = logicCanvas.current.width;
    const imgH = logicCanvas.current.height;
    const coverScale = Math.max(w / imgW, h / imgH);
    const offX = (w - imgW * coverScale) / 2;   // negative = left/right cropped
    const offY = (h - imgH * coverScale) / 2;   // negative = top/bottom cropped
    const srcX = Math.max(0, Math.min(imgW - 1, (x - offX) / coverScale));
    const srcY = Math.max(0, Math.min(imgH - 1, (y - offY) / coverScale));

    const px = Math.floor(srcX);
    const py = Math.floor(srcY);

    // Fuzzy read: any channel > 220 → 255, prevents Photoshop compression errors
    // Returns walkable white if the mask wasn't loaded (e.g. no terrain mask in scene)
    const fuzzyRead = (ctx) => {
      if (!ctx) return '255,255,255';
      const d = ctx.getImageData(px, py, 1, 1).data;
      return `${d[0] > 220 ? 255 : 0},${d[1] > 220 ? 255 : 0},${d[2] > 220 ? 255 : 0}`;
    };

    const d = logicCtx.current.getImageData(px, py, 1, 1).data;
    const [r, g, b, a] = d;

    // Logic Mask Legend (mask_logic.png):
    // Black  (0,0,0)       = BLOCK
    // White  (255,255,255) = WALK
    // Yellow (255,255,0)   = HIDE_ZONE
    // Exit door colours — use these exact hex values when painting doors:
    //   #0000ff  pure blue    → key '0,0,255'
    //   #05fff3  cyan-green   → key '05fff3'
    //   #e500ff  violet       → key 'e500ff'
    //   #ff0004  red          → key 'ff0004'
    //   #ff8400  orange       → key 'ff8400'
    //   #39b54a  green        → key '39b54a'
    let type    = 'WALK';
    let exitKey = null;
    if (a < 10 || (r < 40 && g < 40 && b < 40))                                  type = 'BLOCK';
    else if (r > 200 && g > 200 && b < 50)                                        type = 'HIDE_ZONE';
    // Exit doors — ordered specific → broad to prevent overlap
    else if (r < 30  && g < 30  && b > 200)                                     { type = 'EXIT'; exitKey = '0,0,255'; }  // pure blue
    else if (r < 30  && g > 200 && b > 200)                                     { type = 'EXIT'; exitKey = '05fff3';  }  // cyan (#05fff3)
    else if (r > 150 && r < 245 && g < 30  && b > 200)                          { type = 'EXIT'; exitKey = 'e500ff';  }  // violet (#e500ff)
    else if (r > 200 && g < 30  && b < 30)                                      { type = 'EXIT'; exitKey = 'ff0004';  }  // red (#ff0004)
    else if (r > 200 && g > 80  && g < 180 && b < 30)                           { type = 'EXIT'; exitKey = 'ff8400';  }  // orange (#ff8400)
    else if (r < 80  && g > 120 && g < 220 && b < 110)                          { type = 'EXIT'; exitKey = '39b54a';  }  // green (#39b54a)

    const terrainKey = fuzzyRead(terrainCtx.current);

    // Terrain mask reinforces walls.
    // Black on mask_terrain.png = obstacle. Only overrides WALK (not HIDE_ZONE/EXIT).
    if (type === 'WALK' && terrainKey === '0,0,0') {
      type = 'BLOCK';
    }

    return { type, terrain: terrainKey, exitKey };
  }, [isReady, noCollision]);

  return { checkPixel, isReady };
};
