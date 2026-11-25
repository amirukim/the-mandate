/**
 * Pixel portrait engine — 32×32 hand-authored busts, rendered to canvas and
 * scaled with image-rendering: pixelated. A deliberate art direction, not a
 * placeholder: limited palettes, directional shading, one-pixel features.
 *
 * portraitPixelDataUrl(id) is cached per id. Unknown ids return the anonymous
 * bust, never null. Raster files (public/portraits/<id>.*) still override
 * these when present — see data/portraits.tsx.
 */

const W = 32;
const H = 32;

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
  mirror(x: number, y: number, c: string) {
    this.set(x, y, c);
    this.set(W - 1 - x, y, c);
  }
}

function draw(spec: PixelSpec): (string | null)[][] {
  const g = new Grid();
  const [skin, skinSh, skinHi] = spec.skin;

  // backdrop, with a quiet glow band behind the head
  g.rect(0, 0, W, 16, spec.bg[0]);
  g.rect(0, 16, W, H - 16, spec.bg[1]);
  g.rect(8, 4, 16, 18, spec.bg[1]);

  // shoulders and attire
  const a = spec.attire;
  g.rect(3, 26, 26, 6, a.c);
  g.rect(6, 24, 20, 3, a.c);
  g.rect(2, 29, 28, 3, "#12161e");
  if (a.kind === "suit") {
    // lapels + shirt + tie
    g.set(13, 24, a.trim); g.set(14, 25, a.trim); g.set(12, 26, a.trim);
    g.set(19, 24, a.trim); g.set(18, 25, a.trim); g.set(20, 26, a.trim);
    g.rect(15, 25, 2, 7, a.shirt);
    if (a.tie) { g.set(15, 26, a.tie); g.set(16, 26, a.tie); g.set(15, 28, a.tie); g.set(16, 28, a.tie); }
    if (a.accent) g.rect(22, 28, 2, 1, a.accent);
  } else if (a.kind === "open") {
    g.rect(14, 24, 4, 8, a.shirt);
    g.set(14, 24, a.trim); g.set(17, 24, a.trim);
  } else {
    g.rect(13, 24, 6, 8, a.c);
    g.set(13, 25, a.trim); g.set(18, 25, a.trim);
    g.set(15, 25, a.accent ?? a.trim); g.set(16, 25, a.accent ?? a.trim);
  }

  // neck
  g.rect(13, 20, 6, 4, skinSh);

  // head
  g.ellipse(16, 13, 6, 7, skin);
  // right-side shading
  g.rect(20, 9, 2, 8, skinSh);
  g.set(21, 12, skinSh); g.set(21, 13, skinSh);
  // left light
  g.set(11, 10, skinHi); g.set(11, 11, skinHi); g.set(12, 9, skinHi);
  // ears
  g.set(9, 13, skinSh); g.set(9, 14, skin);
  g.set(22, 13, skinSh); g.set(22, 14, skin);

  // hair
  const h = spec.hair;
  if (h) {
    const { c, hi } = h;
    switch (h.style) {
      case "bob":
        g.rect(9, 6, 14, 4, c);
        g.rect(9, 10, 2, 8, c);
        g.rect(21, 10, 2, 8, c);
        g.rect(10, 9, 12, 1, c);
        g.set(11, 7, hi); g.set(20, 8, hi);
        break;
      case "receding":
        g.rect(11, 5, 10, 3, c);
        g.set(12, 4, hi); g.set(19, 6, c);
        break;
      case "tied":
        g.rect(10, 5, 12, 4, c);
        g.rect(9, 9, 2, 5, c);
        g.rect(21, 9, 2, 5, c);
        g.ellipse(16, 4, 3, 2, c);
        g.set(15, 3, hi); g.set(11, 6, hi);
        break;
      case "sidepart":
        g.rect(10, 5, 12, 3, c);
        g.rect(10, 8, 4, 2, c);
        g.set(21, 8, c); g.set(22, 9, c);
        g.set(12, 4, hi); g.set(13, 5, hi);
        break;
      case "curls":
        g.rect(10, 4, 12, 3, c);
        g.set(10, 3, c); g.set(13, 3, c); g.set(18, 3, c); g.set(21, 3, c);
        g.set(9, 6, c); g.set(22, 6, c); g.set(9, 9, c); g.set(22, 9, c);
        g.set(12, 3, hi); g.set(19, 4, hi);
        break;
      case "combed":
        g.rect(10, 4, 12, 4, c);
        g.rect(9, 8, 2, 2, c); g.rect(21, 8, 2, 2, c);
        g.set(11, 4, hi); g.set(12, 4, hi); g.set(13, 4, hi);
        break;
      case "white":
        g.rect(10, 4, 12, 4, c);
        g.rect(9, 8, 2, 3, c); g.rect(21, 8, 2, 3, c);
        g.set(11, 4, hi); g.set(20, 4, hi);
        break;
      case "short":
      default:
        g.rect(10, 4, 12, 4, c);
        g.set(9, 7, c); g.set(22, 7, c); g.set(9, 9, c); g.set(22, 9, c);
        g.set(11, 4, hi); g.set(20, 5, hi);
        break;
    }
  }
  if (spec.hijab) {
    g.rect(9, 4, 14, 5, spec.hijab.c);
    g.rect(8, 8, 3, 14, spec.hijab.c);
    g.rect(21, 8, 3, 14, spec.hijab.c);
    g.rect(8, 8, 1, 14, spec.hijab.hi);
    g.rect(10, 4, 4, 1, spec.hijab.hi);
    g.rect(9, 21, 14, 2, spec.hijab.c);
  }
  if (spec.songkok) {
    g.rect(10, 3, 12, 4, spec.songkok);
    g.rect(10, 6, 12, 1, "#c9a96a");
    g.set(12, 3, "#2b323e");
  }
  if (spec.kopiah) {
    g.rect(10, 3, 12, 4, spec.kopiah);
    g.rect(10, 6, 12, 1, "#8f8a7c");
    g.set(14, 3, "#8f8a7c"); g.set(16, 3, "#8f8a7c"); g.set(18, 3, "#8f8a7c");
  }

  // brows
  const brow = spec.older ? skinSh : "#26222a";
  g.set(13, 11, brow); g.set(14, 11, brow);
  g.set(18, 11, brow); g.set(19, 11, brow);

  // eyes: dark pixels with a glint
  g.set(12, 12, "#1d1a20"); g.set(13, 12, "#1d1a20");
  g.set(18, 12, "#1d1a20"); g.set(19, 12, "#1d1a20");
  g.set(12, 13, "#1d1a20"); g.set(19, 13, "#1d1a20");
  g.set(13, 13, skin); g.set(18, 13, skin);
  g.set(12, 12, "#c9c2b4");
  // nose
  g.set(16, 14, skinSh); g.set(16, 15, skinSh);
  g.set(15, 16, skinSh);
  // cheeks
  g.set(11, 15, skinHi); g.set(21, 16, skinSh);
  // mouth
  const mouth = spec.mouth ?? "firm";
  if (mouth === "set") { g.set(14, 17, "#4d3230"); g.set(15, 17, "#4d3230"); g.set(16, 17, "#4d3230"); g.set(17, 17, "#4d3230"); }
  else if (mouth === "soft") { g.set(14, 17, "#4d3230"); g.set(15, 18, "#4d3230"); g.set(16, 18, "#4d3230"); g.set(17, 17, "#4d3230"); }
  else { g.set(13, 17, "#4d3230"); g.set(14, 18, "#4d3230"); g.set(15, 18, "#4d3230"); g.set(16, 18, "#4d3230"); g.set(17, 18, "#4d3230"); g.set(18, 17, "#4d3230"); }

  if (spec.facial) {
    const grey = spec.facial.includes("grey");
    const fc = grey ? "#a7aca4" : "#232833";
    if (spec.facial.startsWith("moustache")) {
      g.set(13, 16, fc); g.set(14, 16, fc); g.set(17, 16, fc); g.set(18, 16, fc);
    } else {
      g.rect(11, 17, 10, 4, fc);
      g.rect(12, 16, 8, 1, fc);
      g.rect(14, 18, 4, 2, skinSh);
      if (grey) g.set(12, 20, "#c9cdc6");
    }
  }

  if (spec.glasses) {
    const f = "#39414c";
    g.rect(11, 11, 5, 4, f);
    g.rect(11, 12, 5, 2, "#8ea0b5");
    g.rect(17, 11, 5, 4, f);
    g.rect(17, 12, 5, 2, "#8ea0b5");
    g.set(16, 12, f);
    g.set(9, 12, f); g.set(23, 12, f);
    g.set(12, 12, "#26222a"); g.set(19, 12, "#26222a");
  }

  if (spec.earrings) { g.set(9, 17, "#e6cd8e"); g.set(22, 17, "#e6cd8e"); }
  if (spec.bindi) g.set(16, 9, "#b3452e");

  // rim light: the lamp side
  g.set(10, 8, skinHi); g.set(10, 9, skinHi);
  g.set(4, 26, a.c); g.set(3, 27, "#4a3826");

  return g.cells;
}

const cache = new Map<string, string>();

function render(spec: PixelSpec): string {
  const cells = draw(spec);
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

/** Cached pixel bust for a character id; unknown ids get the anonymous figure. */
export function pixelPortraitDataUrl(id: string): string {
  const hit = cache.get(id);
  if (hit !== undefined) return hit;
  const spec = SPECS[id] ?? GENERIC;
  const url = render(spec);
  cache.set(id, url);
  return url;
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
