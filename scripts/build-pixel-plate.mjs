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
import { PixelCanvas } from "./pixel-canvas.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const W = 480;
const H = 253;

const C = {
  // Wall and floor: warm paper, lit from the window side.
  wall: "#e6d9be",
  wallLt: "#efe6d0",
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

const px = new PixelCanvas(W, H);

/* Room shell                                                          */
/* ------------------------------------------------------------------ */

px.rect(0, 0, W, H, C.wall);

// Crown line: a shadow, a bead, and a lit fillet under the ceiling.
px.rect(0, 0, W, 2, C.wallShade);
px.hline(0, 2, W, C.panel);
px.hline(0, 3, W, C.wallLt);
px.hline(0, 4, W, C.wall);

// Daylight falls from the window band; the far right of the room cools off.
px.rect(0, 0, 12, H, C.wallShade);
px.rect(448, 0, 32, H, C.wallShade);
px.rect(440, 0, 8, H, C.wall);

// The wall catches the window's light: a flat, stepped band to the right.
px.rect(326, 16, 116, 96, C.wallLt);

// Panel joints: a shadow line with a lit edge, as on a real panelled wall.
for (const x of [33, 127, 353, 443]) {
  px.vline(x, 0, 219, C.panel);
  px.vline(x + 1, 0, 219, C.wall);
}

// Dado rail and skirting.
px.hline(0, 219, W, C.walnut);
px.hline(0, 220, W, C.walnutLt);
px.rect(0, 221, W, 7, C.wallShade);
px.hline(0, 221, W, C.panel);
px.rect(0, 226, W, 2, C.walnutDk);

// Floor.
px.rect(0, 228, W, 25, C.floor);
px.hline(0, 228, W, C.floorDk);
for (const x of [24, 61, 99, 150, 196, 245, 292, 338, 385, 429, 464]) {
  px.vline(x, 229, 24, C.floorDk);
}
// Light spilling from the window onto the boards.
px.rect(158, 229, 164, 7, C.floorLt);
px.rect(174, 236, 132, 5, C.floorLt);

// The carpet: a bordered rug with a medallion, sweeping under the viewer.
px.ellipse(240, 258, 170, 20, C.ink);
px.ellipse(240, 258, 164, 18, C.gold);
px.ellipse(240, 258, 156, 16, C.navy);
px.ellipse(240, 258, 146, 14, C.navyMid);
px.ellipse(240, 258, 122, 11, C.gold);
px.ellipse(240, 258, 114, 9, C.navy);
// medallion ticks on the visible border arc
for (const x of [180, 240, 300]) px.rect(x, 243, 4, 2, C.goldLt);
px.rect(136, 246, 3, 2, C.goldLt);
px.rect(341, 246, 3, 2, C.goldLt);

/* ------------------------------------------------------------------ */
/* Tall window with the Putrajaya skyline                              */
/* ------------------------------------------------------------------ */

// Reveal: the frame is set into the wall, so its left edge catches light.
px.rect(149, 13, 170, 118, C.wallShade);
px.rect(150, 14, 168, 116, C.walnut);
px.frame(150, 14, 168, 116, C.walnutDk);
px.hline(151, 15, 166, C.walnutLt);
px.vline(151, 15, 114, C.walnutLt);

// Glass, in flat bands from zenith down to the haze on the boulevard.
px.rect(157, 21, 152, 101, C.sky);
px.rect(157, 51, 152, 34, C.skyLt);
px.rect(157, 85, 152, 37, C.glass);

// Clouds: stepped clusters, no soft edges.
px.rect(169, 33, 27, 2, C.glass);
px.rect(177, 30, 14, 3, C.glass);
px.rect(272, 27, 31, 2, C.glass);
px.rect(280, 24, 15, 3, C.glass);
px.rect(296, 30, 6, 1, C.glass);

// The city: ministry blocks stepping down to the boulevard.
px.rect(160, 92, 24, 30, C.city);
px.rect(186, 80, 18, 42, C.city);
px.rect(206, 96, 26, 26, C.city);
px.rect(234, 86, 20, 36, C.city);
px.rect(258, 94, 22, 28, C.city);
px.rect(286, 78, 20, 44, C.city);
px.rect(308, 90, 7, 32, C.city);
// the dome and its finial
px.rect(243, 78, 14, 8, C.city);
px.rect(246, 73, 8, 5, C.city);
px.rect(249, 70, 2, 3, C.city);
// lit windows
for (const [x, y] of [
  [164, 98], [172, 106], [172, 114], [190, 86], [198, 94], [198, 110],
  [212, 102], [222, 110], [238, 92], [248, 104], [262, 100], [270, 112],
  [292, 84], [300, 96], [300, 112],
]) {
  px.rect(x, y, 2, 2, C.glass);
}
// horizon haze
px.hline(157, 121, 152, C.skyLt);

// Mullions and transom, with a lit inner edge.
px.rect(231, 21, 4, 101, C.walnut);
px.vline(232, 21, 101, C.walnutLt);
px.rect(157, 67, 152, 4, C.walnut);
px.hline(157, 67, 152, C.walnutLt);

// Stone sill.
px.rect(146, 127, 176, 5, C.paperDeep);
px.hline(146, 127, 176, C.paperLt);
px.hline(146, 131, 176, C.wallShade);
px.hline(150, 133, 168, C.wallShade);

// Drapes framing the window: hung from the cornice, over the frame edges.
px.rect(142, 5, 7, 131, C.walnut);
px.rect(142, 5, 2, 131, C.walnutLt);
px.vline(146, 8, 128, C.walnutDk);
px.hline(142, 5, 7, C.walnutDk);
px.rect(318, 5, 7, 131, C.walnut);
px.rect(318, 5, 2, 131, C.walnutLt);
px.vline(322, 8, 128, C.walnutDk);
px.hline(318, 5, 7, C.walnutDk);
// tiebacks: a brass band pinching each panel at the sill line
px.rect(142, 118, 7, 3, C.gold);
px.hline(142, 118, 7, C.goldLt);
px.rect(318, 118, 7, 3, C.gold);
px.hline(318, 118, 7, C.goldLt);

/* ------------------------------------------------------------------ */
/* Wall clock — end the month                                          */
/* ------------------------------------------------------------------ */

px.disc(340, 41, 14, C.wallShade);
px.disc(339, 40, 14, C.ink);
px.disc(339, 40, 12, C.paperLt);
px.disc(339, 40, 10, C.paper);
for (const [dx, dy] of [[0, -9], [9, 0], [0, 9], [-9, 0]]) px.set(339 + dx, 40 + dy, C.ink);
for (let i = 1; i < 7; i++) px.set(339 - Math.round(i * 0.4), 40 - i, C.ink);
for (let i = 1; i < 6; i++) px.set(339 + Math.round(i * 0.95), 40 - Math.round(i * 0.55), C.ink);
px.set(339, 40, C.burg);
px.set(339, 41, C.burg);

/* ------------------------------------------------------------------ */
/* Wall map of the federation — overview                               */
/* ------------------------------------------------------------------ */

px.rect(40, 38, 86, 66, C.wallShade);
px.rect(38, 36, 86, 66, C.ink);
px.rect(40, 38, 82, 62, C.paperLt);
// sea grid, faint, for the cartographic read
for (const y of [55, 72, 88]) px.hline(41, y, 80, C.paperDeep);
for (const x of [60, 82, 104]) px.vline(x, 39, 60, C.paperDeep);
// peninsula: a slender, stepped diagonal
const peninsula = [
  [58, 44, 6, 4], [57, 48, 8, 5], [58, 53, 8, 5], [60, 58, 8, 5],
  [61, 63, 8, 5], [63, 68, 7, 5], [64, 73, 6, 4], [66, 77, 5, 3], [68, 80, 3, 2],
];
for (const [x, y, w, h] of peninsula) px.rect(x, y, w, h, C.panel);
// borneo: a broad lobe with the Sulu shoulder
px.rect(84, 56, 20, 8, C.panel);
px.rect(82, 64, 24, 8, C.panel);
px.rect(84, 72, 22, 9, C.panel);
px.rect(88, 81, 18, 5, C.panel);
px.rect(104, 60, 8, 6, C.panel);
// islands
px.rect(79, 51, 2, 2, C.panel);
px.rect(77, 84, 2, 2, C.panel);
// state pins
for (const [x, y] of [[60, 53], [64, 70], [90, 63], [97, 76]]) px.rect(x, y, 2, 2, C.burg);
// compass
px.rect(112, 88, 3, 3, C.gold);
px.set(113, 87, C.gold);
px.set(113, 91, C.gold);
// caption rules, standing in for lettering
px.hline(44, 92, 36, C.gold);
px.hline(44, 95, 21, C.panel);

/* ------------------------------------------------------------------ */
/* State files on their shallow shelf — states                         */
/* ------------------------------------------------------------------ */

px.hline(45, 145, 44, C.wallShade);
px.rect(46, 142, 42, 3, C.walnut);
px.hline(46, 142, 42, C.walnutLt);
px.rect(49, 133, 34, 9, C.navyMid);
px.frame(49, 133, 34, 9, C.ink);
px.rect(52, 129, 34, 8, C.navy);
px.frame(52, 129, 34, 8, C.ink);
px.rect(48, 125, 34, 8, C.navy);
px.frame(48, 125, 34, 8, C.ink);
px.hline(53, 127, 13, C.gold);
px.hline(56, 131, 8, C.paperDeep);
px.hline(53, 135, 10, C.paperDeep);

/* ------------------------------------------------------------------ */
/* Bookshelf — wall hung, right of the window                          */
/* ------------------------------------------------------------------ */

px.rect(324, 108, 30, 49, C.walnutDk);
px.rect(326, 110, 26, 15, C.ink);
px.rect(326, 127, 26, 13, C.ink);
px.rect(326, 142, 26, 13, C.ink);
px.hline(324, 108, 30, C.walnutLt);
px.hline(324, 125, 30, C.walnut);
px.hline(324, 140, 30, C.walnut);
px.hline(324, 155, 30, C.walnut);
// brackets
px.rect(326, 157, 3, 4, C.walnut);
px.rect(349, 157, 3, 4, C.walnut);
px.hline(324, 161, 30, C.wallShade);
const books = [C.burg, C.navy, C.moss, C.gold, C.paperDeep, C.burgDk, C.navyMid];
const rowY = [111, 128, 143];
const rowH = [14, 12, 12];
for (let row = 0; row < 3; row++) {
  for (let i = 0; i < 5; i++) {
    const h = rowH[row] - (i % 3);
    const w = i === 2 ? 3 : 4;
    const x = 327 + i * 5;
    px.rect(x, rowY[row] + (rowH[row] - h), w, h, books[(i + row) % books.length]);
  }
}

/* ------------------------------------------------------------------ */
/* Framed chamber picture — parliament                                 */
/* ------------------------------------------------------------------ */

px.rect(364, 34, 80, 56, C.wallShade);
px.rect(362, 32, 80, 56, C.ink);
px.rect(365, 35, 74, 50, C.paperLt);
px.frame(365, 35, 74, 50, C.navy);
// the chamber: a filled hemicycle with two rows of benches
for (let y = 0; y <= 15; y++) {
  const span = Math.round(Math.sqrt(Math.max(0, 15 * 15 - y * y)) * 1.9);
  px.hline(402 - span, 84 - y, span * 2, C.navyMid);
}
px.hline(373, 85, 58, C.burgDk);
for (let a = 0; a <= 9; a++) {
  const ang = Math.PI - (Math.PI * a) / 9;
  px.rect(402 + Math.round(19 * Math.cos(ang)), 82 - Math.round(19 * Math.sin(ang) * 0.55), 2, 2, C.burg);
}
for (let a = 0; a <= 8; a++) {
  const ang = Math.PI - (Math.PI * a) / 8;
  px.rect(402 + Math.round(11 * Math.cos(ang)), 83 - Math.round(11 * Math.sin(ang) * 0.55), 2, 2, C.paperDeep);
}
px.hline(384, 66, 36, C.gold);
// gallery rail and chandelier
px.hline(371, 60, 62, C.navy);
px.rect(374, 61, 1, 3, C.navy);
px.rect(429, 61, 1, 3, C.navy);
px.rect(401, 42, 3, 3, C.gold);
px.vline(402, 45, 5, C.gold);
px.hline(396, 50, 13, C.gold);
px.rect(396, 51, 2, 2, C.goldLt);
px.rect(407, 51, 2, 2, C.goldLt);

/* ------------------------------------------------------------------ */
/* The Jalur standard — parties (flag colours only here)               */
/* ------------------------------------------------------------------ */

px.rect(469, 30, 2, 67, C.wallShade);
px.rect(467, 29, 2, 67, C.walnut);
px.vline(468, 29, 67, C.walnutLt);
px.rect(467, 27, 2, 3, C.gold);
// cloth: 14 stripes, the canton over the top-left quarter
px.rect(447, 32, 20, 51, C.flagWhite);
px.frame(447, 32, 20, 51, C.ink);
for (let i = 0; i < 14; i++) {
  const y = 33 + Math.round((i * 49) / 14);
  const h = 33 + Math.round(((i + 1) * 49) / 14) - y;
  if (i % 2 === 0) px.rect(448, y, 18, h, C.flagRed);
}
px.rect(448, 33, 10, 25, C.flagBlue);
// crescent and star, large enough to read at 30 px
px.disc(452, 45, 4, C.flagGold);
px.disc(454, 45, 3, C.flagBlue);
px.rect(452, 38, 3, 1, C.flagGold);
px.rect(451, 39, 5, 1, C.flagGold);
px.rect(452, 40, 3, 1, C.flagGold);
px.rect(453, 41, 1, 1, C.flagGold);

/* ------------------------------------------------------------------ */
/* Sideboard, globe and orchid — diplomacy                             */
/* ------------------------------------------------------------------ */

// cabinet body, lit at its left edge, shadowed at the right
px.rect(17, 166, 50, 62, C.walnut);
px.hline(17, 166, 50, C.walnutLt);
px.vline(17, 166, 62, C.walnutLt);
px.hline(17, 227, 50, C.walnutDk);
px.vline(66, 166, 62, C.walnutDk);
px.rect(15, 164, 54, 3, C.walnutLt);
px.hline(15, 164, 54, C.paperDeep);
px.rect(19, 226, 46, 2, C.walnutDk);
// two door panels
px.rect(21, 172, 20, 48, C.walnutLt);
px.frame(21, 172, 20, 48, C.walnutDk);
px.rect(45, 172, 18, 48, C.walnutLt);
px.frame(45, 172, 18, 48, C.walnutDk);
px.rect(39, 193, 2, 4, C.gold);
px.rect(47, 193, 2, 4, C.gold);
// shadows on the floor
px.rect(20, 228, 48, 3, C.floorDk);

// globe: stand, meridian, sphere, flat continents
px.hline(36, 162, 13, C.walnutDk);
px.rect(41, 158, 3, 4, C.gold);
px.disc(42, 141, 17, C.ink);
px.disc(42, 141, 16, C.sky);
px.vline(42, 125, 33, C.skyLt);
px.hline(26, 141, 33, C.skyLt);
px.rect(31, 131, 8, 6, C.moss);
px.rect(37, 136, 9, 4, C.moss);
px.rect(32, 143, 6, 7, C.moss);
px.rect(42, 147, 8, 4, C.moss);
px.rect(47, 129, 5, 6, C.moss);
px.rect(29, 137, 4, 3, C.mossDk);
px.rect(44, 152, 5, 2, C.mossDk);
// meridian arc
px.vline(42, 126, 2, C.walnut);
px.vline(42, 154, 2, C.walnut);

// the day's orchid, wilting
px.rect(59, 158, 7, 6, C.paperDeep);
px.frame(59, 158, 7, 6, C.walnutDk);
px.vline(62, 150, 8, C.mossDk);
px.hline(62, 150, 3, C.mossDk);
px.rect(64, 147, 3, 3, C.burg);
px.rect(62, 151, 2, 2, C.moss);

/* ------------------------------------------------------------------ */
/* Safe — security, on the floor under the picture                     */
/* ------------------------------------------------------------------ */

px.rect(374, 176, 42, 52, C.floorDk);
px.rect(372, 174, 42, 52, C.steelDk);
px.rect(374, 176, 38, 48, C.steel);
px.hline(374, 176, 38, C.paperDeep);
px.vline(374, 176, 48, C.paperDeep);
px.hline(374, 223, 38, C.steelDk);
px.vline(411, 176, 48, C.steelDk);
// door, handle side to the right
px.rect(377, 179, 32, 42, C.paperDeep);
px.frame(377, 179, 32, 42, C.steelDk);
px.disc(392, 197, 8, C.steelDk);
px.disc(392, 197, 6, C.paperLt);
px.disc(392, 197, 2, C.ink);
px.rect(397, 189, 3, 9, C.gold);
px.hline(388, 185, 6, C.wallShade);
px.rect(404, 211, 2, 6, C.steelDk);
px.rect(379, 211, 2, 6, C.steelDk);
// riveted corners and hinges
for (const [x, y] of [[379, 181], [406, 181], [379, 218], [406, 218]]) px.set(x, y, C.steelDk);
px.rect(374, 186, 2, 8, C.steelDk);
px.rect(408, 186, 2, 8, C.steelDk);
px.set(374, 186, C.paperDeep); px.set(409, 186, C.paperDeep);

/* ------------------------------------------------------------------ */
/* A potted palm on the floor, left of the visitor chair               */
/* ------------------------------------------------------------------ */

// planter: brass pot on a dark foot
px.rect(74, 206, 18, 20, C.gold);
px.rect(74, 206, 18, 2, C.goldLt);
px.vline(76, 206, 20, C.goldLt);
px.vline(90, 206, 20, C.walnutDk);
px.rect(76, 226, 14, 2, C.walnutDk);
// fronds: a stepped crown with a dark underside
px.rect(80, 196, 2, 10, C.mossDk);
px.rect(70, 192, 14, 2, C.moss);
px.rect(76, 186, 16, 2, C.moss);
px.rect(84, 190, 14, 2, C.moss);
px.rect(64, 198, 10, 2, C.mossDk);
px.rect(90, 198, 12, 2, C.mossDk);
px.rect(74, 181, 10, 2, C.moss);
px.set(76, 180, C.moss);
px.set(72, 192, C.moss);
px.set(88, 186, C.mossDk);

/* ------------------------------------------------------------------ */
/* The desk                                                            */
/* ------------------------------------------------------------------ */

// shadow on the boards, offset right
px.rect(139, 221, 214, 7, C.floorDk);
// legs
px.rect(143, 168, 10, 60, C.walnut);
px.vline(143, 168, 60, C.walnutLt);
px.vline(152, 168, 60, C.walnutDk);
px.rect(328, 168, 10, 60, C.walnut);
px.vline(328, 168, 60, C.walnutLt);
px.vline(337, 168, 60, C.walnutDk);
// modesty panel, recessed
px.rect(219, 168, 109, 18, C.walnutDk);
px.hline(219, 168, 109, C.walnut);
// drawer pedestal (save & load)
px.rect(156, 168, 63, 58, C.walnut);
px.rect(158, 170, 59, 51, C.walnutLt);
px.hline(158, 170, 59, C.paperDeep);
px.frame(158, 170, 59, 51, C.walnutDk);
px.hline(159, 186, 57, C.walnutDk);
px.hline(159, 202, 57, C.walnutDk);
// brass pulls with a dark setting
for (const y of [176, 192, 208]) {
  px.rect(183, y, 8, 3, C.walnutDk);
  px.rect(184, y, 6, 3, C.gold);
  px.set(185, y, C.goldLt);
}
// desk top: grain streaks and a brass edging above the dark arris
px.rect(133, 156, 214, 10, C.walnut);
px.hline(133, 156, 214, C.walnutLt);
px.hline(133, 157, 214, C.paperDeep);
px.hline(150, 160, 118, C.walnut);
px.hline(276, 161, 62, C.walnut);
px.hline(133, 164, 214, C.gold);
px.hline(133, 165, 214, C.walnutDk);
px.vline(133, 156, 10, C.walnutLt);
px.vline(346, 156, 10, C.walnutDk);

// banker's lamp: conical shade, brass stem, flat pool of light
px.ellipse(150, 155, 14, 2, C.paperDeep);
px.rect(147, 152, 7, 3, C.gold);
px.rect(149, 147, 3, 6, C.gold);
for (let i = 0; i < 5; i++) {
  const half = 3 + i * 2;
  px.hline(150 - half, 142 + i, half * 2 + 1, C.moss);
}
px.hline(144, 142, 8, C.mossDk);
px.hline(141, 146, 19, C.gold);
px.vline(143, 143, 4, C.mossDk);
px.rect(149, 140, 3, 2, C.goldLt);
// green glass catches the window: a light streak and a dark edge
px.hline(146, 143, 7, C.mossDk);
px.set(144, 141, C.goldLt);
px.set(150, 141, C.goldLt);

// leather journal (history)
px.rect(180, 150, 26, 6, C.burg);
px.frame(180, 150, 26, 6, C.burgDk);
px.vline(183, 151, 4, C.gold);
px.hline(186, 152, 16, C.burgDk);
px.hline(186, 151, 12, C.paperLt);

// the briefing folders, the one red accent of the room
px.rect(214, 149, 43, 7, C.burgDk);
px.frame(214, 149, 43, 7, C.ink);
px.rect(216, 144, 43, 6, C.burg);
px.frame(216, 144, 43, 6, C.burgDk);
px.rect(218, 140, 40, 5, C.burg);
px.hline(218, 140, 40, C.ink);
px.rect(223, 142, 15, 2, C.paperLt);
px.rect(241, 142, 7, 2, C.paperDeep);

// newspaper (news)
px.rect(259, 149, 32, 1, C.paperDeep);
px.rect(259, 150, 32, 8, C.paperLt);
px.frame(259, 150, 32, 8, C.paperDeep);
px.rect(262, 152, 18, 2, C.ink);
px.hline(262, 155, 10, C.panel);
px.hline(262, 157, 14, C.panel);
px.rect(281, 152, 7, 4, C.paperDeep);

// ledger (economy)
px.rect(291, 153, 21, 8, C.moss);
px.frame(291, 153, 21, 8, C.mossDk);
px.rect(294, 155, 3, 4, C.gold);
px.hline(299, 155, 10, C.paperLt);

// telephone (cabinet)
px.rect(311, 150, 17, 8, C.navyMid);
px.frame(311, 150, 17, 8, C.ink);
px.rect(310, 146, 19, 4, C.navy);
px.hline(310, 146, 19, C.ink);
px.hline(311, 147, 17, C.navyMid);
px.rect(317, 152, 5, 4, C.paperDeep);
px.frame(317, 152, 5, 4, C.ink);
px.rect(328, 152, 3, 2, C.navyMid);
px.rect(330, 154, 2, 2, C.navyMid);

/* ------------------------------------------------------------------ */
/* Visitor chairs, in front of the desk                                */
/* ------------------------------------------------------------------ */

for (const x of [100, 336]) {
  px.ellipse(x + 17, 223, 20, 3, C.floorDk);
  // back: walnut frame around a moss panel, top rail proud of the sides
  px.rect(x + 4, 172, 26, 3, C.walnut);
  px.hline(x + 5, 172, 24, C.walnutLt);
  px.rect(x + 5, 175, 4, 22, C.walnut);
  px.rect(x + 25, 175, 4, 22, C.walnut);
  px.rect(x + 9, 175, 16, 22, C.moss);
  px.frame(x + 9, 175, 16, 22, C.mossDk);
  px.hline(x + 11, 178, 12, C.mossDk);
  // seat and legs
  px.rect(x, 197, 34, 5, C.walnut);
  px.hline(x, 197, 34, C.walnutLt);
  px.hline(x, 201, 34, C.walnutDk);
  px.rect(x + 2, 202, 4, 20, C.walnut);
  px.rect(x + 28, 202, 4, 20, C.walnut);
  px.vline(x + 2, 202, 20, C.walnutLt);
  px.vline(x + 31, 202, 20, C.walnutDk);
}

/* ------------------------------------------------------------------ */

const png = px.toPNG();

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/art/pixel/env-office-hub.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);

const scene = px.colours(flagOnly).length;
const flags = px.used.size - scene;
console.log(`wrote ${out} (${W}×${H}, ${png.length} bytes)`);
console.log(`colours: ${scene} scene + ${flags} flag-only`);
