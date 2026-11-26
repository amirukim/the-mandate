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

const MOUTH = "#4d3230";

/* ------------------------------------------------------------------ */
/* Full-body sprites (v2, plan C/D): 48x64, same specs and palette     */
/* ------------------------------------------------------------------ */

export const SPRITE_W = 64;
export const SPRITE_H = 96;
export type SpritePose = "stand" | "walk";
export type SpriteBlink = boolean;

export interface SpriteFrameOpts {
  pose?: SpritePose;
  /** Walk frame 0-3 (contact / pass / contact / pass, mirrored). */
  frame?: number;
  blink?: boolean;
}

/**
 * The layered paper-doll (D-17): shadow, legs, torso, arms, head, hair and
 * headwear, face, expression posture. Every layer is a pure function of the
 * PixelSpec, so bust and sprite can never drift, and the silhouette becomes
 * checkable (D-19). Expressions change brows, eyes, mouth AND body language
 * (D-18).
 */

/** Body volume per type (D-19): shoulders, waist, legs and head all differ. */
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

const BODY_GEOM: Record<BodyType, BodyGeom> = {
  slim:    { sw: 7,  ww: 5,  shoulderY: 37, legTop: 69, legH: 20, headRx: 8,   headRy: 9,  headCy: 18, legW: 4 },
  average: { sw: 11, ww: 9,  shoulderY: 36, legTop: 68, legH: 20, headRx: 10,  headRy: 11, headCy: 17, legW: 6 },
  broad:   { sw: 15, ww: 12, shoulderY: 35, legTop: 68, legH: 20, headRx: 11.5, headRy: 12, headCy: 15, legW: 7 },
  heavy:   { sw: 17, ww: 20, shoulderY: 37, legTop: 66, legH: 21, headRx: 13,  headRy: 13, headCy: 19, legW: 8 },
  tall:    { sw: 8,  ww: 6,  shoulderY: 34, legTop: 76, legH: 16, headRx: 8.5, headRy: 9.5, headCy: 12, legW: 5 },
};

/** Expression body language (D-18): the pose changes with the mood. */
interface ExprPose {
  headDx: number;
  headDy: number;
  shoulderDy: number;
  armDy: number;
}
const EXPR_POSE: Record<Expression, ExprPose> = {
  neutral:   { headDx: 0, headDy: 0, shoulderDy: 0, armDy: 0 },
  concerned: { headDx: 2, headDy: 0, shoulderDy: 0, armDy: 0 },
  pleased:   { headDx: 0, headDy: -1, shoulderDy: -2, armDy: -2 },
  stern:     { headDx: 1, headDy: 1, shoulderDy: 2, armDy: 0 },
  weary:     { headDx: 1, headDy: 1, shoulderDy: 2, armDy: 3 },
  surprised: { headDx: 0, headDy: -1, shoulderDy: -2, armDy: -2 },
};

const C_BELT_BUCKLE = "#c69b54";

/** The full-body sprite, layer by layer. */
export function drawSprite(
  spec: PixelSpec,
  expression: Expression,
  opts: SpriteFrameOpts = {},
): (string | null)[][] {
  const g = new Grid(SPRITE_W, SPRITE_H);
  const body = spec.body ?? "average";
  const geom = BODY_GEOM[body];
  const [skin] = spec.skin;
  const a = spec.attire;
  const pose = opts.pose ?? "stand";
  const frame = opts.frame ?? 0;
  const exprPose = EXPR_POSE[expression];
  const stoop = spec.stoop === true;

  const headDx = exprPose.headDx + (stoop ? 3 : 0);
  const headDy = exprPose.headDy + (stoop ? 1 : 0);
  const shoulderY = geom.shoulderY + exprPose.shoulderDy + (stoop ? 2 : 0);
  const legTop = geom.legTop;
  const legH = Math.min(22, geom.legH + (spec.heightAdj ?? 0));
  const legW = geom.legW;
  const shoe = shade(a.c, 0.5);

  // floor shadow
  g.ellipse(32, SPRITE_H - 3, 14, 2, "rgba(0,0,0,0.28)");

  // --- legs -------------------------------------------------------------
  const legAX = 32 - Math.round(geom.ww / 2) - Math.round(legW / 2) - 1;
  const legBX = legAX + Math.round(geom.ww / 2) + legW - 1;
  if (pose === "walk") {
    const bentA = frame === 1 || frame === 3;
    const bentB = frame === 0 || frame === 2;
    const shiftA = frame === 0 ? -3 : frame === 2 ? 3 : 0;
    const shiftB = -shiftA;
    g.rect(legAX + shiftA, legTop, legW, bentA ? legH - 3 : legH, a.c);
    g.rect(legBX + shiftB, legTop, legW, bentB ? legH - 3 : legH, a.c);
    g.rect(legAX + shiftA, legTop + (bentA ? legH - 6 : legH - 3), legW, 3, shoe);
    g.rect(legBX + shiftB, legTop + (bentB ? legH - 6 : legH - 3), legW, 3, shoe);
  } else {
    g.rect(legAX, legTop, legW, legH, a.c);
    g.rect(legBX, legTop, legW, legH, a.c);
    g.rect(legAX, legTop + legH - 3, legW, 3, shoe);
    g.rect(legBX, legTop + legH - 3, legW, 3, shoe);
  }

  // --- torso: shoulders tapering to the waist, hem flare per cut ---------
  const hemFlare = a.kind === "suit" ? 1 : a.kind === "open" ? 2 : 0;
  for (let y = shoulderY; y < legTop; y++) {
    const t = (y - shoulderY) / Math.max(1, legTop - shoulderY);
    let half = Math.round(geom.sw + (geom.ww - geom.sw) * t);
    if (body === "heavy" && t > 0.45 && t < 0.9) half += 2; // the belly
    if (y > legTop - 4) half += hemFlare;
    g.rect(32 - half, y, half * 2, 1, a.c);
  }
  // shoulder slope above the shoulder line
  for (let s = 1; s <= 2; s++) {
    const half = Math.max(3, geom.sw - s * 3);
    g.rect(32 - half, shoulderY - s, half * 2, 1, a.c);
  }
  // key light left, core shade right (recompute the width per row)
  for (let y = shoulderY + 2; y < legTop - 4; y++) {
    const t = (y - shoulderY) / Math.max(1, legTop - shoulderY);
    const half = Math.round(geom.sw + (geom.ww - geom.sw) * t) + (y > legTop - 4 ? hemFlare : 0);
    g.set(32 - half + 1, y, tint(a.c, 0.16));
    g.set(32 + half - 1, y, shade(a.c, 0.2));
  }

  // collar furniture, parametrised by the shoulder width
  const collarY = shoulderY + 2;
  const torsoH = legTop - shoulderY;
  if (a.kind === "suit") {
    g.rect(29, collarY, 6, torsoH - 2, a.shirt);
    g.vline(33, collarY, torsoH - 2, shade(a.shirt, 0.18));
    if (a.tie) {
      g.rect(31, collarY, 2, 3, a.tie);
      g.rect(31, collarY + 3, 2, Math.max(4, torsoH - 8), a.tie);
      g.rect(31, collarY + torsoH - 6, 2, 3, shade(a.tie, 0.22));
    }
    const lap = Math.round(geom.sw * 0.6);
    g.rect(32 - lap, collarY, 3, 3, a.trim);
    g.rect(32 - lap - 1, collarY + 3, 3, 4, a.trim);
    g.rect(32 + lap - 3, collarY, 3, 3, a.trim);
    g.rect(32 + lap, collarY + 3, 3, 4, a.trim);
    if (a.accent) g.rect(32 + lap + 3, collarY + 12, 3, 2, a.accent);
  } else if (a.kind === "open") {
    g.rect(32 - Math.round(geom.sw * 0.5), collarY, 4, torsoH - 2, a.shirt);
    g.rect(32 + Math.round(geom.sw * 0.5) - 4, collarY, 4, torsoH - 2, a.shirt);
    g.rect(32 - Math.round(geom.sw * 0.5) - 2, collarY, 2, torsoH - 2, a.trim);
    g.rect(32 + Math.round(geom.sw * 0.5) + 1, collarY, 2, torsoH - 2, a.trim);
  } else {
    g.rect(29, collarY, 6, torsoH - 2, a.shirt);
    g.vline(32, collarY + 2, torsoH - 4, shade(a.shirt, 0.14));
    g.rect(30, collarY - 1, 4, 2, a.accent ?? a.trim);
  }
  if (a.kind === "baju") {
    // baju Melayu: two-button placket and the folded sampin sash across the hip
    g.vline(32, collarY + 1, torsoH - 3, shade(a.shirt, 0.16));
    g.set(31, collarY + 2, a.accent ?? a.trim);
    g.set(31, collarY + 4, a.accent ?? a.trim);
    const sashY = legTop - 9;
    for (let s = 0; s < 6; s++) {
      const x = 32 - Math.round(geom.ww * 0.5) + s * 2;
      g.rect(x - 2, sashY + s, Math.max(4, geom.ww + 2 - s), 2, s % 2 === 0 ? shade(a.trim, 0.1) : a.trim);
    }
  }
  if (a.kind === "sherwani") {
    // full-length placket with buttons, stand collar, hem edging
    g.rect(31, collarY, 3, torsoH - 2, shade(a.shirt, 0.1));
    for (let b = 0; b < 4; b++) g.set(32, collarY + 3 + b * 4, a.accent ?? a.trim);
    g.rect(32 - Math.round(geom.sw * 0.5) - 2, collarY, 2, torsoH - 2, a.trim);
    g.rect(32 + Math.round(geom.sw * 0.5) + 1, collarY, 2, torsoH - 2, a.trim);
    g.rect(30, collarY - 1, 5, 2, a.trim);
  }

  // belt
  g.rect(32 - geom.ww - 2, legTop - 6, geom.ww * 2 + 4, 3, shade(a.c, 0.4));
  g.set(32 - geom.ww, legTop - 5, C_BELT_BUCKLE);
  g.set(32 + geom.ww - 1, legTop - 5, C_BELT_BUCKLE);

  // --- arms: the resting stance is per character (silhouette variety) -----
  const armW = body === "heavy" ? 5 : body === "slim" ? 3 : 4;
  const armY = shoulderY + 3;
  const armSwing = pose === "walk" ? (frame === 0 ? 1 : frame === 2 ? -1 : 0) : 0;
  const idleIn = pose === "stand" && frame === 1 ? 1 : 0;
  const stance = spec.stance ?? "stand";
  const armLen = Math.max(6, legTop - armY - 5 + exprPose.armDy);

  if (pose === "walk") {
    const wLX = 32 - geom.sw - armW + 2 - armSwing;
    const wRX = 32 + geom.sw - 2 + armSwing;
    g.rect(wLX, armY, armW, armLen, shade(a.c, 0.12));
    g.rect(wRX, armY, armW, armLen, shade(a.c, 0.12));
    g.rect(wLX, armY + armLen, armW, 3, skin);
    g.rect(wRX, armY + armLen, armW, 3, skin);
  } else if (stance === "clasp") {
    // upper arms angle inward; the hands meet in front of the waist
    const upper = Math.max(4, Math.round(armLen * 0.55));
    for (const side of [-1, 1] as const) {
      for (let s = 0; s < upper; s++) {
        const t = s / upper;
        g.rect(32 + side * (geom.sw + armW - 2) - side * Math.round(t * (geom.sw - 1)) - (side < 0 ? armW : 0), armY + s, armW, 1, shade(a.c, 0.12));
      }
      g.rect(32 + side * 2 - (side < 0 ? armW : 1), armY + upper, armW, 3, skin);
    }
  } else if (stance === "hip") {
    // akimbo: elbow out at the waist, hand resting on the hip
    const elbowY = armY + Math.round(armLen * 0.6);
    for (const side of [-1, 1] as const) {
      const ax = 32 + side * (geom.sw - armW + 1) - (side < 0 ? 0 : armW - 1);
      g.rect(ax, armY, armW, elbowY - armY, shade(a.c, 0.12));
      const outX = 32 + side * (geom.sw + 3) - (side < 0 ? 0 : armW - 1);
      for (let s = 0; s <= 3; s++) {
        g.rect(Math.round(ax + ((outX - ax) * s) / 3), elbowY + s, armW, 1, shade(a.c, 0.12));
      }
      g.rect(outX + (side < 0 ? -1 : 0), elbowY + 4, armW, 3, skin);
    }
  } else if (stance === "cross") {
    // arms folded: upper arms at the sides, then a full-width fold bar
    const foldY = armY + Math.round(armLen * 0.55);
    for (const side of [-1, 1] as const) {
      const ax = 32 + side * (geom.sw - armW + 1) - (side < 0 ? 0 : armW - 1);
      g.rect(ax, armY, armW, foldY - armY + 1, shade(a.c, 0.12));
    }
    g.rect(32 - geom.sw - 1, foldY, geom.sw * 2 + 3, 4, shade(a.c, 0.2));
    g.rect(32 - geom.sw - 1, foldY + 4, geom.sw * 2 + 3, 2, skin);
  } else {
    const armLX = 32 - geom.sw - armW + 2 + idleIn;
    const armRX = 32 + geom.sw - 2 - idleIn;
    g.rect(armLX, armY, armW, armLen, shade(a.c, 0.12));
    g.rect(armRX, armY, armW, armLen, shade(a.c, 0.12));
    g.rect(armLX, armY + armLen, armW, 3, skin);
    g.rect(armRX, armY + armLen, armW, 3, skin);
  }

  // --- props (D-17): carried in the stand pose, hand-level -----------------
  if (pose === "stand" && spec.prop) {
    const handY = armY + armLen;
    const handX = 32 + geom.sw + 1; // the right hand line, outside the torso
    if (spec.prop === "folder") {
      g.rect(handX - 2, handY - 7, 8, 7, "#c9a96a");
      g.rect(handX - 1, handY - 6, 6, 2, "#f2ede1");
      g.vline(handX + 5, handY - 7, 7, shade("#c9a96a", 0.3));
    } else if (spec.prop === "phone") {
      g.rect(handX, handY - 3, 3, 6, "#12171d");
      g.set(handX + 1, handY - 2, "#d7e2ec");
    } else if (spec.prop === "tablet") {
      g.rect(32 - 5, handY - 9, 10, 8, "#12171d");
      g.rect(32 - 4, handY - 8, 8, 5, "#2b3a4a");
      g.set(32 - 3, handY - 7, "#4d7a9e");
    } else if (spec.prop === "cane") {
      const caneX = handX + armW;
      g.vline(caneX, handY - 2, SPRITE_H - 6 - handY, "#6b472a");
      g.rect(caneX - 1, handY - 4, 3, 2, "#6b472a");
      g.rect(handX, handY, armW, 3, skin);
    }
  }

  // --- head ----------------------------------------------------------------
  drawDollHead(g, spec, expression, 32 + headDx, geom.headCy + headDy, geom.headRx, geom.headRy, Boolean(opts.blink));
  return g.cells;
}

/** The sprite head: bigger face (D-16), real eyes with iris and glint,
 *  brows/chin/nose geometry per character (D-17), accurate headwear (D-20),
 *  expression overlays (D-18). */
function drawDollHead(
  g: Grid,
  spec: PixelSpec,
  expression: Expression,
  hx: number,
  hy: number,
  rx: number,
  ry: number,
  blink: boolean,
) {
  const [skin, skinSh, skinHi] = spec.skin;
  const chin = spec.face?.chin ?? "taper";
  const noseW = spec.face?.nose ?? "slim";
  const browShape = spec.face?.brow ?? "straight";

  // skull: shade crescent right, lit face left
  g.ellipse(hx + 1, hy, rx, ry, skinSh);
  g.ellipse(hx, hy, rx, ry, skin);
  g.ellipse(hx, hy + Math.round(ry * 0.4), rx - 2, Math.round(ry * 0.6), skin);
  // jaw + chin per shape
  if (chin === "square") {
    g.rect(hx - Math.round(rx * 0.7), hy + Math.round(ry * 0.7), Math.round(rx * 1.4), 4, skin);
    g.rect(hx - Math.round(rx * 0.55), hy + Math.round(ry * 0.85), Math.round(rx * 1.1), 2, skin);
  } else if (chin === "round") {
    g.ellipse(hx, hy + Math.round(ry * 0.7), Math.round(rx * 0.7), Math.round(ry * 0.5), skin);
  } else {
    g.ellipse(hx, hy + Math.round(ry * 0.75), Math.round(rx * 0.5), Math.round(ry * 0.45), skin);
  }
  // selective 1 px outline: right edge and jaw underside
  g.vline(hx + rx - 1, hy - 2, Math.round(ry * 0.8), skinSh);
  g.set(hx + rx - 2, hy + Math.round(ry * 0.55), skinSh);
  g.set(hx + 1, hy + ry + (chin === "square" ? 2 : 1), skinSh);
  // left light plane
  g.vline(hx - rx + 1, hy - 2, Math.round(ry * 0.8), skinHi);
  g.set(hx - rx + 1, hy - 3, skinHi);
  // ears
  g.rect(hx - rx - 1, hy, 2, 4, skin);
  g.rect(hx + rx - 1, hy, 2, 4, skin);
  // neck
  g.rect(hx - 3, hy + ry - 1, 6, 5, skinSh);

  // --- hair (mass first, face carve after) ---------------------------------
  const h = spec.hair;
  if (h) {
    const { c, hi } = h;
    const hairSh = shade(c, 0.3);
    switch (h.style) {
      case "bob":
        g.ellipse(hx, hy - 1, rx + 3, ry + 1, c);
        g.rect(hx - rx - 3, hy + 1, 4, Math.round(ry * 1.6), c);
        g.rect(hx + rx - 1, hy + 1, 4, Math.round(ry * 1.6), c);
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.rect(hx + rx - 1, hy + 2, 3, Math.round(ry * 1.4), hairSh);
        g.set(hx - 4, hy - ry, hi); g.set(hx + 2, hy - ry - 1, hi);
        break;
      case "receding":
        g.ellipse(hx, hy - 3, rx + 1, ry - 3, c);
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.rect(hx + rx - 2, hy - 5, 3, 7, hairSh);
        g.set(hx - 3, hy - ry - 1, hi); g.set(hx - 2, hy - ry, hi);
        break;
      case "tied":
        g.ellipse(hx, hy - 2, rx + 2, ry, c);
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.ellipse(hx - rx - 1, hy - 1, 3, 4, c);
        g.set(hx - 2, hy - ry - 1, hi);
        break;
      case "sidepart":
        g.ellipse(hx, hy - 2, rx + 2, ry - 1, c);
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.rect(hx - rx - 1, hy - 4, 5, 4, c);
        g.rect(hx + rx - 2, hy - 3, 3, 6, hairSh);
        g.set(hx - 4, hy - ry - 1, hi); g.set(hx - 3, hy - ry, hi);
        break;
      case "curls":
        for (const [dx, dy, r] of [[-6, -3, 4], [0, -5, 5], [6, -2, 4], [-9, 1, 3], [9, 1, 3]] as const) {
          g.ellipse(hx + dx, hy + dy, r, r - 1, c);
        }
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.set(hx - 1, hy - ry - 1, hi); g.set(hx + 5, hy + 2, hairSh);
        break;
      case "combed":
      case "white":
        g.ellipse(hx, hy - 3, rx + 1, ry - 2, c);
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.rect(hx + rx - 2, hy - 5, 3, 8, hairSh);
        g.set(hx - 4, hy - ry - 1, hi); g.set(hx - 3, hy - ry + 1, hi);
        break;
      case "short":
      default:
        g.ellipse(hx, hy - 2, rx + 2, ry, c);
        g.ellipse(hx, hy + 1, rx - 1, ry - 2, skin);
        g.rect(hx + rx - 2, hy - 4, 3, 7, hairSh);
        g.set(hx - 4, hy - ry, hi); g.set(hx + 3, hy - ry, hi);
        break;
    }
  }

  // --- headwear: accurate shapes (D-20) -------------------------------------
  if (spec.hijab) {
    const c = spec.hijab.c;
    const hi = spec.hijab.hi;
    const long = spec.hijab.style === "long";
    g.ellipse(hx, hy, rx + (long ? 1 : 3), ry + 2, c);
    if (long) {
      // long straight scarf: snug crown, panels fall inside the body line
      g.rect(hx - rx + 1, hy + 2, 3, Math.round(ry * 2.4), c);
      g.rect(hx + rx - 4, hy + 2, 3, Math.round(ry * 2.4), c);
      g.rect(hx - 6, hy + Math.round(ry * 1.4), 12, Math.round(ry * 1.5), c);
      g.vline(hx - 6, hy + Math.round(ry * 1.4), Math.round(ry * 1.5), shade(c, 0.18));
    } else {
      // shoulder cape: wide drape over the shoulders
      g.rect(hx - rx - 3, hy, 4, Math.round(ry * 2.1), c);
      g.rect(hx + rx - 1, hy, 4, Math.round(ry * 2.1), c);
      g.rect(hx - rx - 2, hy + Math.round(ry * 1.6), rx * 2 + 4, 7, c);
      g.hline(hx - rx - 2, hy + Math.round(ry * 1.6) + 6, rx * 2 + 4, shade(c, 0.18));
    }
    g.ellipse(hx, hy + 1, rx - 2, ry - 2, skin);
    g.rect(hx - rx + 2, hy - 2, rx * 2 - 4, 4, skin);
    g.vline(hx - rx - 1, hy - 2, Math.round(ry * 1.8), shade(c, 0.22));
    g.vline(hx + rx, hy - 2, Math.round(ry * 1.8), shade(c, 0.22));
    g.vline(hx - 1, hy - ry - 1, 4, shade(c, 0.18));
    g.hline(hx - rx - 1, hy + Math.round(ry * 1.2), 3, shade(c, 0.18));
    g.set(hx + rx - 2, hy + ry + 3, "#e6cd8e");
    g.set(hx + rx - 3, hy + ry + 3, hi);
    g.set(hx - 3, hy - ry - 1, tint(c, 0.3)); g.set(hx + 1, hy - ry - 1, tint(c, 0.3));
  }
  if (spec.songkok) {
    // flat-topped oval cap with a gold band
    g.ellipse(hx, hy - ry, rx + 2, 4, spec.songkok);
    g.rect(hx - rx - 2, hy - ry - 2, rx * 2 + 4, 5, spec.songkok);
    g.rect(hx - rx - 2, hy - ry + 2, rx * 2 + 4, 2, "#c9a96a");
    g.rect(hx + rx - 3, hy - ry - 1, 3, 5, shade(spec.songkok, 0.25));
    g.set(hx - 4, hy - ry - 1, tint(spec.songkok, 0.25));
  }
  if (spec.kopiah) {
    // the white knit skullcap: rounder, shorter, with the knit ribs
    g.ellipse(hx, hy - ry, rx + 1, 4, spec.kopiah);
    g.rect(hx - rx - 1, hy - ry - 1, rx * 2 + 2, 5, spec.kopiah);
    g.rect(hx - rx - 1, hy - ry + 3, rx * 2 + 2, 1, "#8f8a7c");
    for (const x of [hx - 5, hx - 1, hx + 3]) g.rect(x, hy - ry - 1, 1, 4, "#8f8a7c");
    g.rect(hx + rx - 2, hy - ry, 2, 5, shade(spec.kopiah, 0.25));
  }

  // --- face -----------------------------------------------------------------
  const browC = spec.older ? shade(skin, 0.4) : "#26222a";
  const browW = browShape === "bushy" ? 5 : 4;
  const browH = browShape === "bushy" ? 2 : 1;
  const browY = hy - Math.round(ry * 0.45) + (expression === "stern" ? 1 : expression === "surprised" ? -2 : expression === "weary" ? 1 : 0);
  const browTilt = expression === "concerned" ? 1 : 0;

  g.rect(hx - Math.round(rx * 0.6), browY + browTilt, browW, browH, browC);
  g.rect(hx + 1, browY + browTilt, browW, browH, browC);
  if (browShape === "arched") {
    g.set(hx - Math.round(rx * 0.6) + 1, browY + browTilt - 1, browC);
    g.set(hx + 2, browY + browTilt - 1, browC);
  }

  // eyes: sclera, iris, pupil, glint — readable at game scale (D-16)
  const ey = hy + 1;
  const eyeW = noseW === "broad" ? 3 : 4;
  const exL = hx - Math.round(rx * 0.55);
  const exR = hx + 2;
  if (blink || expression === "weary") {
    g.hline(exL, ey + 1, eyeW, "#241f26");
    g.hline(exR, ey + 1, eyeW, "#241f26");
    if (expression === "weary") {
      g.rect(exL, ey, eyeW, 1, "#f6f2e8");
      g.set(exL + 1, ey, "#23303e");
      g.rect(exR, ey, eyeW, 1, "#f6f2e8");
      g.set(exR + 1, ey, "#23303e");
    }
  } else if (expression === "stern") {
    // narrowed eyes: iris only, no sclera
    g.rect(exL + 1, ey, 2, 2, "#23303e");
    g.rect(exR + 1, ey, 2, 2, "#23303e");
    g.hline(exL - 1, ey - 1, eyeW + 2, "#241f26");
    g.hline(exR - 1, ey - 1, eyeW + 2, "#241f26");
  } else {
    const eyeH = expression === "surprised" ? 3 : 2;
    g.rect(exL, ey - (eyeH > 2 ? 1 : 0), eyeW, eyeH, "#f6f2e8");
    g.rect(exR, ey - (eyeH > 2 ? 1 : 0), eyeW, eyeH, "#f6f2e8");
    const iy = ey;
    g.rect(exL + 1, iy, 2, 2, "#23303e");
    g.rect(exR + 1, iy, 2, 2, "#23303e");
    g.set(exL + 1, iy, "#12171d");
    g.set(exR + 1, iy, "#12171d");
    g.set(exL + 1, iy - (eyeH > 2 ? 1 : 0), "#4d5f72");
    g.set(exR + 1, iy - (eyeH > 2 ? 1 : 0), "#4d5f72");
    g.set(exL + eyeW - 1, ey - (eyeH > 2 ? 1 : 0), "#d7e2ec");
    g.set(exR + eyeW - 1, ey - (eyeH > 2 ? 1 : 0), "#d7e2ec");
    g.hline(exL - 1, ey - (eyeH > 2 ? 2 : 1), eyeW + 2, "#241f26");
    g.hline(exR - 1, ey - (eyeH > 2 ? 2 : 1), eyeW + 2, "#241f26");
  }

  // nose: bridge + nostrils, per width
  const ny = ey + 3;
  g.vline(hx + 1, ny - 1, 3, skinSh);
  g.set(hx - (noseW === "broad" ? 2 : 1), ny + 2, skinSh);
  g.set(hx + (noseW === "broad" ? 2 : 1), ny + 2, skinSh);
  g.set(hx, ny + 1, skinHi);

  // cheeks
  g.set(hx - rx + 2, ny, skinHi);
  g.set(hx + rx - 2, ny + 1, skinSh);

  // mouth per expression (authored resting shape under neutral)
  const my = hy + Math.round(ry * 0.82);
  const resting = spec.mouth ?? "firm";
  if (expression === "stern") {
    g.hline(hx - 3, my, 7, MOUTH);
    g.set(hx - 4, my + 1, MOUTH); // corners pull down: a real stern read
    g.set(hx + 4, my + 1, MOUTH);
  } else if (expression === "pleased") {
    g.hline(hx - 3, my, 7, MOUTH);
    g.set(hx - 4, my - 1, MOUTH);
    g.set(hx + 3, my - 1, MOUTH);
  } else if (expression === "concerned") {
    g.hline(hx - 2, my, 5, MOUTH);
    g.set(hx - 3, my + 1, MOUTH);
    g.set(hx + 2, my + 1, MOUTH);
  } else if (expression === "surprised") {
    g.rect(hx - 2, my - 1, 5, 3, MOUTH);
    g.rect(hx - 1, my, 3, 1, "#3a1f22");
  } else if (expression === "weary") {
    g.hline(hx - 3, my, 7, MOUTH);
    g.set(hx - 4, my - 1, MOUTH);
    g.set(hx + 3, my - 1, MOUTH);
  } else if (resting === "set") {
    g.hline(hx - 3, my, 7, MOUTH);
  } else if (resting === "soft") {
    g.hline(hx - 3, my - 1, 6, MOUTH);
    g.set(hx + 3, my, MOUTH);
  } else {
    g.hline(hx - 3, my - 1, 7, MOUTH);
    g.set(hx - 4, my - 1, MOUTH); g.set(hx + 3, my - 1, MOUTH);
    g.hline(hx - 2, my, 5, skinHi);
  }

  // age marks (senior): crow's feet and the nasolabial line
  if (spec.older) {
    g.set(hx - rx + 1, ey, skinSh); g.set(hx + rx - 1, ey, skinSh);
    g.set(hx - 4, my - 2, skinSh); g.set(hx + 4, my - 2, skinSh);
  }

  // facial hair
  if (spec.facial) {
    const grey = spec.facial.includes("grey");
    const fc = grey ? "#a7aca4" : "#232833";
    if (spec.facial.startsWith("moustache")) {
      g.rect(hx - 5, my - 2, 11, 2, fc);
      g.rect(hx - 6, my - 1, 3, 1, fc); g.rect(hx + 4, my - 1, 3, 1, fc);
    } else {
      g.rect(hx - 6, my, 13, 5, fc);
      g.rect(hx - 5, my - 2, 3, 2, fc); g.rect(hx + 3, my - 2, 3, 2, fc);
      g.rect(hx - 2, my + 2, 5, 2, skinSh);
      g.rect(hx - 5, my + 5, 11, 2, fc);
      if (grey) g.rect(hx + 3, my + 4, 3, 1, "#c9cdc6");
    }
  }

  // glasses: outline frames with the refined eyes visible behind (D-16)
  if (spec.glasses) {
    const f = "#39414c";
    const gy = ey - 2;
    const gh = expression === "surprised" ? 3 : 2;
    for (const gx of [exL - 1, exR - 1]) {
      g.hline(gx, gy, eyeW + 2, f);
      g.hline(gx, gy + gh + 1, eyeW + 2, f);
      g.vline(gx, gy, gh + 1, f);
      g.vline(gx + eyeW + 1, gy, gh + 1, f);
      g.set(gx + 1, gy + 1, "#d7e2ec");
    }
    g.set(hx, gy + 1, f);
    g.hline(exL - Math.round(rx * 0.4), gy + 1, Math.round(rx * 0.4), f);
    g.hline(exR + eyeW + 1, gy + 1, Math.round(rx * 0.4), f);
  }

  if (spec.earrings) {
    g.set(hx - rx, hy + 4, "#e6cd8e");
    g.set(hx + rx - 1, hy + 4, "#e6cd8e");
  }
  if (spec.bindi) g.rect(hx - 1, hy - Math.round(ry * 0.5), 2, 2, "#b3452e");

  // rim light catch on the lamp side
  g.set(hx - rx + 1, hy - ry - 1, skinHi);
}

/** The PM avatar customisation, as chosen at New Game. */
export interface AvatarCustomisation {
  skin?: string;
  hair?: string;
  headwear?: "none" | "songkok" | "kopiah" | "tudung";
  attire?: string;
  glasses?: boolean;
  homeState?: string;
  /** v3 paper-doll (D-17/D-19): the avatar's body volume. Additive. */
  body?: BodyType;
  /** Drives one-time opening nudges and gates avatar-specific dialogue. */
  priorCareer?: "civilService" | "military" | "business" | "activism" | "academia";
  /** Free-form trait tags; dialogue conditions gate on `avatar.trait.<tag>`. */
  traits?: string[];
}

/** Build a PixelSpec from the PM avatar customisation (decision D-08 slice). */
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
    stance: "hip",
    body: "slim",
    heightAdj: -4,
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
    stance: "clasp",
    heightAdj: -2,
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
