import type { GameState } from "../types/game";
import type { GameEventDef } from "../types/narrative";
import { isBudgetTurn, isMonsoonTurn } from "./calendar";

/**
 * Picks which briefings land on the Prime Minister's desk this month.
 * Deterministic: no randomness, so a reloaded save shows the same queue.
 * Shared by legacy GameEventDefs and the v2 graph events, which both describe
 * themselves as SchedulableItems.
 */
export interface SchedulableItem {
  id: string;
  kind: "chapter" | "recurring";
  chapter?: number;
  window?: [number, number];
  priority: number;
  minGap?: number;
  schedule?: "budget" | "monsoon";
  available?: (state: GameState) => boolean;
}

export function pickSchedulable(state: GameState, items: readonly SchedulableItem[]): string[] {
  const eligible = items.filter((event) => {
    if (state.firedEvents.includes(event.id)) return false;
    if (event.kind === "chapter") {
      if (event.chapter !== state.chapter) return false;
      const [from, to] = event.window ?? [0, 99];
      if (state.turn < from || state.turn > to) return false;
    } else {
      if (event.chapter !== undefined && state.chapter < 2) return false;
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

function legacyItem(event: GameEventDef): SchedulableItem {
  return {
    id: event.id,
    kind: event.kind,
    chapter: event.chapter,
    window: event.window,
    priority: event.priority,
    minGap: event.minGap,
    schedule: event.schedule,
    available: event.available,
  };
}

export function selectEventsForTurn(state: GameState, allEvents: readonly GameEventDef[]): string[] {
  return pickSchedulable(state, allEvents.map(legacyItem));
}

/** Scheduler view of the legacy defs, for merging with graph events. */
export function legacySchedulable(allEvents: readonly GameEventDef[]): SchedulableItem[] {
  return allEvents.map(legacyItem);
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
