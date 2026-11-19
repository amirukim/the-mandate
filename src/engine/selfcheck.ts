import { createInitialState } from "../data/initial-state";
import { ALL_EVENTS } from "../data/events";
import { applyEffects } from "./effects";
import { advanceMonth, beginTurn, chooseOption, currentEvent } from "./turn-flow";
import { seekCounsel } from "./relationships";
import { chapterOf, dateLabel, isBudgetTurn, stateIsFallen } from "./calendar";
import type { GameState } from "../types/game";

export interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

function makeState(): GameState {
  return createInitialState({
    saveVersion: 1,
    playerName: "Test PM",
    campaignName: "Selfcheck",
    seed: 424242,
    difficulty: "standard",
    startedAt: "2026-11-01T00:00:00Z",
  });
}

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function findNaN(value: unknown, path: string): string[] {
  if (typeof value === "number" && Number.isNaN(value)) return [path];
  if (Array.isArray(value)) return value.flatMap((v, i) => findNaN(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      findNaN(v, path ? `${path}.${k}` : k),
    );
  }
  return [];
}

export function runSelfChecks(): CheckResult[] {
  const results: CheckResult[] = [];

  // 1. Every effect target across every event, immediate or delayed, resolves.
  let badTargets = 0;
  const scratch = makeState();
  for (const event of ALL_EVENTS) {
    for (const option of event.options) {
      for (const consequence of option.consequences) {
        try {
          applyEffects(scratch, consequence.effects ?? []);
        } catch (error) {
          badTargets += 1;
          results.push({
            name: `Effect target: ${event.id}/${option.id}`,
            pass: false,
            detail: String(error),
          });
        }
      }
    }
  }
  results.push({
    name: "All event effect targets resolve",
    pass: badTargets === 0,
    detail: `${ALL_EVENTS.length} events checked, ${badTargets} bad targets`,
  });

  // 2. Twelve-month playthrough: no crashes, no NaN, decisions logged.
  const state = makeState();
  beginTurn(state);
  let optionsTaken = 0;
  let flowCrashed = false;
  try {
    for (let month = 0; month < 12 && !state.fallen; month++) {
      while (currentEvent(state)) {
        const outcome = chooseOption(state, "a");
        if (!outcome) throw new Error("chooseOption returned null for an active event");
        optionsTaken += 1;
      }
      advanceMonth(state);
    }
  } catch (error) {
    flowCrashed = true;
    results.push({ name: "Playthrough crash", pass: false, detail: String(error) });
  }
  const nanPaths = findNaN(state, "state");
  results.push({
    name: "12-month playthrough survives",
    pass: !flowCrashed && optionsTaken >= 8 && nanPaths.length === 0,
    detail: `${optionsTaken} decisions taken, ${nanPaths.length} NaN values, turn ${state.turn}`,
  });

  // 3. Chapter events never repeat; decisions always recorded.
  const duplicates = state.firedEvents.filter((id, i, arr) => arr.indexOf(id) !== i && !id.startsWith("r_"));
  results.push({
    name: "No repeated chapter events",
    pass: duplicates.length === 0,
    detail: `${state.firedEvents.length} fired, duplicates: ${duplicates.join(", ") || "none"}`,
  });
  results.push({
    name: "Decision log complete",
    pass: state.decisions.length === optionsTaken,
    detail: `${state.decisions.length} logged of ${optionsTaken}`,
  });

  // 4. Counsel works once per character per month.
  const counselState = cloneState(state);
  const first = seekCounsel(counselState, "chiefOfStaff", (id) => id);
  const second = seekCounsel(counselState, "chiefOfStaff", (id) => id);
  results.push({
    name: "Counsel once per month per character",
    pass: first !== null && second === null,
    detail: first ? `advice: ${first.text.slice(0, 48)}...` : "no advice returned",
  });

  // 5. Save roundtrip through JSON (what cloud sync stores).
  const saved = JSON.parse(JSON.stringify(state)) as GameState;
  const roundtripOk =
    saved.turn === state.turn &&
    saved.history.length === state.history.length &&
    saved.decisions.length === state.decisions.length &&
    saved.economy.gdpGrowth === state.economy.gdpGrowth;
  results.push({ name: "JSON save roundtrip", pass: roundtripOk, detail: `turn ${saved.turn}, history ${saved.history.length}` });

  // 6. Calendar anchors.
  const calendarOk =
    dateLabel(0) === "November 2026" &&
    dateLabel(12) === "November 2027" &&
    chapterOf(3) === 1 &&
    chapterOf(4) === 2 &&
    isBudgetTurn(11) === true;
  results.push({ name: "Calendar anchors (Nov 2026 start, Oct budget)", pass: calendarOk, detail: `t0=${dateLabel(0)}, t11=${dateLabel(11)}` });

  // 7. Fall condition triggers on collapse values.
  const fallenState = cloneState(state);
  fallenState.politics.approval = 10;
  fallenState.politics.coalitionStability = 15;
  results.push({
    name: "Government-fall condition triggers",
    pass: stateIsFallen(fallenState) === true && stateIsFallen(state) === false,
    detail: "approval 10 + stability 15 falls; healthy state stands",
  });

  return results;
}
