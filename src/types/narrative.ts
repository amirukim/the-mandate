import type { GameState, NewsCategory } from "./game";
import type { Effect } from "./game";

export interface DialogueLine {
  speaker: string;
  role: string;
  text: string;
}

export interface ReactionNews {
  outlet: "peninsula" | "borneo" | "sinar";
  headline: string;
  body?: string;
}

export interface Consequence {
  /** Human-readable immediate result shown after the decision. */
  note?: string;
  /** Turn offset (relative to the decision turn) before this consequence lands. */
  delayTurns?: number;
  /** What actually matured, shown in the month-end digest when the delay elapses. */
  description?: string;
  effects?: Effect[];
  news?: ReactionNews[];
}

export interface SceneOption {
  id: string;
  label: string;
  detail: string;
  /** One-line record of what the player chose, for the decision log. */
  summary: string;
  consequences: Consequence[];
}

export interface GameEventDef {
  id: string;
  kind: "chapter" | "recurring";
  chapter?: number;
  /** Higher sorts first when several fire in the same month. */
  priority: number;
  /** Inclusive turn window for chapter events. */
  window?: [number, number];
  /** Minimum gap in turns between fires, for recurring events. */
  minGap?: number;
  /** Fixed months for recurring events (October budget, monsoon season). */
  schedule?: "budget" | "monsoon";
  title: string;
  location: string;
  category: NewsCategory;
  briefing: string[];
  dialogue: DialogueLine[];
  options: SceneOption[];
  available?: (state: GameState) => boolean;
}
