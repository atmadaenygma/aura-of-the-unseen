// Read spawn position from mask color
// Returns { x, y } for the center of pixels matching the given color
export const readSpawnFromMask = (maskUrl, colorRGB) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = maskUrl;
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const [r, g, b] = colorRGB.split(',').map(v => parseInt(v.trim()));

      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let foundAny = false;

      // Find all pixels matching the color
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const px = ctx.getImageData(x, y, 1, 1).data;
          // Fuzzy match: any channel > 220 → 255
          const matchR = px[0] > 220;
          const matchG = px[1] > 220;
          const matchB = px[2] > 220;

          const targetR = r > 220;
          const targetG = g > 220;
          const targetB = b > 220;

          if (matchR === targetR && matchG === targetG && matchB === targetB) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            foundAny = true;
          }
        }
      }

      if (foundAny) {
        resolve({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
      } else {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
  });
};
