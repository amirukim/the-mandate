/**
 * Builds the authored pixel key art for the main menu: Putrajaya at dusk.
 *
 * 480×200 native, shown at 3× to fill 1440×600. It must hold up under the
 * menu's paper scrim, which washes the left third, so the composition puts
 * the dome complex right of centre and keeps the sky quiet.
 *
 * Art bible rules applied here:
 *  - dusk sky as three flat bands, never a gradient ramp;
 *  - silhouette layers stepping darker toward the viewer;
 *  - gold only as lamp light and the horizon line, not a wash;
 *  - no characters, no flags, no readable text.
 *
 * Run: node scripts/build-menu-plate.mjs
 * Out: public/art/pixel/keyart-menu.png
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PixelCanvas } from "./pixel-canvas.mjs";

const W = 480;
const H = 200;

const px = new PixelCanvas(W, H);

const C = {
  // Dusk sky, three flat bands cooling toward the zenith.
  skyTop: "#141c26",
  skyMid: "#1f2e3d",
  skyLow: "#33465a",
  haze: "#7a5c3a",
  horizon: "#c69b54",
  cloud: "#2a3a4c",
  cloudLit: "#c69b54",
  star: "#dcebf5",
  // Silhouette layers, stepping darker toward the viewer.
  blockFar: "#223448",
  blockMid: "#17202b",
  blockNear: "#0e141d",
  // Lights.
  lit: "#e5c385",
  lamp: "#e5c385",
  lampWarm: "#c69b54",
  // The lake, reflecting the dusk.
  lake: "#1f2e3d",
  lakeDeep: "#16232f",
};

/* ------------------------------------------------------------------ */
/* Sky: three flat bands and a warm haze at the horizon                */
/* ------------------------------------------------------------------ */

px.rect(0, 0, W, 58, C.skyTop);
px.rect(0, 58, W, 46, C.skyMid);
px.rect(0, 104, W, 32, C.skyLow);
px.rect(0, 136, W, 10, C.haze);

// a few first stars in the cold band
for (const [x, y] of [[36, 12], [88, 26], [204, 9], [238, 30], [332, 18], [410, 34], [452, 12]]) px.set(x, y, C.star);

// clouds: stepped clusters with a lit underside catching the last light
px.rect(96, 40, 42, 3, C.cloud);
px.rect(104, 37, 26, 3, C.cloud);
px.hline(96, 43, 42, C.cloudLit);
px.rect(300, 52, 56, 3, C.cloud);
px.rect(312, 49, 30, 3, C.cloud);
px.hline(300, 55, 56, C.cloudLit);
px.rect(408, 36, 30, 2, C.cloud);
px.hline(408, 38, 30, C.cloudLit);

/* ------------------------------------------------------------------ */
/* Far layer: ministry blocks on both banks of the boulevard           */
/* ------------------------------------------------------------------ */

const far = [
  [8, 108, 26, 38], [40, 100, 20, 46], [66, 114, 30, 30], [102, 96, 22, 50],
  [130, 110, 26, 34], [162, 118, 18, 26], [356, 106, 24, 38], [386, 98, 20, 46],
  [412, 112, 28, 32], [446, 102, 22, 42],
];
for (const [x, y, w, h] of far) {
  px.rect(x, y, w, h, C.blockFar);
  // a sparse grid of unlit windows, one tone darker is not needed at this size
  for (let wx = x + 3; wx < x + w - 3; wx += 6) {
    for (let wy = y + 4; wy < y + h - 4; wy += 8) px.rect(wx, wy, 2, 2, C.blockMid);
  }
}

/* ------------------------------------------------------------------ */
/* Mid layer: the domed complex, right of centre, with its wings       */
/* ------------------------------------------------------------------ */

px.rect(268, 118, 128, 26, C.blockMid);
px.rect(256, 128, 14, 16, C.blockMid);
px.rect(394, 128, 14, 16, C.blockMid);
// the dome itself
px.rect(310, 96, 44, 22, C.blockMid);
for (let i = 0; i < 14; i++) {
  const half = Math.round(22 * Math.sqrt(Math.max(0, 1 - (i / 14) * (i / 14))));
  px.hline(332 - half, 96 - i, half * 2, C.blockMid);
}
px.rect(331, 80, 2, 6, C.blockMid);
px.set(332, 79, C.lit);
// a lit colonnade under the dome
for (let x = 314; x <= 350; x += 6) px.rect(x, 122, 2, 8, C.lit);

/* ------------------------------------------------------------------ */
/* The bridge, left third, over the lake                               */
/* ------------------------------------------------------------------ */

px.rect(24, 142, 168, 5, C.blockNear);
// pylons and the deck curve hinted by stepped lights
px.rect(52, 128, 4, 19, C.blockNear);
px.rect(160, 128, 4, 19, C.blockNear);
px.hline(56, 130, 104, C.blockNear);
for (let x = 30; x <= 188; x += 10) px.set(x, 141, C.lamp);
px.set(54, 126, C.lit);
px.set(162, 126, C.lit);

/* ------------------------------------------------------------------ */
/* The lake: dusk reflection with broken gold dashes                   */
/* ------------------------------------------------------------------ */

px.rect(0, 146, W, 24, C.lake);
px.hline(0, 146, W, C.horizon);
for (const [x, y, w] of [[36, 152, 22], [72, 158, 14], [120, 151, 26], [306, 154, 30], [340, 160, 18], [316, 165, 22], [430, 152, 20]]) {
  px.rect(x, y, w, 1, C.lampWarm);
}
px.rect(0, 164, W, 6, C.lakeDeep);

/* ------------------------------------------------------------------ */
/* Boulevard: the near embankment with its lamp posts                  */
/* ------------------------------------------------------------------ */

px.rect(0, 170, W, 30, C.blockNear);
px.hline(0, 170, W, C.blockMid);
for (let x = 28; x < W; x += 56) {
  px.rect(x, 158, 2, 12, C.blockMid);
  px.set(x, 157, C.lamp);
  px.set(x + 1, 157, C.lamp);
}
// the road: a kerb line and the sheen of the evening lane
px.hline(0, 186, W, "#16232f");
px.hline(0, 187, W, "#223448");

/* ------------------------------------------------------------------ */
/* Encode                                                              */
/* ------------------------------------------------------------------ */

const png = px.toPNG();

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/art/pixel/keyart-menu.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);

console.log(`wrote ${out} (${W}×${H}, ${png.length} bytes)`);
console.log(`colours: ${px.colours().length}`);
