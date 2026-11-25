/**
 * Pixel canvas + minimal PNG encoder shared by the plate builders
 * (build-pixel-plate.mjs, build-menu-plate.mjs, future rooms).
 *
 * Every plate is drawn at its native size on an integer grid, then encoded as
 * an 8-bit RGB PNG (filter 0) — no resampling, no alpha, per the art bible.
 */

import { deflateSync } from "node:zlib";

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

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export class PixelCanvas {
  /** hex colours actually drawn, for the ≤24-colour audit */
  used = new Set();

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height * 3);
  }

  set(x, y, hex) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.used.add(hex);
    const [r, g, b] = hexToRgb(hex);
    const i = (y * this.width + x) * 3;
    this.pixels[i] = r;
    this.pixels[i + 1] = g;
    this.pixels[i + 2] = b;
  }

  rect(x, y, w, h, hex) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, hex);
  }

  hline(x, y, w, hex) {
    this.rect(x, y, w, 1, hex);
  }

  vline(x, y, h, hex) {
    this.rect(x, y, 1, h, hex);
  }

  /** 1px outline; two-pass (frame then fill) reads as a bevelled plate. */
  frame(x, y, w, h, hex) {
    this.hline(x, y, w, hex);
    this.hline(x, y + h - 1, w, hex);
    this.vline(x, y, h, hex);
    this.vline(x + w - 1, y, h, hex);
  }

  disc(cx, cy, r, hex) {
    for (let y = -r; y <= r; y++) {
      const span = Math.floor(Math.sqrt(r * r - y * y));
      this.hline(cx - span, cy + y, span * 2 + 1, hex);
    }
  }

  ellipse(cx, cy, rx, ry, hex) {
    for (let y = -ry; y <= ry; y++) {
      const k = 1 - (y * y) / (ry * ry);
      if (k < 0) continue;
      const span = Math.floor(rx * Math.sqrt(k));
      this.hline(cx - span, cy + y, span * 2 + 1, hex);
    }
  }

  /** Lit top/left edge, shaded bottom/right edge: the two-plane minimum. */
  bevel(x, y, w, h, base, light, shade) {
    this.rect(x, y, w, h, base);
    this.hline(x, y, w, light);
    this.vline(x, y, h, light);
    this.hline(x, y + h - 1, w, shade);
    this.vline(x + w - 1, y, h, shade);
  }

  /** Distinct colours drawn, optionally excluding a set (flag-only colours). */
  colours(exclude = new Set()) {
    return [...this.used].filter((hex) => !exclude.has(hex));
  }

  toPNG() {
    const { width: W, height: H, pixels } = this;
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(W, 0);
    ihdr.writeUInt32BE(H, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // colour type: truecolour RGB
    const raw = Buffer.alloc(H * (W * 3 + 1));
    for (let y = 0; y < H; y++) {
      raw[y * (W * 3 + 1)] = 0; // filter: none
      for (let x = 0; x < W * 3; x++) raw[y * (W * 3 + 1) + 1 + x] = pixels[y * W * 3 + x];
    }
    return Buffer.concat([
      signature,
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
  }
}
