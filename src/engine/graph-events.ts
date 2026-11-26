import type { GameState, NewsCategory } from "../types/game";
import type { DialogueGraph, DialogueView, LocalizedText } from "./dialogue";
import { dialogueAdvance, dialogueChoose, dialogueEnter } from "./dialogue";
import { ensureMutable } from "./array-guard";
import type { SchedulableItem } from "./narrative";

/**
 * The bridge between the desk queue and the v2 dialogue runner (Phase 8).
 * A graph event is data: meta describes when it lands and how it reads in the
 * queue; the graph carries the scene. Choices apply their own effects and
 * flags through the standard dialogue runner; finalisation records the
 * decision, the wire item, and the recurrence marker — the same bookkeeping
 * chooseOption does for legacy events.
 */
export interface GraphEventMeta {
  id: string;
  kind: "chapter" | "recurring";
  chapter?: number;
  window?: [number, number];
  priority: number;
  minGap?: number;
  schedule?: "budget" | "monsoon";
  title: LocalizedText;
  location: LocalizedText;
  category: NewsCategory;
}

export interface GraphEventDef {
  meta: GraphEventMeta;
  graph: DialogueGraph;
}

export interface GraphNews {
  outlet: "peninsula" | "borneo" | "sinar";
  headline: LocalizedText;
}

/** A choice may carry a wire line in the authoring layer. */
export interface AuthoredChoiceExtras {
  news?: GraphNews;
}

/** The registry, populated by src/data/dialogue. */
const REGISTRY = new Map<string, GraphEventDef>();

export function registerGraphEvents(events: readonly GraphEventDef[]): void {
  for (const e of events) REGISTRY.set(e.meta.id, e);
}

export function graphEventById(id: string): GraphEventDef | null {
  return REGISTRY.get(id) ?? null;
}

export function allGraphEvents(): GraphEventDef[] {
  return [...REGISTRY.values()];
}

export function isGraphEvent(id: string): boolean {
  return REGISTRY.has(id);
}

/** Scheduler view of every registered graph event. */
export function graphSchedulable(): SchedulableItem[] {
  return allGraphEvents().map((e) => ({
    id: e.meta.id,
    kind: e.meta.kind,
    chapter: e.meta.chapter,
    window: e.meta.window,
    priority: e.meta.priority,
    minGap: e.meta.minGap,
    schedule: e.meta.schedule,
  }));
}

/** Enter the event's graph: what the desk should show. */
export function beginGraphEvent(state: GameState, graph: DialogueGraph): DialogueView {
  return dialogueEnter(state, graph, graph.start);
}

/** Continue past a line. */
export function advanceGraphEvent(state: GameState, graph: DialogueGraph, nodeId: string): DialogueView {
  return dialogueAdvance(state, graph, nodeId);
}

export interface GraphFinalisation {
  view: DialogueView;
  decided: boolean;
  headline: LocalizedText | null;
}

/**
 * Pick a choice: the runner applies effects/flags/callback flags on the
 * transition, and the decision is recorded exactly once on the pick.
 */
export function chooseGraphEvent(state: GameState, graph: DialogueGraph, nodeId: string, choiceId: string, opts?: { news?: GraphNews; title?: string }): GraphFinalisation {
  const view = dialogueChoose(state, graph, nodeId, choiceId);
  const choice = graph.nodes[nodeId].kind === "choices"
    ? graph.nodes[nodeId].choices.find((c) => c.id === choiceId)
    : null;

  const label = choice?.label ?? { en: choiceId, ms: choiceId };
  state.decisions = ensureMutable(state.decisions);
  state.decisions.push({
    id: graph.id,
    turn: state.turn,
    chapter: state.chapter,
    eventTitle: opts?.title ?? graph.id,
    optionId: choiceId,
    optionLabel: label.en,
    summary: label.ms,
  });

  return { view, decided: true, headline: opts?.news?.headline ?? null };
}

/**
 * The desk bookkeeping when a graph event finishes: fired marker, recurrence
 * timestamp, wire item. The queue head is only removed once the UI confirms
 * the end screen (mirrors how legacy events keep their scene until continued).
 */
export function completeGraphEvent(state: GameState, graphId: string, headline: LocalizedText | null, category: NewsCategory, outlet: "peninsula" | "borneo" | "sinar" = "peninsula"): void {
  state.firedEvents = ensureMutable(state.firedEvents);
  if (!state.firedEvents.includes(graphId)) state.firedEvents.push(graphId);
  state.flags = { ...state.flags, [`lastFired:${graphId}`]: state.turn };
  if (headline) {
    state.news = ensureMutable(state.news);
    state.news.push({
      id: `${graphId}-${state.turn}`,
      turn: state.turn,
      outlet,
      headline: headline.en,
      category,
    });
  }
  // take it off the desk
  state.queuedEventIds = state.queuedEventIds.slice(1);
}
