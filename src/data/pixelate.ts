/**
 * Rasterizes any art file into a hard-edged pixel grid:
 *   1. the vector source is drawn once at its FULL resolution (sharp),
 *   2. then downsampled to the pixel grid with image smoothing disabled —
 *      every cell takes the hard colour of its source block, zero
 *      anti-aliasing — so the upscaled result is crisp pixel art, never a
 *      blurred small photo.
 * Cached per source and size.
 */
const cache = new Map<string, Promise<string>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`pixelate: failed to load ${src}`));
    img.src = src;
  });
}

export async function pixelateArt(src: string, width: number, height: number): Promise<string> {
  const key = `${src}@${width}x${height}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const job = (async () => {
    const img = await loadImage(src);
    // pass 1 — full-resolution raster, sharp vector edges
    const full = document.createElement("canvas");
    full.width = width * 3;
    full.height = height * 3;
    const fctx = full.getContext("2d");
    if (!fctx) throw new Error("pixelate: no 2d context");
    fctx.drawImage(img, 0, 0, full.width, full.height);
    // pass 2 — nearest-neighbour downsample onto the pixel grid
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const octx = out.getContext("2d");
    if (!octx) throw new Error("pixelate: no 2d context");
    octx.imageSmoothingEnabled = false;
    octx.drawImage(full, 0, 0, width, height);
    return out.toDataURL("image/png");
  })();
  cache.set(key, job);
  return job;
}
