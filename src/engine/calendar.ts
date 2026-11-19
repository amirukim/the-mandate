import type { GameState } from "../types/game";
import type { Lang } from "../i18n/store";

export const START_YEAR = 2026;
export const START_MONTH = 10; // November 2026 (0-based)

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_MS = [
  "Januari",
  "Februari",
  "Mac",
  "April",
  "Mei",
  "Jun",
  "Julai",
  "Ogos",
  "September",
  "Oktober",
  "November",
  "Disember",
];

function monthName(month: number, lang: Lang): string {
  return lang === "ms" ? MONTHS_MS[month % 12] : MONTHS[month % 12];
}

/** Turn 0 is November 2026. */
export function dateLabel(turn: number, lang: Lang = "en"): string {
  const month = START_MONTH + turn;
  const year = START_YEAR + Math.floor(month / 12);
  return `${monthName(month, lang)} ${year}`;
}

export function shortDateLabel(turn: number, lang: Lang = "en"): string {
  const month = START_MONTH + turn;
  const year = START_YEAR + Math.floor(month / 12);
  return `${monthName(month, lang).slice(0, 3)} ${year}`;
}

/** Chapter I covers the first hundred days (turns 0-3). Chapter II follows. */
export function chapterOf(turn: number): number {
  return turn < 4 ? 1 : 2;
}

export function chapterTitle(chapter: number, lang: Lang = "en"): string {
  if (lang === "ms") {
    return chapter === 1 ? "Bab I: Seratus Hari Pertama" : "Bab II: Permainan Panjang";
  }
  return chapter === 1 ? "Chapter I: The First Hundred Days" : "Chapter II: The Long Game";
}

export function isBudgetTurn(turn: number): boolean {
  const month = (START_MONTH + turn) % 12;
  return month === 9; // October: Budget tabled for the coming year.
}

export function isMonsoonTurn(turn: number): boolean {
  const month = (START_MONTH + turn) % 12;
  return month === 10 || month === 11 || month === 0; // Nov-Jan northeast monsoon.
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function stateIsFallen(state: GameState): boolean {
  return (
    state.politics.approval <= 16 &&
    (state.politics.coalitionStability <= 24 || state.politics.oppositionStrength >= 70)
  );
}
