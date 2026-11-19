import type { Effect, EffectTarget, GameState } from "../types/game";
import { clamp } from "./calendar";

/**
 * Every mutable numeric leaf of GameState has declared bounds here. Applying an
 * unknown target throws, so event data typos surface in self-checks, not in play.
 */
export const TARGET_BOUNDS: Record<string, [number, number]> = {
  "economy.gdpGrowth": [-6, 9],
  "economy.inflation": [-1, 12],
  "economy.ringgit": [3.6, 5.4],
  "economy.debtToGdp": [40, 95],
  "economy.fiscalDeficit": [-2, 9],
  "economy.revenue": [250, 520],
  "economy.unemployment": [2, 8],
  "economy.householdIncome": [5000, 12000],
  "economy.fdi": [0, 100],
  "economy.productivity": [0, 100],
  "politics.approval": [0, 100],
  "politics.coalitionStability": [0, 100],
  "politics.oppositionStrength": [0, 100],
  "politics.institutionalIntegrity": [0, 100],
  "social.costOfLivingPressure": [0, 100],
  "social.povertyRate": [0, 20],
  "social.health": [0, 100],
  "social.education": [0, 100],
  "social.housingAffordability": [0, 100],
  "social.wageGrowth": [-2, 10],
  "social.satisfaction": [0, 100],
  "social.cohesion": [0, 100],
  "security.militaryReadiness": [0, 100],
  "security.policeEffectiveness": [0, 100],
  "security.cybersecurity": [0, 100],
  "security.maritimeSecurity": [0, 100],
  "security.borderProtection": [0, 100],
  "security.domesticStability": [0, 100],
  "federal.sabahSarawakAutonomy": [0, 100],
  "federal.ma63Progress": [0, 100],
  "federal.stateInfrastructure": [0, 100],
  "federal.revenueFairness": [0, 100],
};

function boundsFor(target: EffectTarget): [number, number] {
  if (target.startsWith("characters.")) return [0, 100];
  if (target.startsWith("federal.relations.")) return [0, 100];
  if (target.startsWith("diplomacy.")) return [0, 100];
  const bounds = TARGET_BOUNDS[target];
  if (!bounds) throw new Error(`Unknown effect target: ${target}`);
  return bounds;
}

function readTarget(state: GameState, target: EffectTarget): number {
  const parts = target.split(".");
  let node: unknown = state;
  for (const part of parts) {
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node !== "number") throw new Error(`Target is not numeric: ${target}`);
  return node;
}

function writeTarget(state: GameState, target: EffectTarget, value: number): void {
  const parts = target.split(".");
  let node: Record<string, unknown> = state as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = node[parts[i]];
    if (typeof next !== "object" || next === null) {
      throw new Error(`Bad path segment at ${parts[i]} in ${target}`);
    }
    node = next as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

export function applyEffect(state: GameState, effect: Effect): void {
  if (effect.target === "flags" || effect.target.startsWith("flags.")) {
    if (effect.set === undefined) throw new Error(`Flag effect needs set: ${effect.target}`);
    const key = effect.target === "flags" ? "" : effect.target.slice("flags.".length);
    if (key) state.flags[key] = effect.set;
    return;
  }
  const [min, max] = boundsFor(effect.target);
  if (effect.set !== undefined) {
    if (typeof effect.set !== "number") {
      throw new Error(`Numeric target needs numeric set: ${effect.target}`);
    }
    writeTarget(state, effect.target, clamp(effect.set, min, max));
    return;
  }
  if (effect.delta === undefined) {
    throw new Error(`Effect needs delta or set: ${effect.target}`);
  }
  writeTarget(state, effect.target, clamp(readTarget(state, effect.target) + effect.delta, min, max));
}

export function applyEffects(state: GameState, effects: readonly Effect[]): void {
  for (const effect of effects) applyEffect(state, effect);
}
