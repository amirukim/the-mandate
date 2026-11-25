/**
 * Builds the iPad home-screen app icons: 16 pixel glyphs, 32x32 each, on
 * rounded palette tiles. Written to public/art/pixel/icons/<id>.png and
 * registered in src/data/asset-manifest.json (checked by check:assets).
 * Displayed at 2x (64 CSS px) with image-rendering: pixelated.
 *
 * Run: node scripts/build-app-icons.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PixelCanvas } from "./pixel-canvas.mjs";

const S = 32;
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/art/pixel/icons");

// palette (same ramps as the plates)
const P = {
  ink: "#17202b",
  navy: "#263849",
  navyDeep: "#1a2a38",
  steel: "#b6b2a6",
  paper: "#e9dfc9",
  paperLt: "#f4ecda",
  paperDeep: "#d8cbb0",
  gold: "#c69b54",
  goldLt: "#e5c385",
  burg: "#803f45",
  burgDk: "#5b2b30",
  moss: "#527b72",
  mossDk: "#3b5b54",
  sky: "#bfd7ea",
  red: "#cc0001",
  white: "#f7f0e0",
  blue: "#1a1e6e",
};

function shade(hex, f) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).map((c) => Math.round(c * (1 - f)));
  return `#${v.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** rounded tile: the icon chrome. inset table gives a pixel squircle. */
function tile(px, base, edge) {
  const inset = [3, 2, 1, 1, 1];
  for (let row = 0; row < S; row++) {
    const i = row < 5 ? inset[row] : row > S - 6 ? inset[S - 1 - row] : 0;
    px.rect(i, row, S - i * 2, 1, base);
  }
  px.rect(inset[0], 1, S - inset[0] * 2, 1, edge);
  px.rect(inset[0], S - 2, S - inset[0] * 2, 1, shade(base, 0.25));
}

/** every glyph draws straight onto the canvas it is given */
const icons = {
  briefing(px) {
    tile(px, P.navy, P.goldLt);
    px.rect(13, 10, 6, 4, P.gold);
    px.rect(14, 11, 4, 2, P.navyDeep);
    px.rect(9, 13, 14, 11, P.gold);
    px.rect(10, 14, 12, 9, shade(P.gold, 0.18));
    px.rect(15, 17, 2, 2, P.paperLt);
  },
  cabinet(px) {
    tile(px, P.mossDk, P.moss);
    px.rect(8, 18, 16, 3, P.gold);
    px.rect(7, 21, 18, 2, shade(P.gold, 0.25));
    for (const x of [10, 15, 20]) {
      px.rect(x, 11, 4, 5, P.paperLt);
      px.set(x + 1, 12, P.ink);
    }
  },
  parliament(px) {
    tile(px, P.navyDeep, P.goldLt);
    for (let a = 0; a <= 8; a++) {
      const ang = Math.PI - (Math.PI * a) / 8;
      px.rect(16 + Math.round(9 * Math.cos(ang)), 21 - Math.round(9 * Math.sin(ang) * 0.55), 2, 2, P.paperLt);
    }
    for (let a = 0; a <= 6; a++) {
      const ang = Math.PI - (Math.PI * a) / 6;
      px.rect(16 + Math.round(5 * Math.cos(ang)), 21 - Math.round(5 * Math.sin(ang) * 0.55), 2, 2, P.gold);
    }
    px.hline(11, 22, 10, P.gold);
    px.rect(15, 9, 3, 2, P.goldLt);
  },
  economy(px) {
    tile(px, P.moss, P.mossDk);
    const pts = [[7, 22], [11, 19], [15, 20], [19, 15], [23, 12]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      for (let x = x1; x <= x2; x++) {
        const y = Math.round(y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
        px.rect(x, y, 1, 2, P.goldLt);
      }
    }
    for (const [x, y] of pts) px.rect(x - 1, y - 1, 2, 2, P.gold);
  },
  overview(px) {
    tile(px, P.sky, "#8fb4d4");
    px.rect(9, 10, 4, 10, P.paper);
    px.rect(8, 14, 6, 5, P.paper);
    px.rect(18, 14, 8, 6, P.paper);
    px.rect(19, 20, 6, 3, P.paper);
    px.rect(9, 10, 4, 2, P.paperLt);
    px.rect(27, 22, 2, 2, P.gold);
  },
  states(px) {
    tile(px, P.paperDeep, P.paper);
    for (const [x, c] of [[7, P.navy], [13, P.moss], [19, P.burg]]) {
      px.rect(x, 12, 6, 6, c);
      px.rect(x, 12, 6, 1, shade(c, 0.25));
    }
    px.hline(7, 21, 18, P.gold);
  },
  diplomacy(px) {
    tile(px, P.navy, P.goldLt);
    px.disc(16, 16, 9, P.sky);
    px.vline(16, 7, 19, P.navy);
    px.hline(7, 16, 19, P.navy);
    px.rect(12, 11, 5, 3, P.moss);
    px.rect(18, 17, 6, 3, P.moss);
  },
  security(px) {
    tile(px, P.steel, P.paperDeep);
    px.rect(12, 9, 8, 3, P.goldDk || shade(P.gold, 0.35));
    px.rect(10, 12, 12, 10, P.gold);
    px.rect(11, 22, 10, 3, shade(P.gold, 0.25));
    px.rect(15, 14, 2, 6, P.navyDeep);
    px.rect(13, 16, 6, 2, P.navyDeep);
  },
  news(px) {
    tile(px, P.paperLt, P.paperDeep);
    px.rect(8, 9, 16, 14, P.white);
    px.rect(8, 9, 16, 1, P.ink);
    px.rect(8, 22, 16, 1, P.ink);
    px.vline(8, 9, 14, P.ink);
    px.vline(23, 9, 14, P.ink);
    px.rect(10, 12, 8, 2, P.burg);
    px.hline(10, 16, 12, P.navy);
    px.hline(10, 18, 9, P.paperDeep);
    px.hline(10, 20, 11, P.paperDeep);
  },
  history(px) {
    tile(px, P.burgDk, P.burg);
    px.rect(10, 8, 13, 16, P.burg);
    px.vline(11, 8, 16, P.gold);
    px.hline(13, 11, 8, P.paperLt);
    px.hline(13, 14, 8, P.paperDeep);
    px.hline(13, 17, 6, P.paperDeep);
    px.vline(22, 8, 16, shade(P.burg, 0.35));
  },
  saves(px) {
    tile(px, P.navyMid || shade(P.navy, 0.2), P.navy);
    px.rect(9, 8, 14, 16, P.paperLt);
    px.rect(12, 8, 8, 5, P.navy);
    px.rect(14, 9, 4, 3, P.gold);
    px.rect(11, 15, 10, 7, P.white);
    px.hline(12, 17, 8, P.paperDeep);
    px.hline(12, 19, 6, P.paperDeep);
  },
  settings(px) {
    tile(px, P.paperDeep, P.steel);
    px.disc(16, 16, 8, P.steel);
    px.disc(16, 16, 4, P.paperLt);
    for (let a = 0; a < 6; a++) {
      const ang = (Math.PI * 2 * a) / 6;
      px.rect(16 + Math.round(8 * Math.cos(ang)) - 2, 16 + Math.round(8 * Math.sin(ang)) - 2, 4, 4, P.steel);
    }
    px.rect(15, 15, 2, 2, P.ink);
  },
  parties(px) {
    tile(px, P.paperDeep, P.steel);
    px.rect(8, 6, 2, 20, P.ink);
    px.rect(10, 8, 14, 11, P.white);
    px.rect(10, 8, 7, 6, P.blue);
    px.set(13, 10, "#ffcc00");
    for (let i = 0; i < 3; i++) px.rect(10, 15 + i * 2, 14, 1, P.red);
  },
  policy(px) {
    tile(px, P.burgDk, P.burg);
    px.rect(9, 7, 14, 18, P.paperLt);
    px.rect(9, 7, 14, 2, P.paperDeep);
    for (const y of [12, 15, 18]) px.hline(12, y, 8, P.navy);
    px.disc(20, 21, 3, P.gold);
    px.set(20, 20, P.goldLt);
  },
  budget(px) {
    tile(px, P.navyDeep, P.gold);
    for (const [y, c] of [[19, P.gold], [16, P.goldLt], [13, P.gold]]) {
      px.rect(9, y, 14, 3, c);
      px.hline(9, y, 14, P.paperLt);
      px.hline(9, y + 2, 14, shade(c, 0.3));
    }
    px.set(22, 8, P.goldLt);
  },
  messages(px) {
    tile(px, P.moss, P.mossDk);
    px.rect(7, 9, 18, 11, P.paperLt);
    px.rect(9, 20, 5, 3, P.paperLt);
    for (const x of [11, 15, 19]) px.rect(x, 13, 3, 2, P.mossDk);
  },
};

mkdirSync(outDir, { recursive: true });
const written = [];
for (const [id, draw] of Object.entries(icons)) {
  const px = new PixelCanvas(S, S);
  draw(px);
  const png = px.toPNG();
  const out = resolve(outDir, `icon-${id}.png`);
  writeFileSync(out, png);
  written.push(`${id}: ${png.length} B, ${px.colours().length} colours`);
}

console.log(`wrote ${written.length} icons to ${outDir}`);
for (const line of written) console.log(`  ${line}`);
