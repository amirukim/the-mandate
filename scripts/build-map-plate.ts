/**
 * Builds the federation terrain plate: 1200x640, rendered once at build time
 * from the same baked polygons the map draws (geo-paths.ts + geo-states.ts),
 * so the runtime never rasterizes (v2 plan D, decision D-11).
 *
 * Layers: sea, shore halo, neighbour paper tones, the federation in cream with
 * a navy coast, banded relief (Titiwangsa, Crocker, Sarawak highlands),
 * rivers, landmark props, state tones. The plate is opaque.
 *
 * Run: npm run build:map-plate   (tsx scripts/build-map-plate.ts)
 * Out: public/art/pixel/map-federation.png
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error — plain JS canvas helper (no type declarations)
import { PixelCanvas } from "./pixel-canvas.mjs";
import {
  GEO_Thailand, GEO_Indonesia, GEO_Vietnam, GEO_Philippines,
  GEO_Brunei, GEO_Singapore, GEO_China, GEO_Taiwan, GEO_Papua_New_Guinea, GEO_East_Timor,
  type GeoRing,
} from "../src/data/geo-paths";
import { GEO_STATES } from "../src/data/geo-states";

const here = dirname(fileURLToPath(import.meta.url));
const W = 1200, H = 640;
const px = new PixelCanvas(W, H);

/* --- polygon helpers over the baked coordinates ------------------------- */

function fillPolygon(canvas: PixelCanvas, ring: any, colour: string) {
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
      for (let x = xa; x <= xb; x++) canvas.set(x, y, colour);
    }
  }
}

function strokePolygon(canvas: PixelCanvas, ring: any, colour: string, width: number) {
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1];
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x1 + ((x2 - x1) * s) / steps);
      const y = Math.round(y1 + ((y2 - y1) * s) / steps);
      if (width <= 1) canvas.set(x, y, colour);
      else canvas.disc(x, y, Math.floor(width / 2), colour);
    }
  }
}

function insideRing(ring: any, x: number, y: number): boolean {
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

px.rect(0, 0, W, 40, "#cfe3f2"); // horizon band
px.rect(0, 40, W, H - 40, "#bfd7ea");
for (const rings of Object.values(GEO_STATES)) {
  for (const ring of rings) strokePolygon(px, ring, "#d5e9f6", 24);
}
for (const rings of Object.values(GEO_STATES)) {
  for (const ring of rings) strokePolygon(px, ring, "#e0f0fa", 10);
}

/* --- neighbours ------------------------------------------------------------ */

const NEIGHBOURS: Array<[GeoRing[], string]> = [
  [GEO_Thailand, "#e3e0d3"], [GEO_Indonesia, "#e0dcc9"], [GEO_Vietnam, "#e6e2d6"],
  [GEO_Philippines, "#ded9c4"], [GEO_Brunei, "#efe9dc"], [GEO_Singapore, "#efe9dc"],
  [GEO_China, "#dcd8c8"], [GEO_Taiwan, "#dcd8c8"], [GEO_Papua_New_Guinea, "#dcd8c8"],
  [GEO_East_Timor, "#dcd8c8"],
];
for (const [rings, colour] of NEIGHBOURS) {
  for (const ring of rings) fillPolygon(px, ring, colour);
}

/* --- the federation --------------------------------------------------------- */

const MY_RINGS = Object.values(GEO_STATES).flat();
for (const rings of Object.values(GEO_STATES)) {
  for (const ring of rings) fillPolygon(px, ring, "#f7f4ec");
}
for (const rings of Object.values(GEO_STATES)) {
  for (const ring of rings) strokePolygon(px, ring, "#1a1e6e", 3);
}

/* --- state tones (political layer, subdued) --------------------------------- */

const STATE_TONE: Record<string, string> = {
  perlis: "#5a7ea6", kedah: "#5a7ea6", penang: "#5a7ea6", perak: "#5a7ea6",
  selangor: "#5a7ea6", "kuala-lumpur": "#5a7ea6", putrajaya: "#5a7ea6",
  kelantan: "#5f8a74", terengganu: "#5f8a74", pahang: "#5f8a74",
  sabah: "#8a8478", sarawak: "#8a8478", labuan: "#8a8478",
  "negeri-sembilan": "#8a8478", melaka: "#5a7ea6", johor: "#5a7ea6",
};
for (const [id, rings] of Object.entries(GEO_STATES)) {
  for (const ring of rings) strokePolygon(px, ring, STATE_TONE[id] ?? "#8a8478", 2);
}

/* --- banded relief, clipped to the federation -------------------------------- */

const RELIEF_BANDS: Array<{ axis: [number, number][]; c: string }> = [
  { axis: [[101.4, 3.4], [101.7, 4.2], [102.0, 4.9], [102.2, 5.6]], c: "#527b72" }, // Titiwangsa
  { axis: [[116.2, 5.1], [116.4, 5.6], [116.6, 6.1]], c: "#4a6b5c" },               // Crocker / Kinabalu
  { axis: [[113.6, 1.6], [114.2, 2.1], [114.6, 2.6]], c: "#4a6b5c" },               // Sarawak highlands
  { axis: [[102.4, 3.0], [102.9, 3.6], [103.2, 4.2]], c: "#527b72" },               // eastern spur
];
const project = (lon: number, lat: number): [number, number] => [
  ((lon - 92) / 40) * W,
  H - ((lat + 12) / 42) * H,
];
for (const band of RELIEF_BANDS) {
  for (let s = 0; s < band.axis.length - 1; s++) {
    const [lon1, lat1] = band.axis[s]; const [lon2, lat2] = band.axis[s + 1];
    const steps = Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) * 30);
    for (let t = 0; t <= steps; t++) {
      const [x, y] = project(lon1 + ((lon2 - lon1) * t) / steps, lat1 + ((lat2 - lat1) * t) / steps);
      if (!MY_RINGS.some((ring) => insideRing(ring, x, y))) continue;
      px.rect(x, y, 2, 2, Math.floor(t / 4) % 2 === 0 ? band.c : "#3b5b54");
    }
  }
}

/* --- rivers -------------------------------------------------------------------- */

const RIVERS: [number, number][][] = [
  [[101.9, 4.6], [101.6, 4.2], [101.45, 3.7], [101.3, 3.2]], // Perak river
  [[102.2, 4.8], [102.4, 4.2], [102.7, 3.8], [103.0, 3.4]],  // east coast
  [[116.3, 5.7], [116.5, 5.3], [116.7, 5.0]],                // Sabah
  [[112.2, 2.6], [111.9, 2.1], [111.4, 1.7]],                // Sarawak
];
for (const river of RIVERS) {
  for (let s = 0; s < river.length - 1; s++) {
    const [lon1, lat1] = river[s]; const [lon2, lat2] = river[s + 1];
    const steps = Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) * 24);
    for (let t = 0; t <= steps; t++) {
      const [x, y] = project(lon1 + ((lon2 - lon1) * t) / steps, lat1 + ((lat2 - lat1) * t) / steps);
      if (MY_RINGS.some((ring) => insideRing(ring, x, y))) px.rect(x, y, 1, 2, "#9fc4dd");
    }
  }
}

/* --- landmarks -------------------------------------------------------------------- */

// Petronas Towers near KL
{
  const [x, y] = project(101.72, 3.16);
  px.rect(x - 1, y - 10, 1, 8, "#d8cbb0");
  px.rect(x + 1, y - 9, 1, 7, "#d8cbb0");
  px.rect(x - 1, y - 3, 3, 2, "#8a8478");
}
// Putrajaya: gold dome dot
{
  const [x, y] = project(101.7, 2.93);
  px.disc(x, y, 2, "#c69b54");
}
// Penang Bridge
{
  const [x1, y1] = project(100.28, 5.22);
  const [x2, y2] = project(100.42, 5.35);
  for (let t = 0; t <= 18; t++) px.rect(x1 + ((x2 - x1) * t) / 18, y1 + ((y2 - y1) * t) / 18, 1, 1, "#8a8478");
}
// Mount Kinabalu
{
  const [x, y] = project(116.62, 6.05);
  for (let i = 0; i < 5; i++) px.rect(x - (4 - i), y + i * 2, (4 - i) * 2, 2, i < 2 ? "#d8cbb0" : "#c9c2ae");
  px.rect(x - 1, y - 2, 2, 2, "#f7f4ec");
}
// Kuching waterfront
{
  const [x, y] = project(110.34, 1.55);
  px.rect(x - 2, y, 5, 1, "#c69b54");
}

/* --- encode + manifest ------------------------------------------------------------- */

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
  scale: 1,
  source: "authored",
  licence: "original",
  note: "Terrain plate built from Natural Earth geometry (build:map-plate).",
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest now ${manifest.assets.length} assets`);
