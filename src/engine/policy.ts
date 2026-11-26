import type { GameState, NewsItem, PolicyState } from "../types/game";
import type { PolicyMeasure } from "../data/policies";
import { measureById } from "../data/policies";
import { applyEffects } from "./effects";
import { ensureMutable } from "./array-guard";

/**
 * The policy engine (v2 Phase 7). Pure TS: enacting a measure runs the standard
 * effect pipeline, schedules delayed effects, and writes the record into the
 * v2 `policy` slice. The state slice is optional on migrated saves; these
 * helpers materialise it on first use.
 */
export function ensurePolicy(state: GameState): PolicyState {
  if (!state.policy) state.policy = { enacted: {}, levers: {} };
  if (!state.policy.enacted) state.policy.enacted = {};
  return state.policy;
}

export function isEnacted(state: GameState, measureId: string): boolean {
  return state.policy?.enacted[measureId] !== undefined;
}

export type EnactBlockReason = "enacted" | "conflict" | "unknown";

/** Why a measure cannot be enacted, or ok. Deterministic from state alone. */
export function canEnact(state: GameState, measureId: string): { ok: boolean; reason?: EnactBlockReason; conflictWith?: string } {
  const measure = measureById(measureId);
  if (!measure) return { ok: false, reason: "unknown" };
  if (isEnacted(state, measureId)) return { ok: false, reason: "enacted" };
  for (const other of measure.conflicts ?? []) {
    if (isEnacted(state, other)) return { ok: false, reason: "conflict", conflictWith: other };
  }
  return { ok: true };
}

export interface EnactResult {
  measure: PolicyMeasure;
  notes: string[];
  news: NewsItem[];
}

/**
 * Enacts a measure: immediate effects now, delayed ones scheduled, the
 * enactment recorded, and coalition anger applied. Mutates state in place.
 */
export function enactPolicy(state: GameState, measureId: string): EnactResult | null {
  const guard = canEnact(state, measureId);
  if (!guard.ok) return null;
  const measure = measureById(measureId)!;
  const policy = ensurePolicy(state);
  const notes: string[] = [];
  const news: NewsItem[] = [];

  applyEffects(state, measure.effects);
  if (measure.delayed) {
    state.pendingEffects = ensureMutable(state.pendingEffects);
    state.pendingEffects.push({
      id: `policy-${measure.id}`,
      dueTurn: state.turn + measure.delayed.turns,
      description: measure.delayed.note.en,
      effects: measure.delayed.effects,
      news: [
        {
          outlet: "peninsula",
          headline: measure.delayed.note.en,
          category: "politics",
        },
      ],
    });
    notes.push(measure.delayed.note.en);
  }

  for (const [blocId, delta] of Object.entries(measure.anger ?? {})) {
    addAnger(state, blocId, delta);
  }

  policy.enacted[measure.id] = state.turn;
  state.flags = { ...state.flags, [`policy.${measure.id}`]: true };
  state.decisions = ensureMutable(state.decisions);
  state.decisions.push({
    id: `policy-${measure.id}`,
    turn: state.turn,
    chapter: state.chapter,
    eventTitle: `Policy: ${measure.title.en}`,
    optionId: "enact",
    optionLabel: measure.title.en,
    summary: measure.summary.en,
  });
  news.push({
    id: `policy-${measure.id}-${state.turn}`,
    turn: state.turn,
    outlet: "peninsula",
    headline: measure.title.en,
    body: measure.summary.en,
    category: "politics",
  });
  state.news = ensureMutable(state.news);
  state.news.push(...news);
  return { measure, notes, news };
}

/* --- faction anger (shared by policy, bills and cabinet) ------------------- */

/** Reads the shared coalition-anger table, materialising the slice if needed. */
export function ensureAnger(state: GameState): Record<string, number> {
  if (!state.cabinetState) state.cabinetState = { appointments: {} };
  if (!state.cabinetState.factionAnger) state.cabinetState.factionAnger = {};
  return state.cabinetState.factionAnger;
}

export function angerOf(state: GameState, blocId: string): number {
  return state.cabinetState?.factionAnger?.[blocId] ?? 0;
}

export function addAnger(state: GameState, blocId: string, delta: number): void {
  const anger = ensureAnger(state);
  anger[blocId] = Math.max(0, Math.min(100, (anger[blocId] ?? 0) + delta));
}

/** The monthly mood pass: anger cools, fragile coalitions leak defectors. */
export function tickCoalitionMood(state: GameState, roll: number): { defectedFrom?: string } {
  const anger = ensureAnger(state);
  for (const key of Object.keys(anger)) {
    anger[key] = Math.max(0, anger[key] - 2);
  }
  if (state.politics.coalitionStability < 30 && roll < 0.25) {
    const blocs = Object.entries(anger).filter(([, v]) => v >= 20);
    const from = (blocs.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ph");
    state.parliament = state.parliament ?? { bills: [] };
    state.parliament.defections = [
      ...(state.parliament.defections ?? []),
      { turn: state.turn, from, to: "pn" },
    ];
    state.politics.coalitionStability = Math.max(0, state.politics.coalitionStability - 3);
    state.politics.oppositionStrength = Math.min(100, state.politics.oppositionStrength + 2);
    state.news = ensureMutable(state.news);
    state.news.push({
      id: `defection-${from}-${state.turn}`,
      turn: state.turn,
      outlet: "borneo",
      headline: "Another MP crosses the floor as the bloc frays",
      body: `A backbencher from ${from.toUpperCase()} has joined the opposition benches, citing "broken promises".`,
      category: "politics",
    });
    return { defectedFrom: from };
  }
  return {};
}
