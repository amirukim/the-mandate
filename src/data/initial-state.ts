import type { CampaignMeta, GameState } from "../types/game";
import { SAVE_VERSION } from "../types/game";
import { CHARACTERS } from "./characters";
import { STATES } from "./states";
import { dateLabel, chapterOf } from "../engine/calendar";

/**
 * The simulation's opening position, November 2026.
 * These figures are the fictional scenario's baseline, not real-world statistics.
 */
export function createInitialState(meta: CampaignMeta): GameState {
  const relations: Record<string, number> = {};
  for (const state of STATES) relations[state.id] = state.relation;

  const characters: GameState["characters"] = {};
  for (const character of CHARACTERS) {
    characters[character.id] = { relationship: character.baseRelationship, counselUsedTurn: null };
  }

  const state: GameState = {
    meta,
    turn: 0,
    chapter: chapterOf(0),
    phase: "scene",
    fallen: false,
    economy: {
      gdpGrowth: 4.7,
      inflation: 2.4,
      ringgit: 4.42,
      debtToGdp: 64.8,
      fiscalDeficit: 4.2,
      revenue: 368,
      unemployment: 3.3,
      householdIncome: 6540,
      fdi: 56,
      productivity: 52,
    },
    politics: {
      approval: 54,
      coalitionStability: 72,
      oppositionStrength: 46,
      institutionalIntegrity: 55,
    },
    social: {
      costOfLivingPressure: 62,
      povertyRate: 6.2,
      health: 58,
      education: 56,
      housingAffordability: 38,
      wageGrowth: 3.1,
      satisfaction: 49,
      cohesion: 61,
    },
    security: {
      militaryReadiness: 54,
      policeEffectiveness: 60,
      cybersecurity: 48,
      maritimeSecurity: 51,
      borderProtection: 49,
      domesticStability: 68,
    },
    diplomacy: {
      asean: 72,
      china: 64,
      unitedStates: 58,
      singapore: 74,
      indonesia: 66,
      europeanUnion: 55,
    },
    federal: {
      sabahSarawakAutonomy: 52,
      ma63Progress: 41,
      stateInfrastructure: 49,
      revenueFairness: 44,
      relations,
    },
    characters,
    flags: {},
    pendingEffects: [],
    firedEvents: [],
    queuedEventIds: [],
    history: [],
    news: [],
    decisions: [],
  };

  state.history.push({
    turn: 0,
    dateLabel: dateLabel(0),
    approval: state.politics.approval,
    gdpGrowth: state.economy.gdpGrowth,
    inflation: state.economy.inflation,
    unemployment: state.economy.unemployment,
    ringgit: state.economy.ringgit,
    fiscalDeficit: state.economy.fiscalDeficit,
    costOfLivingPressure: state.social.costOfLivingPressure,
    coalitionStability: state.politics.coalitionStability,
  });

  return state;
}

export function createCampaignMeta(playerName: string, campaignName: string, difficulty: CampaignMeta["difficulty"]): CampaignMeta {
  return {
    saveVersion: SAVE_VERSION,
    playerName: playerName.trim() || "The Prime Minister",
    campaignName: campaignName.trim() || "Unity Government 2026",
    seed: Math.floor(Math.random() * 2147483647),
    difficulty,
    startedAt: new Date().toISOString(),
  };
}
