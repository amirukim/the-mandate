import type { DialogueGraph, DialogueChoice, DialogueNode, LocalizedText, DialogueExpression } from "../../engine/dialogue";
import type { GraphEventDef, GraphEventMeta } from "../../engine/graph-events";

/**
 * Authoring helper for briefing scenes: intro line → decision → one resolution
 * line per choice. Every player-facing string is EN+MS inline (the Phase 8
 * parity rule); choices carry their own effects, flags and wire lines.
 */
export interface SceneLine {
  speaker: string;
  role?: LocalizedText;
  text: LocalizedText;
  expression?: DialogueExpression;
}

export function mkScene(
  id: string,
  intro: SceneLine,
  prompt: LocalizedText | undefined,
  choices: DialogueChoice[],
  resolutions: Record<string, SceneLine>,
): DialogueGraph {
  const nodes: Record<string, DialogueNode> = {
    intro: {
      kind: "line",
      speaker: intro.speaker,
      role: intro.role,
      text: intro.text,
      expression: intro.expression,
      next: "decision",
    },
    decision: { kind: "choices", prompt, choices: choices.map((c) => ({ ...c, to: `res-${c.id}` })) },
    out: { kind: "end" },
  };
  for (const [cid, res] of Object.entries(resolutions)) {
    nodes[`res-${cid}`] = {
      kind: "line",
      speaker: res.speaker,
      role: res.role,
      text: res.text,
      expression: res.expression,
      next: "out",
    };
  }
  return { id, start: "intro", nodes };
}

/** Meta + graph, bundled as a desk event. */
export function ev(meta: GraphEventMeta, graph: DialogueGraph): GraphEventDef {
  return { meta, graph };
}

/** Prompt lines reused across briefings. */
export const PROMPT: Record<string, LocalizedText> = {
  decide: { en: "How do you rule?", ms: "Bagaimana keputusan anda?" },
  decideBrief: { en: "What is the call?", ms: "Apa keputusannya?" },
  decidePress: { en: "What do you tell the room?", ms: "Apa yang anda beritahu bilik itu?" },
};

export const L = (en: string, ms: string): LocalizedText => ({ en, ms });
