import { useEffect, useState, useRef } from 'react';

export const useNavigation = (logicUrl, entityUrl, hideUrl, terrainUrl) => {
  const canvases = {
    logic: useRef(document.createElement('canvas')),
    entity: useRef(document.createElement('canvas')),
    hide: useRef(document.createElement('canvas')),
    terrain: useRef(document.createElement('canvas'))
  };
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = (url, canvas) => new Promise((res) => {
      const img = new Image(); img.src = `${url}?v=${Date.now()}`; img.crossOrigin = "anonymous";
      img.onload = () => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0); res(true);
      };
      img.onerror = () => res(false);
    });

    setIsReady(false);
    Promise.all([
      load(logicUrl, canvases.logic.current),
      load(entityUrl, canvases.entity.current),
      load(hideUrl, canvases.hide.current),
      load(terrainUrl, canvases.terrain.current)
    ]).then(() => setIsReady(true));
  }, [logicUrl, entityUrl, hideUrl, terrainUrl]);

  const checkPixel = (x, y, w, h) => {
    if (!isReady) return { type: 'BLOCK' };
    const px = Math.floor((x / w) * canvases.logic.current.width);
    const py = Math.floor((y / h) * canvases.logic.current.height);

    const getFuzzy = (cvs) => {
      const d = cvs.getContext('2d').getImageData(px, py, 1, 1).data;
      return `${d[0]>240?255:0},${d[1]>240?255:0},${d[2]>240?255:0}`;
    };

    const [lr, lg, lb, la] = canvases.logic.current.getContext('2d').getImageData(px, py, 1, 1).data;
    const [tr, tg, tb] = canvases.terrain.current.getContext('2d').getImageData(px, py, 1, 1).data;

    let type = 'WALK';
    if (la < 10 || (lr < 40 && lg < 40 && lb < 40)) type = 'BLOCK';
    else if (lg > 200 && lr < 50) type = 'INTERACT';
    else if (lr > 200 && lb > 200) type = 'HIDE_ZONE';
    else if (lb > 200) type = 'EXIT';

    return { 
      type, 
      entityKey: getFuzzy(canvases.entity.current),
      hideKey: getFuzzy(canvases.hide.current),
      terrain: `${tr},${tg},${tb}` 
    };
  };

  return { checkPixel, isReady };
};