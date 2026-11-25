import { createInitialState } from "../data/initial-state";
import { ALL_EVENTS } from "../data/events";
import { applyEffects } from "./effects";
import { advanceMonth, beginTurn, chooseOption, currentEvent } from "./turn-flow";
import { seekCounsel } from "./relationships";
import { chapterOf, dateLabel, isBudgetTurn, stateIsFallen } from "./calendar";
import type { GameState } from "../types/game";
import { SAVE_VERSION } from "../types/game";
import { EN_DICT } from "../i18n/en";
import { MS_DICT } from "../i18n/ms";
import {
  dialogueAdvance,
  dialogueChoose,
  dialogueEnter,
  validateDialogueGraph,
  type DialogueChoicesView,
  type DialogueView,
} from "./dialogue";
import { legacyEventGraph } from "./dialogue-legacy";
import { FIXTURE_PRESS_LEAK } from "../data/dialogue/fixture";
import { migrateSave } from "./save-migrate";

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

  // 8. Dialogue graph validator: every v1 event adapts to a sound graph, and
  //    the validator catches a broken one.
  let adapterBad = 0;
  let adapterDetail = "";
  for (const event of ALL_EVENTS) {
    const graph = legacyEventGraph(event);
    const problems = validateDialogueGraph(graph);
    const bad =
      problems.missingTargets.length + problems.deadEnds.length + problems.unreachable.length + problems.missingText.length;
    if (bad > 0 && adapterBad === 0) adapterDetail = `${event.id}: ${bad} problem(s)`;
    adapterBad += bad;
  }
  const broken: typeof FIXTURE_PRESS_LEAK = {
    id: "selfcheck.broken",
    start: "only",
    nodes: { only: { kind: "line", speaker: "generic", text: { en: "dead end", ms: "jalan buntu" } } },
  };
  const brokenProblems = validateDialogueGraph(broken);
  const validatorCatches = brokenProblems.deadEnds.length > 0;
  results.push({
    name: "Dialogue graphs: 15 legacy adaptations sound, validator catches dead ends",
    pass: adapterBad === 0 && validatorCatches,
    detail: `${ALL_EVENTS.length} graphs, ${adapterBad} problems; validator ${validatorCatches ? "caught" : "missed"} the control (${adapterDetail})`,
  });

  // 9. EN/MS key parity across the whole UI dictionary.
  const leafPaths = (node: unknown, prefix: string, out: Set<string>): void => {
    if (typeof node === "string") {
      out.add(prefix);
      return;
    }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) leafPaths(v, prefix ? `${prefix}.${k}` : k, out);
  };
  const enPaths = new Set<string>();
  const msPaths = new Set<string>();
  leafPaths(EN_DICT, "", enPaths);
  leafPaths(MS_DICT, "", msPaths);
  const enOnly = [...enPaths].filter((p) => !msPaths.has(p));
  const msOnly = [...msPaths].filter((p) => !enPaths.has(p));
  const emptyMs = [...msPaths].filter((p) => {
    let cur: unknown = MS_DICT;
    for (const part of p.split(".")) {
      if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
    }
    return typeof cur === "string" && cur.trim().length === 0;
  });
  results.push({
    name: "EN/MS i18n key parity",
    pass: enOnly.length === 0 && msOnly.length === 0 && emptyMs.length === 0,
    detail: `${enPaths.size} keys; EN-only: ${enOnly.slice(0, 3).join(", ") || "none"}; MS-only: ${msOnly.slice(0, 3).join(", ") || "none"}; empty MS: ${emptyMs.length}`,
  });

  // 10. Legacy-adapter equivalence: choices map 1:1 onto event options, the
  //     walk never mutates state, and finalisation matches chooseOption.
  let equivalenceOk = true;
  let equivalenceDetail = "";
  for (const event of ALL_EVENTS) {
    const graph = legacyEventGraph(event);
    const decision = graph.nodes[`${event.id}.decision`];
    if (!decision || decision.kind !== "choices" || decision.choices.length !== event.options.length) {
      equivalenceOk = false;
      equivalenceDetail = `${event.id}: choice count mismatch`;
      break;
    }
    const mismatch = decision.choices.find((c, i) => c.id !== event.options[i].id || c.label.en !== event.options[i].label);
    if (mismatch) {
      equivalenceOk = false;
      equivalenceDetail = `${event.id}: label/id mismatch`;
      break;
    }
    // walking the graph must not touch state
    const before = cloneState(state);
    let view: DialogueView = dialogueEnter(before, graph, graph.start);
    let guard = 0;
    while (view.kind === "line" && guard < 64) {
      view = dialogueAdvance(before, graph, view.nodeId);
      guard += 1;
    }
    if (JSON.stringify(before) !== JSON.stringify(state)) {
      equivalenceOk = false;
      equivalenceDetail = `${event.id}: graph walk mutated state`;
      break;
    }
    // finalise choice "a" through the graph, then the v1 path, on clones
    if (view.kind !== "choices") {
      equivalenceOk = false;
      equivalenceDetail = `${event.id}: walk did not reach the decision`;
      break;
    }
    const graphChoice = (view as DialogueChoicesView).choices[0];
    const walkState = cloneState(state);
    dialogueChoose(walkState, graph, view.nodeId, graphChoice.id);
    // legacy finalisation: the graph routes the pick, chooseOption applies it
    chooseOption(walkState, graphChoice.id);
    const v1State = cloneState(state);
    chooseOption(v1State, event.options[0].id);
    // the automatic callback flag is the v2 system's memory, not behaviour:
    // strip it and the two paths must be identical.
    const stripCallback = (s: GameState): GameState => {
      const copy = cloneState(s);
      copy.flags = Object.fromEntries(Object.entries(copy.flags).filter(([k]) => !k.startsWith("dialog:")));
      return copy;
    };
    if (JSON.stringify(stripCallback(walkState)) !== JSON.stringify(stripCallback(v1State))) {
      equivalenceOk = false;
      equivalenceDetail = `${event.id}: graph path diverged from chooseOption`;
      break;
    }
  }
  results.push({
    name: "Legacy-adapter equivalence (15 events)",
    pass: equivalenceOk,
    detail: equivalenceDetail || "ids, labels, walk purity and finalisation match chooseOption",
  });

  // 11. v1 save migrates to v2 and keeps playing.
  const v1Save = {
    version: 1,
    slot: 0 as const,
    savedAt: "2026-11-01T00:00:00Z",
    summary: { playerName: "Test PM", campaignName: "Selfcheck", turn: state.turn, chapter: state.chapter, dateLabel: dateLabel(state.turn), approval: Math.round(state.politics.approval) },
    state: cloneState(state),
  };
  const migrated = migrateSave(JSON.parse(JSON.stringify(v1Save)));
  const migratedOk =
    migrated !== null &&
    migrated.version === SAVE_VERSION &&
    migrated.state.decisions.length === v1Save.state.decisions.length;
  let migratedPlays = false;
  if (migratedOk && migrated) {
    try {
      const playState = cloneState(migrated.state);
      advanceMonth(playState);
      migratedPlays = playState.turn === v1Save.state.turn + 1;
    } catch {
      migratedPlays = false;
    }
  }
  const newerRefused = migrateSave({ ...JSON.parse(JSON.stringify(v1Save)), version: SAVE_VERSION + 1 }) === null;
  results.push({
    name: "v1 save migrates to v2 and plays",
    pass: Boolean(migratedOk && migratedPlays && newerRefused),
    detail: `version ${migrated?.version}, plays: ${migratedPlays}, newer save refused: ${newerRefused}`,
  });

  // 12. New-runner playthrough of the fixture graph: callback flags, effects,
  //     locked choice with a reason, and every path terminates.
  const fixtureState = cloneState(state);
  fixtureState.characters.chiefOfStaff.relationship = 40; // force the gated choice locked
  let view: DialogueView = dialogueEnter(fixtureState, FIXTURE_PRESS_LEAK, FIXTURE_PRESS_LEAK.start);
  let fixtureGuard = 0;
  let fixtureOk = true;
  let fixtureDetail = "";
  while (view.kind !== "end" && fixtureGuard < 32) {
    fixtureGuard += 1;
    if (view.kind === "line") {
      view = dialogueAdvance(fixtureState, FIXTURE_PRESS_LEAK, view.nodeId);
    } else if (view.kind === "choices") {
      const own = view.choices.find((c) => c.id === "own");
      const blame = view.choices.find((c) => c.id === "blame");
      if (!own || !blame) {
        fixtureOk = false;
        fixtureDetail = "expected choices missing";
        break;
      }
      if (!blame.locked || !blame.lockedReason) {
        fixtureOk = false;
        fixtureDetail = "gated choice did not lock at relationship 40";
        break;
      }
      view = dialogueChoose(fixtureState, FIXTURE_PRESS_LEAK, view.nodeId, own.id);
    } else {
      break;
    }
  }
  const integrityDelta = fixtureState.politics.institutionalIntegrity - state.politics.institutionalIntegrity;
  const approvalDelta = fixtureState.politics.approval - state.politics.approval;
  fixtureOk =
    fixtureOk &&
    view.kind === "end" &&
    fixtureState.flags["dialog:fixture.pressLeak:own"] === true &&
    fixtureState.flags["fixture:pressLeakOwned"] === true &&
    integrityDelta === 3 &&
    approvalDelta === -2;
  if (!fixtureOk && !fixtureDetail) fixtureDetail = `deltas i=${integrityDelta} a=${approvalDelta}, flags ${Object.keys(fixtureState.flags).length}`;
  results.push({
    name: "Fixture graph plays through the new runner",
    pass: fixtureOk,
    detail: fixtureDetail || `terminated after ${fixtureGuard} steps; callback flag and effects applied`,
  });

  return results;
}
