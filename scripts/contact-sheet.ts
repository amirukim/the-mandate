/**
 * QA contact sheet: renders every character x expression at 4x on a neutral
 * grey so the cast can be reviewed at a glance (v3-art Step 0, per the
 * create-game-assets skill's contact-sheet gate).
 *
 *   tsx scripts/contact-sheet.ts --suffix before
 *   tsx scripts/contact-sheet.ts --suffix after
 *
 * Out: public/art/qa/contact-sheet-<suffix>.png (+ .json legend).
 * 4x nearest-neighbour, no resampling; the sheet is a review artefact, not a
 * shipped asset (registered in the manifest as optional).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CHARACTERS } from "../src/data/characters";
import { SUPPORTING_CAST } from "../src/data/cast-v2";
import { drawSprite, specById, SPRITE_W, SPRITE_H, type Expression } from "../src/data/pixel-portraits";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const suffixFlag = args.indexOf("--suffix");
const suffix = suffixFlag >= 0 ? args[suffixFlag + 1] : "before";
const SCALE = 4;

/* --- minimal RGBA PNG encoder (colour type 6, filter 0) ---------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff];
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBytes = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

function encodeRGBA(width: number, height: number, rgba: Uint8Array): Buffer {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < width * 4; x++) {
      raw[y * (width * 4 + 1) + 1 + x] = rgba[y * width * 4 + x];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
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

/* --- cell parsing (same conventions as the sprite builder) -------------- */

function parseCell(cell: string): [number, number, number, number] {
  if (cell.startsWith("rgba(")) {
    const nums = cell.slice(5, -1).split(",").map((s) => parseFloat(s.trim()));
    return [nums[0], nums[1], nums[2], Math.round(nums[3] * 255)];
  }
  return [
    parseInt(cell.slice(1, 3), 16),
    parseInt(cell.slice(3, 5), 16),
    parseInt(cell.slice(5, 7), 16),
    255,
  ];
}

/* --- compose the sheet --------------------------------------------------- */

const EXPRESSIONS: Expression[] = ["neutral", "concerned", "pleased", "stern", "weary", "surprised"];
const CAST = [...CHARACTERS, ...SUPPORTING_CAST];

const cellW = SPRITE_W * SCALE;
const cellH = SPRITE_H * SCALE;
const PAD = 12;
const W = PAD * 2 + cellW * EXPRESSIONS.length;
const H = PAD * 2 + cellH * CAST.length;

const px = new Uint8Array(W * H * 4);
function fillBg() {
  for (let y = 0; y < H; y++) {
    const row = Math.floor((y - PAD) / cellH);
    const striped = row % 2 === 1;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const v = striped ? 176 : 200; // neutral review grey, striped by row
      px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
    }
  }
}
fillBg();

function blit(cells: (string | null)[][], dx: number, dy: number) {
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      const cell = cells[y][x];
      if (!cell) continue;
      const [r, g, b, a] = parseCell(cell);
      if (a === 0) continue;
      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const i = ((dy + y * SCALE + sy) * W + (dx + x * SCALE + sx)) * 4;
          const fa = a / 255;
          px[i] = Math.round(r * fa + px[i] * (1 - fa));
          px[i + 1] = Math.round(g * fa + px[i + 1] * (1 - fa));
          px[i + 2] = Math.round(b * fa + px[i + 2] * (1 - fa));
          px[i + 3] = 255;
        }
      }
    }
  }
}

const legend: Array<{ row: number; id: string; name: string }> = [];
CAST.forEach((character, row) => {
  legend.push({ row, id: character.id, name: character.name });
  const spec = specById(character.id);
  EXPRESSIONS.forEach((expression, col) => {
    const cells = drawSprite(spec, expression, { pose: "stand", frame: 0, blink: false });
    blit(cells, PAD + col * cellW, PAD + row * cellH);
  });
});

const png = encodeRGBA(W, H, px);
const outDir = resolve(here, "../public/art/qa");
mkdirSync(outDir, { recursive: true });
const outPng = resolve(outDir, `contact-sheet-${suffix}.png`);
writeFileSync(outPng, png);
writeFileSync(
  resolve(outDir, `contact-sheet-${suffix}.json`),
  JSON.stringify({ scale: SCALE, cell: `${SPRITE_W}x${SPRITE_H}`, expressions: EXPRESSIONS, cast: legend }, null, 2) + "\n",
);
console.log(`contact sheet: ${outPng} (${W}x${H}, ${CAST.length} rows x ${EXPRESSIONS.length} expressions at ${SCALE}x)`);
console.log(legend.map((l) => `  row ${String(l.row).padStart(2)}: ${l.id} — ${l.name}`).join("\n"));
