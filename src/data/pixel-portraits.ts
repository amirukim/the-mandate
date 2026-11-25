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
  // left-light on the coat
  g.rect(12, 52, 2, 8, "#4a3826");

  // collar per kind
  if (a.kind === "suit") {
    g.rect(26, 46, 5, 6, a.trim);
    g.rect(33, 46, 5, 6, a.trim);
    g.rect(30, 47, 4, 17, a.shirt);
    if (a.tie) { g.rect(31, 48, 2, 4, a.tie); g.rect(30, 51, 4, 3, a.tie); g.rect(31, 54, 2, 8, a.tie); }
    if (a.accent) g.rect(40, 54, 4, 2, a.accent);
  } else if (a.kind === "open") {
    g.rect(28, 46, 8, 14, a.shirt);
    g.set(28, 46, a.trim); g.set(29, 47, a.trim); g.set(27, 48, a.trim);
    g.rect(35, 46, 8, 14, a.shirt);
    g.set(35, 46, a.trim); g.set(36, 47, a.trim); g.set(37, 48, a.trim);
  } else {
    g.rect(26, 46, 12, 18, a.shirt);
    g.rect(25, 46, 2, 18, a.c);
    g.rect(37, 46, 2, 18, a.c);
    g.rect(30, 47, 4, 2, a.accent ?? a.trim);
  }

  // neck
  g.rect(27, 39, 10, 7, skinSh);
  g.rect(27, 39, 10, 2, skinSh);

  // head
  g.ellipse(32, 26, 12, 14, skin);
  // jaw taper shadow
  g.ellipse(32, 30, 10, 9, skin);
  // right-side plane shadow
  g.rect(39, 18, 4, 16, skinSh);
  g.rect(41, 22, 2, 8, skinSh);
  // left light
  g.rect(22, 16, 2, 14, skinHi);
  g.set(24, 14, skinHi);
  // ears
  g.rect(19, 26, 3, 6, skinSh);
  g.rect(42, 26, 3, 6, skinSh);

  // hair
  const h = spec.hair;
  if (h) {
    const { c, hi } = h;
    switch (h.style) {
      case "bob":
        g.ellipse(32, 20, 15, 13, c);
        g.rect(19, 22, 5, 18, c);
        g.rect(40, 22, 5, 18, c);
        g.rect(21, 16, 22, 4, c);
        g.rect(23, 18, 18, 3, skin);
        g.rect(22, 20, 20, 3, skin);
        g.set(24, 12, hi); g.set(25, 13, hi); g.set(40, 16, hi); g.set(41, 17, hi);
        break;
      case "receding":
        g.ellipse(32, 17, 13, 9, c);
        g.rect(20, 16, 24, 4, skin);
        g.rect(22, 20, 20, 2, skin);
        g.set(24, 10, hi); g.set(25, 11, hi);
        break;
      case "tied":
        g.ellipse(32, 18, 14, 11, c);
        g.rect(19, 18, 4, 12, c);
        g.rect(41, 18, 4, 12, c);
        g.rect(24, 16, 16, 4, skin);
        g.ellipse(32, 6, 5, 4, c);
        g.set(30, 4, hi); g.set(21, 13, hi);
        break;
      case "sidepart":
        g.ellipse(32, 17, 14, 10, c);
        g.rect(20, 17, 10, 4, c);
        g.rect(20, 20, 24, 3, skin);
        g.set(25, 8, hi); g.set(26, 9, hi); g.set(27, 10, hi);
        g.set(44, 14, c); g.set(45, 15, c);
        break;
      case "curls":
        for (const [cx, cy, r] of [[22, 13, 6], [30, 10, 7], [40, 12, 6], [18, 19, 5], [46, 19, 5]] as const) {
          g.ellipse(cx, cy, r, r - 1, c);
        }
        g.rect(22, 18, 20, 4, skin);
        g.set(28, 8, hi); g.set(38, 10, hi);
        break;
      case "combed":
        g.ellipse(32, 16, 14, 10, c);
        g.rect(21, 17, 22, 3, skin);
        g.rect(18, 18, 4, 4, c); g.rect(42, 18, 4, 4, c);
        g.set(23, 9, hi); g.set(24, 10, hi); g.set(25, 11, hi);
        break;
      case "white":
        g.ellipse(32, 16, 14, 10, c);
        g.rect(18, 18, 4, 5, c); g.rect(42, 18, 4, 5, c);
        g.rect(21, 17, 22, 3, skin);
        g.set(23, 9, hi); g.set(40, 10, hi);
        break;
      case "short":
      default:
        g.ellipse(32, 15, 14, 11, c);
        g.rect(20, 18, 24, 3, skin);
        g.rect(18, 19, 3, 4, c); g.rect(43, 19, 3, 4, c);
        g.set(23, 8, hi); g.set(24, 9, hi); g.set(41, 11, hi);
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
  }
  if (spec.songkok) {
    g.ellipse(32, 12, 14, 7, spec.songkok);
    g.rect(18, 8, 28, 4, spec.songkok);
    g.rect(18, 11, 28, 2, "#c9a96a");
    g.rect(22, 8, 6, 1, "#2b323e");
  }
  if (spec.kopiah) {
    g.ellipse(32, 12, 14, 7, spec.kopiah);
    g.rect(18, 8, 28, 4, spec.kopiah);
    g.rect(18, 11, 28, 2, "#8f8a7c");
    for (const x of [26, 32, 38]) g.rect(x, 8, 1, 4, "#8f8a7c");
  }

  // brows — 2px tall, gently curved
  const brow = spec.older ? skinSh : "#26222a";
  g.rect(24, 21, 7, 1, brow);
  g.rect(25, 20, 5, 1, brow);
  g.rect(33, 20, 5, 1, brow);
  g.rect(34, 21, 7, 1, brow);

  // eyes: sclera, iris, glint, lid
  g.ellipse(27, 25, 3, 2, "#f2eee4");
  g.ellipse(37, 25, 3, 2, "#f2eee4");
  g.rect(27, 25, 2, 2, "#1d1a20");
  g.rect(37, 25, 2, 2, "#1d1a20");
  g.set(27, 25, "#c9c2b4"); g.set(37, 25, "#c9c2b4");
  g.rect(24, 23, 7, 1, "#241f26");
  g.rect(34, 23, 7, 1, "#241f26");
  if (spec.older) {
    g.set(23, 22, skinSh); g.set(24, 22, skinSh);
    g.set(41, 22, skinSh); g.set(40, 22, skinSh);
    g.set(31, 19, skinSh); g.set(32, 19, skinSh);
  }

  // nose
  g.rect(31, 27, 1, 6, skinSh);
  g.rect(32, 30, 1, 3, skinHi);
  g.rect(29, 33, 5, 1, skinSh);

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
    const f = "#39414c";
    g.rect(22, 22, 10, 7, f);
    g.rect(32, 22, 10, 7, f);
    g.rect(23, 23, 8, 5, "#8ea0b5");
    g.rect(33, 23, 8, 5, "#8ea0b5");
    g.rect(31, 24, 2, 1, f);
    g.rect(16, 23, 6, 1, f);
    g.rect(42, 23, 6, 1, f);
    // eyes through the lenses
    g.ellipse(27, 25, 2, 2, "#1d1a20");
    g.ellipse(37, 25, 2, 2, "#1d1a20");
    g.set(27, 24, "#c9c2b4"); g.set(37, 24, "#c9c2b4");
    g.rect(24, 29, 6, 1, skinSh);
    g.rect(35, 29, 5, 1, skinSh);
  }

  if (spec.earrings) { g.rect(19, 33, 2, 2, "#e6cd8e"); g.rect(43, 33, 2, 2, "#e6cd8e"); }
  if (spec.bindi) g.rect(31, 17, 2, 2, "#b3452e");

  // rim light: the lamp side
  g.rect(21, 14, 1, 16, skinHi);
  g.rect(13, 50, 1, 8, "#4a3826");
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
