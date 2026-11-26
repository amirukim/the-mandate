/**
 * Builds the federation terrain plate — 400x213, the chunky-pixel map.
 * Displayed at 3x (1200x640) with image-rendering: pixelated, so every drawn
 * pixel becomes a 3px block: true pixel art, not a smooth vector map (art
 * bible 5.7; v2 map revamp).
 *
 * Layers: sea band, shore halo, neighbour tones, the federation in cream with
 * a navy coast, subdued state tones, stepped relief ridges clipped to real
 * polygons, rivers, landmark pixels.
 *
 * Run: npm run build:map-plate   (tsx scripts/build-map-plate.ts)
 * Out: public/art/pixel/map-federation.png
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PixelCanvas } from "./pixel-canvas.mjs";
import {
  GEO_Thailand, GEO_Indonesia, GEO_Vietnam, GEO_Philippines,
  GEO_Brunei, GEO_Singapore, GEO_China, GEO_Taiwan, GEO_Papua_New_Guinea, GEO_East_Timor,
  type GeoRing,
} from "../src/data/geo-paths";
import { GEO_STATES } from "../src/data/geo-states";

const here = dirname(fileURLToPath(import.meta.url));
const W = 400, H = 213; // bible spec: 400x213 at x3 = 1200x640
const px = new PixelCanvas(W, H);
const C_GOLD_LT = "#e5c385";

/** rings arrive baked at 1200x640; divide by 3 into plate space */
const to3 = (ring: GeoRing | number[][]): [number, number][] =>
  (ring as ReadonlyArray<ReadonlyArray<number>>).map((p) => [
    Math.round((p[0] / 3) * 10) / 10,
    Math.round((p[1] / 3) * 10) / 10,
  ]);
const at3 = (lon: number, lat: number): [number, number] => {
  const x = ((lon - 92) / 40) * (1200 / 3);
  const y = 213 - ((lat + 12) / 42) * (640 / 3);
  return [Math.round(x), Math.round(y)];
};

/* --- polygon helpers on plate space -------------------------------------- */

function fillPolygon(ring: number[][], colour: string) {
  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of ring) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  for (let y = Math.max(0, Math.ceil(minY)); y <= Math.min(H - 1, Math.floor(maxY)); y++) {
    const xs: number[] = [];
    for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xa = Math.max(0, Math.ceil(xs[i]));
      const xb = Math.min(W - 1, Math.floor(xs[i + 1]));
      for (let x = xa; x <= xb; x++) px.set(x, y, colour);
    }
  }
}

function strokePolygon(ring: number[][], colour: string, width = 1) {
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1];
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x1 + ((x2 - x1) * s) / steps);
      const y = Math.round(y1 + ((y2 - y1) * s) / steps);
      if (width <= 1) px.set(x, y, colour);
      else px.disc(x, y, Math.floor(width / 2), colour);
    }
  }
}

function insideRing(ring: number[][], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1];
    if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
      if (x < x1 + ((y - y1) / (y2 - y1)) * (x2 - x1)) inside = !inside;
    }
  }
  return inside;
}

/* --- sea + shore halo ------------------------------------------------------ */

px.rect(0, 0, W, 13, "#cfe3f2"); // horizon band
px.rect(0, 13, W, H - 13, "#bfd7ea");
const MY_RINGS = Object.values(GEO_STATES).map((rings) => rings.map((ring) => to3(ring)));
for (const rings of MY_RINGS) for (const ring of rings) strokePolygon(ring, "#d5e9f6", 8);
for (const rings of MY_RINGS) for (const ring of rings) strokePolygon(ring, "#e0f0fa", 3);

/* --- neighbours ------------------------------------------------------------- */

const NEIGHBOURS: GeoRing[][] = [
  GEO_Thailand, GEO_Indonesia, GEO_Vietnam, GEO_Philippines,
  GEO_Brunei, GEO_Singapore, GEO_China, GEO_Taiwan,
  GEO_Papua_New_Guinea, GEO_East_Timor,
];
for (const rings of NEIGHBOURS) for (const ring of rings) fillPolygon(to3(ring), "#e3e0d3");

/* --- the federation ----------------------------------------------------------- */

const STATE_TONE: Record<string, string> = {
  perlis: "#5a7ea6", kedah: "#5a7ea6", penang: "#5a7ea6", perak: "#5a7ea6",
  selangor: "#5a7ea6", "kuala-lumpur": "#5a7ea6", putrajaya: "#5a7ea6",
  kelantan: "#5f8a74", terengganu: "#5f8a74", pahang: "#5f8a74",
  sabah: "#8a8478", sarawak: "#8a8478", labuan: "#8a8478",
  "negeri-sembilan": "#8a8478", melaka: "#5a7ea6", johor: "#5a7ea6",
};
for (const rings of MY_RINGS) {
  for (const ring of rings) fillPolygon(ring, "#f7f4ec");
}
for (const rings of MY_RINGS) {
  for (const ring of rings) strokePolygon(ring, "#1a1e6e", 1);
}
for (const [id, rings] of Object.entries(GEO_STATES)) {
  const tone = STATE_TONE[id] ?? "#8a8478";
  for (const ring of rings) strokePolygon(to3(ring), tone, 1);
}

/* --- banded relief, clipped to the federation ---------------------------------- */

const RELIEF_BANDS: Array<{ axis: [number, number][]; c: string }> = [
  { axis: [[101.4, 3.4], [101.7, 4.2], [102.0, 4.9], [102.2, 5.6]], c: "#527b72" }, // Titiwangsa
  { axis: [[116.2, 5.1], [116.4, 5.6], [116.6, 6.1]], c: "#4a6b5c" },               // Crocker / Kinabalu
  { axis: [[113.6, 1.6], [114.2, 2.1], [114.6, 2.6]], c: "#4a6b5c" },               // Sarawak highlands
  { axis: [[102.4, 3.0], [102.9, 3.6], [103.2, 4.2]], c: "#527b72" },               // eastern spur
];
const allRings = MY_RINGS.flat();
for (const band of RELIEF_BANDS) {
  for (let s = 0; s < band.axis.length - 1; s++) {
    const [lon1, lat1] = band.axis[s]; const [lon2, lat2] = band.axis[s + 1];
    const steps = Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) * 10);
    for (let t = 0; t <= steps; t++) {
      const lon = lon1 + ((lon2 - lon1) * t) / steps;
      const lat = lat1 + ((lat2 - lat1) * t) / steps;
      const [x, y] = at3(lon, lat);
      if (allRings.some((ring) => insideRing(ring, x, y))) {
        px.rect(x, y, 1, 1, Math.floor(t / 3) % 2 === 0 ? band.c : "#3b5b54");
      }
    }
  }
}

/* --- rivers ------------------------------------------------------------------------ */

const RIVERS: [number, number][][] = [
  [[101.9, 4.6], [101.6, 4.2], [101.45, 3.7], [101.3, 3.2]], // Perak river
  [[102.2, 4.8], [102.4, 4.2], [102.7, 3.8], [103.0, 3.4]],  // east coast
  [[116.3, 5.7], [116.5, 5.3], [116.7, 5.0]],                // Sabah
  [[112.2, 2.6], [111.9, 2.1], [111.4, 1.7]],                // Sarawak
];
for (const river of RIVERS) {
  for (let s = 0; s < river.length - 1; s++) {
    const [lon1, lat1] = river[s]; const [lon2, lat2] = river[s + 1];
    const steps = Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) * 8);
    for (let t = 0; t <= steps; t++) {
      const [x, y] = at3(lon1 + ((lon2 - lon1) * t) / steps, lat1 + ((lat2 - lat1) * t) / steps);
      if (allRings.some((ring) => insideRing(ring, x, y))) px.set(x, y, "#9fc4dd");
    }
  }
}

/* --- landmark pixels ------------------------------------------------------------------ */

// Petronas Towers near KL: twin dark columns with gold tips
{
  const [x, y] = at3(101.72, 3.16);
  px.rect(x - 1, y - 2, 1, 2, "#39414c");
  px.rect(x + 1, y - 2, 1, 2, "#39414c");
  px.set(x - 1, y - 3, C_GOLD_LT);
  px.set(x + 1, y - 3, C_GOLD_LT);
}
// Putrajaya: gold dome pixel
{
  const [x, y] = at3(101.7, 2.93);
  px.set(x, y, C_GOLD_LT);
}
// Penang Bridge: dotted line island-to-mainland
{
  const [x1, y1] = at3(100.28, 5.22);
  const [x2, y2] = at3(100.42, 5.35);
  for (let t = 0; t <= 6; t++) px.set(Math.round(x1 + ((x2 - x1) * t) / 6), Math.round(y1 + ((y2 - y1) * t) / 6), "#8a8478");
}
// Mount Kinabalu: stepped peak
{
  const [x, y] = at3(116.62, 6.05);
  px.set(x, y - 1, "#f7f4ec");
  px.set(x - 1, y, "#d8cbb0"); px.set(x + 1, y, "#d8cbb0");
  px.rect(x - 1, y + 1, 3, 1, "#c9c2ae");
}
// Kuching waterfront: gold pixel
{
  const [x, y] = at3(110.34, 1.55);
  px.set(x, y, C_GOLD_LT);
}

/* --- encode + manifest ------------------------------------------------------------------ */

const png = px.toPNG();
const outDir = resolve(here, "../public/art/pixel");
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, "map-federation.png");
writeFileSync(outFile, png);
console.log(`wrote ${outFile} (${W}x${H}, ${png.length} bytes)`);

const manifestPath = resolve(here, "../src/data/asset-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.assets = manifest.assets.filter((a: { id: string }) => a.id !== "map.federation");
manifest.assets.push({
  id: "map.federation",
  kind: "map",
  src: "/art/pixel/map-federation.png",
  width: W,
  height: H,
  scale: 3,
  source: "authored",
  licence: "original",
  note: "Chunky-pixel terrain plate built from Natural Earth geometry (build:map-plate).",
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest now ${manifest.assets.length} assets`);
