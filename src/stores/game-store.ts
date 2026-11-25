import { create } from "zustand";
import type { Difficulty, Effect, GameState, SaveSlotId } from "../types/game";
import { applyEffects } from "../engine/effects";
import { createCampaignMeta, createInitialState } from "../data/initial-state";
import { beginTurn, advanceMonth, chooseOption, currentEvent, type ChosenOutcome } from "../engine/turn-flow";
import { seekCounsel } from "../engine/relationships";
import { getEventById } from "../data/events";
import type { TurnReport } from "../engine/simulation";
import { saveLocal, loadLocal } from "../services/save-service";
import { getLang } from "../i18n/store";
import { outcomeDisplay, reportDisplay, eventDisplay, counselVoice } from "../i18n/data";
import type { AvatarCustomisation } from "../data/pixel-portraits";

interface LastCounsel {
  characterId: string;
  text: string;
}

interface GameStore {
  game: GameState | null;
  chosen: ChosenOutcome | null;
  lastReport: TurnReport | null;
  lastCounsel: LastCounsel | null;

  newGame(playerName: string, campaignName: string, difficulty: Difficulty, avatar?: AvatarCustomisation): void;
  continueGame(): boolean;
  loadFromSave(slot: SaveSlotId): boolean;
  makeDecision(optionId: string): void;
  clearChosen(): void;
  endMonth(): void;
  beginNextMonth(): void;
  askCounsel(characterId: string): void;
  closeCampaign(): void;
}

function persist(game: GameState, slot: SaveSlotId): void {
  saveLocal(slot, game);
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  chosen: null,
  lastReport: null,
  lastCounsel: null,

  newGame(playerName, campaignName, difficulty, avatar) {
    const meta = createCampaignMeta(playerName, campaignName, difficulty);
    const game = createInitialState(meta);
    if (avatar) {
      // the PM's dossier: customisation lives in the optional v2 slice, and
      // the prior career nudges the opening ledger once, here at creation.
      game.avatar = avatar;
      if (avatar.priorCareer) {
        game.flags = { ...game.flags, "avatar.career": avatar.priorCareer };
        const NUDGE: Record<string, Effect[]> = {
          civilService: [{ target: "politics.institutionalIntegrity", delta: 2 }],
          military: [{ target: "security.militaryReadiness", delta: 3 }],
          business: [{ target: "economy.fdi", delta: 3 }],
          activism: [{ target: "politics.approval", delta: 2 }],
          academia: [{ target: "social.education", delta: 2 }],
        };
        try {
          applyEffects(game, NUDGE[avatar.priorCareer] ?? []);
        } catch {
          /* a hostile nudge never blocks creation */
        }
      }
      for (const trait of avatar.traits ?? []) {
        game.flags = { ...game.flags, [`avatar.trait.${trait}`]: true };
      }
    }
    beginTurn(game);
    persist(game, 0);
    set({ game, chosen: null, lastReport: null, lastCounsel: null });
  },

  continueGame() {
    const save = loadLocal(0);
    if (!save) return false;
    get().loadFromSave(0);
    return true;
  },

  loadFromSave(slot) {
    const save = loadLocal(slot);
    if (!save) return false;
    const game = save.state;
    if (game.phase === "scene" && game.queuedEventIds.length === 0 && currentEvent(game) === null) {
      // Scene phase with an empty queue means the month is waiting to be ended.
      beginTurn(game);
    }
    set({ game: { ...game }, chosen: null, lastReport: game.lastReport ?? null, lastCounsel: null });
    return true;
  },

  makeDecision(optionId) {
    const { game } = get();
    if (!game) return;
    const outcome = chooseOption(game, optionId);
    if (!outcome) return;
    // The reaction screen reads in the language the decision was made in.
    const translated = outcomeDisplay(outcome, getLang());
    persist(game, 0);
    // The engine mutates state in place; clone so subscribers of `game` re-render.
    set({ game: { ...game }, chosen: translated });
  },

  clearChosen() {
    set({ chosen: null });
  },

  endMonth() {
    const { game } = get();
    if (!game) return;
    const report = reportDisplay(advanceMonth(game), null, getLang());
    game.lastReport = report;
    persist(game, 0);
    set({ game: { ...game }, lastReport: report, chosen: null });
  },

  beginNextMonth() {
    const { game } = get();
    if (!game) return;
    game.phase = "scene";
    delete game.lastReport;
    persist(game, 0);
    set({ game: { ...game }, lastReport: null });
  },

  askCounsel(characterId) {
    const { game } = get();
    if (!game) return;
    const lang = getLang();
    const nextId = game.queuedEventIds[0];
    const nextEvent = nextId ? getEventById(nextId) : null;
    const subject = nextEvent
      ? eventDisplay(nextEvent, lang).title
      : lang === "ms"
        ? "bulan yang tenang"
        : "a quiet month";
    const result = seekCounsel(game, characterId, () => subject);
    if (result) {
      const voice = counselVoice(characterId, lang);
      if (voice) result.text = voice(subject);
      persist(game, 0);
      set({ game: { ...game }, lastCounsel: { characterId, text: result.text } });
    } else {
      persist(game, 0);
      set({ game: { ...game } });
    }
  },

  closeCampaign() {
    const { game } = get();
    if (game) persist(game, 0);
    set({ game: null, chosen: null, lastReport: null, lastCounsel: null });
  },
}));
