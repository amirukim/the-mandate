/**
 * Builds the full-body sprite sheets: 12 characters x (4 expressions + 2 idle
 * frames + blink + 4 walk frames) = 132 transparent PNGs, 48x64, drawn from
 * the same PixelSpec source as the busts (imported here via tsx, so bust and
 * sprite can never drift). Also patches src/data/asset-manifest.json with the
 * sprite entries.
 *
 * Run: npm run build:sprites   (tsx scripts/build-sprites.ts)
 */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CHARACTERS } from "../src/data/characters";
import { SUPPORTING_CAST } from "../src/data/cast-v2";
import { drawSprite, specById, SPRITE_W, SPRITE_H, type Expression } from "../src/data/pixel-portraits";

const here = dirname(fileURLToPath(import.meta.url));

/* --- minimal RGBA PNG encoder (colour type 6, filter 0) --------------- */

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
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
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

function parseCell(cell: string | null): [number, number, number, number] {
  if (!cell) return [0, 0, 0, 0];
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

function encodeRGBA(width: number, height: number, cells: (string | null)[][]): Buffer {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = parseCell(cells[y][x]);
      const i = y * (width * 4 + 1) + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --- the sprite families ---------------------------------------------- */

const EXPRESSIONS: Expression[] = ["neutral", "concerned", "pleased", "stern"];
const CAST = [...CHARACTERS, ...SUPPORTING_CAST];

const files: Array<{ name: string; id: string; expression: Expression; pose: "stand" | "walk"; frame: number; blink: boolean }> = [];
for (const character of CAST) {
  const base = `sprite-${character.id}`;
  for (const expression of EXPRESSIONS) {
    files.push({ name: `${base}-${expression}.png`, id: character.id, expression, pose: "stand", frame: 0, blink: false });
  }
  files.push(
    { name: `${base}-idle-1.png`, id: character.id, expression: "neutral", pose: "stand", frame: 0, blink: false },
    { name: `${base}-idle-2.png`, id: character.id, expression: "neutral", pose: "stand", frame: 1, blink: false },
    { name: `${base}-blink.png`, id: character.id, expression: "neutral", pose: "stand", frame: 0, blink: true },
  );
  for (let f = 1; f <= 4; f++) {
    files.push({ name: `${base}-walk-${f}.png`, id: character.id, expression: "neutral", pose: "walk", frame: f - 1, blink: false });
  }
}

/* --- encode + patch the manifest --------------------------------------- */

const root = resolve(here, "..");
const outDir = resolve(root, "public/art/pixel/sprites");
mkdirSync(outDir, { recursive: true });

console.log(`encoding ${files.length} sprites (${CAST.length} characters)...`);
for (const file of files) {
  const cells = drawSprite(specById(file.id), file.expression, { pose: file.pose, frame: file.frame, blink: file.blink });
  writeFileSync(resolve(outDir, file.name), encodeRGBA(SPRITE_W, SPRITE_H, cells));
}
console.log(`wrote ${files.length} files`);

const manifestPath = resolve(root, "src/data/asset-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.assets = manifest.assets.filter((a: { id: string }) => !a.id.startsWith("sprite."));
for (const file of files) {
  manifest.assets.push({
    id: `sprite.${file.name.replace(/^sprite-/, "").replace(/\.png$/, "")}`,
    kind: "sprite",
    src: `/art/pixel/sprites/${file.name}`,
    width: 48,
    height: 64,
    scale: 2,
    source: "authored",
    licence: "original",
    note: "Full-body sprite, generated from the bust spec (build:sprites).",
  });
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest now ${manifest.assets.length} assets`);
