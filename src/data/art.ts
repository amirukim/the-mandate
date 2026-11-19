/**
 * Scene illustration registry.
 *
 * Hand-drawn SVG plates in public/art — a work of fiction about real places,
 * no photographs and no real people. SceneView resolves the backdrop from the
 * event's location, so new art only needs a new file and an entry here.
 */
const OFFICE = "/art/scene-office.svg";
const CHAMBER = "/art/scene-chamber.svg";

export const MENU_ART = "/art/menu-putrajaya.svg";

export function artForScene(location: string): string {
  if (/parliament|cabinet|lounge|parlimen|kabinet/i.test(location)) return CHAMBER;
  return OFFICE;
}
