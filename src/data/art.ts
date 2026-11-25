/**
 * The illustrated backdrop manifest. Every scene art file lives under
 * public/art/ and is consumed by SceneView (via artForScene) and the page
 * mastheads. Adding a location keyword below is all a new venue needs.
 *
 * Painted upgrades: drop a raster painting at
 *   public/art/painted/<sceneKey>.webp (or .png / .jpg)
 * and it automatically covers the vector scene everywhere it is used —
 * missing files fall back to the vector art silently.
 */

export type SceneKey = "chamber" | "office" | "treasury" | "ops" | "flood";

/**
 * A room's full art stack. The authored pixel plate is used directly at native
 * size (no rasterisation); the vector illustration underneath is the fallback
 * that must always exist; the painted key is the raster drop-in chain.
 */
export interface EnvironmentArt {
  pixel?: string;
  vector: string;
  painted: SceneKey | "hub";
  /** Raster width/height for the vector fallback (⅓ of its natural size). */
  width: number;
  height: number;
}

export const ENVIRONMENTS = {
  officeHub: {
    pixel: "/art/pixel/env-office-hub.png",
    vector: "/art/scene-hub.svg",
    painted: "hub",
    width: 480,
    height: 253,
  },
} satisfies Record<string, EnvironmentArt>;

export type EnvironmentId = keyof typeof ENVIRONMENTS;

const SCENE_SVG: Record<SceneKey, string> = {
  office: "/art/scene-office.svg",
  chamber: "/art/scene-chamber.svg",
  treasury: "/art/scene-treasury.svg",
  ops: "/art/scene-ops.svg",
  flood: "/art/scene-flood.svg",
};

/** Resolves a scene's location string (event data) to its scene key. */
export function sceneKeyFor(location: string): SceneKey {
  const l = location.toLowerCase();
  if (/parliament|cabinet|lounge|parlimen|kabinet|dewan/.test(l)) return "chamber";
  if (/treasury|bank|finance|kewangan/.test(l)) return "treasury";
  if (/crisis|operations|security council|nsc|keselamatan/.test(l)) return "ops";
  if (/kelantan|monsoon|flood|banjir|village|kampung/.test(l)) return "flood";
  return "office";
}

/** Backdrop for a scene's location string (event data). */
export function artForScene(location: string): string {
  return SCENE_SVG[sceneKeyFor(location)];
}

/** Title-screen key art: the Putrajaya federal district at dusk. */
export const MENU_ART = "/art/menu-putrajaya.svg";

/** Painted-candidate files for a scene key (plus "hub" for the office hub). */
export function paintedSceneSrcs(key: SceneKey | "hub"): string[] {
  return [`/art/painted/${key}.webp`, `/art/painted/${key}.png`, `/art/painted/${key}.jpg`];
}
