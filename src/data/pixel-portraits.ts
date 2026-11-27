/**
 * Pixel portrait engine â€” 64Ã—64 busts, rendered to canvas and scaled with
 * image-rendering: pixelated on large surfaces (smooth 2D downscale on small
 * ones, so the cast strip stays legible). Deliberate art direction, not a
 * placeholder: limited palettes, directional shading, readable faces.
 *
 * pixelPortraitDataUrl(id) is cached per id. Unknown ids return the anonymous
 * figure, never null. Raster files (public/portraits/<id>.*) still override
 * these when present â€” see data/portraits.tsx.
 */

const W = 64;
const H = 64;

/** Darken a hex colour toward black by factor f (0..1) â€” derives shading
 *  tones from the authored palette without adding spec fields. */
function shade(hex: string, f: number): string {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).map((c) => Math.round(c * (1 - f)));
  return `#${v.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Lighten toward white by factor f. */
function tint(hex: string, f: number): string {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).map((c) => Math.round(c + (255 - c) * f));
  return `#${v.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

interface PixelSpec {
  skin: [string, string, string];
  bg: [string, string];
  attire: { kind: "suit" | "open" | "mandarin" | "baju" | "sherwani"; c: string; trim: string; shirt: string; tie?: string; accent?: string };
  /** v3: the prop the character carries in stand pose (D-17 props layer). */
  prop?: "folder" | "phone" | "tablet" | "cane";
  hair?: { c: string; hi: string; style: "bob" | "short" | "receding" | "tied" | "sidepart" | "curls" | "combed" | "white" };
  hijab?: { c: string; hi: string; style?: "cape" | "long" };
  songkok?: string;
  kopiah?: string;
  glasses?: boolean;
  facial?: "beard" | "beard-grey" | "moustache" | "moustache-grey";
  older?: boolean;
  mouth?: "firm" | "set" | "soft";
  earrings?: boolean;
  bindi?: boolean;
  /** v3 paper-doll (D-17/D-19): body volume and older-posture variant. */
  body?: BodyType;
  stoop?: boolean;
  /** v3: resting arm stance — real silhouette variety on shared body types. */
  stance?: "stand" | "clasp" | "hip" | "cross";
  /** v3: leg-length jitter so same-body characters differ in height. */
  heightAdj?: number;
  /** Per-character face geometry so faces read as different people. */
  face?: { brow?: "straight" | "arched" | "bushy"; chin?: "taper" | "square" | "round"; nose?: "slim" | "broad" };
}

export type BodyType = "slim" | "average" | "broad" | "tall" | "heavy";

class Grid {
  readonly w: number;
  readonly h: number;
  readonly cells: (string | null)[][];

  constructor(w: number = W, h: number = H) {
    this.w = w;
    this.h = h;
    this.cells = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
  }
  set(inputX: number, inputY: number, c: string | null) {
    const x = Math.round(inputX);
    const y = Math.round(inputY);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.cells[y][x] = c;
  }
  rect(x: number, y: number, w: number, h: number, c: string) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
  }
  hline(x: number, y: number, w: number, c: string) {
    this.rect(x, y, w, 1, c);
  }
  vline(x: number, y: number, h: number, c: string) {
    this.rect(x, y, 1, h, c);
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string) {
    for (let yy = cy - ry; yy <= cy + ry; yy++) {
      for (let xx = cx - rx; xx <= cx + rx; xx++) {
        const dx = (xx - cx) / rx;
        const dy = (yy - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(xx, yy, c);
      }
    }
  }
  /** Symmetric pair around the centre line. */
  mirror(x: number, y: number, w: number, h: number, c: string) {
    this.rect(x, y, w, h, c);
    this.rect(this.w - x - w, y, w, h, c);
  }
}

/** The 96x96 bust (v3a phase 3): the paper-doll's head-and-chest crop at 2x,
 *  so the portrait and the sprite are the same drawing by construction (D-17),
 *  with the authored backdrop and the six-expression support of the doll. */
function drawBustCells(spec: PixelSpec, expression: Expression): (string | null)[][] {
  const sprite = drawSprite(spec, expression, { pose: "stand", frame: 0 });
  const g = new Grid(96, 96);
  // backdrop, with a quiet warm glow behind the head
  g.rect(0, 0, 96, 44, spec.bg[0]);
  g.rect(0, 44, 96, 52, spec.bg[1]);
  g.ellipse(48, 42, 34, 30, spec.bg[1]);
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      const c = sprite[y + 2][x + 8];
      if (c) g.rect(x * 2, y * 2, 2, 2, c);
    }
  }
  return g.cells;
}
const cache = new Map<string, string>();

function render(spec: PixelSpec, expression: Expression = "neutral"): string {
  const cells = drawBustCells(spec, expression);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = cells[y][x];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas.toDataURL("image/png");
}

/** Cached pixel bust for a character id; unknown ids get the anonymous figure.
 *  `expression` variants are cached per id+expression; the default call keeps
 *  the plain authored face and the original cache key. */
export function pixelPortraitDataUrl(id: string, expression: Expression = "neutral"): string {
  const key = expression === "neutral" ? id : `${id}:${expression}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const spec = SPECS[id] ?? GENERIC;
  const url = render(spec, expression);
  cache.set(key, url);
  return url;
}

/** The authored spec table by character id (sprites read the same source). */
export function specById(id: string): PixelSpec {
  return SPECS[id] ?? GENERIC;
}

/**
 * Expression frames for the theatre. A character's resting face is authored in
 * SPECS; these four overlays redraw brows and mouth on top of it. Selection is
 * rule-driven (features/narrative/cast.ts), never random.
 */
export type Expression = "neutral" | "concerned" | "pleased" | "stern" | "weary" | "surprised";


/* ------------------------------------------------------------------ */
/* Full-body sprites (v2, plan C/D): 48x64, same specs and palette     */
/* ------------------------------------------------------------------ */

export const SPRITE_W = 96;
export const SPRITE_H = 128;
export type SpritePose = "stand" | "walk";
export type SpriteBlink = boolean;

export interface SpriteFrameOpts {
  pose?: SpritePose;
  /** Walk frame 0-3 (contact / pass / contact / pass, mirrored). */
  frame?: number;
  blink?: boolean;
}

/**
 * The illustrated paper-doll (D-24): the layered generator repaints into a
 * 4x-supersampled soft canvas — gradient shading, smooth masses, anti-aliased
 * edges — and downsamples to the native 96x128 sprite. Layers, spec, stances,
 * expressions and gates are unchanged; only the renderer left the pixel rules.
 */

interface BodyGeom {
  sw: number;
  ww: number;
  shoulderY: number;
  legTop: number;
  legH: number;
  headRx: number;
  headRy: number;
  headCy: number;
  legW: number;
}

/** Logical 96x128 units per body type (D-19). headCy puts the head a
 *  neck's width above the shoulders so the doll connects (D-24 fix). */
const BODY_GEOM: Record<BodyType, BodyGeom> = {
  slim:    { sw: 12, ww: 8,  shoulderY: 49, legTop: 92, legH: 26, headRx: 11.5, headRy: 12.5, headCy: 28.5, legW: 6 },
  average: { sw: 15, ww: 12, shoulderY: 48, legTop: 90, legH: 27, headRx: 13,  headRy: 14,  headCy: 26, legW: 8 },
  broad:   { sw: 19, ww: 15, shoulderY: 47, legTop: 90, legH: 27, headRx: 14.5, headRy: 15.5, headCy: 23.5, legW: 9 },
  heavy:   { sw: 21, ww: 25, shoulderY: 49, legTop: 88, legH: 28, headRx: 16,  headRy: 16.5, headCy: 24.5, legW: 10 },
  tall:    { sw: 13, ww: 10, shoulderY: 45, legTop: 99, legH: 26, headRx: 12,  headRy: 13,  headCy: 24, legW: 7 },
};

/** Expression body language (D-18). */
interface ExprPose {
  headDx: number;
  headDy: number;
  shoulderDy: number;
  armDy: number;
}
const EXPR_POSE: Record<Expression, ExprPose> = {
  neutral:   { headDx: 0, headDy: 0, shoulderDy: 0, armDy: 0 },
  concerned: { headDx: 2, headDy: 0, shoulderDy: 0, armDy: 0 },
  pleased:   { headDx: 0, headDy: -2, shoulderDy: -2, armDy: -2 },
  stern:     { headDx: 1, headDy: 1, shoulderDy: 2, armDy: 0 },
  weary:     { headDx: 1, headDy: 1, shoulderDy: 2, armDy: 3 },
  surprised: { headDx: 0, headDy: -1, shoulderDy: -2, armDy: -2 },
};

const C_BELT_BUCKLE = "#c9a96a";

/* --- the soft canvas: RGBA fine buffer + shape fills ---------------------- */

type RGB = [number, number, number];
type Colour = ArrayLike<number>;
const rgbCache = new Map<string, RGB>();
function rgb(hex: string): RGB {
  let v = rgbCache.get(hex);
  if (!v) {
    v = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    rgbCache.set(hex, v);
  }
  return v;
}
function mixRGB(a: Colour, b: Colour, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ] as RGB;
}
function shadeRGB(hex: string, f: number): RGB {
  return rgb(shade(hex, f));
}

class Soft {
  d: Uint8ClampedArray;
  constructor(public w: number, public h: number) {
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  blend(x: number, y: number, c: Colour, a: number): void {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const d = this.d;
    const fa = Math.max(0, Math.min(1, a));
    d[i] = d[i] * (1 - fa) + c[0] * fa;
    d[i + 1] = d[i + 1] * (1 - fa) + c[1] * fa;
    d[i + 2] = d[i + 2] * (1 - fa) + c[2] * fa;
    d[i + 3] = Math.max(d[i + 3], Math.round(fa * 255));
  }
  /** Anti-aliased ellipse: 2x2 sub-samples per fine pixel. */
  fillEllipse(cx: number, cy: number, rx: number, ry: number, c: Colour, a = 1): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        let cov = 0;
        for (const sx of [-0.25, 0.25]) {
          for (const sy of [-0.25, 0.25]) {
            const dx = (x + 0.5 + sx - cx) / rx;
            const dy = (y + 0.5 + sy - cy) / ry;
            if (dx * dx + dy * dy <= 1) cov += 0.25;
          }
        }
        if (cov > 0) this.blend(x, y, c, a * cov);
      }
    }
  }
  /** Radially shaded ellipse: light centre to edge shade. */
  fillEllipseShaded(cx: number, cy: number, rx: number, ry: number, cIn: Colour, cEdge: Colour): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= 1) this.blend(x, y, mixRGB(cIn, cEdge, Math.min(1, d * 1.15)), 1);
      }
    }
  }
  /** Vertical-gradient rounded rect; t = 0 at top, 1 at bottom. */
  fillRoundRect(x: number, y: number, w: number, h: number, r: number, c: (t: number) => Colour): void {
    void r;
    for (let yy = Math.round(y); yy < Math.round(y + h); yy++) {
      const t = h > 0 ? (yy - y) / h : 0;
      const col = c(t);
      for (let xx = Math.round(x); xx < Math.round(x + w); xx++) this.blend(xx, yy, col, 1);
    }
  }
  fillRect(x: number, y: number, w: number, h: number, c: Colour): void {
    for (let yy = Math.round(y); yy < Math.round(y + h); yy++) {
      for (let xx = Math.round(x); xx < Math.round(x + w); xx++) this.blend(xx, yy, c, 1);
    }
  }
  downsample(f: number): (string | null)[][] {
    const w = Math.floor(this.w / f);
    const h = Math.floor(this.h / f);
    const cells: (string | null)[][] = [];
    for (let y = 0; y < h; y++) {
      const row: (string | null)[] = [];
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let sy = 0; sy < f; sy++) {
          for (let sx = 0; sx < f; sx++) {
            const i = ((y * f + sy) * this.w + (x * f + sx)) * 4;
            const al = this.d[i + 3] / 255;
            r += this.d[i] * al;
            g += this.d[i + 1] * al;
            b += this.d[i + 2] * al;
            a += al;
          }
        }
        const n = f * f;
        const avgA = a / n;
        if (avgA < 0.02) row.push(null);
        else {
          const rr = Math.round(r / (a || 1));
          const gg = Math.round(g / (a || 1));
          const bb = Math.round(b / (a || 1));
          row.push(`rgba(${rr},${gg},${bb},${avgA.toFixed(3)})`);
        }
      }
      cells.push(row);
    }
    return cells;
  }
}

/** Paints the whole doll into `sc`. m = fine px per logical unit; the figure
 *  is drawn at logical (32 - ox, ... - oy). */
function paintDoll(
  sc: Soft,
  spec: PixelSpec,
  expression: Expression,
  opts: SpriteFrameOpts,
  m: number,
  ox = 0,
  oy = 0,
): void {
  const body = spec.body ?? "average";
  const geom = BODY_GEOM[body];
  const [skin, skinSh, skinHi] = spec.skin.map(rgb);
  const a = spec.attire;
  const pose = opts.pose ?? "stand";
  const frame = opts.frame ?? 0;
  const exprPose = EXPR_POSE[expression];
  const stoop = spec.stoop === true;

  const headDx = exprPose.headDx + (stoop ? 3 : 0);
  const headDy = exprPose.headDy + (stoop ? 1 : 0);
  const shoulderY = geom.shoulderY + exprPose.shoulderDy + (stoop ? 2 : 0);
  const legTop = geom.legTop;
  const legH = Math.min(30, geom.legH + (spec.heightAdj ?? 0));
  const legW = geom.legW;
  const attireC = rgb(a.c);
  const attireShade = rgb(shade(a.c, 0.22));
  const attireLit = rgb(tint(a.c, 0.16));
  const shoeC = rgb(shade(a.c, 0.5));

  // helpers in fine space
  const fx = (x: number): number => (x - ox) * m;
  const fy = (y: number): number => (y - oy) * m;

  // ground shadow: soft dark ellipse at low alpha (fine-space coords)
  sc.fillEllipse(32 * m, (SPRITE_H - 3) * m, 15 * m, 2.2 * m, [20, 26, 34], 0.3);

  // --- legs ---------------------------------------------------------------
  const legAX = 32 - Math.round(geom.ww / 2) - Math.round(legW / 2) - 1;
  const legBX = legAX + Math.round(geom.ww / 2) + legW - 1;
  if (pose === "walk") {
    const bentA = frame === 1 || frame === 3;
    const bentB = frame === 0 || frame === 2;
    const shiftA = frame === 0 ? -3 : frame === 2 ? 3 : 0;
    const shiftB = -shiftA;
    sc.fillRoundRect(fx(legAX + shiftA), fy(legTop), legW * m, (bentA ? legH - 3 : legH) * m, 2, (t) => mixRGB(attireLit, attireShade, t));
    sc.fillRoundRect(fx(legBX + shiftB), fy(legTop), legW * m, (bentB ? legH - 3 : legH) * m, 2, (t) => mixRGB(attireC, attireShade, 0.35 + t * 0.45));
    sc.fillRect(fx(legAX + shiftA), fy(legTop + (bentA ? legH - 6 : legH - 3)), legW * m, 3 * m, shoeC);
    sc.fillRect(fx(legBX + shiftB), fy(legTop + (bentB ? legH - 6 : legH - 3)), legW * m, 3 * m, shoeC);
  } else {
    sc.fillRoundRect(fx(legAX), fy(legTop), legW * m, legH * m, 2, (t) => mixRGB(attireLit, attireShade, t * 0.8));
    sc.fillRoundRect(fx(legBX), fy(legTop), legW * m, legH * m, 2, (t) => mixRGB(attireC, attireShade, 0.35 + t * 0.45));
    sc.fillRect(fx(legAX), fy(legTop + legH - 3), legW * m, 3 * m, shoeC);
    sc.fillRect(fx(legBX), fy(legTop + legH - 3), legW * m, 3 * m, shoeC);
  }

  // --- torso ---------------------------------------------------------------
  const torsoRows = (legTop - shoulderY) * m;
  const hemFlare = a.kind === "suit" ? 1 : a.kind === "open" ? 2 : 0;
  for (let fy2 = 0; fy2 < torsoRows; fy2++) {
    const y = shoulderY * m + fy2;
    const t = fy2 / torsoRows;
    let half = geom.sw + (geom.ww - geom.sw) * t;
    if (body === "heavy" && t > 0.45 && t < 0.9) half += 2.5;
    if (t > 0.86) half += hemFlare;
    const dark = rgb("#1a1a22");
    const col = mixRGB(rgb(tint(a.c, 0.14)), mixRGB(attireC, dark, t), t);
    sc.fillRect(fx(32 - half), y, half * m, 1, col);
    sc.fillRect(fx(32 + half - Math.max(1, m * 0.5)), y, Math.max(1, m * 0.5), 1, shadeRGB(a.c, 0.18 + t * 0.12));
    if (fy2 === 0) sc.fillRect(fx(32 - half), y, half * 2 * m, 1, mixRGB(col, [255, 250, 240], 0.25));
  }
  for (let s = 1; s <= 2; s++) {
    const half = Math.max(3, geom.sw - s * 3.5);
    sc.fillRect(fx(32 - half), fy(shoulderY - s), half * 2 * m, m, mixRGB(attireC, rgb("#faf6ec"), 0.22));
  }

  // collar furniture per kind
  const collarY = shoulderY + 2;
  const torsoH = legTop - shoulderY;
  const attireShirt = rgb(a.shirt);
  const attireTrim = rgb(a.trim);
  const attireAccent = rgb(a.accent ?? a.trim);
  const attireTie = rgb(a.tie ?? a.trim);
  if (a.kind === "suit") {
    sc.fillRect(fx(29), fy(collarY), 6 * m, (torsoH - 2) * m, attireShirt);
    sc.fillRect(fx(33), fy(collarY), m, (torsoH - 2) * m, shadeRGB(a.shirt, 0.16));
    if (a.tie) {
      sc.fillRect(fx(31), fy(collarY), 2 * m, 3 * m, attireTie);
      sc.fillRect(fx(31), fy(collarY + 3), 2 * m, Math.max(4, torsoH - 8) * m, attireTie);
      sc.fillRect(fx(31), fy(collarY + torsoH - 6), 2 * m, 3 * m, shadeRGB(a.tie, 0.22));
    }
    const lap = Math.round(geom.sw * 0.6);
    sc.fillRect(fx(32 - lap), fy(collarY), 3 * m, 3 * m, attireTrim);
    sc.fillRect(fx(32 - lap - 1), fy(collarY + 3), 3 * m, 4 * m, attireTrim);
    sc.fillRect(fx(32 + lap - 3), fy(collarY), 3 * m, 3 * m, attireTrim);
    sc.fillRect(fx(32 + lap), fy(collarY + 3), 3 * m, 4 * m, attireTrim);
    if (a.accent) sc.fillRect(fx(32 + lap + 3), fy(collarY + 12), 3 * m, 2 * m, rgb(a.accent));
  } else if (a.kind === "open") {
    const px = Math.round(geom.sw * 0.5);
    sc.fillRect(fx(32 - px), fy(collarY), 4 * m, (torsoH - 2) * m, attireShirt);
    sc.fillRect(fx(32 + px - 4), fy(collarY), 4 * m, (torsoH - 2) * m, attireShirt);
    sc.fillRect(fx(32 - px - 2), fy(collarY), 2 * m, (torsoH - 2) * m, attireTrim);
    sc.fillRect(fx(32 + px + 1), fy(collarY), 2 * m, (torsoH - 2) * m, attireTrim);
  } else if (a.kind === "mandarin" || a.kind === "sherwani") {
    sc.fillRect(fx(29), fy(collarY), 6 * m, (torsoH - 2) * m, attireShirt);
    sc.fillRect(fx(31), fy(collarY + 2), m, (torsoH - 4) * m, shadeRGB(a.shirt, 0.14));
    for (let b = 0; b < 4; b++) sc.fillRect(fx(31), fy(collarY + 3 + b * 4), m, m, attireAccent);
    sc.fillRect(fx(32 - Math.round(geom.sw * 0.5) - 2), fy(collarY), 2 * m, (torsoH - 2) * m, attireTrim);
    sc.fillRect(fx(32 + Math.round(geom.sw * 0.5) + 1), fy(collarY), 2 * m, (torsoH - 2) * m, attireTrim);
    sc.fillRect(fx(30), fy(collarY - 1), 5 * m, 2 * m, attireTrim);
  } else if (a.kind === "baju") {
    sc.fillRect(fx(29), fy(collarY), 6 * m, (torsoH - 2) * m, attireShirt);
    sc.fillRect(fx(31), fy(collarY + 2), m, (torsoH - 4) * m, shadeRGB(a.shirt, 0.16));
    sc.fillRect(fx(31), fy(collarY + 2), m, m, attireAccent);
    sc.fillRect(fx(31), fy(collarY + 4), m, m, attireAccent);
    const sashY = legTop - 9;
    for (let s = 0; s < 7; s++) {
      const x = 32 - Math.round(geom.ww * 0.4) + s * 2;
      sc.fillRect(fx(x - 1), fy(sashY + s), Math.max(4, geom.ww + 3 - s * 1.2) * m, 2 * m, s % 2 === 0 ? attireTrim : mixRGB(attireTrim, [20, 20, 20], 0.25));
    }
  }
  sc.fillRect(fx(32 - geom.ww - 2), fy(legTop - 6), (geom.ww * 2 + 4) * m, 3 * m, shadeRGB(a.c, 0.4));
  sc.fillRect(fx(32 - geom.ww), fy(legTop - 5), m, m, rgb(C_BELT_BUCKLE));
  sc.fillRect(fx(32 + geom.ww - 1), fy(legTop - 5), m, m, rgb(C_BELT_BUCKLE));

  // --- arms per stance -------------------------------------------------------
  const armW = body === "heavy" ? 6 : body === "slim" ? 4 : 5;
  const armY = shoulderY + 3;
  const armSwing = pose === "walk" ? (frame === 0 ? 1 : frame === 2 ? -1 : 0) : 0;
  const idleIn = pose === "stand" && frame === 1 ? 1 : 0;
  const stance = spec.stance ?? "stand";
  const armLen = Math.max(6, legTop - armY - 5 + exprPose.armDy);
  const armCol = rgb(shade(a.c, 0.1));
  const handC = skin;

  const armDown = (side: number, xOff: number, len: number): void => {
    const ax = 32 + side * (geom.sw - armW + 1) + xOff - (side < 0 ? 0 : armW - 1);
    sc.fillRoundRect(fx(ax), fy(armY), armW * m, len * m, 2, (t) => mixRGB(attireLit, attireShade, 0.15 + t * 0.35));
    sc.fillEllipse(fx(ax + armW * 0.5), fy(armY + len + 1.5), armW * m * 0.55, 1.8 * m, handC);
  };

  if (pose === "walk") {
    const wLX = 32 - geom.sw - armW + 2 - armSwing;
    const wRX = 32 + geom.sw - 2 + armSwing;
    sc.fillRoundRect(fx(wLX), fy(armY), armW * m, armLen * m, 2, () => mixRGB(attireLit, attireShade, 0.3));
    sc.fillRoundRect(fx(wRX), fy(armY), armW * m, armLen * m, 2, () => mixRGB(attireC, attireShade, 0.3));
    sc.fillEllipse(fx(wLX + armW * 0.5), fy(armY + armLen + 1.5), armW * m * 0.55, 1.8 * m, handC);
    sc.fillEllipse(fx(wRX + armW * 0.5), fy(armY + armLen + 1.5), armW * m * 0.55, 1.8 * m, handC);
  } else if (stance === "clasp") {
    const upper = Math.max(4, Math.round(armLen * 0.55));
    for (const side of [-1, 1] as const) {
      for (let s = 0; s < upper; s++) {
        const t = s / upper;
        const x = 32 + side * (geom.sw + armW - 2) - side * Math.round(t * (geom.sw - 1)) - (side < 0 ? armW : 0);
        sc.fillRect(fx(x), fy(armY + s), armW * m, m, armCol);
      }
      sc.fillEllipse(fx(32 + side * 2), fy(armY + upper + 1.5), armW * m * 0.6, 1.8 * m, handC);
    }
  } else if (stance === "hip") {
    const elbowY = armY + Math.round(armLen * 0.6);
    for (const side of [-1, 1] as const) {
      const ax = 32 + side * (geom.sw - armW + 1) - (side < 0 ? 0 : armW - 1);
      sc.fillRoundRect(fx(ax), fy(armY), armW * m, (elbowY - armY) * m, 2, (t) => mixRGB(attireLit, attireShade, t * 0.4));
      const outX = 32 + side * (geom.sw + 3.5) - (side < 0 ? 0 : armW - 1);
      for (let s = 0; s <= 3; s++) {
        sc.fillRect(fx(ax + ((outX - ax) * s) / 3), fy(elbowY + s), armW * m, m, mixRGB(attireLit, attireShade, 0.3));
      }
      sc.fillEllipse(fx(32 + side * (geom.sw + 3.5) + armW * 0.5), fy(elbowY + 5.5), armW * m * 0.55, 1.8 * m, handC);
    }
  } else if (stance === "cross") {
    const foldY = armY + Math.round(armLen * 0.55);
    for (const side of [-1, 1] as const) {
      const ax = 32 + side * (geom.sw - armW + 1) - (side < 0 ? 0 : armW - 1);
      sc.fillRoundRect(fx(ax), fy(armY), armW * m, (foldY - armY + 1) * m, 2, (t) => mixRGB(attireLit, attireShade, t * 0.4));
    }
    sc.fillRect(fx(32 - geom.sw - 1), fy(foldY), (geom.sw * 2 + 3) * m, 4 * m, mixRGB(attireC, [20, 26, 34], 0.22));
    sc.fillRect(fx(32 - geom.sw - 1), fy(foldY + 4), (geom.sw * 2 + 3) * m, 2 * m, handC);
  } else {
    armDown(-1, idleIn, armLen);
    armDown(1, -idleIn, armLen);
  }

  // --- props -----------------------------------------------------------------
  if (pose === "stand" && spec.prop) {
    const handY = armY + armLen;
    const handX = 32 + geom.sw + 1;
    if (spec.prop === "folder") {
      sc.fillRoundRect(fx(handX - 2), fy(handY - 7), 8 * m, 7 * m, 1, () => mixRGB([201, 169, 106], [160, 130, 80], 0.3));
      sc.fillRect(fx(handX - 1), fy(handY - 6), 6 * m, 2 * m, [242, 237, 225]);
      sc.fillRect(fx(handX + 5), fy(handY - 7), m, 7 * m, shadeRGB("#c9a96a", 0.3));
    } else if (spec.prop === "phone") {
      sc.fillRoundRect(fx(handX), fy(handY - 3), 3 * m, 6 * m, 1, () => [18, 23, 29]);
      sc.fillRect(fx(handX + 1), fy(handY - 2), m, 2 * m, [215, 226, 236]);
    } else if (spec.prop === "tablet") {
      sc.fillRoundRect(fx(27), fy(handY - 9), 10 * m, 8 * m, 1, () => [18, 23, 29]);
      sc.fillRect(fx(28), fy(handY - 8), 8 * m, 5 * m, [43, 58, 74]);
      sc.fillRect(fx(29), fy(handY - 7), 3 * m, 2 * m, [77, 122, 158]);
    } else if (spec.prop === "cane") {
      const caneX = handX + armW + 1;
      sc.fillRect(fx(caneX), fy(handY - 2), m, (SPRITE_H - 6 - handY) * m, [107, 71, 42]);
      sc.fillRoundRect(fx(caneX - 1), fy(handY - 4), 3 * m, 2 * m, 1, () => [107, 71, 42]);
      sc.fillEllipse(fx(handX + armW * 0.5), fy(handY), armW * m * 0.5, 1.5 * m, handC);
    }
  }

  // --- head --------------------------------------------------------------------
  drawDollHeadSoft(sc, spec, expression, 32 + headDx, geom.headCy + headDy, geom.headRx, geom.headRy, Boolean(opts.blink), m, ox, oy, skin, skinSh, skinHi, collarY);
}

/** The illustrated head (D-24). neckToY: how far down the neck fill runs
 *  (logical y of the collar), so head and torso connect. */
function drawDollHeadSoft(
  sc: Soft,
  spec: PixelSpec,
  expression: Expression,
  hx: number,
  hy: number,
  rx: number,
  ry: number,
  blink: boolean,
  m: number,
  ox: number,
  oy: number,
  skin: RGB,
  skinSh: RGB,
  skinHi: RGB,
  neckToY: number,
): void {
  const X = (x: number): number => (x - ox) * m;
  const Y = (y: number): number => (y - oy) * m;
  const chin = spec.face?.chin ?? "taper";
  const noseW = spec.face?.nose ?? "slim";
  const browShape = spec.face?.brow ?? "straight";
  void chin;

  // neck — runs under the jaw into the collar so head and torso connect (D-24);
  // drawn first so the skull and jaw overlap it
  const neckTop = hy + ry - 1;
  const neckC = spec.hijab ? rgb(spec.hijab.c) : mixRGB(skin, skinSh, 0.5);
  sc.fillRect(X(hx - 3), Y(neckTop), 6 * m, Math.max(5, neckToY - neckTop) * m, neckC);
  // temple rim light — under the hair so it reads as form, not a streak (D-24)
  sc.fillEllipse(X(hx - rx * 0.74), Y(hy - ry * 0.72), 1.0 * m, ry * 0.2 * m, mixRGB(skin, skinHi, 0.35));

  // skull: radially shaded
  sc.fillEllipseShaded(X(hx), Y(hy), rx * m, ry * m, mixRGB(skin, skinHi, 0.35), mixRGB(skin, skinSh, 0.55));
  // jaw per shape
  if (chin === "square") {
    sc.fillRect(X(hx - rx * 0.7), Y(hy + ry * 0.7), rx * 1.4 * m, 4 * m, mixRGB(skin, skinSh, 0.2));
    sc.fillRect(X(hx - rx * 0.55), Y(hy + ry * 0.85), rx * 1.1 * m, 2 * m, skin);
  } else if (chin === "round") {
    sc.fillEllipseShaded(X(hx), Y(hy + ry * 0.7), rx * 0.7 * m, ry * 0.5 * m, skin, mixRGB(skin, skinSh, 0.3));
  } else {
    sc.fillEllipseShaded(X(hx), Y(hy + ry * 0.75), rx * 0.5 * m, ry * 0.45 * m, skin, mixRGB(skin, skinSh, 0.25));
  }
  // ears
  sc.fillEllipse(X(hx - rx - 0.5), Y(hy + 2), 1.5 * m, 2 * m, skin);
  sc.fillEllipse(X(hx + rx + 0.5), Y(hy + 2), 1.5 * m, 2 * m, skin);

  // hair
  const h = spec.hair;
  if (h) {
    const c = rgb(h.c);
    const hi = rgb(h.hi);
    switch (h.style) {
      case "bob":
        sc.fillEllipseShaded(X(hx), Y(hy - 1), (rx + 3) * m, (ry + 1) * m, hi, c);
        sc.fillRect(X(hx - rx - 3), Y(hy + 1), 4 * m, ry * 1.6 * m, c);
        sc.fillRect(X(hx + rx - 1), Y(hy + 1), 4 * m, ry * 1.6 * m, shadeRGB(h.c, 0.3));
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        break;
      case "receding":
        sc.fillEllipseShaded(X(hx), Y(hy - 3), (rx + 1) * m, (ry - 3) * m, hi, c);
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        break;
      case "tied":
        sc.fillEllipseShaded(X(hx), Y(hy - 2), (rx + 2) * m, ry * m, hi, c);
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        sc.fillEllipse(X(hx - rx - 1), Y(hy - 1), 3 * m, 4 * m, c);
        break;
      case "sidepart":
        sc.fillEllipseShaded(X(hx), Y(hy - 2), (rx + 2) * m, (ry - 1) * m, hi, c);
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        break;
      case "curls":
        for (const [dx, dy, r] of [[-6, -3, 5], [0, -5, 6], [6, -2, 5], [-9, 1, 4], [9, 1, 4]] as const) {
          sc.fillEllipseShaded(X(hx + dx), Y(hy + dy), r * m, (r - 1) * m, mixRGB(hi, c, 0.4), c);
        }
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        break;
      case "combed":
      case "white":
        sc.fillEllipseShaded(X(hx), Y(hy - 3), (rx + 1) * m, (ry - 2) * m, hi, c);
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        break;
      case "short":
      default:
        sc.fillEllipseShaded(X(hx), Y(hy - 2), (rx + 2) * m, ry * m, hi, c);
        sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 1) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
        break;
    }
  }

  // headwear
  if (spec.hijab) {
    const c = rgb(spec.hijab.c);
    const hi = rgb(spec.hijab.hi);
    const long = spec.hijab.style === "long";
    sc.fillEllipseShaded(X(hx), Y(hy), (rx + (long ? 1 : 3)) * m, (ry + 2) * m, hi, c);
    if (long) {
      sc.fillRect(X(hx - rx + 1), Y(hy + 2), 3 * m, ry * 2.4 * m, c);
      sc.fillRect(X(hx + rx - 4), Y(hy + 2), 3 * m, ry * 2.4 * m, shadeRGB(spec.hijab.c, 0.22));
      sc.fillRect(X(hx - 6), Y(hy + ry * 1.4), 12 * m, ry * 1.5 * m, c);
      sc.fillRect(X(hx - 6), Y(hy + ry * 1.4), m, ry * 1.5 * m, shadeRGB(spec.hijab.c, 0.18));
    } else {
      sc.fillRect(X(hx - rx - 3), Y(hy), 4 * m, ry * 2.1 * m, c);
      sc.fillRect(X(hx + rx - 1), Y(hy), 4 * m, ry * 2.1 * m, shadeRGB(spec.hijab.c, 0.22));
      sc.fillRect(X(hx - rx - 2), Y(hy + ry * 1.6), (rx * 2 + 4) * m, 7 * m, c);
      sc.fillRect(X(hx - rx - 2), Y(hy + ry * 1.6 + 6), (rx * 2 + 4) * m, m, shadeRGB(spec.hijab.c, 0.18));
    }
    sc.fillEllipseShaded(X(hx), Y(hy + 1), (rx - 2) * m, (ry - 2) * m, skin, mixRGB(skin, skinSh, 0.3));
    sc.fillRect(X(hx - rx + 2), Y(hy - 2), (rx * 2 - 4) * m, 4 * m, skin);
    sc.fillRect(X(hx - rx - 1), Y(hy - 2), m, ry * 1.8 * m, shadeRGB(spec.hijab.c, 0.22));
    sc.fillRect(X(hx + rx), Y(hy - 2), m, ry * 1.8 * m, shadeRGB(spec.hijab.c, 0.22));
    sc.fillEllipse(X(hx + rx - 2.5), Y(hy + ry + 3), 1.2 * m, 1.2 * m, [230, 205, 142]);
  }
  if (spec.songkok) {
    sc.fillEllipseShaded(X(hx), Y(hy - ry), (rx + 2) * m, 4 * m, mixRGB(rgb(spec.songkok), [230, 205, 142], 0.12), rgb(spec.songkok));
    sc.fillRect(X(hx - rx - 2), Y(hy - ry - 2), (rx * 2 + 4) * m, 5 * m, rgb(spec.songkok));
    sc.fillRect(X(hx - rx - 2), Y(hy - ry + 2), (rx * 2 + 4) * m, 2 * m, [201, 169, 106]);
  }
  if (spec.kopiah) {
    sc.fillEllipseShaded(X(hx), Y(hy - ry), (rx + 1) * m, 4 * m, mixRGB(rgb(spec.kopiah), [255, 252, 244], 0.25), rgb(spec.kopiah));
    sc.fillRect(X(hx - rx - 1), Y(hy - ry - 1), (rx * 2 + 2) * m, 5 * m, rgb(spec.kopiah));
    sc.fillRect(X(hx - rx - 1), Y(hy - ry + 3), (rx * 2 + 2) * m, m, [143, 138, 124]);
  }

  // face
  const browC = spec.older ? mixRGB(skin, [38, 34, 42], 0.5) : [38, 34, 42];
  const browW = browShape === "bushy" ? 6 : 5;
  const browH = browShape === "bushy" ? 2.4 : 1.6;
  const sternBrow = expression === "stern";
  const surprisedBrow = expression === "surprised";
  const wearyBrow = expression === "weary";
  const browY = hy - ry * 0.45 + (sternBrow ? 1.5 : surprisedBrow ? -2.5 : wearyBrow ? 1 : 0);
  const browTilt = expression === "concerned" ? 1.2 : 0;
  for (const side of [-1, 1] as const) {
    const bx = hx + side * (rx * 0.28) - (side < 0 ? browW * 0.7 : 0.5);
    sc.fillRoundRect(X(bx), Y(browY + (side < 0 ? browTilt : -browTilt)), browW * m, browH * m, 1.5, () => browC);
  }

  const ey = hy + ry * 0.12;
  const eyeW = noseW === "broad" ? 4.6 : 5.2;
  const exL = hx - rx * 0.52 - eyeW * 0.5;
  const exR = hx + rx * 0.52 - eyeW * 0.5;
  const drawEye = (ex: number): void => {
    if (blink || expression === "weary") {
      sc.fillRect(X(ex), Y(ey + 0.6), eyeW * m, 1.6 * m, [36, 31, 38]);
      if (expression === "weary") sc.fillRect(X(ex + 0.5), Y(ey - 0.4), (eyeW - 1) * m, 1.6 * m, [246, 242, 232]);
      return;
    }
    if (expression === "stern") {
      sc.fillEllipse(X(ex + eyeW * 0.5), Y(ey + 0.8), (eyeW * 0.5) * m, 1.4 * m, [246, 242, 232]);
      sc.fillEllipse(X(ex + eyeW * 0.5), Y(ey + 0.9), (eyeW * 0.32) * m, 1.3 * m, [35, 48, 62]);
      sc.fillEllipse(X(ex + eyeW * 0.5), Y(ey + 0.9), (eyeW * 0.16) * m, 0.8 * m, [18, 23, 29]);
      sc.fillRect(X(ex - 1), Y(ey - 0.8), (eyeW + 2) * m, 1.2 * m, [36, 31, 38]);
      return;
    }
    const eyeH = expression === "surprised" ? 3.2 : 2.4;
    sc.fillEllipseShaded(X(ex + eyeW * 0.5), Y(ey + eyeH * 0.35), (eyeW * 0.5) * m, (eyeH * 0.5) * m, [252, 250, 244], [226, 232, 238]);
    sc.fillEllipse(X(ex + eyeW * 0.5), Y(ey + eyeH * 0.4), (eyeW * 0.3) * m, (eyeH * 0.42) * m, [35, 48, 62]);
    sc.fillEllipse(X(ex + eyeW * 0.5), Y(ey + eyeH * 0.5), (eyeW * 0.16) * m, (eyeH * 0.3) * m, [18, 23, 29]);
    sc.fillEllipse(X(ex + eyeW * 0.5 - eyeW * 0.12), Y(ey + eyeH * 0.18), (eyeW * 0.12) * m, (eyeH * 0.16) * m, [215, 226, 236]);
    sc.fillRect(X(ex - 1), Y(ey - eyeH * 0.55), (eyeW + 2) * m, 1.1 * m, [36, 31, 38]);
    if (expression === "pleased") sc.fillRect(X(ex + 0.5), Y(ey + eyeH * 0.85), (eyeW - 1) * m, m, mixRGB(skin, [95, 90, 77], 0.35));
  };
  drawEye(exL);
  drawEye(exR);

  const ny = ey + ry * 0.32;
  sc.fillRect(X(hx - 0.6), Y(ny), 1.2 * m, ry * 0.24, mixRGB(skin, skinSh, 0.5));
  sc.fillEllipse(X(hx), Y(ny + ry * 0.2), (noseW === "broad" ? 2.2 : 1.6) * m, m, mixRGB(skin, skinSh, 0.45));

  sc.fillEllipse(X(hx - rx * 0.62), Y(ny + 1.6), 1.7 * m, 1.0 * m, mixRGB(skin, skinHi, 0.3));
  sc.fillEllipse(X(hx + rx * 0.6), Y(ny + 1.4), 2 * m, 1.3 * m, mixRGB(skin, skinSh, 0.4));

  const my = hy + ry * 0.82;
  const resting = spec.mouth ?? "firm";
  const mouthLine = (w: number, yOff = 0): void => {
    sc.fillRoundRect(X(hx - w / 2), Y(my + yOff), w * m, 1.6 * m, 0.8, () => [77, 50, 48]);
  };
  if (expression === "stern") {
    mouthLine(7);
    sc.fillRect(X(hx - 4), Y(my + 1.2), 1.6 * m, m, [77, 50, 48]);
    sc.fillRect(X(hx + 2.4), Y(my + 1.2), 1.6 * m, m, [77, 50, 48]);
  } else if (expression === "pleased") {
    sc.fillRoundRect(X(hx - 3.5), Y(my - 0.8), 7 * m, 2.6 * m, 1.2, () => [77, 50, 48]);
    sc.fillRect(X(hx - 2), Y(my + 0.4), 4 * m, 1.2 * m, [214, 138, 120]);
  } else if (expression === "concerned") {
    mouthLine(5.5, 0.5);
    sc.fillRect(X(hx - 3.4), Y(my + 1.2), 1.4 * m, m, [77, 50, 48]);
    sc.fillRect(X(hx + 2), Y(my + 1.2), 1.4 * m, m, [77, 50, 48]);
  } else if (expression === "surprised") {
    sc.fillEllipse(X(hx), Y(my + 0.6), 2.4 * m, 3 * m, [77, 50, 48]);
    sc.fillEllipse(X(hx), Y(my + 1), 1.6 * m, 1.6 * m, [58, 31, 34]);
  } else if (expression === "weary") {
    mouthLine(6.5);
    sc.fillRect(X(hx - 4), Y(my - 0.6), 1.4 * m, m, [77, 50, 48]);
    sc.fillRect(X(hx + 2.6), Y(my - 0.6), 1.4 * m, m, [77, 50, 48]);
  } else if (resting === "set") {
    mouthLine(7);
  } else if (resting === "soft") {
    sc.fillRoundRect(X(hx - 3), Y(my - 0.6), 6 * m, 2 * m, 1, () => [77, 50, 48]);
  } else {
    mouthLine(7);
    sc.fillRect(X(hx - 1), Y(my + 0.9), 2 * m, m, mixRGB(skin, skinHi, 0.25));
  }

  if (spec.older) {
    sc.fillRect(X(hx - rx * 0.92), Y(ey - 0.4), 1.2 * m, m, mixRGB(skin, skinSh, 0.5));
    sc.fillRect(X(hx + rx * 0.72), Y(ey - 0.4), 1.2 * m, m, mixRGB(skin, skinSh, 0.5));
    sc.fillRect(X(hx - 4), Y(my - 2.2), 2.4 * m, m, mixRGB(skin, skinSh, 0.4));
    sc.fillRect(X(hx + 1.8), Y(my - 2.2), 2.4 * m, m, mixRGB(skin, skinSh, 0.4));
  }

  if (spec.facial) {
    const grey = spec.facial.includes("grey");
    const fc = grey ? mixRGB([167, 172, 164], [255, 255, 255], 0.15) : rgb("#232833");
    if (spec.facial.startsWith("moustache")) {
      sc.fillRoundRect(X(hx - 5.5), Y(my - 2.4), 11 * m, 2.6 * m, 1.2, () => fc);
    } else {
      sc.fillEllipseShaded(X(hx), Y(my + 2.4), 7 * m, 4.6 * m, mixRGB(fc, skin, 0.15), fc);
      sc.fillRect(X(hx - 5), Y(my - 2.2), 3 * m, 2.4 * m, fc);
      sc.fillRect(X(hx + 2), Y(my - 2.2), 3 * m, 2.4 * m, fc);
    }
  }

  if (spec.glasses) {
    const f = rgb("#39414c");
    const gy = ey - 2.2;
    const gh = expression === "surprised" ? 3.6 : 2.8;
    for (const ex of [exL, exR]) {
      sc.fillRoundRect(X(ex - 1.2), Y(gy), (eyeW + 2.4) * m, (gh + 1.2) * m, 2, () => f);
      sc.fillRoundRect(X(ex - 0.6), Y(gy + 0.6), (eyeW + 1.2) * m, gh * m, 1.5, () => [215, 226, 236]);
    }
    sc.fillRect(X(hx - 1), Y(gy + 1), 2 * m, 1.2 * m, f);
  }

  if (spec.earrings) {
    sc.fillEllipse(X(hx - rx - 0.5), Y(hy + 4.5), 1.1 * m, 1.1 * m, [230, 205, 142]);
    sc.fillEllipse(X(hx + rx - 0.5), Y(hy + 4.5), 1.1 * m, 1.1 * m, [230, 205, 142]);
  }
  if (spec.bindi) sc.fillEllipse(X(hx), Y(hy - ry * 0.5), 1.2 * m, 1.4 * m, [179, 69, 46]);
}

export function drawSprite(
  spec: PixelSpec,
  expression: Expression,
  opts: SpriteFrameOpts = {},
): (string | null)[][] {
  const SS = 4;
  const sc = new Soft(SPRITE_W * SS, SPRITE_H * SS);
  paintDoll(sc, spec, expression, opts, SS, 0, 0);
  return sc.downsample(SS);
}

/** The 96x96 bust stays the paper-doll's head-and-chest crop. */
export function specFromAvatar(avatar: AvatarCustomisation): PixelSpec {
  const skin = AVATAR_SKINS.find((s) => s[0] === avatar.skin) ?? AVATAR_SKINS[0];
  const hair = AVATAR_HAIRS.find((h) => h.id === avatar.hair) ?? AVATAR_HAIRS[0];
  const attire = AVATAR_ATTIRE.find((t) => t.id === avatar.attire) ?? AVATAR_ATTIRE[0];
  const body = AVATAR_BODIES.find((b) => b.id === avatar.body) ?? AVATAR_BODIES[0];
  const spec: PixelSpec = {
    skin: [...skin],
    bg: ["#1b2434", "#10141d"],
    attire: { ...attire },
    mouth: "firm",
    body: body.id,
  };
  if (avatar.headwear === "songkok") spec.songkok = "#10151d";
  if (avatar.headwear === "kopiah") spec.kopiah = "#d9d2c0";
  if (avatar.headwear === "tudung") {
    spec.hijab = { c: hair.c, hi: tint(hair.c, 0.3), style: "cape" };
    spec.hair = undefined;
  } else {
    spec.hair = { c: hair.c, hi: hair.hi, style: hair.style };
  }
  if (avatar.glasses) spec.glasses = true;
  return spec;
}

/** The PM avatar customisation, as chosen at New Game. */
export interface AvatarCustomisation {
  skin?: string;
  hair?: string;
  headwear?: "none" | "songkok" | "kopiah" | "tudung";
  attire?: string;
  glasses?: boolean;
  homeState?: string;
  body?: BodyType;
  priorCareer?: "civilService" | "military" | "business" | "activism" | "academia";
  traits?: string[];
}

/** Body volume options for the PM avatar (D-19). */
export const AVATAR_BODIES: Array<{ id: BodyType; label: { en: string; ms: string } }> = [
  { id: "slim", label: { en: "Slim", ms: "Langsing" } },
  { id: "average", label: { en: "Average", ms: "Sederhana" } },
  { id: "broad", label: { en: "Broad", ms: "Bidang" } },
  { id: "tall", label: { en: "Tall", ms: "Tinggi" } },
  { id: "heavy", label: { en: "Heavy", ms: "Gempal" } },
];

/** Six authored skin ramps for the PM avatar. */
export const AVATAR_SKINS: [string, string, string][] = [
  ["#c99a76", "#8f6247", "#e6bd98"],
  ["#b5825a", "#7d5539", "#dcae84"],
  ["#a9744c", "#74502f", "#cc9871"],
  ["#d0a276", "#96684a", "#ecd0a8"],
  ["#c19a72", "#87613f", "#dfb894"],
  ["#9c6b45", "#6b472a", "#c0916a"],
];

/** Hair options for the PM avatar (id, colour ramp, bust style). */
export const AVATAR_HAIRS: Array<{ id: string; c: string; hi: string; style: NonNullable<PixelSpec["hair"]>["style"] }> = [
  { id: "shortDark", c: "#1d222c", hi: "#4d5a6e", style: "short" },
  { id: "combedGrey", c: "#e5e2da", hi: "#f7f5ef", style: "white" },
  { id: "sidepart", c: "#2a2f38", hi: "#8b93a1", style: "sidepart" },
  { id: "tied", c: "#191d24", hi: "#3f4a5a", style: "tied" },
  { id: "curls", c: "#262b30", hi: "#6e747c", style: "curls" },
  { id: "bald", c: "#c49a72", hi: "#e2ba92", style: "receding" },
];

/** Attire options for the PM avatar. */
export const AVATAR_ATTIRE: Array<{ id: string; kind: PixelSpec["attire"]["kind"]; c: string; trim: string; shirt: string; tie?: string; accent?: string }> = [
  { id: "suitNavy", kind: "suit", c: "#2a3140", trim: "#4a5468", shirt: "#e9e2d2", tie: "#8a6c1f", accent: "#c9a96a" },
  { id: "suitGrey", kind: "suit", c: "#3a3f4a", trim: "#5a6070", shirt: "#dde2e8", tie: "#6e3440", accent: "#c9a96a" },
  { id: "batik", kind: "open", c: "#223026", trim: "#3f5a48", shirt: "#c6cdc2" },
  { id: "mandarin", kind: "mandarin", c: "#1f232c", trim: "#c9a96a", shirt: "#d9d2c0", accent: "#e6cd8e" },
  { id: "bajuCream", kind: "baju", c: "#efe9dc", trim: "#c9a96a", shirt: "#efe9dc", accent: "#8f8a7c" },
  { id: "sherwani", kind: "sherwani", c: "#2d4a3a", trim: "#c9a96a", shirt: "#d9d2c0", accent: "#e6cd8e" },
];

const avatarCache = new Map<string, string>();

/** Bust data URL for a customised PM avatar, cached by the customisation. */
export function pmAvatarDataUrl(avatar: AvatarCustomisation, expression: Expression = "neutral"): string {
  const key = JSON.stringify(avatar) + (expression === "neutral" ? "" : `:${expression}`);
  const hit = avatarCache.get(key);
  if (hit !== undefined) return hit;
  const url = render(specFromAvatar(avatar), expression);
  avatarCache.set(key, url);
  return url;
}

/** Full-body sprite data URL for any spec (transparent). */
export function spriteDataUrl(spec: PixelSpec, expression: Expression, opts: { pose?: "stand" | "walk"; frame?: number; blink?: boolean } = {}): string {
  const key = JSON.stringify(spec) + `:${expression}:${opts.pose ?? "stand"}:${opts.frame ?? 0}:${opts.blink ? 1 : 0}`;
  const hit = avatarCache.get(key);
  if (hit !== undefined) return hit;
  const cells = drawSprite(spec, expression, opts);
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  for (let y = 0; y < SPRITE_H; y++) {
    for (let x = 0; x < SPRITE_W; x++) {
      const cell = cells[y][x];
      if (!cell) continue;
      if (cell.startsWith("rgba(")) {
        const nums = cell.slice(5, -1).split(",").map((s) => parseFloat(s.trim()));
        ctx.fillStyle = `rgba(${nums[0]},${nums[1]},${nums[2]},${nums[3] ?? 1})`;
      } else {
        ctx.fillStyle = cell;
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const url = canvas.toDataURL("image/png");
  avatarCache.set(key, url);
  return url;
}


const SPECS: Record<string, PixelSpec> = {
  chiefOfStaff: {
    skin: ["#c99a76", "#8f6247", "#e6bd98"],
    bg: ["#1b2434", "#10141d"],
    attire: { kind: "suit", c: "#2a3140", trim: "#4a5468", shirt: "#e9e2d2", tie: "#8a6c1f", accent: "#c9a96a" },
    hair: { c: "#1d222c", hi: "#4d5a6e", style: "bob" },
    mouth: "soft",
    prop: "folder",
    body: "slim",
    heightAdj: 1,
    face: { brow: "arched", chin: "taper", nose: "slim" },
  },
  finance: {
    skin: ["#c49a72", "#8a6244", "#e2ba92"],
    bg: ["#1d2740", "#10141d"],
    attire: { kind: "suit", c: "#232a36", trim: "#3d4757", shirt: "#dde2e8", tie: "#6e3440", accent: "#c9a96a" },
    hair: { c: "#8f8f8c", hi: "#c4c4c0", style: "receding" },
    glasses: true,
    older: true,
    mouth: "set",
    body: "broad",
    stance: "cross",
    heightAdj: 3,
    face: { brow: "bushy", chin: "square", nose: "broad" },
  },
  economicAdviser: {
    skin: ["#b5825a", "#7d5539", "#dcae84"],
    bg: ["#173028", "#0f1a17"],
    attire: { kind: "suit", c: "#1f4440", trim: "#39655c", shirt: "#d8b86a", accent: "#c9a96a" },
    hair: { c: "#191d24", hi: "#3f4a5a", style: "tied" },
    glasses: true,
    bindi: true,
    earrings: true,
    mouth: "firm",
    body: "slim",
    stance: "clasp",
    heightAdj: -2,
    face: { brow: "arched", chin: "taper", nose: "slim" },
  },
  nationalSecurity: {
    skin: ["#c19a72", "#87613f", "#dfb894"],
    bg: ["#20262e", "#11151b"],
    attire: { kind: "suit", c: "#262d38", trim: "#48536a", shirt: "#cfd6de" },
    hijab: { c: "#26324a", hi: "#3d556a", style: "long" },
    older: true,
    mouth: "set",
    body: "average",
    heightAdj: 2,
    face: { brow: "straight", chin: "taper", nose: "slim" },
  },
  foreign: {
    skin: ["#d0a276", "#96684a", "#ecd0a8"],
    bg: ["#1c2436", "#10141d"],
    attire: { kind: "suit", c: "#2c3d5c", trim: "#51678c", shirt: "#ece9e0", tie: "#1d2740", accent: "#e6cd8e" },
    hair: { c: "#2a2f38", hi: "#8b93a1", style: "sidepart" },
    glasses: true,
    prop: "phone",
    older: true,
    mouth: "firm",
    body: "slim",
    stance: "hip",
    heightAdj: -3,
    face: { brow: "straight", chin: "square", nose: "slim" },
  },
  home: {
    skin: ["#c39c74", "#896248", "#e0bd97"],
    bg: ["#33202a", "#170f14"],
    attire: { kind: "suit", c: "#2a2632", trim: "#4a4458", shirt: "#d8d3c8", accent: "#e6cd8e" },
    hijab: { c: "#6e2f3a", hi: "#8a474e", style: "cape" },
    older: true,
    mouth: "firm",
    body: "broad",
    heightAdj: 3,
    face: { brow: "straight", chin: "taper", nose: "slim" },
  },
  borneoMinister: {
    skin: ["#a9744c", "#74502f", "#cc9871"],
    bg: ["#1c2e1f", "#0f1812"],
    attire: { kind: "open", c: "#223026", trim: "#3f5a48", shirt: "#c6cdc2" },
    hair: { c: "#262b30", hi: "#6e747c", style: "curls" },
    older: true,
    mouth: "firm",
        heightAdj: -5,
    face: { brow: "bushy", chin: "round", nose: "broad" },
  },
  gpsPremier: {
    skin: ["#bd8a5e", "#835a38", "#d9ad82"],
    bg: ["#2e2417", "#171208"],
    attire: { kind: "suit", c: "#2b2a24", trim: "#4e4c40", shirt: "#e4ded0", accent: "#c9a96a" },
    hair: { c: "#8a8a84", hi: "#bdbdb6", style: "combed" },
    glasses: true,
    older: true,
    mouth: "firm",
    body: "tall",
    face: { brow: "straight", chin: "square", nose: "slim" },
  },
  bnChair: {
    skin: ["#bd9268", "#84603e", "#dfb98e"],
    bg: ["#2c2416", "#15100a"],
    attire: { kind: "mandarin", c: "#1f232c", trim: "#c9a96a", shirt: "#d9d2c0", accent: "#e6cd8e" },
    hair: { c: "#e5e2da", hi: "#f7f5ef", style: "white" },
    songkok: "#10151d",
    facial: "moustache-grey",
    older: true,
    mouth: "set",
    body: "heavy",
    face: { brow: "bushy", chin: "square", nose: "broad" },
  },
  oppositionLeader: {
    skin: ["#c39a70", "#8a6244", "#dfba92"],
    bg: ["#341d20", "#18100f"],
    attire: { kind: "mandarin", c: "#23272e", trim: "#3c434f", shirt: "#c9cdd4", accent: "#8a474e" },
    hair: { c: "#31353d", hi: "#7d8492", style: "short" },
    kopiah: "#d9d2c0",
    facial: "beard",
    mouth: "set",
    body: "average",
    heightAdj: -2,
    face: { brow: "bushy", chin: "square", nose: "broad" },
  },
  // --- supporting cast (v3a phase 2): real specs, never anonymous ----------
  "sup-palaceSecretary": {
    skin: ["#c49a72", "#8a6244", "#e2ba92"],
    bg: ["#241f18", "#14100c"],
    attire: { kind: "baju", c: "#d9d2c0", trim: "#b8ad93", shirt: "#efe9dc", accent: "#8f8a7c" },
    hair: { c: "#e5e2da", hi: "#f7f5ef", style: "combed" },
    songkok: "#3a3f4a",
    facial: "moustache-grey",
    older: true,
    stoop: true,
    prop: "cane",
    mouth: "soft",
    body: "average",
    face: { brow: "straight", chin: "taper", nose: "slim" },
  },
  "sup-attorneyGeneral": {
    skin: ["#b5825a", "#7d5539", "#dcae84"],
    bg: ["#2a1e20", "#161011"],
    attire: { kind: "suit", c: "#1f232c", trim: "#39414c", shirt: "#e9e2d2", tie: "#6e3440" },
    hair: { c: "#31353d", hi: "#7d8492", style: "bob" },
    glasses: true,
    older: true,
    mouth: "set",
    body: "slim",
    stance: "clasp",
    heightAdj: -5,
    face: { brow: "straight", chin: "taper", nose: "slim" },
  },
  "sup-bankGovernor": {
    skin: ["#d0a276", "#96684a", "#ecd0a8"],
    bg: ["#1d2740", "#10141d"],
    attire: { kind: "suit", c: "#3a3f4a", trim: "#5a6070", shirt: "#dde2e8", tie: "#1d2740" },
    hair: { c: "#8f8f8c", hi: "#c4c4c0", style: "combed" },
    glasses: true,
    older: true,
    stoop: true,
    mouth: "firm",
    body: "heavy",
    face: { brow: "bushy", chin: "round", nose: "broad" },
  },
  "sup-armedForcesChief": {
    skin: ["#c19a72", "#87613f", "#dfb894"],
    bg: ["#1f2a1c", "#10140e"],
    attire: { kind: "mandarin", c: "#3d4a35", trim: "#5f7050", shirt: "#d5d2c4" },
    hair: { c: "#232833", hi: "#4d5a6e", style: "short" },
    facial: "moustache",
    older: true,
    mouth: "set",
    body: "broad",
    heightAdj: -2,
    face: { brow: "bushy", chin: "square", nose: "broad" },
  },
  "sup-kelantanLeader": {
    skin: ["#bd8a5e", "#835a38", "#d9ad82"],
    bg: ["#24201a", "#14110d"],
    attire: { kind: "baju", c: "#e6dfcd", trim: "#c4bda6", shirt: "#efe9dc", accent: "#8f8a7c" },
    hair: { c: "#8f8f8c", hi: "#c4c4c0", style: "short" },
    songkok: "#1f232c",
    facial: "beard-grey",
    older: true,
    stoop: true,
    mouth: "firm",
    body: "broad",
    face: { brow: "bushy", chin: "square", nose: "broad" },
  },
  "sup-terengganuLeader": {
    skin: ["#c39a70", "#8a6244", "#dfba92"],
    bg: ["#1c2436", "#10141d"],
    attire: { kind: "suit", c: "#2a3140", trim: "#4a5468", shirt: "#ece9e0", tie: "#3f5a48" },
    hair: { c: "#232833", hi: "#4d5a6e", style: "sidepart" },
    kopiah: "#efe9dc",
    facial: "beard",
    mouth: "firm",
    body: "slim",
    stance: "hip",
    heightAdj: -6,
    face: { brow: "straight", chin: "square", nose: "broad" },
  },
  "sup-journalist": {
    skin: ["#d0a276", "#96684a", "#ecd0a8"],
    bg: ["#331d17", "#180f0c"],
    attire: { kind: "suit", c: "#6e2f3a", trim: "#8a474e", shirt: "#e9e2d2" },
    hair: { c: "#191d24", hi: "#3f4a5a", style: "bob" },
    earrings: true,
    mouth: "soft",
    body: "average",
    stance: "hip",
    heightAdj: 2,
    face: { brow: "arched", chin: "taper", nose: "slim" },
  },
  "sup-activist": {
    skin: ["#a9744c", "#74502f", "#cc9871"],
    bg: ["#1c2e1f", "#0f1812"],
    attire: { kind: "open", c: "#2d4a3a", trim: "#3f6b57", shirt: "#c6cdc2" },
    hair: { c: "#262b30", hi: "#6e747c", style: "curls" },
    earrings: true,
    prop: "tablet",
    mouth: "firm",
    body: "slim",
    stance: "cross",
    heightAdj: -1,
    face: { brow: "arched", chin: "round", nose: "slim" },
  },
  "sup-tycoon": {
    skin: ["#bd9268", "#84603e", "#dfb98e"],
    bg: ["#33291a", "#191209"],
    attire: { kind: "suit", c: "#ded6c2", trim: "#c9b98e", shirt: "#f2ede1", tie: "#8a6c1f", accent: "#c69b54" },
    hair: { c: "#2a2f38", hi: "#8b93a1", style: "sidepart" },
    older: true,
    mouth: "soft",
    body: "heavy",
    stance: "cross",
    heightAdj: -4,
    face: { brow: "straight", chin: "round", nose: "broad" },
  },
};

const GENERIC: PixelSpec = {
  skin: ["#3a4350", "#2a303b", "#4d5866"],
  bg: ["#161b23", "#0e1218"],
  attire: { kind: "suit", c: "#1c222c", trim: "#313a48", shirt: "#262e3a" },
  mouth: "firm",
};
