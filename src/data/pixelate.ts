/**
 * Rasterizes any art file to a low-resolution canvas (⅓ scale by convention)
 * and returns a PNG data URL. Rendered back at full size with
 * image-rendering: pixelated, this converts the whole illustrated family to
 * the game's pixel look without repainting a single file. Cached per source.
 */
const cache = new Map<string, Promise<string>>();

export function pixelateArt(src: string, width: number, height: number): Promise<string> {
  const key = `${src}@${width}x${height}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const job = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("pixelate: no 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`pixelate: failed to load ${src}`));
    img.src = src;
  });
  cache.set(key, job);
  return job;
}
