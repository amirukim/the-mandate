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
import { enactPolicy, canEnact } from "./policy";
import { ensureParliament, whip, callVote, moveConfidence } from "./parliament";
import { setAllocation, deriveStance, tableBudget, withinEnvelope, budgetSum, DEFAULT_ALLOCATIONS } from "./budget";
import { appoint, holderOf } from "./cabinet";
import { classifyMandate } from "./endings";
import { billById } from "../data/bills";
import { POLICY_MEASURES } from "../data/policies";
import { GRAPH_EVENTS, ADVISOR_ARCS, ensureContentRegistered } from "../data/dialogue";
import { beginGraphEvent, chooseGraphEvent, completeGraphEvent } from "./graph-events";
import { pickSchedulable, legacySchedulable } from "./narrative";

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

  // 13. Policy engine: enact, block, conflict, delay, decision log.
  const policyState = makeState();
  const beforeDeficit = policyState.economy.fiscalDeficit;
  const pResult = enactPolicy(policyState, "subsidy-restructure");
  const pDelayScheduled = policyState.pendingEffects.some((e) => e.id === "policy-subsidy-restructure");
  const pLogged = policyState.decisions.some((d) => d.id === "policy-subsidy-restructure");
  const pAgain = enactPolicy(policyState, "subsidy-restructure"); // blocked: enacted
  const conflict = POLICY_MEASURES.find((m) => m.conflicts?.length);
  let pConflictBlocked = true;
  if (conflict) {
    // enact the conflicting measure, then expect the first to be refused
    const otherId = conflict.conflicts![0];
    if (!enactPolicy(policyState, otherId)) {
      pConflictBlocked = canEnact(policyState, conflict.id).reason === "conflict";
    } else {
      pConflictBlocked = canEnact(policyState, conflict.id).reason === "conflict";
    }
  }
  results.push({
    name: "Policy engine: enact, double-refuse, conflict, delay, log",
    pass: Boolean(
      pResult &&
      Math.abs(policyState.economy.fiscalDeficit - (beforeDeficit - 0.4)) < 0.001 &&
      pDelayScheduled &&
      pLogged &&
      pAgain === null &&
      pConflictBlocked,
    ),
    detail: `deficit moved, delay scheduled, logged, re-enact refused, conflict reason: ${pConflictBlocked}`,
  });

  // 14. Parliament: whip arithmetic, anger defection, thresholds, confidence.
  const whipState = makeState();
  const ordinary = billById("civil-service-reform")!;
  const healthy = whip(whipState, ordinary);
  const constitutional = billById("term-limits")!;
  const twoThirdsForecast = whip(whipState, constitutional);
  // anger the BN bloc and the government line shrinks
  const angryState = cloneState(whipState);
  angryState.cabinetState = { appointments: {}, factionAnger: { bn: 60 } };
  const angry = whip(angryState, ordinary);
  const voteOutcome = callVote(whipState, ordinary);
  results.push({
    name: "Parliament: whip arithmetic, anger defection, two-thirds threshold",
    pass:
      healthy.pass &&
      healthy.forVotes >= 112 &&
      angry.forVotes < healthy.forVotes &&
      twoThirdsForecast.threshold === 148 &&
      voteOutcome.passed &&
      ensureParliament(whipState).bills.length === 1,
    detail: `healthy for=${healthy.forVotes}, angry for=${angry.forVotes}, two-thirds threshold ${twoThirdsForecast.threshold}, vote passed: ${voteOutcome.passed}`,
  });

  // 15. Budget: envelope, stance, supply vote through the parliament engine.
  const budgetState = makeState();
  setAllocation(budgetState, "health", 40);
  setAllocation(budgetState, "education", 40); // over any sane envelope when others keep defaults
  const overSum = budgetSum((budgetState.budget?.allocations ?? {}) as Record<string, number>);
  const budgetState2 = makeState();
  for (const [k, v] of Object.entries(DEFAULT_ALLOCATIONS)) setAllocation(budgetState2, k, v);
  setAllocation(budgetState2, "infrastructure", 24);
  setAllocation(budgetState2, "subsidy", 10);
  const stance = deriveStance((budgetState2.budget?.allocations ?? {}) as Record<string, number>);
  const supply = tableBudget(budgetState2, () => ({ passed: true }));
  results.push({
    name: "Budget: envelope enforcement, stance derivation, supply record",
    pass:
      !withinEnvelope({ health: 40, education: 40, security: 12, infrastructure: 14, subsidy: 22, transfer: 10 }) &&
      overSum > 100 &&
      stance === "consolidation" &&
      supply.passed &&
      supply.stance === stance &&
      budgetState2.flags.budget2027 === stance &&
      budgetState2.budget?.passedTurn !== undefined,
    detail: `over-envelope sum ${overSum}, stance ${stance}, passed ${supply.passed}, flag ${String(budgetState2.flags.budget2027)}`,
  });

  // 16. Cabinet: appointment, fit effect, outsider anger, reshuffle.
  const cabinetState = makeState();
  const beforeRevenue = cabinetState.economy.revenue;
  const a1 = appoint(cabinetState, "finance", "finance"); // a natural fit
  const fitApplied = cabinetState.economy.revenue - beforeRevenue === 3;
  const angerBefore = cabinetState.cabinetState?.factionAnger?.gps ?? 0;
  appoint(cabinetState, "borneo", "foreign"); // a PH minister on a GPS/GRS post
  const angerAfter = cabinetState.cabinetState?.factionAnger?.gps ?? 0;
  const a2 = appoint(cabinetState, "home", "finance"); // reshuffle: finance moves to home
  const moved = holderOf(cabinetState, "home") === "finance" && holderOf(cabinetState, "finance") === null;
  results.push({
    name: "Cabinet: appoint, fit effect, outsider anger, reshuffle",
    pass: Boolean(a1 && fitApplied && a2 && moved && angerAfter > angerBefore),
    detail: `fit effect ${fitApplied}, anger ${angerBefore}->${angerAfter}, reshuffle ${moved}`,
  });

  // 17. Endings classifier: fallen variants and living mandates differ.
  const strongState = makeState();
  strongState.politics.approval = 62;
  strongState.politics.coalitionStability = 74;
  const strongEnding = classifyMandate(strongState);
  const voteFallen = makeState();
  voteFallen.fallen = true;
  voteFallen.flags = { ...voteFallen.flags, "parliament.confidenceLost": true };
  const voteEnding = classifyMandate(voteFallen);
  const crisisState = makeState();
  crisisState.politics.approval = 10;
  crisisState.politics.coalitionStability = 15;
  const crisisEnding = classifyMandate(crisisState);
  results.push({
    name: "Endings classifier: fallen-vote, crisis, and living mandates distinct",
    pass:
      strongEnding.id.startsWith("mandate-") &&
      voteEnding.id === "fallen-vote" &&
      crisisEnding.id === "fallen-crisis" &&
      strongEnding.id !== voteEnding.id,
    detail: `strong=${strongEnding.id}, vote=${voteEnding.id}, crisis=${crisisEnding.id}`,
  });

  // 18. A v2 save carrying every new slice survives JSON + migration.
  const slicesState = makeState();
  enactPolicy(slicesState, "school-meals");
  callVote(slicesState, billById("ma63-grant-bill")!);
  moveConfidence(slicesState);
  appoint(slicesState, "trade", "foreign");
  setAllocation(slicesState, "health", 20);
  const slicesSave = {
    version: SAVE_VERSION,
    slot: 0 as const,
    savedAt: "2026-11-01T00:00:00Z",
    summary: { playerName: "Test PM", campaignName: "Selfcheck", turn: slicesState.turn, chapter: slicesState.chapter, dateLabel: dateLabel(slicesState.turn), approval: Math.round(slicesState.politics.approval) },
    state: cloneState(slicesState),
  };
  const roundtripped = migrateSave(JSON.parse(JSON.stringify(slicesSave)));
  const slicesOk =
    roundtripped !== null &&
    Object.keys(roundtripped.state.policy?.enacted ?? {}).length === 1 &&
    (roundtripped.state.parliament?.bills.length ?? 0) === 2 &&
    (roundtripped.state.cabinetState?.appointments.trade ?? "") === "foreign" &&
    (roundtripped.state.budget?.allocations?.health ?? 0) === 20;
  results.push({
    name: "v2 slices survive JSON save roundtrip + migration",
    pass: slicesOk,
    detail: `policy ${Object.keys(roundtripped?.state.policy?.enacted ?? {}).length}, bills ${roundtripped?.state.parliament?.bills.length}, trade=${roundtripped?.state.cabinetState?.appointments.trade}`,
  });

  // 19. Graph content: 20 events + 3 arcs, all sound on the validator, all paths terminate.
  ensureContentRegistered();
  let contentBad = 0;
  let contentDetail = "";
  for (const def of [...GRAPH_EVENTS, ...ADVISOR_ARCS.map((a) => ({ meta: { id: a.id }, graph: a.graph } as typeof GRAPH_EVENTS[number]))]) {
    const problems = validateDialogueGraph(def.graph);
    const bad = problems.missingTargets.length + problems.deadEnds.length + problems.unreachable.length + problems.missingText.length;
    if (bad > 0 && contentBad === 0) contentDetail = `${def.graph.id}: ${bad} problem(s)`;
    contentBad += bad;
  }
  // every path terminates within a bound
  let runAway = 0;
  const pathState = makeState();
  for (const def of GRAPH_EVENTS) {
    let view = beginGraphEvent(pathState, def.graph);
    let guard = 0;
    while (view.kind !== "end" && guard < 16) {
      guard += 1;
      if (view.kind === "line") view = dialogueAdvance(pathState, def.graph, view.nodeId);
      else if (view.kind === "choices") {
        const pick = view.choices.find((c) => !c.locked) ?? view.choices[0];
        view = dialogueChoose(pathState, def.graph, view.nodeId, pick.id);
      }
    }
    if (view.kind !== "end") runAway += 1;
    // reset flags so the next event's resume-detection doesn't skip ahead
    pathState.flags = {};
  }
  results.push({
    name: `Graph content: ${GRAPH_EVENTS.length} events + ${ADVISOR_ARCS.length} arcs sound, all paths terminate`,
    pass: GRAPH_EVENTS.length >= 20 && ADVISOR_ARCS.length >= 3 && contentBad === 0 && runAway === 0,
    detail: contentDetail || `validator clean, ${runAway} runaway paths`,
  });

  // 20. Graph event finalisation: decision, wire, queue, fired marker.
  const deskState = makeState();
  beginTurn(deskState);
  const graphInQueue = deskState.queuedEventIds.some((id) => id.startsWith("g_") || id.startsWith("arc_"));
  const sample = GRAPH_EVENTS[0];
  const deskView = beginGraphEvent(deskState, sample.graph);
  let finGuard = 0;
  let finView = deskView;
  while (finView.kind !== "choices" && finGuard < 8) {
    finGuard += 1;
    if (finView.kind === "line") finView = dialogueAdvance(deskState, sample.graph, finView.nodeId);
    else break;
  }
  if (finView.kind === "choices") {
    const pick = finView.choices[0];
    const choicesNode = sample.graph.nodes[finView.nodeId] as
      | { kind: "choices"; choices: Array<{ id: string; news?: { outlet: "peninsula" | "borneo" | "sinar"; headline: { en: string; ms: string } } }> }
      | undefined;
    const chosenNews = choicesNode && choicesNode.kind === "choices"
      ? choicesNode.choices.find((c) => c.id === pick.id)?.news ?? null
      : null;
    const after = chooseGraphEvent(deskState, sample.graph, finView.nodeId, pick.id);
    completeGraphEvent(deskState, sample.graph.id, chosenNews?.headline ?? null, sample.meta.category);
    const logged = deskState.decisions.some((d) => d.id === sample.graph.id && d.optionId === pick.id);
    const fired = deskState.firedEvents.includes(sample.graph.id);
    const offDesk = !deskState.queuedEventIds.includes(sample.graph.id);
    const onWire = chosenNews ? deskState.news.some((n) => n.id === `${sample.graph.id}-${deskState.turn}`) : true;
    results.push({
      name: "Graph event finalisation: decision, wire, queue, fired marker",
      pass: after.decided && logged && fired && offDesk && onWire,
      detail: `logged=${logged}, fired=${fired}, offDesk=${offDesk}, wire=${onWire}`,
    });
  } else {
    results.push({ name: "Graph event finalisation", pass: false, detail: "path never reached choices" });
  }
  void graphInQueue;

  // 21. The scheduler can place graph events on the desk (deterministic).
  const schedState = makeState();
  schedState.chapter = 2;
  schedState.turn = 10;
  const schedulable = pickSchedulable(schedState, [
    ...legacySchedulable(ALL_EVENTS),
    ...GRAPH_EVENTS.map((e) => ({ id: e.meta.id, kind: e.meta.kind, chapter: e.meta.chapter, window: e.meta.window, priority: e.meta.priority, minGap: e.meta.minGap, schedule: e.meta.schedule })),
  ]);
  const hasGraphOnDesk = schedulable.some((id) => id.startsWith("g_"));
  results.push({
    name: "Scheduler merges graph events onto the desk queue",
    pass: schedulable.length > 0 && hasGraphOnDesk,
    detail: `queue: ${schedulable.join(", ")}`,
  });

  return results;
}
