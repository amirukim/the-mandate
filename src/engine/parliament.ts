import type { Effect, GameState, NewsItem, ParliamentBill, ParliamentState } from "../types/game";
import type { BillDef } from "../data/bills";
import { TOTAL_SEATS, MAJORITY, COALITIONS, coalitionById, type CoalitionDef } from "../data/parties";
import { applyEffects } from "./effects";
import { ensureMutable } from "./array-guard";
import { angerOf, addAnger } from "./policy";

/**
 * The parliament game (v2 Phase 7). Pure TS. The whip reads one number per
 * bloc — its anger — and turns it into arithmetic the player can audit line by
 * line: government benches defect to abstention as anger rises, opposition
 * abstentions soften, kingmakers decide on the government's standing. The seat
 * totals (222 / 112 majority / 148 two-thirds) never change; who fills them can.
 */
export function ensureParliament(state: GameState): ParliamentState {
  if (!state.parliament) state.parliament = { bills: [] };
  if (!state.parliament.bills) state.parliament.bills = [];
  return state.parliament;
}

const TWO_THIRDS = Math.ceil((TOTAL_SEATS * 2) / 3); // 148
export { TWO_THIRDS };

export interface BlocVote {
  blocId: string;
  seats: number;
  position: "for" | "against" | "abstain";
  /** Seats withheld from the bloc line by anger (shown as defections). */
  defected: number;
}

export interface VoteArithmetic {
  forVotes: number;
  againstVotes: number;
  abstain: number;
  threshold: number;
  kindLabel: "majority" | "two-thirds";
  pass: boolean;
  blocs: BlocVote[];
}

function thresholdFor(bill: { kind: BillDef["kind"] | "confidence" }): { threshold: number; label: "majority" | "two-thirds" } {
  return bill.kind === "constitution" ? { threshold: TWO_THIRDS, label: "two-thirds" } : { threshold: MAJORITY, label: "majority" };
}

/**
 * How the blocs line up. Deterministic from state + bill, so the forecast the
 * player reads before a vote is exactly the tally the vote produces.
 */
export function whip(state: GameState, bill: { kind: BillDef["kind"] | "confidence"; appease?: Record<string, number> }): VoteArithmetic {
  const { threshold, label } = thresholdFor(bill);
  const blocs: BlocVote[] = [];
  let forVotes = 0;
  let againstVotes = 0;
  let abstain = 0;

  for (const c of COALITIONS) {
    const anger = angerOf(state, c.id);
    let forN = 0;
    let againstN = 0;
    let abstainN = 0;
    let defected = 0;
    if (c.status === "government") {
      // Anger above 30 peels seats off the bloc line into abstention.
      defected = anger > 30 ? Math.min(c.seats, Math.round((c.seats * (anger - 30)) / 70)) : 0;
      forN = c.seats - defected;
      abstainN = defected;
    } else if (c.status === "opposition") {
      // The courted bloc abstains in proportion to what the bill offers it.
      const soften = bill.appease?.[c.id] ?? 0;
      defected = soften > 0 ? Math.min(c.seats, Math.round((c.seats * soften) / 15)) : 0;
      againstN = c.seats - defected;
      abstainN = defected;
    } else {
      // Kingmakers back a government that is holding up, and posture otherwise.
      const approve = state.politics.approval >= 45 || state.politics.coalitionStability >= 60;
      forN = approve ? c.seats : 0;
      abstainN = approve ? 0 : c.seats;
    }
    forVotes += forN;
    againstVotes += againstN;
    abstain += abstainN;
    blocs.push({
      blocId: c.id,
      seats: c.seats,
      position: forN > 0 ? "for" : againstN > 0 ? "against" : "abstain",
      defected,
    });
  }

  return {
    forVotes,
    againstVotes,
    abstain,
    threshold,
    kindLabel: label,
    pass: forVotes > againstVotes && forVotes >= threshold,
    blocs,
  };
}

/** A tableable bill: the data bills, or the dynamically built supply/confidence bills. */
export type TableableBill = Omit<BillDef, "kind"> & { kind: BillDef["kind"] | "confidence" };

export interface VoteOutcome {
  bill: ParliamentBill;
  arithmetic: VoteArithmetic;
  passed: boolean;
  news: NewsItem[];
}

function billRecord(state: GameState, bill: TableableBill, arithmetic: VoteArithmetic): ParliamentBill {
  return {
    id: bill.id,
    title: bill.title.en,
    turn: state.turn,
    kind: bill.kind === "supply" ? "supply" : bill.kind,
    votes: { for: arithmetic.forVotes, against: arithmetic.againstVotes, abstain: arithmetic.abstain },
    passed: arithmetic.pass,
  };
}

/**
 * Tables and immediately divides on a bill. On a pass: effects apply and the
 * bill's anger/appease entries land. On a supply or confidence defeat the
 * government falls — that is the constitutional arithmetic, not a game over
 * whim — and the endings classifier reads the flag.
 */
export function callVote(state: GameState, bill: TableableBill): VoteOutcome {
  const parliament = ensureParliament(state);
  const arithmetic = whip(state, bill);
  const passed = arithmetic.pass;
  const record = billRecord(state, bill, arithmetic);
  parliament.bills = [...parliament.bills, record];
  const news: NewsItem[] = [];

  if (passed) {
    const effects: Effect[] = [...bill.effects];
    applyEffects(state, effects);
    for (const [blocId, delta] of Object.entries(bill.anger ?? {})) addAnger(state, blocId, delta);
    for (const [blocId, delta] of Object.entries(bill.appease ?? {})) addAnger(state, blocId, -delta);
    state.flags = { ...state.flags, [`bill.${bill.id}`]: "passed" };
    news.push({
      id: `bill-${bill.id}-${state.turn}`,
      turn: state.turn,
      outlet: "peninsula",
      headline: `${bill.title.en} passes ${arithmetic.forVotes}–${arithmetic.againstVotes}`,
      category: "politics",
    });
  } else {
    const hit = bill.kind === "supply" ? -9 : bill.kind === "constitution" ? -2 : -3;
    state.politics.coalitionStability = Math.max(0, state.politics.coalitionStability + hit);
    state.flags = { ...state.flags, [`bill.${bill.id}`]: "failed" };
    news.push({
      id: `bill-${bill.id}-failed-${state.turn}`,
      turn: state.turn,
      outlet: "sinar",
      headline: `${bill.title.en} defeated ${arithmetic.againstVotes}–${arithmetic.forVotes}`,
      category: "politics",
    });
    if (bill.kind === "supply" || bill.kind === "confidence") {
      state.flags = { ...state.flags, "parliament.confidenceLost": true };
      state.fallen = true;
    }
  }

  state.news = ensureMutable(state.news);
  state.news.push(...news);
  return { bill: record, arithmetic, passed, news };
}

/** A confidence motion in the government itself. */
export function moveConfidence(state: GameState): VoteOutcome {
  return callVote(state, {
    id: `confidence-${state.turn}`,
    kind: "confidence",
    title: { en: "Motion of confidence in the government", ms: "Usul percaya kepada kerajaan" },
    summary: { en: "The government stakes its life on the arithmetic of the House.", ms: "Kerajaan mempertaruhkan nyawanya pada aritmetik Dewan." },
    effects: [{ target: "politics.coalitionStability", delta: 5 }],
  });
}

/** Coalition lookup used by the vote UI. */
export function blocOf(id: string): CoalitionDef | undefined {
  return coalitionById(id);
}

export { MAJORITY, TOTAL_SEATS };
