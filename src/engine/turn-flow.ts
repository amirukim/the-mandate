import { ALL_EVENTS, getEventById } from "../data/events";
import { ensureContentRegistered } from "../data/dialogue";
import type { GameState, NewsItem } from "../types/game";import type { GameEventDef, SceneOption } from "../types/narrative";
import { applyEffects } from "./effects";
import { economyHeadline, endTurn, type TurnReport } from "./simulation";
import { legacySchedulable, pickSchedulable } from "./narrative";
import { graphSchedulable } from "./graph-events";
import { ensureMutable } from "./array-guard";

const OUTLET_ROTATION = ["peninsula", "borneo", "sinar"] as const;

/** Schedule this month's briefings onto the desk — legacy and graph events share it. */
export function beginTurn(state: GameState): void {
  ensureContentRegistered();
  const items = [...legacySchedulable(ALL_EVENTS), ...graphSchedulable()];
  state.queuedEventIds = pickSchedulable(state, items);
}

/** The event currently on the Prime Minister's desk, if any. */
export function currentEvent(state: GameState): GameEventDef | null {
  if (state.queuedEventIds.length === 0) return null;
  return getEventById(state.queuedEventIds[0]) ?? null;
}

export interface ChosenOutcome {
  event: GameEventDef;
  option: SceneOption;
  notes: string[];
  news: NewsItem[];
}

/** Applies a decision: immediate effects now, delayed ones scheduled. */
export function chooseOption(state: GameState, optionId: string): ChosenOutcome | null {
  const event = currentEvent(state);
  if (!event) return null;
  const option = event.options.find((o) => o.id === optionId);
  if (!option) return null;

  const notes: string[] = [];
  const news: NewsItem[] = [];

  option.consequences.forEach((consequence, index) => {
    if (consequence.delayTurns !== undefined) {
      state.pendingEffects = ensureMutable(state.pendingEffects);
      state.pendingEffects.push({
        id: `${event.id}-${option.id}-${index}`,
        dueTurn: state.turn + consequence.delayTurns,
        description: consequence.description ?? consequence.note ?? "A consequence matures.",
        effects: consequence.effects ?? [],
        news: (consequence.news ?? []).map((n) => ({ ...n, category: event.category })),
      });
    } else {
      applyEffects(state, consequence.effects ?? []);
      if (consequence.note) notes.push(consequence.note);
    }
    if (consequence.news) {
      consequence.news.forEach((n, ni) => {
        news.push({
          id: `${event.id}-${option.id}-${index}-${ni}`,
          turn: state.turn,
          outlet: n.outlet,
          headline: n.headline,
          body: n.body,
          category: event.category,
        });
      });
    }
  });

  state.news = ensureMutable(state.news);
  state.news.push(...news);
  state.decisions = ensureMutable(state.decisions);
  state.decisions.push({
    id: event.id,
    turn: state.turn,
    chapter: state.chapter,
    eventTitle: event.title,
    optionId: option.id,
    optionLabel: option.label,
    summary: option.summary,
  });
  state.firedEvents = ensureMutable(state.firedEvents);
  state.firedEvents.push(event.id);
  state.queuedEventIds = state.queuedEventIds.slice(1);
  return { event, option, notes, news };
}

/** Closes the month: simulation step, wire headline, next month's schedule. */
export function advanceMonth(state: GameState): TurnReport {
  const report = endTurn(state);
  const headline = economyHeadline(state);
  if (headline) {
    const item: NewsItem = {
      id: `eco-${state.turn}`,
      turn: state.turn,
      outlet: OUTLET_ROTATION[state.turn % OUTLET_ROTATION.length],
      headline: headline.headline,
      body: headline.body,
      category: "economy",
    };
    state.news = ensureMutable(state.news);
    state.news.push(item);
    report.headlines.push(item);
  }
  beginTurn(state);
  state.phase = "summary";
  return report;
}
