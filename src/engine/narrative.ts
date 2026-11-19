import type { GameState } from "../types/game";
import type { GameEventDef } from "../types/narrative";
import { isBudgetTurn, isMonsoonTurn } from "./calendar";

/**
 * Picks which briefings land on the Prime Minister's desk this month.
 * Deterministic: no randomness, so a reloaded save shows the same queue.
 */
export function selectEventsForTurn(state: GameState, allEvents: readonly GameEventDef[]): string[] {
  const eligible = allEvents.filter((event) => {
    if (state.firedEvents.includes(event.id)) return false;
    if (event.kind === "chapter") {
      if (event.chapter !== state.chapter) return false;
      const [from, to] = event.window ?? [0, 99];
      if (state.turn < from || state.turn > to) return false;
    } else {
      if (state.chapter < 2) return false;
      if (event.schedule === "budget" && !isBudgetTurn(state.turn)) return false;
      if (event.schedule === "monsoon" && !isMonsoonTurn(state.turn)) return false;
      if (event.minGap !== undefined && hasRecent(state, event.id, event.minGap)) return false;
    }
    if (event.available && !event.available(state)) return false;
    return true;
  });

  const sorted = [...eligible].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  return sorted.slice(0, 2).map((event) => event.id);
}

function hasRecent(state: GameState, eventId: string, gap: number): boolean {
  const last = state.flags[`lastFired:${eventId}`];
  return typeof last === "number" && state.turn - last < gap;
}

/** Takes the next event off the month's queue and records it. */
export function dequeueNext(state: GameState, allEvents: readonly GameEventDef[]): string | null {
  const next = state.queuedEventIds[0] ?? null;
  if (!next) return null;
  state.queuedEventIds = state.queuedEventIds.slice(1);
  state.firedEvents.push(next);
  const def = allEvents.find((event) => event.id === next);
  if (def && def.kind === "recurring") {
    state.flags[`lastFired:${def.id}`] = state.turn;
  }
  return next;
}
