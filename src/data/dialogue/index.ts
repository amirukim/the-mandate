import { registerGraphEvents } from "../../engine/graph-events";
import { BRIEFING_EVENTS } from "./briefings";
import { CRISIS_EVENTS } from "./crises";
import { ADVISOR_ARCS } from "./advisors";

/**
 * The v2 content registry (Phase 8): 20 graph events + 3 advisor arcs. The
 * 15 legacy v1 events stay untouched in src/data/events.
 */
export const GRAPH_EVENTS = [...BRIEFING_EVENTS, ...CRISIS_EVENTS];

let registered = false;
export function ensureContentRegistered(): void {
  if (registered) return;
  registerGraphEvents(GRAPH_EVENTS);
  registered = true;
}

export { ADVISOR_ARCS };
