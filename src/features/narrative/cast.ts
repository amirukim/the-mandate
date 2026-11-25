import type { DialogueLine, SceneOption } from "../../types/narrative";
import { portraitArtId } from "../../data/portraits";
import type { Expression } from "../../data/pixel-portraits";

export interface CastMember {
  /** Display name as written in the event data (stable across locales). */
  speaker: string;
  role: string;
  /** Index of the member's first line, for the speaker strip. */
  idx: number;
  /** Art id, when the speaker is one of the ten officeholders. */
  characterId: string | null;
}

/**
 * The scene cast, in order of first appearance. Resolution goes through
 * character IDs once, here, so art lookup never depends on a mutable display
 * name. Unregistered speakers (a reporter, an aide) keep their name and get
 * the anonymous figure downstream.
 */
export function castOf(dialogue: DialogueLine[]): CastMember[] {
  const cast: CastMember[] = [];
  dialogue.forEach((line, idx) => {
    if (cast.some((c) => c.speaker === line.speaker)) return;
    cast.push({ speaker: line.speaker, role: line.role, idx, characterId: portraitArtId(line.speaker) });
  });
  return cast;
}

/**
 * Which face the stage figure wears while the consequences land. Rules from
 * the art bible, applied in order and never random:
 *   1. a refusal-shaped choice (refuse / reject / veto / decline / hold) is stern;
 *   2. any single immediate effect of -3 or worse is stern;
 *   3. a net-negative immediate effect is concerned;
 *   4. a net-positive immediate effect is pleased;
 *   5. otherwise the authored resting face.
 * Delayed consequences are not the player's call yet, so they don't count.
 */
export function expressionForOutcome(option: SceneOption): Expression {
  const refusal = /refuse|reject|veto|decline|hold|resist|shut|crack/i.test(option.id);
  let net = 0;
  let worst = 0;
  for (const consequence of option.consequences) {
    if (consequence.delayTurns !== undefined) continue;
    for (const effect of consequence.effects ?? []) {
      const delta = effect.delta ?? 0;
      net += delta;
      worst = Math.min(worst, delta);
    }
  }
  if (refusal || worst <= -3) return "stern";
  if (net < 0) return "concerned";
  if (net > 0) return "pleased";
  return "neutral";
}
