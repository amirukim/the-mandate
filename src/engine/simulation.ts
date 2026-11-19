import type { DelayedEffect, GameState, NewsItem } from "../types/game";
import type { Movement, TurnReport } from "../types/game";
import { clamp, dateLabel, round1, stateIsFallen } from "./calendar";
import { applyEffects } from "./effects";
import { makeRng, type Rng } from "./rng";

export type { Movement, TurnReport } from "../types/game";

function drift(value: number, target: number, rate: number, noise: number, rng: Rng): number {
  const pull = (target - value) * rate;
  return value + pull + rng.range(-noise, noise);
}

function movement(
  label: string,
  from: number,
  to: number,
  unit: string,
  goodDirection: "up" | "down",
): Movement {
  return { label, from: round1(from), to: round1(to), unit, goodDirection };
}

/**
 * One month of government. Applies economic drift, political weather, delayed
 * consequences, and produces the summary the player reads at month's end.
 * Mutates `state` in place; callers own the copy.
 */
export function endTurn(state: GameState): TurnReport {
  const before = snapshot(state);
  const rng = makeRng(state.meta.seed + state.turn * 7919);
  const turmoil = state.meta.difficulty === "turmoil";
  const headwind = turmoil ? 1.5 : 1;

  const f = state.flags;

  // --- Economy ---
  const economy = state.economy;
  const restructure = f.subsidyPolicy === "restructure" ? 1 : 0;
  const consolidation = f.budget2027 === "consolidation" ? 1 : 0;
  const investment = f.budget2027 === "investment" ? 1 : 0;

  const potential = 4.6 + restructure * 0.35 + investment * 0.25 - consolidation * 0.15;
  economy.gdpGrowth = clamp(drift(economy.gdpGrowth, potential, 0.35, 0.18, rng), -6, 9);

  const subsidyBroad = f.subsidyPolicy === "broad" ? 1 : 0;
  const subsidyCut = f.subsidyPolicy === "restructure" ? 1 : 0;
  const inflationTarget = 2.2 + subsidyBroad * 0.5 - subsidyCut * 0.1;
  economy.inflation = clamp(drift(economy.inflation, inflationTarget, 0.4, 0.15, rng), -1, 12);

  const ringgitTarget =
    4.12 + (economy.fiscalDeficit - 3.2) * 0.16 - (economy.fdi - 55) * 0.004;
  economy.ringgit = clamp(drift(economy.ringgit, ringgitTarget, 0.3, 0.012, rng), 3.6, 5.4);

  economy.debtToGdp = clamp(
    economy.debtToGdp + economy.fiscalDeficit * 0.12 - economy.gdpGrowth * 0.06,
    40,
    95,
  );
  economy.revenue = clamp(
    economy.revenue * (1 + (economy.gdpGrowth + economy.inflation) / 200) +
      (f.subsidyPolicy === "restructure" ? 1.2 : 0),
    250,
    520,
  );
  economy.unemployment = clamp(
    drift(economy.unemployment, 3.4 - (economy.gdpGrowth - 4.5) * 0.25, 0.3, 0.06, rng),
    2,
    8,
  );
  economy.householdIncome = clamp(
    economy.householdIncome * (1 + (economy.gdpGrowth * 0.35 + economy.inflation * 0.4) / 100),
    5000,
    12000,
  );
  economy.fdi = clamp(drift(economy.fdi, 58 + restructure * 6 + consolidation * 4, 0.2, 1.2, rng), 0, 100);
  economy.productivity = clamp(drift(economy.productivity, 55 + restructure * 8 + investment * 4, 0.12, 0.5, rng), 0, 100);

  // --- Cost of living and society ---
  const social = state.social;
  const pressureTarget =
    60 +
    (economy.inflation - 2.2) * 6 -
    restructure * 4 -
    (f.subsidyPolicy === "targeted" ? 3 : 0) -
    (f.subsidyPolicy === "broad" ? 8 : 0) +
    (f.wagePolicy === "defer" ? 3 : 0);
  social.costOfLivingPressure = clamp(
    drift(social.costOfLivingPressure, pressureTarget, 0.3, 1.1, rng) * (1 + (turmoil ? 0.004 : 0)),
    0,
    100,
  );
  social.povertyRate = clamp(
    drift(social.povertyRate, Math.max(2.5, 9 - (economy.gdpGrowth - 4) * 0.6), 0.25, 0.1, rng),
    0,
    20,
  );
  social.health = clamp(drift(social.health, f.budget2027 === "expansion" ? 62 : 57, 0.2, 0.5, rng), 0, 100);
  social.education = clamp(drift(social.education, f.budget2027 === "expansion" ? 60 : 55, 0.2, 0.5, rng), 0, 100);
  social.housingAffordability = clamp(
    drift(social.housingAffordability, 40 + consolidation * 3, 0.15, 0.7, rng),
    0,
    100,
  );
  social.wageGrowth = clamp(
    drift(
      social.wageGrowth,
      (f.wagePolicy === "raise2000" ? 4.6 : f.wagePolicy === "phase1850" ? 3.8 : 3.1) +
        economy.inflation * 0.2,
      0.3,
      0.2,
      rng,
    ),
    -2,
    10,
  );
  const satisfactionTarget =
    50 - (social.costOfLivingPressure - 55) * 0.35 + restructure * 2 + (social.cohesion - 60) * 0.2;
  social.satisfaction = clamp(drift(social.satisfaction, satisfactionTarget, 0.25, 1.0, rng), 0, 100);
  social.cohesion = clamp(drift(social.cohesion, 60 + restructure * 2, 0.2, 0.8, rng), 0, 100);

  // --- Politics ---
  const politics = state.politics;
  const approvalPull =
    55 -
    (social.costOfLivingPressure - 55) * 0.5 +
    (social.satisfaction - 50) * 0.2 +
    (state.federal.ma63Progress - 40) * 0.08 +
    (politics.institutionalIntegrity - 55) * 0.1;
  politics.approval = clamp(
    politics.approval + (approvalPull - politics.approval) * 0.22 + rng.range(-1.4, 1.4) * headwind,
    0,
    100,
  );
  const stabilityDrift =
    (state.federal.revenueFairness - 44) * 0.08 +
    (state.characters.gpsPremier ? (state.characters.gpsPremier.relationship - 55) * 0.06 : 0);
  politics.coalitionStability = clamp(
    politics.coalitionStability + (72 + stabilityDrift - politics.coalitionStability) * 0.18,
    0,
    100,
  );
  politics.oppositionStrength = clamp(
    drift(politics.oppositionStrength, 46 + (politics.approval < 40 ? 12 : 0), 0.2, 1.0, rng),
    0,
    100,
  );
  politics.institutionalIntegrity = clamp(
    drift(politics.institutionalIntegrity, 56, 0.15, 0.6, rng),
    0,
    100,
  );

  // --- Security, diplomacy, federal ---
  const sec = state.security;
  sec.militaryReadiness = clamp(drift(sec.militaryReadiness, 54 + (investment ? 3 : 0), 0.15, 0.6, rng), 0, 100);
  sec.policeEffectiveness = clamp(drift(sec.policeEffectiveness, 60, 0.15, 0.6, rng), 0, 100);
  sec.cybersecurity = clamp(drift(sec.cybersecurity, 48, 0.15, 0.7, rng), 0, 100);
  sec.maritimeSecurity = clamp(drift(sec.maritimeSecurity, f.maritimePosture === "buildup" ? 58 : 51, 0.15, 0.7, rng), 0, 100);
  sec.borderProtection = clamp(drift(sec.borderProtection, 50, 0.15, 0.7, rng), 0, 100);
  sec.domesticStability = clamp(
    drift(sec.domesticStability, 68 - (social.costOfLivingPressure - 60) * 0.15, 0.2, 0.8, rng),
    0,
    100,
  );

  const dip = state.diplomacy;
  const dipTarget = { asean: 72, china: 64, unitedStates: 58, singapore: 74, indonesia: 66, europeanUnion: 55 };
  (Object.keys(dipTarget) as Array<keyof typeof dipTarget>).forEach((key) => {
    dip[key] = clamp(drift(dip[key], dipTarget[key], 0.18, 0.7, rng), 0, 100);
  });

  const fed = state.federal;
  fed.ma63Progress = clamp(drift(fed.ma63Progress, f.ma63Track === "grant" ? 52 : 44, 0.15, 0.6, rng), 0, 100);
  fed.sabahSarawakAutonomy = clamp(drift(fed.sabahSarawakAutonomy, f.ma63Track === "grant" ? 58 : 52, 0.15, 0.6, rng), 0, 100);
  fed.stateInfrastructure = clamp(drift(fed.stateInfrastructure, investment ? 54 : 49, 0.15, 0.6, rng), 0, 100);
  fed.revenueFairness = clamp(drift(fed.revenueFairness, f.ma63Track === "grant" ? 50 : 44, 0.15, 0.6, rng), 0, 100);

  // --- Delayed consequences now due ---
  const due: DelayedEffect[] = [];
  const remaining: DelayedEffect[] = [];
  const nextTurn = state.turn + 1;
  for (const effect of state.pendingEffects) {
    if (effect.dueTurn <= nextTurn) due.push(effect);
    else remaining.push(effect);
  }
  state.pendingEffects = remaining;

  const headlines: NewsItem[] = [];
  for (const effect of due) {
    applyEffects(state, effect.effects);
    if (effect.news) {
      for (const item of effect.news) {
        headlines.push({ ...item, id: `${effect.id}-${item.outlet}-${state.turn}`, turn: state.turn });
      }
    }
  }

  // Advance the month and record history.
  state.turn = nextTurn;
  const after = snapshot(state);
  const newDate = dateLabel(state.turn);
  state.history.push({
    turn: state.turn,
    dateLabel: newDate,
    approval: after.approval,
    gdpGrowth: after.gdpGrowth,
    inflation: after.inflation,
    unemployment: after.unemployment,
    ringgit: after.ringgit,
    fiscalDeficit: after.deficit,
    costOfLivingPressure: after.pressure,
    coalitionStability: after.stability,
  });
  state.chapter = state.turn < 4 ? 1 : 2;

  state.fallen = stateIsFallen(state);

  return {
    turn: state.turn,
    dateLabel: newDate,
    movements: buildMovements(before, after),
    delayedNotes: due.map((d) => d.description),
    headlines,
    fallen: state.fallen,
  };
}

interface Snapshot {
  approval: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  ringgit: number;
  deficit: number;
  pressure: number;
  stability: number;
}

function snapshot(state: GameState): Snapshot {
  return {
    approval: state.politics.approval,
    gdpGrowth: state.economy.gdpGrowth,
    inflation: state.economy.inflation,
    unemployment: state.economy.unemployment,
    ringgit: state.economy.ringgit,
    deficit: state.economy.fiscalDeficit,
    pressure: state.social.costOfLivingPressure,
    stability: state.politics.coalitionStability,
  };
}

function buildMovements(a: Snapshot, b: Snapshot): Movement[] {
  return [
    movement("Public approval", a.approval, b.approval, "%", "up"),
    movement("GDP growth", a.gdpGrowth, b.gdpGrowth, "%", "up"),
    movement("Inflation", a.inflation, b.inflation, "%", "down"),
    movement("Unemployment", a.unemployment, b.unemployment, "%", "down"),
    movement("Ringgit vs USD", a.ringgit, b.ringgit, "RM", "down"),
    movement("Fiscal deficit", a.deficit, b.deficit, "% GDP", "down"),
    movement("Cost of living pressure", a.pressure, b.pressure, "idx", "down"),
    movement("Coalition stability", a.stability, b.stability, "idx", "up"),
  ];
}

/** Fictional headline generated from the month's economy, for the news wire. */
export function economyHeadline(state: GameState): { headline: string; body: string } | null {
  const h = state.history;
  const prev = h[h.length - 2];
  if (!prev) return null;
  const gdp = state.economy.gdpGrowth;
  const inf = state.economy.inflation;
  if (gdp >= 5.2) {
    return {
      headline: "Economy accelerates past 5% as exports hum",
      body: "Analysts credit steady demand for electrical and electronics exports, though they warn households have yet to feel the difference.",
    };
  }
  if (gdp <= 3.6) {
    return {
      headline: "Growth cools below four percent, ringgit under watch",
      body: "Slower momentum raises questions about the fiscal path ahead. The Treasury points to investment pipelines still in motion.",
    };
  }
  if (inf >= 3.4) {
    return {
      headline: "Prices climb faster than wages, households squeeze",
      body: `Inflation prints at ${inf.toFixed(1)} percent while pay packets lag, keeping the cost of living at the top of every kopitiam conversation.`,
    };
  }
  return {
    headline: "Steady month for the economy, say statisticians",
    body: `Growth holds at ${gdp.toFixed(1)} percent with inflation at ${inf.toFixed(1)} percent. Markets yawn; ministers do not.`,
  };
}
