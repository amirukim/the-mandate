import type { GameState } from "../types/game";
import type { BudgetState } from "../types/game";
import type { LText } from "../data/lt";
import { isBudgetTurn, clamp } from "./calendar";

/**
 * The Budget Office (v2 Phase 7). The envelope is the federal revenue the
 * simulation already tracks; the lines are shares of it. The mix the PM sets
 * becomes the budget stance the economy model reads (`budget2027` flag), and
 * tabling runs a supply vote through the parliament engine — lose it and the
 * government falls. All numbers are shares of the envelope, not RM billions,
 * so the model stays legible.
 */
export interface BudgetLine {
  id: string;
  label: LText;
  note: LText;
}

export const BUDGET_LINES: BudgetLine[] = [
  {
    id: "health",
    label: { en: "Health", ms: "Kesihatan" },
    note: { en: "Clinics, hospital queues, the HPV and dialysis programmes.", ms: "Klinik, barisan hospital, program HPV dan dialisis." },
  },
  {
    id: "education",
    label: { en: "Education", ms: "Pendidikan" },
    note: { en: "Schools, matriculation, the TVET push.", ms: "Sekolah, matrikulasi, dorongan TVET." },
  },
  {
    id: "security",
    label: { en: "Security", ms: "Keselamatan" },
    note: { en: "Police, armed forces, border and cyber commands.", ms: "Polis, angkatan tentera, sempadan dan pemerintahan siber." },
  },
  {
    id: "infrastructure",
    label: { en: "Infrastructure", ms: "Infrastruktur" },
    note: { en: "Rail, rural roads, the east-coast corridors.", ms: "Rel, jalan luar bandar, koridor pantai timur." },
  },
  {
    id: "subsidy",
    label: { en: "Subsidy & aid", ms: "Subsidi & bantuan" },
    note: { en: "Fuel, food and STR transfers. The loudest line in the House.", ms: "Minyak, makanan dan pindahan STR. Perkara paling bising di Dewan." },
  },
  {
    id: "transfer",
    label: { en: "Federal transfers", ms: "Pindahan persekutuan" },
    note: { en: "What the states and local councils receive.", ms: "Apa yang diterima negeri dan pihak berkuasa tempatan." },
  },
];

/** Shares of the envelope; the whole budget must sum within 100%. */
export const ENVELOPE = 100;
export const LINE_MIN = 4;
export const LINE_MAX = 40;

export const DEFAULT_ALLOCATIONS: Record<string, number> = {
  health: 18,
  education: 16,
  security: 12,
  infrastructure: 14,
  subsidy: 22,
  transfer: 10,
};

export function ensureBudget(state: GameState): BudgetState {
  if (!state.budget) state.budget = { allocations: { ...DEFAULT_ALLOCATIONS } };
  if (!state.budget.allocations) state.budget.allocations = { ...DEFAULT_ALLOCATIONS };
  return state.budget;
}

export function budgetSum(allocations: Record<string, number>): number {
  return Object.values(allocations).reduce((sum, v) => sum + v, 0);
}

export function withinEnvelope(allocations: Record<string, number>): boolean {
  return budgetSum(allocations) <= ENVELOPE;
}

export function setAllocation(state: GameState, lineId: string, value: number): void {
  const budget = ensureBudget(state);
  budget.allocations = { ...budget.allocations, [lineId]: clamp(Math.round(value), LINE_MIN, LINE_MAX) };
}

export type BudgetStance = "expansion" | "investment" | "consolidation" | "balanced";

export const STANCE_LABEL: Record<BudgetStance, LText> = {
  expansion: { en: "Expansion", ms: "Pengembangan" },
  investment: { en: "Investment", ms: "Pelaburan" },
  consolidation: { en: "Consolidation", ms: "Penyatuan" },
  balanced: { en: "Balanced", ms: "Seimbang" },
};

/** The reading the press and the ministries put on the mix. */
export function deriveStance(allocations: Record<string, number>): BudgetStance {
  const a = allocations;
  if ((a.subsidy ?? 0) <= 14 && (a.infrastructure ?? 0) >= 18) return "consolidation";
  if ((a.health ?? 0) + (a.education ?? 0) >= 38 && (a.subsidy ?? 0) >= 18) return "expansion";
  if ((a.infrastructure ?? 0) >= 20 && (a.subsidy ?? 0) <= 18) return "investment";
  return "balanced";
}

/** The deficit movement each stance carries when the budget passes. */
const STANCE_DEFICIT: Record<BudgetStance, number> = {
  expansion: 0.5,
  investment: 0.3,
  consolidation: -0.4,
  balanced: 0,
};

export interface BudgetTableResult {
  stance: BudgetStance;
  passed: boolean;
}

/**
 * Tables the budget as a supply bill. On a pass the stance flag is written for
 * the economy model; on a defeat the parliament engine marks the government
 * as fallen (losing supply is losing office).
 */
export function tableBudget(state: GameState, runSupplyVote: () => { passed: boolean }): BudgetTableResult {
  const budget = ensureBudget(state);
  const stance = deriveStance(budget.allocations ?? {});
  const result = runSupplyVote();
  if (result.passed) {
    state.flags = { ...state.flags, budget2027: stance === "balanced" ? "balanced" : stance };
    budget.passedTurn = state.turn;
  }
  return { stance, passed: result.passed };
}

/** True when the ordinary budget season (October) is this month. */
export function isBudgetSeason(turn: number): boolean {
  return isBudgetTurn(turn);
}

/** The standing deficit signal the stance implies, shown as a preview. */
export function stanceDeficit(stance: BudgetStance): number {
  return STANCE_DEFICIT[stance];
}
