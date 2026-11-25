/**
 * Builds the authored pixel plate for the Prime Minister's office hub.
 *
 * Every coordinate below is a pixel cell on a 480×253 canvas — the plate is
 * drawn at its native size, never downsampled from a vector. Displayed at 3×
 * it fills 1440×760, which is the coordinate space the hub hotspots use.
 *
 * Art bible rules applied here:
 *  - key light from the left, two-step shading on every material;
 *  - flat, banded tones only (no gradients);
 *  - ~24 colours, ramps reused;
 *  - real Jalur Gemilang colours on the flag and nowhere else.
 *
 * Run: node scripts/build-pixel-plate.mjs
 * Out: public/art/pixel/env-office-hub.png
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const W = 480;
const H = 253;

const C = {
  // Wall and floor: warm paper, lit from the window side.
  wall: "#e6d9be",
  wallShade: "#cfc0a2",
  panel: "#bfae8d",
  floor: "#a98a60",
  floorDk: "#8a6d49",
  floorLt: "#c2a276",
  // Paper and documents.
  paper: "#e9dfc9",
  paperLt: "#f4ecda",
  paperDeep: "#d8cbb0",
  // Walnut: shadow / base / light.
  walnutDk: "#4c3828",
  walnut: "#6c4f36",
  walnutLt: "#8f6c48",
  // Metals and accents.
  gold: "#c69b54",
  goldLt: "#e5c385",
  burg: "#803f45",
  burgDk: "#5b2b30",
  moss: "#527b72",
  mossDk: "#3b5b54",
  steel: "#ada99c",
  steelDk: "#7c7a70",
  // The window: daylight and the city outside.
  sky: "#bfd7ea",
  skyLt: "#dcebf5",
  glass: "#f3f9fd",
  city: "#93a9bf",
  // Ink: outlines, carpet, clock case.
  ink: "#17202b",
  navy: "#263849",
  navyMid: "#33495c",
  // Flag-only colours: the real Jalur Gemilang, used nowhere else.
  flagRed: "#cc0001",
  flagWhite: "#f7f0e0",
  flagBlue: "#1a1e6e",
  flagGold: "#ffcc00",
};

const flagOnly = new Set([C.flagRed, C.flagWhite, C.flagBlue, C.flagGold]);
const used = new Set();

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const buffer = new Uint8Array(W * H * 3);

function set(x, y, hex) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  used.add(hex);
  const [r, g, b] = rgb(hex);
  const i = (y * W + x) * 3;
  buffer[i] = r;
  buffer[i + 1] = g;
  buffer[i + 2] = b;
}

function rect(x, y, w, h, hex) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, hex);
}

function hline(x, y, w, hex) {
  rect(x, y, w, 1, hex);
}

function vline(x, y, h, hex) {
  rect(x, y, 1, h, hex);
}

function frame(x, y, w, h, hex) {
  hline(x, y, w, hex);
  hline(x, y + h - 1, w, hex);
  vline(x, y, h, hex);
  vline(x + w - 1, y, h, hex);
}

function disc(cx, cy, r, hex) {
  for (let y = -r; y <= r; y++) {
    const span = Math.floor(Math.sqrt(r * r - y * y));
    hline(cx - span, cy + y, span * 2 + 1, hex);
  }
}

function ellipse(cx, cy, rx, ry, hex) {
  for (let y = -ry; y <= ry; y++) {
    const k = 1 - (y * y) / (ry * ry);
    if (k < 0) continue;
    const span = Math.floor(rx * Math.sqrt(k));
    hline(cx - span, cy + y, span * 2 + 1, hex);
  }
}

/** Lit top/left edge, shaded bottom/right edge: the two-plane minimum. */
function bevel(x, y, w, h, base, light, shade) {
  rect(x, y, w, h, base);
  hline(x, y, w, light);
  vline(x, y, h, light);
  hline(x, y + h - 1, w, shade);
  vline(x + w - 1, y, h, shade);
}

/* ------------------------------------------------------------------ */
/* Room shell                                                          */
/* ------------------------------------------------------------------ */

rect(0, 0, W, H, C.wall);

// Daylight falls from the window band; the far right of the room cools off.
rect(0, 0, 12, H, C.wallShade);
rect(448, 0, 32, H, C.wallShade);
rect(440, 0, 8, H, C.wall);

// Panel joints: a shadow line with a lit edge, as on a real panelled wall.
for (const x of [33, 127, 353, 443]) {
  vline(x, 0, 219, C.panel);
  vline(x + 1, 0, 219, C.wall);
}

// Dado rail and skirting.
hline(0, 219, W, C.walnut);
hline(0, 220, W, C.walnutLt);
rect(0, 221, W, 7, C.wallShade);
hline(0, 221, W, C.panel);
rect(0, 226, W, 2, C.walnutDk);

// Floor.
rect(0, 228, W, 25, C.floor);
hline(0, 228, W, C.floorDk);
for (const x of [24, 61, 99, 150, 196, 245, 292, 338, 385, 429, 464]) {
  vline(x, 229, 24, C.floorDk);
}
// Light spilling from the window onto the boards.
rect(158, 229, 164, 7, C.floorLt);
rect(174, 236, 132, 5, C.floorLt);

// The carpet, seen as its near edge sweeping under the viewer.
ellipse(240, 258, 170, 20, C.ink);
ellipse(240, 258, 166, 18, C.gold);
ellipse(240, 258, 161, 16, C.navy);
ellipse(240, 258, 150, 12, C.navyMid);

/* ------------------------------------------------------------------ */
/* Tall window with the Putrajaya skyline                              */
/* ------------------------------------------------------------------ */

// Reveal: the frame is set into the wall, so its left edge catches light.
rect(149, 13, 170, 118, C.wallShade);
rect(150, 14, 168, 116, C.walnut);
frame(150, 14, 168, 116, C.walnutDk);
hline(151, 15, 166, C.walnutLt);
vline(151, 15, 114, C.walnutLt);

// Glass, in flat bands from zenith down to the haze on the boulevard.
rect(157, 21, 152, 101, C.sky);
rect(157, 51, 152, 34, C.skyLt);
rect(157, 85, 152, 37, C.glass);

// Clouds: stepped clusters, no soft edges.
rect(169, 33, 27, 2, C.glass);
rect(177, 30, 14, 3, C.glass);
rect(272, 27, 31, 2, C.glass);
rect(280, 24, 15, 3, C.glass);
rect(296, 30, 6, 1, C.glass);

// The city: ministry blocks stepping down to the boulevard.
rect(160, 92, 24, 30, C.city);
rect(186, 80, 18, 42, C.city);
rect(206, 96, 26, 26, C.city);
rect(234, 86, 20, 36, C.city);
rect(258, 94, 22, 28, C.city);
rect(286, 78, 20, 44, C.city);
rect(308, 90, 7, 32, C.city);
// the dome and its finial
rect(243, 78, 14, 8, C.city);
rect(246, 73, 8, 5, C.city);
rect(249, 70, 2, 3, C.city);
// lit windows
for (const [x, y] of [
  [164, 98], [172, 106], [172, 114], [190, 86], [198, 94], [198, 110],
  [212, 102], [222, 110], [238, 92], [248, 104], [262, 100], [270, 112],
  [292, 84], [300, 96], [300, 112],
]) {
  rect(x, y, 2, 2, C.glass);
}
// horizon haze
hline(157, 121, 152, C.skyLt);

// Mullions and transom, with a lit inner edge.
rect(231, 21, 4, 101, C.walnut);
vline(232, 21, 101, C.walnutLt);
rect(157, 67, 152, 4, C.walnut);
hline(157, 67, 152, C.walnutLt);

// Stone sill.
rect(146, 127, 176, 5, C.paperDeep);
hline(146, 127, 176, C.paperLt);
hline(146, 131, 176, C.wallShade);
hline(150, 133, 168, C.wallShade);

/* ------------------------------------------------------------------ */
/* Wall clock — end the month                                          */
/* ------------------------------------------------------------------ */

disc(340, 41, 14, C.wallShade);
disc(339, 40, 14, C.ink);
disc(339, 40, 12, C.paperLt);
disc(339, 40, 10, C.paper);
for (const [dx, dy] of [[0, -9], [9, 0], [0, 9], [-9, 0]]) set(339 + dx, 40 + dy, C.ink);
for (let i = 1; i < 7; i++) set(339 - Math.round(i * 0.4), 40 - i, C.ink);
for (let i = 1; i < 6; i++) set(339 + Math.round(i * 0.95), 40 - Math.round(i * 0.55), C.ink);
set(339, 40, C.burg);
set(339, 41, C.burg);

/* ------------------------------------------------------------------ */
/* Wall map of the federation — overview                               */
/* ------------------------------------------------------------------ */

rect(40, 38, 86, 66, C.wallShade);
rect(38, 36, 86, 66, C.ink);
rect(40, 38, 82, 62, C.paperLt);
// sea grid, faint, for the cartographic read
for (const y of [55, 72, 88]) hline(41, y, 80, C.paperDeep);
for (const x of [60, 82, 104]) vline(x, 39, 60, C.paperDeep);
// peninsula: a slender, stepped diagonal
const peninsula = [
  [58, 44, 6, 4], [57, 48, 8, 5], [58, 53, 8, 5], [60, 58, 8, 5],
  [61, 63, 8, 5], [63, 68, 7, 5], [64, 73, 6, 4], [66, 77, 5, 3], [68, 80, 3, 2],
];
for (const [x, y, w, h] of peninsula) rect(x, y, w, h, C.panel);
// borneo: a broad lobe with the Sulu shoulder
rect(84, 56, 20, 8, C.panel);
rect(82, 64, 24, 8, C.panel);
rect(84, 72, 22, 9, C.panel);
rect(88, 81, 18, 5, C.panel);
rect(104, 60, 8, 6, C.panel);
// islands
rect(79, 51, 2, 2, C.panel);
rect(77, 84, 2, 2, C.panel);
// state pins
for (const [x, y] of [[60, 53], [64, 70], [90, 63], [97, 76]]) rect(x, y, 2, 2, C.burg);
// compass
rect(112, 88, 3, 3, C.gold);
set(113, 87, C.gold);
set(113, 91, C.gold);
// caption rules, standing in for lettering
hline(44, 92, 36, C.gold);
hline(44, 95, 21, C.panel);

/* ------------------------------------------------------------------ */
/* State files on their shallow shelf — states                         */
/* ------------------------------------------------------------------ */

hline(45, 145, 44, C.wallShade);
rect(46, 142, 42, 3, C.walnut);
hline(46, 142, 42, C.walnutLt);
rect(49, 133, 34, 9, C.navyMid);
frame(49, 133, 34, 9, C.ink);
rect(52, 129, 34, 8, C.navy);
frame(52, 129, 34, 8, C.ink);
rect(48, 125, 34, 8, C.navy);
frame(48, 125, 34, 8, C.ink);
hline(53, 127, 13, C.gold);
hline(56, 131, 8, C.paperDeep);
hline(53, 135, 10, C.paperDeep);

/* ------------------------------------------------------------------ */
/* Bookshelf — wall hung, right of the window                          */
/* ------------------------------------------------------------------ */

rect(324, 108, 30, 49, C.walnutDk);
rect(326, 110, 26, 15, C.ink);
rect(326, 127, 26, 13, C.ink);
rect(326, 142, 26, 13, C.ink);
hline(324, 108, 30, C.walnutLt);
hline(324, 125, 30, C.walnut);
hline(324, 140, 30, C.walnut);
hline(324, 155, 30, C.walnut);
// brackets
rect(326, 157, 3, 4, C.walnut);
rect(349, 157, 3, 4, C.walnut);
hline(324, 161, 30, C.wallShade);
const books = [C.burg, C.navy, C.moss, C.gold, C.paperDeep, C.burgDk, C.navyMid];
const rowY = [111, 128, 143];
const rowH = [14, 12, 12];
for (let row = 0; row < 3; row++) {
  for (let i = 0; i < 5; i++) {
    const h = rowH[row] - (i % 3);
    const w = i === 2 ? 3 : 4;
    const x = 327 + i * 5;
    rect(x, rowY[row] + (rowH[row] - h), w, h, books[(i + row) % books.length]);
  }
}

/* ------------------------------------------------------------------ */
/* Framed chamber picture — parliament                                 */
/* ------------------------------------------------------------------ */

rect(364, 34, 80, 56, C.wallShade);
rect(362, 32, 80, 56, C.ink);
rect(365, 35, 74, 50, C.paperLt);
frame(365, 35, 74, 50, C.navy);
// the chamber: a filled hemicycle with two rows of benches
for (let y = 0; y <= 15; y++) {
  const span = Math.round(Math.sqrt(Math.max(0, 15 * 15 - y * y)) * 1.9);
  hline(402 - span, 84 - y, span * 2, C.navyMid);
}
hline(373, 85, 58, C.burgDk);
for (let a = 0; a <= 9; a++) {
  const ang = Math.PI - (Math.PI * a) / 9;
  rect(402 + Math.round(19 * Math.cos(ang)), 82 - Math.round(19 * Math.sin(ang) * 0.55), 2, 2, C.burg);
}
for (let a = 0; a <= 8; a++) {
  const ang = Math.PI - (Math.PI * a) / 8;
  rect(402 + Math.round(11 * Math.cos(ang)), 83 - Math.round(11 * Math.sin(ang) * 0.55), 2, 2, C.paperDeep);
}
hline(384, 66, 36, C.gold);
// gallery rail and chandelier
hline(371, 60, 62, C.navy);
rect(374, 61, 1, 3, C.navy);
rect(429, 61, 1, 3, C.navy);
rect(401, 42, 3, 3, C.gold);
vline(402, 45, 5, C.gold);
hline(396, 50, 13, C.gold);
rect(396, 51, 2, 2, C.goldLt);
rect(407, 51, 2, 2, C.goldLt);

/* ------------------------------------------------------------------ */
/* The Jalur standard — parties (flag colours only here)               */
/* ------------------------------------------------------------------ */

rect(469, 30, 2, 67, C.wallShade);
rect(467, 29, 2, 67, C.walnut);
vline(468, 29, 67, C.walnutLt);
rect(467, 27, 2, 3, C.gold);
// cloth: 14 stripes, the canton over the top-left quarter
rect(447, 32, 20, 51, C.flagWhite);
frame(447, 32, 20, 51, C.ink);
for (let i = 0; i < 14; i++) {
  const y = 33 + Math.round((i * 49) / 14);
  const h = 33 + Math.round(((i + 1) * 49) / 14) - y;
  if (i % 2 === 0) rect(448, y, 18, h, C.flagRed);
}
rect(448, 33, 10, 25, C.flagBlue);
// crescent and star, large enough to read at 30 px
disc(452, 45, 4, C.flagGold);
disc(454, 45, 3, C.flagBlue);
rect(452, 38, 3, 1, C.flagGold);
rect(451, 39, 5, 1, C.flagGold);
rect(452, 40, 3, 1, C.flagGold);
rect(453, 41, 1, 1, C.flagGold);

/* ------------------------------------------------------------------ */
/* Sideboard, globe and orchid — diplomacy                             */
/* ------------------------------------------------------------------ */

// cabinet body, lit at its left edge, shadowed at the right
rect(17, 166, 50, 62, C.walnut);
hline(17, 166, 50, C.walnutLt);
vline(17, 166, 62, C.walnutLt);
hline(17, 227, 50, C.walnutDk);
vline(66, 166, 62, C.walnutDk);
rect(15, 164, 54, 3, C.walnutLt);
hline(15, 164, 54, C.paperDeep);
rect(19, 226, 46, 2, C.walnutDk);
// two door panels
rect(21, 172, 20, 48, C.walnutLt);
frame(21, 172, 20, 48, C.walnutDk);
rect(45, 172, 18, 48, C.walnutLt);
frame(45, 172, 18, 48, C.walnutDk);
rect(39, 193, 2, 4, C.gold);
rect(47, 193, 2, 4, C.gold);
// shadows on the floor
rect(20, 228, 48, 3, C.floorDk);

// globe: stand, meridian, sphere, flat continents
hline(36, 162, 13, C.walnutDk);
rect(41, 158, 3, 4, C.gold);
disc(42, 141, 17, C.ink);
disc(42, 141, 16, C.sky);
vline(42, 125, 33, C.skyLt);
hline(26, 141, 33, C.skyLt);
rect(31, 131, 8, 6, C.moss);
rect(37, 136, 9, 4, C.moss);
rect(32, 143, 6, 7, C.moss);
rect(42, 147, 8, 4, C.moss);
rect(47, 129, 5, 6, C.moss);
rect(29, 137, 4, 3, C.mossDk);
rect(44, 152, 5, 2, C.mossDk);
// meridian arc
vline(42, 126, 2, C.walnut);
vline(42, 154, 2, C.walnut);

// the day's orchid, wilting
rect(59, 158, 7, 6, C.paperDeep);
frame(59, 158, 7, 6, C.walnutDk);
vline(62, 150, 8, C.mossDk);
hline(62, 150, 3, C.mossDk);
rect(64, 147, 3, 3, C.burg);
rect(62, 151, 2, 2, C.moss);

/* ------------------------------------------------------------------ */
/* Safe — security, on the floor under the picture                     */
/* ------------------------------------------------------------------ */

rect(374, 176, 42, 52, C.floorDk);
rect(372, 174, 42, 52, C.steelDk);
rect(374, 176, 38, 48, C.steel);
hline(374, 176, 38, C.paperDeep);
vline(374, 176, 48, C.paperDeep);
hline(374, 223, 38, C.steelDk);
vline(411, 176, 48, C.steelDk);
// door, handle side to the right
rect(377, 179, 32, 42, C.paperDeep);
frame(377, 179, 32, 42, C.steelDk);
disc(392, 197, 8, C.steelDk);
disc(392, 197, 6, C.paperLt);
disc(392, 197, 2, C.ink);
rect(397, 189, 3, 9, C.gold);
hline(388, 185, 6, C.wallShade);
rect(404, 211, 2, 6, C.steelDk);
rect(379, 211, 2, 6, C.steelDk);

/* ------------------------------------------------------------------ */
/* The desk                                                            */
/* ------------------------------------------------------------------ */

// shadow on the boards, offset right
rect(139, 221, 214, 7, C.floorDk);
// legs
rect(143, 168, 10, 60, C.walnut);
vline(143, 168, 60, C.walnutLt);
vline(152, 168, 60, C.walnutDk);
rect(328, 168, 10, 60, C.walnut);
vline(328, 168, 60, C.walnutLt);
vline(337, 168, 60, C.walnutDk);
// modesty panel, recessed
rect(219, 168, 109, 18, C.walnutDk);
hline(219, 168, 109, C.walnut);
// drawer pedestal (save & load)
rect(156, 168, 63, 58, C.walnut);
rect(158, 170, 59, 51, C.walnutLt);
hline(158, 170, 59, C.paperDeep);
frame(158, 170, 59, 51, C.walnutDk);
hline(159, 186, 57, C.walnutDk);
hline(159, 202, 57, C.walnutDk);
rect(184, 176, 6, 3, C.navy);
rect(184, 192, 6, 3, C.navy);
rect(184, 208, 6, 3, C.navy);
// desk top
rect(133, 156, 214, 10, C.walnut);
hline(133, 156, 214, C.walnutLt);
hline(133, 157, 214, C.paperDeep);
hline(133, 165, 214, C.walnutDk);
vline(133, 156, 10, C.walnutLt);
vline(346, 156, 10, C.walnutDk);

// banker's lamp: conical shade, brass stem, flat pool of light
ellipse(150, 155, 14, 2, C.paperDeep);
rect(147, 152, 7, 3, C.gold);
rect(149, 147, 3, 6, C.gold);
for (let i = 0; i < 5; i++) {
  const half = 3 + i * 2;
  hline(150 - half, 142 + i, half * 2 + 1, C.moss);
}
hline(144, 142, 8, C.mossDk);
hline(141, 146, 19, C.gold);
vline(143, 143, 4, C.mossDk);
rect(149, 140, 3, 2, C.goldLt);

// leather journal (history)
rect(180, 150, 26, 6, C.burg);
frame(180, 150, 26, 6, C.burgDk);
vline(183, 151, 4, C.gold);
hline(186, 152, 16, C.burgDk);
hline(186, 151, 12, C.paperLt);

// the briefing folders, the one red accent of the room
rect(214, 149, 43, 7, C.burgDk);
frame(214, 149, 43, 7, C.ink);
rect(216, 144, 43, 6, C.burg);
frame(216, 144, 43, 6, C.burgDk);
rect(218, 140, 40, 5, C.burg);
hline(218, 140, 40, C.ink);
rect(223, 142, 15, 2, C.paperLt);
rect(241, 142, 7, 2, C.paperDeep);

// newspaper (news)
rect(259, 149, 32, 1, C.paperDeep);
rect(259, 150, 32, 8, C.paperLt);
frame(259, 150, 32, 8, C.paperDeep);
rect(262, 152, 18, 2, C.ink);
hline(262, 155, 10, C.panel);
hline(262, 157, 14, C.panel);
rect(281, 152, 7, 4, C.paperDeep);

// ledger (economy)
rect(291, 153, 21, 8, C.moss);
frame(291, 153, 21, 8, C.mossDk);
rect(294, 155, 3, 4, C.gold);
hline(299, 155, 10, C.paperLt);

// telephone (cabinet)
rect(311, 150, 17, 8, C.navyMid);
frame(311, 150, 17, 8, C.ink);
rect(310, 146, 19, 4, C.navy);
hline(310, 146, 19, C.ink);
hline(311, 147, 17, C.navyMid);
rect(317, 152, 5, 4, C.paperDeep);
frame(317, 152, 5, 4, C.ink);
rect(328, 152, 3, 2, C.navyMid);
rect(330, 154, 2, 2, C.navyMid);

/* ------------------------------------------------------------------ */
/* Visitor chairs, in front of the desk                                */
/* ------------------------------------------------------------------ */

for (const x of [100, 336]) {
  ellipse(x + 17, 223, 20, 3, C.floorDk);
  // back: walnut frame around a moss panel, top rail proud of the sides
  rect(x + 4, 172, 26, 3, C.walnut);
  hline(x + 5, 172, 24, C.walnutLt);
  rect(x + 5, 175, 4, 22, C.walnut);
  rect(x + 25, 175, 4, 22, C.walnut);
  rect(x + 9, 175, 16, 22, C.moss);
  frame(x + 9, 175, 16, 22, C.mossDk);
  hline(x + 11, 178, 12, C.mossDk);
  // seat and legs
  rect(x, 197, 34, 5, C.walnut);
  hline(x, 197, 34, C.walnutLt);
  hline(x, 201, 34, C.walnutDk);
  rect(x + 2, 202, 4, 20, C.walnut);
  rect(x + 28, 202, 4, 20, C.walnut);
  vline(x + 2, 202, 20, C.walnutLt);
  vline(x + 31, 202, 20, C.walnutDk);
}

/* ------------------------------------------------------------------ */
/* PNG encoder (RGB, 8-bit, filter 0)                                  */
/* ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBytes = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: truecolour RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc(H * (W * 3 + 1));
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0; // filter: none
  for (let x = 0; x < W * 3; x++) raw[y * (W * 3 + 1) + 1 + x] = buffer[y * W * 3 + x];
}

const png = Buffer.concat([
  signature,
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/art/pixel/env-office-hub.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);

const scene = [...used].filter((hex) => !flagOnly.has(hex)).length;
const flags = [...used].filter((hex) => flagOnly.has(hex)).length;
console.log(`wrote ${out} (${W}×${H}, ${png.length} bytes)`);
console.log(`colours: ${scene} scene + ${flags} flag-only`);
