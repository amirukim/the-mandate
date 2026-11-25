import type { DialogueGraph } from "../../engine/dialogue";

/**
 * Fixture graph exercising every v2 dialogue feature: a flag callback, a stat
 * gate with a visible locked reason, an unconditional choice with effects, and
 * an end. Used by the self-checks (validator, parity, playthrough) and as the
 * authoring template for Phase 8 content. EN and MS complete.
 */
export const FIXTURE_PRESS_LEAK: DialogueGraph = {
  id: "fixture.pressLeak",
  start: "warn",
  nodes: {
    warn: {
      kind: "line",
      speaker: "chiefOfStaff",
      role: { en: "Principal Private Secretary", ms: "Setiausaha Peribadi Utama" },
      expression: "concerned",
      text: {
        en: "A draft has leaked to Sinar Waktu. The ministry's fingerprints are on every page.",
        ms: "Draf telah bocor kepada Sinar Waktu. Cap jari kementerian ada pada setiap muka surat.",
      },
      next: "table",
    },
    table: {
      kind: "choices",
      prompt: { en: "How do you answer?", ms: "Bagaimana anda menjawab?" },
      choices: [
        {
          id: "own",
          label: { en: "Own the draft publicly", ms: "Akui draf itu secara terbuka" },
          to: "ownResult",
          effects: [
            { target: "politics.institutionalIntegrity", delta: 3 },
            { target: "politics.approval", delta: -2 },
          ],
          setFlags: { "fixture:pressLeakOwned": true },
        },
        {
          id: "deny",
          label: { en: "Deny everything", ms: "Nafkan segalanya" },
          to: "denyResult",
          effects: [{ target: "politics.institutionalIntegrity", delta: -3 }],
          setFlags: { "fixture:pressLeakDenied": true },
        },
        {
          id: "blame",
          label: { en: "Sack the drafter", ms: "Buang penulis draf itu" },
          to: "blameResult",
          if: { kind: "relationship", characterId: "chiefOfStaff", gte: 55 },
          lockedReason: {
            en: "Sarah Tan will not scapegoat a staffer while she distrusts you.",
            ms: "Sarah Tan tidak akan menjadikan kakitangan kambing hitam selagi dia tidak percaya kepada anda.",
          },
          effects: [
            { target: "politics.approval", delta: 1 },
            { target: "politics.institutionalIntegrity", delta: -1 },
          ],
          setFlags: { "fixture:drafterSacked": true },
        },
      ],
    },
    ownResult: {
      kind: "line",
      speaker: "sup-journalist",
      role: { en: "Political Editor, Sinar Waktu", ms: "Editor Politik, Sinar Waktu" },
      expression: "pleased",
      text: {
        en: "An on-record confirmation by lunchtime. Rare. I will write it exactly as you said it.",
        ms: "Pengesahan secara rasmi sebelum tengah hari. Jarang. Saya akan tulis tepat seperti kata anda.",
      },
      next: "end",
    },
    denyResult: {
      kind: "line",
      speaker: "sup-journalist",
      role: { en: "Political Editor, Sinar Waktu", ms: "Editor Politik, Sinar Waktu" },
      expression: "stern",
      text: {
        en: "I have the pages. Deny it on the record and the denial becomes the story.",
        ms: "Saya ada muka suratnya. Nafkan secara rasmi dan nafikan itu yang menjadi berita.",
      },
      next: "end",
    },
    blameResult: {
      kind: "line",
      speaker: "chiefOfStaff",
      role: { en: "Principal Private Secretary", ms: "Setiausaha Peribadi Utama" },
      expression: "stern",
      text: {
        en: "The drafter is gone. The leak stopped. Remember which of us ended it.",
        ms: "Penulisnya sudah tiada. Bocoran sudah berhenti. Ingat siapa yang menamatkannya.",
      },
      next: "end",
    },
    end: { kind: "end" },
  },
};
