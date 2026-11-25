import { CHARACTERS, type CharacterDef } from "../data/characters";
import { SUPPORTING_CAST } from "../data/cast-v2";
import type { GameEventDef } from "../types/narrative";
import { validateDialogueGraph, type DialogueGraph } from "./dialogue";

/**
 * Legacy adapter (plan C-3/C-4): converts a v1 `GameEventDef` into a dialogue
 * graph so the v1 events run on the v2 runner without changing their data.
 *
 * Equivalence contract: the graph's decision choices map 1:1 onto the event's
 * options (same ids, same labels, same order). Finalisation goes through the
 * v1 `chooseOption(optionId)`, so effects, delayed consequences, the decision
 * log and the wire are applied by the unchanged v1 code path. The
 * `legacy-adapter equivalence` self-check proves the mapping on all 15 events.
 */

const NAME_TO_ID: Record<string, string> = {};
for (const c of [...CHARACTERS, ...(SUPPORTING_CAST as CharacterDef[])]) NAME_TO_ID[c.name] = c.id;

export const GENERIC_SPEAKER = "generic";

/** Display name → character id; unknown speakers fall to the generic figure. */
export function characterIdForName(name: string): string {
  return NAME_TO_ID[name] ?? GENERIC_SPEAKER;
}

export function legacyEventGraph(event: GameEventDef): DialogueGraph {
  const nodes: DialogueGraph["nodes"] = {};
  const lineIds: string[] = [];

  event.dialogue.forEach((line, i) => {
    const id = `${event.id}.line.${i}`;
    lineIds.push(id);
    nodes[id] = {
      kind: "line",
      speaker: characterIdForName(line.speaker),
      role: { en: line.role, ms: line.role },
      expression: "neutral",
      // v1 text is displayed through eventDisplay (MS overrides live there),
      // so the graph carries the EN string in both slots for validation.
      text: { en: line.text, ms: line.text },
      next: `${event.id}.decision`,
    };
  });

  nodes[`${event.id}.decision`] = {
    kind: "choices",
    prompt: { en: event.title, ms: event.title },
    choices: event.options.map((option) => ({
      id: option.id,
      label: { en: option.label, ms: option.label },
      // finalisation stays on the v1 path: the UI calls chooseOption(optionId)
      to: `${event.id}.end`,
    })),
  };
  nodes[`${event.id}.end`] = { kind: "end" };

  // chain the lines; an event with no dialogue goes straight to the decision
  for (let i = 0; i < lineIds.length; i++) {
    const node = nodes[lineIds[i]];
    if (node.kind !== "line") continue;
    node.next = i + 1 < lineIds.length ? lineIds[i + 1] : `${event.id}.decision`;
  }
  if (lineIds.length === 0) nodes[`${event.id}.start`] = nodes[`${event.id}.decision`];

  const graph: DialogueGraph = {
    id: event.id,
    start: lineIds[0] ?? `${event.id}.decision`,
    nodes,
    source: { kind: "legacy-event", eventId: event.id },
  };
  const problems = validateDialogueGraph(graph);
  const bad = problems.missingTargets.length + problems.deadEnds.length + problems.missingText.length;
  if (bad > 0) throw new Error(`legacy adapter produced an unsound graph for ${event.id}`);
  return graph;
}
