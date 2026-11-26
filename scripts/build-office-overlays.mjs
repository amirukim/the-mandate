/**
 * Builds the animated/state-reactive office overlays (v2 Phase 5): transparent
 * PNGs positioned over the base plate by src/pages/Office.tsx — day/night
 * window, monsoon rain, ceiling fan, flag sway/furled, clock face + monthly
 * hands, in-tray file stack, orchid fresh/wilted, award plaque, wire pile and
 * the phone badge. All reduced-motion safe (the page picks static frames).
 *
 * Run: npm run build:office-overlays
 */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/art/pixel/office");
mkdirSync(outDir, { recursive: true });

/* --- tiny RGBA canvas ------------------------------------------------- */

class Rgba {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(null); // "r,g,b,a" strings or null
  }
  set(x, y, v) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = v;
  }
  rect(x, y, w, h, v) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.set(xx, yy, v);
  }
  hline(x, y, w, v) {
    this.rect(x, y, w, 1, v);
  }
  vline(x, y, h, v) {
    this.rect(x, y, 1, h, v);
  }
  disc(cx, cy, r, v) {
    for (let yy = cy - r; yy <= cy + r; yy++)
      for (let xx = cx - r; xx <= cx + r; xx++) {
        if ((xx - cx) ** 2 + (yy - cy) ** 2 <= r * r) this.set(xx, yy, v);
      }
  }
}

function encode(c) {
  const raw = Buffer.alloc(c.h * (c.w * 4 + 1));
  for (let y = 0; y < c.h; y++) {
    raw[y * (c.w * 4 + 1)] = 0;
    for (let x = 0; x < c.w; x++) {
      const v = c.px[y * c.w + x];
      const i = y * (c.w * 4 + 1) + 1 + x * 4;
      if (v === null || v === undefined) continue;
      const parts = v.split(",").map((s) => parseFloat(s.trim()));
      raw[i] = parts[0];
      raw[i + 1] = parts[1];
      raw[i + 2] = parts[2];
      raw[i + 3] = parts.length > 3 ? Math.round(parts[3] * 255) : 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBytes = Buffer.from(type, "ascii");
  const crcTable = crcTableGlobal;
  let c = 0xffffffff;
  const all = Buffer.concat([typeBytes, data]);
  for (let i = 0; i < all.length; i++) c = crcTable[(c ^ all[i]) & 0xff] ^ (c >>> 8);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

const crcTableGlobal = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/* --- palette ----------------------------------------------------------- */

const P = {
  ink: "#23,32,43,1",
  navy: "#38,56,73,1",
  navyDeep: "#26,40,56,1",
  paper: "#233,226,201,1",
  paperLt: "#244,236,218,1",
  paperDeep: "#216,203,176,1",
  gold: "198,155,84,1",
  goldLt: "229,195,133,1",
  burg: "128,63,69,1",
  burgDk: "91,43,48,1",
  moss: "82,123,114,1",
  mossDk: "59,91,84,1",
  skyDay: "191,215,234,1",
  skyDayLt: "220,235,245,1",
  skyNight: "30,42,58,1",
  skyNightLt: "44,60,80,1",
  city: "147,169,191,1",
  windowLit: "229,195,133,1",
  rain: "255,255,255,0.4",
  rainSoft: "200,220,238,0.45",
  steam: "255,255,255,0.5",
};

/* --- window day (baked into the base plate) vs night ------------------- */

function windowPlate(night) {
  const c = new Rgba(152, 101);
  const sky = night ? "30,42,58,1" : "191,215,234,1";
  const skyMid = night ? "44,60,80,1" : "220,235,245,1";
  const skyLow = night ? "52,70,92,1" : "243,249,253,1";
  c.rect(0, 0, 152, 101, sky);
  c.rect(0, 30, 152, 34, skyMid);
  c.rect(0, 64, 152, 37, skyLow);
  if (night) {
    // stars
    for (const [x, y] of [[18, 10], [42, 22], [70, 8], [104, 16], [128, 26], [60, 18], [96, 30]]) c.rect(x, y, 1, 1, "255,255,255,0.8");
  } else {
    // clouds
    c.rect(12, 12, 27, 2, "255,255,255,0.85");
    c.rect(20, 9, 14, 3, "255,255,255,0.85");
    c.rect(115, 6, 31, 2, "255,255,255,0.7");
    c.rect(123, 3, 15, 3, "255,255,255,0.7");
  }
  // skyline: ministry blocks stepping down to the boulevard
  const blocks = [
    [3, 71, 24, 30], [29, 59, 18, 42], [49, 75, 26, 26], [77, 65, 20, 36],
    [101, 73, 22, 28], [129, 57, 20, 44], [131, 69, 6, 32],
  ];
  for (const [x, y, w, h] of blocks) c.rect(x, y, w, h, night ? "38,54,72,1" : "147,169,191,1");
  // the dome
  c.rect(86, 57, 14, 8, night ? "30,44,60,1" : "147,169,191,1");
  for (let i = 0; i < 5; i++) {
    const half = Math.round(7 * Math.sqrt(Math.max(0, 1 - (i / 5) * (i / 5))));
    c.hline(93 - half, 73 - i - 8, half * 2, night ? "30,44,60,1" : "147,169,191,1");
  }
  c.rect(92, 49, 2, 4, night ? "30,44,60,1" : "147,169,191,1");
  if (night) {
    // lit windows at night
    for (const [x, y] of [[8, 78], [14, 84], [34, 66], [36, 78], [56, 82], [82, 72], [86, 84], [106, 80], [132, 66], [136, 78]]) {
      c.rect(x, y, 2, 2, "229,195,133,0.95");
    }
    c.rect(88, 62, 12, 2, "229,195,133,0.9");
  } else {
    for (const [x, y] of [[8, 78], [34, 66], [56, 82], [82, 72], [106, 80], [132, 66]]) c.rect(x, y, 2, 2, "243,249,253,0.9");
  }
  return c;
}

/* --- rain (two frames, over the window) -------------------------------- */

function rainPlate(frame) {
  const c = new Rgba(160, 112);
  const streaks = frame === 0
    ? [[10, 8], [34, 30], [58, 12], [82, 36], [106, 20], [130, 40], [22, 52], [70, 60], [118, 56], [146, 24]]
    : [[22, 14], [46, 36], [70, 18], [94, 42], [118, 26], [142, 46], [34, 58], [82, 66], [128, 62], [8, 30]];
  for (const [x, y] of streaks) {
    for (let i = 0; i < 7; i++) c.rect(x - i, y + i * 2, 1, 2, i < 4 ? P.rain : P.rainSoft);
  }
  return c;
}

/* --- ceiling fan (three rotation frames) -------------------------------- */

function fanPlate(frame) {
  const c = new Rgba(52, 14);
  const cx = 26, cy = 10;
  c.rect(cx - 1, 0, 3, 4, "90,74,56,1"); // drop rod
  c.disc(cx, cy, 3, "90,74,56,1");
  const baseAngle = (frame * Math.PI) / 6;
  for (let b = 0; b < 4; b++) {
    const ang = baseAngle + (b * Math.PI) / 2;
    for (let t = 4; t <= 16; t++) {
      const x = cx + Math.round(Math.cos(ang) * t);
      const y = cy + Math.round(Math.sin(ang) * t * 0.45);
      c.rect(x - 1, y - 1, 3, 2, b % 2 === 0 ? "110,92,70,1" : "76,62,46,1");
    }
  }
  return c;
}

/* --- coffee steam (three frames) ---------------------------------------- */

function steamPlate(frame) {
  const c = new Rgba(14, 17);
  const wisps = [
    [[6, 12], [4, 8], [8, 4]],
    [[8, 12], [5, 7], [3, 3]],
    [[4, 12], [7, 8], [5, 4]],
  ][frame];
  for (const [x, y] of wisps) {
    c.rect(x, y, 2, 3, "255,255,255,0.55");
    c.rect(x + 1, y - 3, 1, 2, "255,255,255,0.35");
  }
  return c;
}

/* --- flag: sway frames + furled ----------------------------------------- */

function flagPlate(frame) {
  const c = new Rgba(22, 53);
  const wave = frame === 0 ? [0, 1, 1, 0, 0, -1, -1, 0] : [0, -1, -1, 0, 0, 1, 1, 0];
  for (let row = 0; row < 51; row++) {
    const dy = wave[Math.floor(row / 6.4) % wave.length] ?? 0;
    const y = 1 + row + dy;
    const stripeRed = Math.floor(row / 3.6) % 2 === 0;
    c.rect(0, y, 20, 1, stripeRed ? "204,0,1,1" : "247,240,224,1");
    if (row < 25) c.rect(0, y, 10, 1, "26,30,110,1");
  }
  // canton star + moon
  c.rect(4, 8, 2, 2, "255,204,0,1");
  c.rect(3, 10, 4, 1, "255,204,0,1");
  c.set(4, 11, "255,204,0,1");
  return c;
}

function flagFurled() {
  const c = new Rgba(22, 53);
  // cloth rolled and tied below the finial
  c.rect(6, 4, 9, 40, "178,80,86,1");
  c.vline(6, 4, 40, "204,0,1,1");
  c.vline(9, 4, 40, "91,43,48,1");
  c.rect(4, 10, 13, 2, "38,56,73,1");
  c.rect(4, 32, 13, 2, "38,56,73,1");
  return c;
}

/* --- clock face + monthly hands ----------------------------------------- */

function clockFace() {
  const c = new Rgba(30, 30);
  c.disc(15, 15, 14, "233,223,201,1");
  c.disc(15, 15, 12, "244,236,218,1");
  c.disc(15, 15, 10, "233,223,201,1");
  for (const [dx, dy] of [[0, -9], [9, 0], [0, 9], [-9, 0]]) c.rect(15 + dx - 1, 15 + dy - 1, 2, 2, "38,56,73,1");
  return c;
}

function clockHands(month) {
  const c = new Rgba(30, 30);
  const cx = 15, cy = 15;
  const hourAngle = ((month % 12) * Math.PI) / 6;
  const minuteAngle = Math.PI; // minute hand rests at XII
  for (let t = 0; t <= 7; t++) {
    const x = cx + Math.round(Math.sin(hourAngle) * t);
    const y = cy - Math.round(Math.cos(hourAngle) * t);
    c.rect(x - 1, y - 1, 2, 2, "38,56,73,1");
  }
  for (let t = 0; t <= 9; t++) {
    const x = cx + Math.round(Math.sin(minuteAngle) * t * 0.2);
    const y = cy - Math.round(Math.cos(minuteAngle) * t);
    c.set(x, y, "38,56,73,1");
  }
  c.disc(cx, cy, 2, "128,63,69,1");
  return c;
}

/* --- in-tray file stack (queued briefings) ------------------------------- */

function fileStack(level) {
  const c = new Rgba(34, 17);
  // the tray
  c.rect(2, 12, 30, 3, "76,62,46,1");
  c.rect(3, 10, 28, 2, "109,92,70,1");
  if (level >= 1) {
    c.rect(6, 7, 22, 3, "128,63,69,1");
    c.hline(6, 7, 22, "155,90,95,1");
  }
  if (level >= 2) {
    c.rect(5, 3, 24, 3, "155,90,95,1");
    c.hline(5, 3, 24, "180,110,115,1");
    c.rect(9, 1, 16, 2, "128,63,69,1");
  }
  return c;
}

/* --- orchid: fresh vs wilting -------------------------------------------- */

function orchid(wilted) {
  const c = new Rgba(10, 20);
  if (wilted) {
    c.rect(4, 8, 1, 9, "59,91,84,1");
    c.rect(5, 16, 2, 2, "59,91,84,1");
    c.rect(2, 6, 3, 2, "128,63,69,1");
    c.set(1, 8, "155,90,95,1");
    c.rect(6, 10, 2, 2, "128,63,69,0.8");
    c.rect(1, 17, 4, 2, "216,203,176,1"); // fallen petal on the sideboard
  } else {
    c.rect(4, 7, 1, 11, "59,91,84,1");
    c.rect(3, 6, 3, 2, "82,123,114,1");
    c.rect(2, 3, 4, 3, "128,63,69,1");
    c.set(3, 2, "155,90,95,1");
    c.rect(6, 5, 3, 2, "128,63,69,0.9");
    c.rect(1, 9, 2, 2, "155,90,95,0.85");
  }
  return c;
}

/* --- award plaque / wire pile / phone badge ------------------------------- */

function awardPlaque() {
  const c = new Rgba(16, 10);
  c.rect(1, 1, 14, 8, "198,155,84,1");
  c.rect(2, 2, 12, 6, "128,63,69,1");
  c.rect(6, 3, 4, 4, "229,195,133,1");
  c.set(7, 2, "229,195,133,1");
  c.set(7, 5, "229,195,133,1");
  return c;
}

function wirePile() {
  const c = new Rgba(16, 12);
  for (const [x, y, w] of [[1, 8, 13], [2, 5, 12], [1, 2, 13]]) {
    c.rect(x, y, w, 2, "244,236,218,1");
    c.hline(x, y, w, "216,203,176,1");
    c.rect(x + 2, y + 1, 6, 1, "38,56,73,1");
  }
  return c;
}

function phoneBadge() {
  const c = new Rgba(4, 4);
  c.disc(2, 2, 2, "204,0,1,1");
  c.set(2, 1, "255,120,120,1");
  return c;
}

/* --- write everything ----------------------------------------------------- */

const sheets = [];
sheets.push(["window-day", windowPlate(false)]);
sheets.push(["window-night", windowPlate(true)]);
sheets.push(["rain-1", rainPlate(0)]);
sheets.push(["rain-2", rainPlate(1)]);
for (const f of [0, 1, 2]) sheets.push([`fan-${f + 1}`, fanPlate(f)]);
for (const f of [0, 1, 2]) sheets.push([`steam-${f + 1}`, steamPlate(f)]);
sheets.push(["flag-sway-1", flagPlate(0)]);
sheets.push(["flag-sway-2", flagPlate(1)]);
sheets.push(["flag-furled", flagFurled()]);
sheets.push(["clock-face", clockFace()]);
for (let m = 0; m < 12; m++) sheets.push([`clock-hands-${m}`, clockHands(m)]);
for (const [name, c] of [["tray-empty", fileStack(0)], ["tray-low", fileStack(1)], ["tray-high", fileStack(2)]]) sheets.push([name, c]);
sheets.push(["orchid-fresh", orchid(false)]);
sheets.push(["orchid-wilt", orchid(true)]);
sheets.push(["award-plaque", awardPlaque()]);
sheets.push(["wire-pile", wirePile()]);
sheets.push(["phone-badge", phoneBadge()]);

for (const [name, c] of sheets) {
  writeFileSync(resolve(outDir, `${name}.png`), encode(c));
}
console.log(`wrote ${sheets.length} overlays to ${outDir}`);

const manifestPath = resolve(here, "../src/data/asset-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.assets = manifest.assets.filter((a) => !a.id.startsWith("office."));
for (const [name, c] of sheets) {
  manifest.assets.push({
    id: `office.${name}`,
    kind: "prop",
    src: `/art/pixel/office/${name}.png`,
    width: c.w,
    height: c.h,
    scale: 3,
    source: "authored",
    licence: "original",
    note: "Office dynamic overlay (v2 Phase 5).",
  });
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest now ${manifest.assets.length} assets`);
