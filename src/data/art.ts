/**
 * The illustrated backdrop manifest. Every scene art file lives under
 * public/art/ and is consumed by SceneView (via artForScene) and the page
 * mastheads. Adding a location keyword below is all a new venue needs.
 */

const OFFICE = "/art/scene-office.svg";
const CHAMBER = "/art/scene-chamber.svg";
const TREASURY = "/art/scene-treasury.svg";
const OPS = "/art/scene-ops.svg";
const FLOOD = "/art/scene-flood.svg";

/** Title-screen key art: the Putrajaya federal district at dusk. */
export const MENU_ART = "/art/menu-putrajaya.svg";

/** Resolves a scene's location string (event data) to its backdrop. */
export function artForScene(location: string): string {
  const l = location.toLowerCase();
  if (/parliament|cabinet|lounge|parlimen|kabinet|dewan/.test(l)) return CHAMBER;
  if (/treasury|bank|finance|kewangan/.test(l)) return TREASURY;
  if (/crisis|operations|security council|nsc|keselamatan/.test(l)) return OPS;
  if (/kelantan|monsoon|flood|banjir|village|kampung/.test(l)) return FLOOD;
  return OFFICE;
}
