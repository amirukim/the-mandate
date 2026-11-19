import type { GameState } from "../types/game";
import { clamp } from "./calendar";

export interface CounselResult {
  text: string;
  relationshipDelta: number;
}

type TitleFor = (eventId: string) => string | null;

const VOICES: Record<string, (subject: string) => string> = {
  chiefOfStaff: (s) =>
    `The building is already talking about ${s}. Handle it ${"deliberately"}: whichever way you lean, say it once, clearly, to your own people first.`,
  finance: (s) =>
    `Treasury has run the numbers on ${s}. Every ringgit promised on that file is a ringgit taken from another. Decide what loses, not just what wins.`,
  economicAdviser: (s) =>
    `On ${s}, the data is unromantic. Protect growth, guard purchasing power, and explain the tradeoff to the public before the opposition explains it for you.`,
  nationalSecurity: (s) =>
    `Security reads ${s} as manageable but loud. Quiet competence wins here; one visible failure will travel further than ten quiet wins.`,
  foreign: (s) =>
    `${s} will be read in Beijing, Washington and Jakarta within the hour. Consistency matters more than cleverness; partners reward predictability.`,
  home: (s) =>
    `${s} touches the ground machinery. The police and civil defence need clear orders and one voice. Keep politics out of their lane.`,
};

/**
 * Once per month per character, the PM may seek counsel. The advice is honest:
 * it names what is actually queued for this month, not flavour text.
 */
export function seekCounsel(
  state: GameState,
  characterId: string,
  titleFor: TitleFor,
): CounselResult | null {
  const characterState = state.characters[characterId];
  if (!characterState || characterState.counselUsedTurn === state.turn) return null;

  characterState.counselUsedTurn = state.turn;
  characterState.relationship = clamp(characterState.relationship + 1, 0, 100);

  const nextId = state.queuedEventIds[0] ?? null;
  const subject = nextId ? (titleFor(nextId) ?? "the month ahead") : "a quiet month";
  const voice = VOICES[characterId];
  const text = voice ? voice(subject) : "The matter deserves attention this month.";

  return { text, relationshipDelta: 1 };
}
