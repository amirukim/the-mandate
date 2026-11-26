import type { Effect, GameState } from "../types/game";
import type { LText } from "../data/lt";
import { CHARACTERS, characterById, type CharacterDef } from "../data/characters";
import { FIGURE_COALITION } from "../data/cast-v2";
import { applyEffects } from "./effects";
import { ensureMutable } from "./array-guard";
import { addAnger, angerOf } from "./policy";

/**
 * The cabinet table (v2 Phase 7). Posts expect certain coalitions and certain
 * people; the appointments write faction anger and small competence nudges.
 * A reshuffle is just another appointment — the old holder returns to the
 * back benches and the anger maths runs again.
 */
export interface CabinetPost {
  id: string;
  label: LText;
  /** Coalitions whose barons expect to hold this post. */
  expects: string[];
  /** Characters whose competence makes the post sing. */
  fit: string[];
  /** Small nudge when the appointee is a good fit. */
  fitEffect: Effect;
}

export const CABINET_POSTS: CabinetPost[] = [
  {
    id: "finance",
    label: { en: "Finance", ms: "Kewangan" },
    expects: ["ph", "bn"],
    fit: ["finance", "economicAdviser"],
    fitEffect: { target: "economy.revenue", delta: 3 },
  },
  {
    id: "home",
    label: { en: "Home Affairs", ms: "Dalam Negeri" },
    expects: ["bn"],
    fit: ["home", "nationalSecurity"],
    fitEffect: { target: "security.policeEffectiveness", delta: 3 },
  },
  {
    id: "education",
    label: { en: "Education", ms: "Pendidikan" },
    expects: ["ph"],
    fit: ["foreign"],
    fitEffect: { target: "social.education", delta: 3 },
  },
  {
    id: "health",
    label: { en: "Health", ms: "Kesihatan" },
    expects: ["ph"],
    fit: ["home"],
    fitEffect: { target: "social.health", delta: 3 },
  },
  {
    id: "borneo",
    label: { en: "Sabah & Sarawak Affairs", ms: "Hal Ehwal Sabah & Sarawak" },
    expects: ["gps", "grs"],
    fit: ["gpsPremier", "borneoMinister"],
    fitEffect: { target: "federal.ma63Progress", delta: 3 },
  },
  {
    id: "trade",
    label: { en: "International Trade", ms: "Perdagangan Antarabangsa" },
    expects: ["ph", "gps"],
    fit: ["finance", "foreign"],
    fitEffect: { target: "economy.fdi", delta: 3 },
  },
];

export function postById(id: string): CabinetPost | undefined {
  return CABINET_POSTS.find((p) => p.id === id);
}

/** The bloc a character answers to (main cast ids are self-describing). */
export function blocOfCharacter(characterId: string): string {
  return FIGURE_COALITION[characterId] ?? blocFromMainCast(characterId);
}

function blocFromMainCast(characterId: string): string {
  if (characterId === "gpsPremier") return "gps";
  if (characterId === "bnChair") return "bn";
  if (characterId === "oppositionLeader") return "pn";
  return "ph";
}

/** Characters eligible for appointment (the cabinet flag on the cast). */
export function eligibleCandidates(): CharacterDef[] {
  return CHARACTERS.filter((c) => c.cabinet);
}

export function holderOf(state: GameState, postId: string): string | null {
  return state.cabinetState?.appointments[postId] ?? null;
}

export function postOfCharacter(state: GameState, characterId: string): string | null {
  const appointments = state.cabinetState?.appointments ?? {};
  for (const [postId, holder] of Object.entries(appointments)) {
    if (holder === characterId) return postId;
  }
  return null;
}

export interface AppointmentResult {
  postId: string;
  characterId: string;
  previousHolder: string | null;
  goodFit: boolean;
  news: NewsItemLite[];
}

interface NewsItemLite {
  headline: string;
  body: string;
}

/**
 * Appoints (or reshuffles) a minister. Anger: barons of the expected blocs
 * bristle at an outsider; the opposition taking a seat angers the partners
 * most. A good fit applies the post's competence nudge; a poor one costs a
 * point of integrity. Mutates state in place.
 */
export function appoint(state: GameState, postId: string, characterId: string): AppointmentResult | null {
  const post = postById(postId);
  const character = characterById(characterId);
  if (!post || !character || !character.cabinet) return null;

  const prev = holderOf(state, postId);
  const movedFrom = postOfCharacter(state, characterId);
  if (!state.cabinetState) state.cabinetState = { appointments: {} };
  if (movedFrom && movedFrom !== postId) delete state.cabinetState.appointments[movedFrom];
  state.cabinetState.appointments[postId] = characterId;

  const bloc = blocOfCharacter(characterId);
  const goodFit = post.fit.includes(characterId);
  const news: NewsItemLite[] = [];

  // Faction anger: the expected blocs are passed over by an outsider.
  if (!post.expects.includes(bloc)) {
    for (const expected of post.expects) addAnger(state, expected, bloc === "pn" ? 8 : 3);
  }
  // The appointee's own bloc is placated a little.
  addAnger(state, bloc, -2);

  const effects: Effect[] = [];
  if (goodFit) effects.push(post.fitEffect);
  else effects.push({ target: "politics.institutionalIntegrity", delta: -1 });
  applyEffects(state, effects);

  // The appointee remembers it.
  const rel = state.characters[characterId];
  if (rel) rel.relationship = Math.min(100, rel.relationship + 4);

  news.push({
    headline: `${character.name} appointed to ${post.label.en}`,
    body: goodFit
      ? "The appointment is read as a safe pair of hands in the right place."
      : "Commentators wonder aloud whether the portfolio fits the appointee.",
  });

  state.news = ensureMutable(state.news);
  state.news.push({
    id: `cabinet-${postId}-${characterId}-${state.turn}`,
    turn: state.turn,
    outlet: "peninsula",
    headline: news[0].headline,
    body: news[0].body,
    category: "politics",
  });

  return { postId, characterId, previousHolder: prev, goodFit, news };
}

/** The anger meters the cabinet page shows. */
export function angerMeters(state: GameState): Array<{ blocId: string; anger: number }> {
  return ["ph", "bn", "gps", "grs", "pn"].map((blocId) => ({ blocId, anger: angerOf(state, blocId) }));
}
