import type { GameState } from "../types/game";
import { stateIsFallen } from "./calendar";

/**
 * The endings classifier (v2 Phase 7): reads a state and names the ending.
 * Fallen governments split by how they fell; surviving mandates split by how
 * much of the mandate survived. Grades are band-based, never new numbers.
 * Phase 8 fills the prose; the classification is already final.
 */
export type EndingId =
  | "fallen-vote"
  | "fallen-crisis"
  | "fallen-disgrace"
  | "mandate-strong"
  | "mandate-held"
  | "mandate-shaken";

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface MandateVerdict {
  id: EndingId;
  /** The ending title key into the i18n maps. */
  titleKey: string;
  /** Paragraph keys for the epilogue, in print order. */
  bodyKeys: string[];
  grades: { economy: Grade; social: Grade; politics: Grade; security: Grade; institutions: Grade };
}

function grade(value: number, bands: Array<[number, Grade]>): Grade {
  for (const [floor, grade] of bands) {
    if (value >= floor) return grade;
  }
  return bands[bands.length - 1][1];
}

function gradeBand(value: number): Grade {
  return grade(value, [[72, "A"], [60, "B"], [48, "C"], [36, "D"]]);
}

export function classifyMandate(state: GameState): MandateVerdict {
  if (state.fallen || stateIsFallen(state)) {
    if (state.flags["parliament.confidenceLost"]) {
      return {
        id: "fallen-vote",
        titleKey: "endings.fallenVote.title",
        bodyKeys: ["endings.fallenVote.body1", "endings.fallenVote.body2"],
        grades: mandateGrades(state),
      };
    }
    if (state.politics.approval <= 16 && state.politics.oppositionStrength >= 70) {
      return {
        id: "fallen-disgrace",
        titleKey: "endings.fallenDisgrace.title",
        bodyKeys: ["endings.fallenDisgrace.body1", "endings.fallenDisgrace.body2"],
        grades: mandateGrades(state),
      };
    }
    return {
      id: "fallen-crisis",
      titleKey: "endings.fallenCrisis.title",
      bodyKeys: ["endings.fallenCrisis.body1", "endings.fallenCrisis.body2"],
      grades: mandateGrades(state),
    };
  }

  const score =
    state.politics.approval * 0.3 +
    state.politics.coalitionStability * 0.25 +
    state.social.satisfaction * 0.2 +
    (state.economy.gdpGrowth * 8 + 20) * 0.15 +
    state.politics.institutionalIntegrity * 0.1;

  if (score >= 62) {
    return {
      id: "mandate-strong",
      titleKey: "endings.strong.title",
      bodyKeys: ["endings.strong.body1", "endings.strong.body2"],
      grades: mandateGrades(state),
    };
  }
  if (score >= 48) {
    return {
      id: "mandate-held",
      titleKey: "endings.held.title",
      bodyKeys: ["endings.held.body1", "endings.held.body2"],
      grades: mandateGrades(state),
    };
  }
  return {
    id: "mandate-shaken",
    titleKey: "endings.shaken.title",
    bodyKeys: ["endings.shaken.body1", "endings.shaken.body2"],
    grades: mandateGrades(state),
  };
}

function mandateGrades(state: GameState): MandateVerdict["grades"] {
  return {
    economy: gradeBand((state.economy.gdpGrowth + 6) * 9 + (6 - Math.abs(state.economy.fiscalDeficit - 3.2)) * 4),
    social: gradeBand(state.social.satisfaction * 0.6 + (100 - state.social.costOfLivingPressure) * 0.4),
    politics: gradeBand(state.politics.approval * 0.5 + state.politics.coalitionStability * 0.5),
    security: gradeBand((state.security.domesticStability + state.security.borderProtection) / 2),
    institutions: gradeBand(state.politics.institutionalIntegrity),
  };
}
