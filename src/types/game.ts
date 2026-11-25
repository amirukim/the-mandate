export type Difficulty = "standard" | "turmoil";

export interface CampaignMeta {
  readonly saveVersion: number;
  readonly playerName: string;
  readonly campaignName: string;
  readonly seed: number;
  readonly difficulty: Difficulty;
  readonly startedAt: string;
}

export interface EconomyState {
  gdpGrowth: number;
  inflation: number;
  ringgit: number;
  debtToGdp: number;
  fiscalDeficit: number;
  revenue: number;
  unemployment: number;
  householdIncome: number;
  fdi: number;
  productivity: number;
}

export interface PoliticsState {
  approval: number;
  coalitionStability: number;
  oppositionStrength: number;
  institutionalIntegrity: number;
}

export interface SocialState {
  costOfLivingPressure: number;
  povertyRate: number;
  health: number;
  education: number;
  housingAffordability: number;
  wageGrowth: number;
  satisfaction: number;
  cohesion: number;
}

export interface SecurityState {
  militaryReadiness: number;
  policeEffectiveness: number;
  cybersecurity: number;
  maritimeSecurity: number;
  borderProtection: number;
  domesticStability: number;
}

export type DiplomacyKey =
  | "asean"
  | "china"
  | "unitedStates"
  | "singapore"
  | "indonesia"
  | "europeanUnion";

export interface FederalState {
  sabahSarawakAutonomy: number;
  ma63Progress: number;
  stateInfrastructure: number;
  revenueFairness: number;
  relations: Record<string, number>;
}

export type GameFlags = Record<string, string | number | boolean>;

export type EffectTarget = string;

export interface Effect {
  target: EffectTarget;
  delta?: number;
  set?: string | number | boolean;
}

export type OutletId = "peninsula" | "borneo" | "sinar";

export type NewsCategory =
  | "politics"
  | "economy"
  | "federal"
  | "diplomacy"
  | "security"
  | "social";

export interface NewsItem {
  id: string;
  turn: number;
  outlet: OutletId;
  headline: string;
  body?: string;
  category: NewsCategory;
}

export interface DelayedEffect {
  id: string;
  dueTurn: number;
  description: string;
  effects: Effect[];
  news?: Array<Omit<NewsItem, "id" | "turn">>;
}

export interface DecisionRecord {
  id: string;
  turn: number;
  chapter: number;
  eventTitle: string;
  optionId: string;
  optionLabel: string;
  summary: string;
}

export interface HistoryPoint {
  turn: number;
  dateLabel: string;
  approval: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  ringgit: number;
  fiscalDeficit: number;
  costOfLivingPressure: number;
  coalitionStability: number;
}

export interface CharacterState {
  relationship: number;
  counselUsedTurn: number | null;
}

export type GamePhase = "scene" | "summary";

export interface GameState {
  meta: CampaignMeta;
  turn: number;
  chapter: number;
  phase: GamePhase;
  fallen: boolean;
  economy: EconomyState;
  politics: PoliticsState;
  social: SocialState;
  security: SecurityState;
  diplomacy: Record<DiplomacyKey, number>;
  federal: FederalState;
  characters: Record<string, CharacterState>;
  flags: GameFlags;
  pendingEffects: DelayedEffect[];
  firedEvents: string[];
  queuedEventIds: string[];
  history: HistoryPoint[];
  news: NewsItem[];
  decisions: DecisionRecord[];
  /** The month-end report of the month just closed, kept so a reload during the summary restores it. */
  lastReport?: TurnReport;
  /** v2 optional slices — absent on migrated v1 saves until their systems write them. */
  avatar?: AvatarState;
  policy?: PolicyState;
  parliament?: ParliamentState;
  cabinetState?: CabinetState;
  budget?: BudgetState;
}

export interface Movement {
  label: string;
  from: number;
  to: number;
  unit: string;
  goodDirection: "up" | "down";
}

export interface TurnReport {
  turn: number;
  dateLabel: string;
  movements: Movement[];
  delayedNotes: string[];
  headlines: NewsItem[];
  fallen: boolean;
}

export type SaveSlotId = 0 | 1 | 2 | 3;

export interface SaveSummary {
  playerName: string;
  campaignName: string;
  turn: number;
  chapter: number;
  dateLabel: string;
  approval: number;
}

export interface GameSave {
  version: number;
  slot: SaveSlotId;
  savedAt: string;
  summary: SaveSummary;
  state: GameState;
}

/** PM customisation chosen at New Game (v2, optional). */
export interface AvatarState {
  skin?: string;
  hair?: string;
  headwear?: "none" | "songkok" | "kopiah" | "tudung";
  attire?: string;
  glasses?: boolean;
  homeState?: string;
  priorCareer?: "civilService" | "military" | "business" | "activism" | "academia";
  traits?: string[];
}

/** Policy dossier state (v2, optional): enacted measures and lever positions. */
export interface PolicyState {
  enacted: Record<string, number>;
  levers?: Record<string, number>;
}

/** Parliament game state (v2, optional): bills, defections, confidence. */
export interface ParliamentBill {
  id: string;
  title: string;
  turn: number;
  kind: "ordinary" | "constitution" | "supply" | "confidence";
  votes: { for: number; against: number; abstain: number };
  passed: boolean;
}

export interface ParliamentState {
  bills: ParliamentBill[];
  defections?: Array<{ turn: number; from: string; to: string; characterId?: string }>;
  confidence?: { lastMotionTurn?: number; passed?: boolean };
}

/** Cabinet appointments and faction mood (v2, optional). */
export interface CabinetState {
  appointments: Record<string, string>;
  factionAnger?: Record<string, number>;
}

/** Annual budget allocations (v2, optional). */
export interface BudgetState {
  allocations?: Record<string, number>;
  passedTurn?: number;
}

export const SAVE_VERSION = 2;
