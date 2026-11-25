/**
 * Pixel portrait engine — 64×64 busts, rendered to canvas and scaled with
 * image-rendering: pixelated on large surfaces (smooth 2D downscale on small
 * ones, so the cast strip stays legible). Deliberate art direction, not a
 * placeholder: limited palettes, directional shading, readable faces.
 *
 * pixelPortraitDataUrl(id) is cached per id. Unknown ids return the anonymous
 * figure, never null. Raster files (public/portraits/<id>.*) still override
 * these when present — see data/portraits.tsx.
 */

const W = 64;
const H = 64;

/** Darken a hex colour toward black by factor f (0..1) — derives shading
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
  attire: { kind: "suit" | "open" | "mandarin"; c: string; trim: string; shirt: string; tie?: string; accent?: string };
  hair?: { c: string; hi: string; style: "bob" | "short" | "receding" | "tied" | "sidepart" | "curls" | "combed" | "white" };
  hijab?: { c: string; hi: string };
  songkok?: string;
  kopiah?: string;
  glasses?: boolean;
  facial?: "beard" | "beard-grey" | "moustache" | "moustache-grey";
  older?: boolean;
  mouth?: "firm" | "set" | "soft";
  earrings?: boolean;
  bindi?: boolean;
}

class Grid {
  readonly cells: (string | null)[][] = Array.from({ length: H }, () => Array<string | null>(W).fill(null));
  set(x: number, y: number, c: string | null) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    this.cells[y][x] = c;
  }
  rect(x: number, y: number, w: number, h: number, c: string) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
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
    this.rect(W - x - w, y, w, h, c);
  }
}

function draw(spec: PixelSpec, expression: Expression = "neutral"): (string | null)[][] {
  const g = new Grid();
  const [skin, skinSh, skinHi] = spec.skin;
  const a = spec.attire;

  // backdrop, with a quiet warm glow behind the head
  g.rect(0, 0, W, 34, spec.bg[0]);
  g.rect(0, 34, W, H - 34, spec.bg[1]);
  g.ellipse(32, 28, 26, 24, spec.bg[1]);

  // shoulders: the coat, rising from the floor
  for (let y = 46; y < H; y++) {
    const t = (y - 46) / (H - 46);
    const half = 10 + Math.round(t * 22);
    g.rect(32 - half, y, half * 2, 1, a.c);
  }
  g.rect(20, 44, 24, 4, a.c);
  // key light falls from the left: lit shoulder, shaded right
  g.rect(22, 50, 4, 10, tint(a.c, 0.18));
  g.set(21, 48, tint(a.c, 0.14)); g.set(22, 60, tint(a.c, 0.12));
  g.rect(49, 54, 3, 8, shade(a.c, 0.22));
  g.rect(46, 48, 2, 4, shade(a.c, 0.14));

  // collar per kind
  if (a.kind === "suit") {
    // shirt band with a placket shadow
    g.rect(30, 46, 4, 18, a.shirt);
    g.rect(33, 46, 1, 18, shade(a.shirt, 0.18));
    // tie: knot, blade, tip
    if (a.tie) {
      g.rect(31, 46, 2, 2, a.tie);
      g.rect(30, 48, 3, 2, shade(a.tie, 0.12));
      g.rect(31, 50, 2, 7, a.tie);
      g.rect(31, 57, 2, 4, shade(a.tie, 0.22));
    }
    // lapels: stepped, falling outward from the collar
    g.rect(27, 46, 3, 3, a.trim);
    g.rect(26, 49, 3, 4, a.trim);
    g.rect(25, 53, 3, 4, shade(a.trim, 0.16));
    g.rect(34, 46, 3, 3, a.trim);
    g.rect(35, 49, 3, 4, a.trim);
    g.rect(36, 53, 3, 4, shade(a.trim, 0.16));
    if (a.accent) g.rect(40, 55, 4, 2, a.accent);
  } else if (a.kind === "open") {
    g.rect(28, 46, 8, 14, a.shirt);
    g.set(28, 46, a.trim); g.set(29, 47, a.trim); g.set(27, 48, a.trim);
    g.rect(35, 46, 8, 14, a.shirt);
    g.set(35, 46, a.trim); g.set(36, 47, a.trim); g.set(37, 48, a.trim);
    // placket line and cloth folds
    g.rect(34, 47, 1, 12, shade(a.shirt, 0.14));
    g.set(29, 52, shade(a.shirt, 0.1)); g.set(30, 57, shade(a.shirt, 0.1));
  } else {
    g.rect(26, 46, 12, 18, a.shirt);
    g.rect(25, 46, 2, 18, a.c);
    g.rect(37, 46, 2, 18, a.c);
    // mandarian collar shadow + placket with a single top button
    g.rect(26, 46, 12, 2, shade(a.shirt, 0.16));
    g.rect(32, 48, 1, 16, shade(a.shirt, 0.12));
    g.rect(31, 47, 3, 2, a.accent ?? a.trim);
  }

  // neck: jaw shadow above, throat light below
  g.rect(27, 39, 10, 7, skinSh);
  g.rect(29, 41, 6, 5, skin);
  g.rect(29, 41, 6, 2, tint(skin, 0.08));

  // head: shade crescent first, then the lit face leaves a tapered shadow
  g.ellipse(34, 26, 12, 14, skinSh);
  g.ellipse(33, 30, 11, 10, skinSh);
  g.ellipse(32, 26, 12, 14, skin);
  g.ellipse(31, 30, 10, 9, skin);
  // right-edge core shadow along the jaw
  g.rect(40, 24, 2, 9, skinSh);
  g.set(41, 30, skinSh); g.set(40, 33, skinSh);
  // left light plane
  g.rect(22, 17, 2, 15, skinHi);
  g.set(23, 15, skinHi); g.set(24, 14, skinHi);
  // forehead sheen
  g.rect(27, 16, 6, 1, tint(skin, 0.12));
  // ears with inner shadow
  g.rect(19, 26, 3, 6, skin);
  g.set(20, 28, skinSh); g.set(20, 29, skinSh);
  g.rect(42, 26, 3, 6, skin);
  g.set(43, 28, skinSh); g.set(43, 29, skinSh);

  // hair — mass first, then a curved carve for the hairline, then light
  const h = spec.hair;
  if (h) {
    const { c, hi } = h;
    const hairSh = shade(c, 0.3);
    switch (h.style) {
      case "bob":
        g.ellipse(32, 20, 15, 13, c);
        g.rect(18, 22, 6, 17, c);
        g.rect(40, 22, 6, 17, c);
        g.ellipse(32, 26, 10, 9, skin);
        // right-side shade plane and side falloff
        g.rect(41, 24, 4, 14, hairSh);
        g.rect(19, 24, 3, 14, shade(c, 0.12));
        // highlight strands along the crown
        g.set(25, 11, hi); g.set(26, 12, hi); g.set(27, 12, hi);
        g.set(39, 13, hi); g.set(40, 14, hi);
        g.set(18, 30, hi);
        break;
      case "receding":
        g.ellipse(32, 17, 13, 9, c);
        g.ellipse(32, 25, 11, 10, skin);
        g.rect(41, 14, 3, 10, hairSh);
        g.set(24, 10, hi); g.set(25, 11, hi); g.set(26, 11, hi);
        g.set(38, 12, hi);
        break;
      case "tied":
        g.ellipse(32, 18, 14, 11, c);
        g.ellipse(32, 25, 11, 10, skin);
        g.rect(18, 20, 4, 14, c);
        g.rect(42, 20, 4, 14, c);
        g.ellipse(32, 6, 5, 4, c);
        g.set(31, 3, hi);
        g.rect(43, 22, 2, 11, hairSh);
        g.set(21, 14, hi); g.set(22, 15, hi);
        break;
      case "sidepart":
        g.ellipse(32, 17, 14, 10, c);
        g.ellipse(32, 25, 11, 10, skin);
        g.rect(19, 16, 8, 6, c);
        g.rect(42, 15, 3, 12, hairSh);
        g.set(24, 8, hi); g.set(25, 9, hi); g.set(26, 9, hi); g.set(27, 10, hi);
        g.set(44, 14, c); g.set(45, 15, c);
        break;
      case "curls":
        for (const [cx, cy, r] of [[22, 13, 6], [30, 10, 7], [40, 12, 6], [18, 19, 5], [46, 19, 5]] as const) {
          g.ellipse(cx, cy, r, r - 1, c);
        }
        g.ellipse(32, 25, 10, 9, skin);
        g.set(30, 6, hi); g.set(38, 8, hi); g.set(17, 17, hi);
        g.set(45, 17, hairSh);
        break;
      case "combed":
        g.ellipse(32, 16, 14, 10, c);
        g.ellipse(32, 24, 11, 10, skin);
        g.rect(17, 17, 4, 5, c); g.rect(43, 17, 4, 5, c);
        g.rect(43, 14, 3, 10, hairSh);
        g.set(22, 9, hi); g.set(23, 10, hi); g.set(24, 10, hi); g.set(25, 11, hi);
        break;
      case "white":
        g.ellipse(32, 16, 14, 10, c);
        g.ellipse(32, 24, 11, 10, skin);
        g.rect(17, 17, 4, 6, c); g.rect(43, 17, 4, 6, c);
        g.rect(43, 14, 3, 10, shade(c, 0.14));
        g.set(22, 9, hi); g.set(40, 10, hi); g.set(24, 10, tint(c, 0.4));
        break;
      case "short":
      default:
        g.ellipse(32, 15, 14, 11, c);
        g.ellipse(32, 24, 11, 10, skin);
        g.rect(17, 18, 4, 5, c); g.rect(43, 18, 4, 5, c);
        g.rect(42, 13, 3, 11, hairSh);
        g.set(22, 8, hi); g.set(23, 9, hi); g.set(41, 11, hi); g.set(42, 12, hi);
        break;
    }
  }
  if (spec.hijab) {
    g.ellipse(32, 19, 17, 15, spec.hijab.c);
    g.rect(15, 24, 6, 26, spec.hijab.c);
    g.rect(43, 24, 6, 26, spec.hijab.c);
    g.rect(15, 24, 2, 26, spec.hijab.hi);
    g.rect(16, 8, 8, 2, spec.hijab.hi);
    g.ellipse(32, 26, 13, 12, skin);
    g.rect(21, 16, 22, 5, spec.hijab.c);
    g.rect(15, 48, 34, 4, spec.hijab.c);
    g.rect(43, 26, 2, 22, shade(spec.hijab.c, 0.2));
    g.set(26, 8, tint(spec.hijab.c, 0.3)); g.set(27, 9, tint(spec.hijab.c, 0.3));
  }
  if (spec.songkok) {
    g.ellipse(32, 12, 14, 7, spec.songkok);
    g.rect(18, 8, 28, 4, spec.songkok);
    g.rect(18, 11, 28, 2, "#c9a96a");
    g.rect(22, 8, 6, 1, "#2b323e");
    g.rect(43, 10, 2, 6, shade(spec.songkok, 0.25));
    g.set(24, 9, tint(spec.songkok, 0.25));
  }
  if (spec.kopiah) {
    g.ellipse(32, 12, 14, 7, spec.kopiah);
    g.rect(18, 8, 28, 4, spec.kopiah);
    g.rect(18, 11, 28, 2, "#8f8a7c");
    for (const x of [26, 32, 38]) g.rect(x, 8, 1, 4, "#8f8a7c");
    g.rect(43, 10, 2, 6, shade(spec.kopiah, 0.25));
  }

  // brows — tapered, a step down toward the temple
  const brow = spec.older ? skinSh : "#26222a";
  g.rect(24, 21, 6, 1, brow);
  g.set(30, 21, brow); g.set(30, 20, brow);
  g.rect(25, 20, 4, 1, shade(brow, 0.1));
  g.rect(33, 20, 5, 1, brow);
  g.set(33, 21, brow);
  g.rect(34, 21, 6, 1, brow);
  g.rect(35, 20, 4, 1, shade(brow, 0.1));

  // eyes: sclera, iris, pupil, glint, lids
  g.ellipse(27, 25, 3, 2, "#f6f2e8");
  g.ellipse(37, 25, 3, 2, "#f6f2e8");
  g.rect(26, 24, 2, 2, "#23303e");
  g.rect(36, 24, 2, 2, "#23303e");
  g.rect(26, 25, 2, 1, "#12171d");
  g.rect(36, 25, 2, 1, "#12171d");
  g.set(27, 24, "#4d5f72");
  g.set(37, 24, "#4d5f72");
  g.rect(24, 23, 7, 1, "#241f26");
  g.rect(34, 23, 7, 1, "#241f26");
  g.set(25, 27, skinSh);
  g.set(39, 27, skinSh);
  if (spec.older) {
    g.set(23, 22, skinSh); g.set(24, 22, skinSh);
    g.set(41, 22, skinSh); g.set(40, 22, skinSh);
    g.set(31, 19, skinSh); g.set(32, 19, skinSh);
  }

  // nose: side plane, tip light, nostrils
  g.rect(31, 26, 1, 7, skinSh);
  g.rect(32, 30, 1, 2, skinHi);
  g.set(30, 33, skinSh);
  g.set(33, 33, skinSh);

  // cheeks
  g.ellipse(24, 30, 3, 2, skinHi);
  g.ellipse(41, 31, 3, 2, skinSh);

  // mouth
  const mouth = spec.mouth ?? "firm";
  if (mouth === "set") {
    g.rect(28, 37, 8, 1, "#4d3230");
  } else if (mouth === "soft") {
    g.rect(28, 36, 8, 1, "#4d3230");
    g.rect(29, 37, 6, 1, "#4d3230");
  } else {
    g.rect(28, 36, 8, 1, "#4d3230");
    g.rect(27, 36, 1, 1, "#4d3230"); g.rect(36, 36, 1, 1, "#4d3230");
    g.rect(30, 38, 4, 1, skinHi);
  }

  // expression pass — drawn over the authored face, never random (see cast.ts)
  if (expression !== "neutral") applyExpression(g, expression, skin);

  if (spec.facial) {
    const grey = spec.facial.includes("grey");
    const fc = grey ? "#a7aca4" : "#232833";
    if (spec.facial.startsWith("moustache")) {
      g.rect(26, 34, 12, 2, fc);
      g.rect(25, 35, 3, 1, fc); g.rect(36, 35, 3, 1, fc);
    } else {
      g.rect(23, 36, 18, 7, fc);
      g.rect(25, 34, 3, 2, fc); g.rect(36, 34, 3, 2, fc);
      g.rect(29, 37, 6, 3, skinSh);
      g.rect(28, 42, 8, 2, fc);
      if (grey) g.rect(24, 40, 3, 1, "#c9cdc6");
    }
  }

  if (spec.glasses) {
    // outline-only frames: the refined eyes stay visible through the lenses
    const f = "#39414c";
    // left lens
    g.rect(22, 22, 10, 1, f);
    g.rect(22, 28, 10, 1, f);
    g.rect(22, 23, 1, 5, f);
    g.rect(31, 23, 1, 5, f);
    // right lens
    g.rect(32, 22, 10, 1, f);
    g.rect(32, 28, 10, 1, f);
    g.rect(32, 23, 1, 5, f);
    g.rect(41, 23, 1, 5, f);
    // bridge and temples
    g.rect(31, 24, 1, 1, f);
    g.rect(16, 23, 6, 1, f);
    g.rect(42, 23, 6, 1, f);
    // lens glint, upper-left of each lens
    g.set(24, 23, "#d7e2ec");
    g.set(34, 23, "#d7e2ec");
    // frames sit on the nose: a small shadow under each lens
    g.rect(24, 29, 6, 1, skinSh);
    g.rect(35, 29, 5, 1, skinSh);
  }

  if (spec.earrings) { g.rect(19, 33, 2, 2, "#e6cd8e"); g.rect(43, 33, 2, 2, "#e6cd8e"); }
  if (spec.bindi) g.rect(31, 17, 2, 2, "#b3452e");

  // rim light: a short catch along the hair edge on the lamp side
  g.rect(21, 14, 1, 9, skinHi);
  g.set(20, 12, skinHi);

  return g.cells;
}

const cache = new Map<string, string>();

function render(spec: PixelSpec, expression: Expression = "neutral"): string {
  const cells = draw(spec, expression);
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

/**
 * Expression frames for the theatre. A character's resting face is authored in
 * SPECS; these four overlays redraw brows and mouth on top of it. Selection is
 * rule-driven (features/narrative/cast.ts), never random.
 */
export type Expression = "neutral" | "concerned" | "pleased" | "stern";

const MOUTH = "#4d3230";

function applyExpression(g: Grid, expression: Expression, skin: string) {
  const brow = "#26222a";
  // clear the authored mouth before redrawing it (face skin underneath)
  g.rect(27, 35, 11, 5, skin);
  if (expression === "pleased") {
    // corners up, gentle closed smile
    g.rect(28, 37, 8, 1, MOUTH);
    g.set(27, 36, MOUTH);
    g.set(36, 36, MOUTH);
  } else if (expression === "concerned") {
    // inner brow tips lifted, mouth pulled flat and small
    g.set(29, 19, brow);
    g.set(30, 19, brow);
    g.set(33, 19, brow);
    g.set(34, 19, brow);
    g.rect(29, 37, 6, 1, MOUTH);
    g.set(28, 38, MOUTH);
    g.set(35, 38, MOUTH);
  } else {
    // stern: brows pressed flat and low, mouth a straight line
    g.rect(25, 22, 5, 1, brow);
    g.rect(34, 22, 5, 1, brow);
    g.rect(28, 37, 8, 1, MOUTH);
  }
}

/* ------------------------------------------------------------------ */
/* The ten figures                                                     */
/* ------------------------------------------------------------------ */

const SPECS: Record<string, PixelSpec> = {
  chiefOfStaff: {
    skin: ["#c99a76", "#8f6247", "#e6bd98"],
    bg: ["#1b2434", "#10141d"],
    attire: { kind: "suit", c: "#2a3140", trim: "#4a5468", shirt: "#e9e2d2", tie: "#8a6c1f", accent: "#c9a96a" },
    hair: { c: "#1d222c", hi: "#4d5a6e", style: "bob" },
    mouth: "soft",
  },
  finance: {
    skin: ["#c49a72", "#8a6244", "#e2ba92"],
    bg: ["#1d2740", "#10141d"],
    attire: { kind: "suit", c: "#232a36", trim: "#3d4757", shirt: "#dde2e8", tie: "#6e3440", accent: "#c9a96a" },
    hair: { c: "#8f8f8c", hi: "#c4c4c0", style: "receding" },
    glasses: true,
    older: true,
    mouth: "set",
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
  },
  nationalSecurity: {
    skin: ["#c19a72", "#87613f", "#dfb894"],
    bg: ["#20262e", "#11151b"],
    attire: { kind: "suit", c: "#262d38", trim: "#48536a", shirt: "#cfd6de" },
    hijab: { c: "#20262e", hi: "#3a4a5c" },
    older: true,
    mouth: "set",
  },
  foreign: {
    skin: ["#d0a276", "#96684a", "#ecd0a8"],
    bg: ["#1c2436", "#10141d"],
    attire: { kind: "suit", c: "#2c3d5c", trim: "#51678c", shirt: "#ece9e0", tie: "#1d2740", accent: "#e6cd8e" },
    hair: { c: "#2a2f38", hi: "#8b93a1", style: "sidepart" },
    glasses: true,
    older: true,
    mouth: "firm",
  },
  home: {
    skin: ["#c39c74", "#896248", "#e0bd97"],
    bg: ["#33202a", "#170f14"],
    attire: { kind: "suit", c: "#2a2632", trim: "#4a4458", shirt: "#d8d3c8", accent: "#e6cd8e" },
    hijab: { c: "#6e2f3a", hi: "#8a474e" },
    older: true,
    mouth: "firm",
  },
  borneoMinister: {
    skin: ["#a9744c", "#74502f", "#cc9871"],
    bg: ["#1c2e1f", "#0f1812"],
    attire: { kind: "open", c: "#223026", trim: "#3f5a48", shirt: "#c6cdc2" },
    hair: { c: "#262b30", hi: "#6e747c", style: "curls" },
    older: true,
    mouth: "firm",
  },
  gpsPremier: {
    skin: ["#bd8a5e", "#835a38", "#d9ad82"],
    bg: ["#2e2417", "#171208"],
    attire: { kind: "suit", c: "#2b2a24", trim: "#4e4c40", shirt: "#e4ded0", accent: "#c9a96a" },
    hair: { c: "#8a8a84", hi: "#bdbdb6", style: "combed" },
    glasses: true,
    older: true,
    mouth: "firm",
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
  },
  oppositionLeader: {
    skin: ["#c39a70", "#8a6244", "#dfba92"],
    bg: ["#341d20", "#18100f"],
    attire: { kind: "mandarin", c: "#23272e", trim: "#3c434f", shirt: "#c9cdd4", accent: "#8a474e" },
    hair: { c: "#31353d", hi: "#7d8492", style: "short" },
    kopiah: "#d9d2c0",
    facial: "beard",
    mouth: "set",
  },
};

const GENERIC: PixelSpec = {
  skin: ["#3a4350", "#2a303b", "#4d5866"],
  bg: ["#161b23", "#0e1218"],
  attire: { kind: "suit", c: "#1c222c", trim: "#313a48", shirt: "#262e3a" },
  mouth: "firm",
};
