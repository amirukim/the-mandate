import type { GameEventDef } from "../../types/narrative";
import { CHAPTER1_EVENTS } from "./chapter1";
import { RECURRING_EVENTS } from "./recurring";

export const ALL_EVENTS: GameEventDef[] = [...CHAPTER1_EVENTS, ...RECURRING_EVENTS];

export function getEventById(id: string): GameEventDef | undefined {
  return ALL_EVENTS.find((event) => event.id === id);
}
