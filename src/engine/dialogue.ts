import type { Effect, GameFlags, GameState } from "../types/game";
import { applyEffects } from "./effects";

/**
 * Dialogue node graph — the v2 narration model (plan C-3/C-4, decision D-08).
 *
 * A graph is plain data: nodes are lines, choice sets, or an end. Speakers are
 * character IDs; every player-facing string carries EN and MS; conditions read
 * the live GameState (stats, flags, relationships, decisions) through a
 * structured evaluator — no expression strings, no eval. Choices apply their
 * effects and flags exactly once, on the transition, and every pick is
 * recorded as a callback flag other graphs can condition on later.
 *
 * The legacy adapter (`dialogue-legacy.ts`) converts the 15 v1 GameEventDefs
 * into this shape; those still finalise through `chooseOption` so v1 behaviour
 * is unchanged by construction.
 */

export type DialogueExpression = "neutral" | "concerned" | "pleased" | "stern";

export interface LocalizedText {
  en: string;
  ms: string;
}

export type DialogueCondition =
  | { kind: "stat"; target: string; gte?: number; lte?: number }
  | { kind: "flag"; flag: string; equals?: string | number | boolean }
  | { kind: "relationship"; characterId: string; gte?: number; lte?: number }
  | { kind: "decision"; eventId: string; optionId?: string }
  | { kind: "all"; of: DialogueCondition[] }
  | { kind: "any"; of: DialogueCondition[] }
  | { kind: "not"; of: DialogueCondition };

export interface DialogueChoice {
  id: string;
  label: LocalizedText;
  to: string;
  /** Gate. A failing choice is hidden unless lockedReason is set, then shown locked. */
  if?: DialogueCondition;
  lockedReason?: LocalizedText;
  /** Applied once, on the transition to `to`. */
  effects?: Effect[];
  /** Flags written on the transition (in addition to the automatic callback flag). */
  setFlags?: GameFlags;
}

export interface DialogueLineNode {
  kind: "line";
  speaker: string;
  role?: LocalizedText;
  expression?: DialogueExpression;
  text: LocalizedText;
  next?: string;
}

export interface DialogueChoicesNode {
  kind: "choices";
  prompt?: LocalizedText;
  choices: DialogueChoice[];
}

export interface DialogueEndNode {
  kind: "end";
}

export type DialogueNode = DialogueLineNode | DialogueChoicesNode | DialogueEndNode;

export interface DialogueGraph {
  /** Stable graph id; callback flags are keyed `dialog:<id>:<choiceId>`. */
  id: string;
  start: string;
  nodes: Record<string, DialogueNode>;
  /** Marks adapter output so the UI finalises through the v1 option path. */
  source?: { kind: "legacy-event"; eventId: string };
}

/* ------------------------------------------------------------------ */
/* Conditions — structured, evaluated against the live GameState       */
/* ------------------------------------------------------------------ */

function resolveTarget(state: GameState, target: string): number | null {
  let cur: unknown = state;
  for (const part of target.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return typeof cur === "number" ? cur : null;
}

export function evaluateCondition(state: GameState, cond: DialogueCondition): boolean {
  switch (cond.kind) {
    case "stat": {
      const v = resolveTarget(state, cond.target);
      if (v === null) return false;
      if (cond.gte !== undefined && v < cond.gte) return false;
      if (cond.lte !== undefined && v > cond.lte) return false;
      return true;
    }
    case "flag": {
      const v = state.flags[cond.flag];
      if (cond.equals !== undefined) return v === cond.equals;
      return Boolean(v);
    }
    case "relationship": {
      const v = state.characters[cond.characterId]?.relationship ?? 50;
      if (cond.gte !== undefined && v < cond.gte) return false;
      if (cond.lte !== undefined && v > cond.lte) return false;
      return true;
    }
    case "decision":
      return state.decisions.some(
        (d) => d.id === cond.eventId && (cond.optionId === undefined || d.optionId === cond.optionId),
      );
    case "all":
      return cond.of.every((c) => evaluateCondition(state, c));
    case "any":
      return cond.of.some((c) => evaluateCondition(state, c));
    case "not":
      return !evaluateCondition(state, cond.of);
  }
}

/* ------------------------------------------------------------------ */
/* Runner — pure state machine; UI drives advance/choose               */
/* ------------------------------------------------------------------ */

export interface DialogueLineView {
  kind: "line";
  nodeId: string;
  speaker: string;
  role?: LocalizedText;
  expression: DialogueExpression;
  text: LocalizedText;
  next?: string;
}

export interface DialogueChoiceView {
  id: string;
  label: LocalizedText;
  locked: boolean;
  lockedReason?: LocalizedText;
}

export interface DialogueChoicesView {
  kind: "choices";
  nodeId: string;
  prompt?: LocalizedText;
  choices: DialogueChoiceView[];
}

export interface DialogueEndView {
  kind: "end";
}

export type DialogueView = DialogueLineView | DialogueChoicesView | DialogueEndView;

function nodeView(state: GameState, graph: DialogueGraph, nodeId: string): DialogueView {
  const node = graph.nodes[nodeId];
  if (!node) throw new Error(`dialogue: unknown node "${nodeId}" in graph "${graph.id}"`);
  if (node.kind === "line") {
    return {
      kind: "line",
      nodeId,
      speaker: node.speaker,
      role: node.role,
      expression: node.expression ?? "neutral",
      text: node.text,
      next: node.next,
    };
  }
  if (node.kind === "choices") {
    const choices = node.choices.map((choice) => {
      const gated = choice.if ? !evaluateCondition(state, choice.if) : false;
      const locked = gated && choice.lockedReason !== undefined;
      const hidden = gated && choice.lockedReason === undefined;
      return hidden
        ? null
        : {
            id: choice.id,
            label: choice.label,
            locked,
            lockedReason: locked ? choice.lockedReason : undefined,
          };
    });
    return { kind: "choices", nodeId, prompt: node.prompt, choices: choices.filter(Boolean) as DialogueChoicesView["choices"] };
  }
  return { kind: "end" };
}

/** Enter a node: returns what the UI should show. Lines wait for advance. */
export function dialogueEnter(state: GameState, graph: DialogueGraph, nodeId: string): DialogueView {
  return nodeView(state, graph, nodeId);
}

/** Continue past a line node (or re-enter a target directly). */
export function dialogueAdvance(state: GameState, graph: DialogueGraph, nodeId: string): DialogueView {
  const node = graph.nodes[nodeId];
  if (!node) throw new Error(`dialogue: unknown node "${nodeId}" in graph "${graph.id}"`);
  if (node.kind === "line" && node.next) return nodeView(state, graph, node.next);
  if (node.kind === "line") return { kind: "end" };
  return nodeView(state, graph, nodeId);
}

/**
 * Pick a choice on a choices node. Effects and flags apply here — once, on the
 * transition — and the pick is recorded as a callback flag so later graphs can
 * condition on it.
 */
export function dialogueChoose(state: GameState, graph: DialogueGraph, nodeId: string, choiceId: string): DialogueView {
  const node = graph.nodes[nodeId];
  if (!node || node.kind !== "choices") throw new Error(`dialogue: node "${nodeId}" is not a choice set`);
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`dialogue: unknown choice "${choiceId}" on node "${nodeId}"`);
  if (choice.if && !evaluateCondition(state, choice.if)) {
    throw new Error(`dialogue: choice "${choiceId}" is locked`);
  }
  state.flags = { ...state.flags, [`dialog:${graph.id}:${choice.id}`]: true };
  if (choice.setFlags) state.flags = { ...state.flags, ...choice.setFlags };
  if (choice.effects) applyEffects(state, choice.effects);
  return nodeView(state, graph, choice.to);
}

/* ------------------------------------------------------------------ */
/* Validation — run at build time in the self-checks, never at play    */
/* ------------------------------------------------------------------ */

export interface DialogueProblems {
  missingTargets: string[];
  deadEnds: string[];
  unreachable: string[];
  missingText: string[];
}

function hasText(t: LocalizedText | undefined): boolean {
  return Boolean(t && t.en.length > 0 && t.ms.length > 0);
}

/** Structural check: targets exist, no dead ends, nothing unreachable, every
 *  player-facing string carries EN and MS. Returns the problem lists; empty
 *  everything means the graph is sound. */
export function validateDialogueGraph(graph: DialogueGraph): DialogueProblems {
  const problems: DialogueProblems = { missingTargets: [], deadEnds: [], unreachable: [], missingText: [] };
  const ids = Object.keys(graph.nodes);
  if (!graph.nodes[graph.start]) {
    problems.missingTargets.push(`start:${graph.start}`);
    return problems;
  }
  const reachable = new Set<string>([graph.start]);
  const queue = [graph.start];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = graph.nodes[id];
    if (!node) continue;
    const targets: string[] = [];
    if (node.kind === "line") {
      if (node.next) targets.push(node.next);
      if (!hasText(node.text)) problems.missingText.push(`${id}.text`);
    } else if (node.kind === "choices") {
      if (node.prompt && !hasText(node.prompt)) problems.missingText.push(`${id}.prompt`);
      if (node.choices.length === 0) problems.deadEnds.push(id);
      for (const choice of node.choices) {
        targets.push(choice.to);
        if (!hasText(choice.label)) problems.missingText.push(`${id}.${choice.id}.label`);
        if (choice.lockedReason && !hasText(choice.lockedReason)) problems.missingText.push(`${id}.${choice.id}.lockedReason`);
      }
    }
    for (const target of targets) {
      if (!graph.nodes[target]) problems.missingTargets.push(`${id}->${target}`);
      else if (!reachable.has(target)) {
        reachable.add(target);
        queue.push(target);
      }
    }
  }
  for (const id of ids) {
    const node = graph.nodes[id];
    if (node.kind === "end") continue;
    if (node.kind === "line" && !node.next) problems.deadEnds.push(id);
  }
  for (const id of ids) {
    if (!reachable.has(id) && graph.nodes[id].kind !== "end") problems.unreachable.push(id);
  }
  return problems;
}

export function graphIsSound(graph: DialogueGraph): boolean {
  const p = validateDialogueGraph(graph);
  return (
    p.missingTargets.length === 0 && p.deadEnds.length === 0 && p.unreachable.length === 0 && p.missingText.length === 0
  );
}
