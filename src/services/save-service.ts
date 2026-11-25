import { supabase, isCloudEnabled } from "./supabase";
import { SAVE_VERSION, type GameState, type GameSave, type SaveSlotId, type SaveSummary } from "../types/game";
import { migrateSave } from "../engine/save-migrate";

export { migrateSave };

const LOCAL_KEY = "mtm:slots";

export function summarize(state: GameState): SaveSummary {
  return {
    playerName: state.meta.playerName,
    campaignName: state.meta.campaignName,
    turn: state.turn,
    chapter: state.chapter,
    dateLabel: state.history[state.history.length - 1]?.dateLabel ?? "November 2026",
    approval: Math.round(state.politics.approval),
  };
}

function readLocalAll(): Partial<Record<SaveSlotId, GameSave>> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<SaveSlotId, GameSave>>) : {};
  } catch {
    return {};
  }
}

function writeLocalAll(all: Partial<Record<SaveSlotId, GameSave>>): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

export function saveLocal(slot: SaveSlotId, state: GameState): GameSave {
  const save: GameSave = {
    version: SAVE_VERSION,
    slot,
    savedAt: new Date().toISOString(),
    summary: summarize(state),
    state,
  };
  const all = readLocalAll();
  all[slot] = save;
  writeLocalAll(all);
  return save;
}

export function loadLocal(slot: SaveSlotId): GameSave | null {
  return readLocalAll()[slot] ?? null;
}

export function listLocalSaves(): GameSave[] {
  const all = readLocalAll();
  return (Object.values(all) as GameSave[]).sort((a, b) => a.slot - b.slot);
}

export function deleteLocal(slot: SaveSlotId): void {
  const all = readLocalAll();
  delete all[slot];
  writeLocalAll(all);
}

/**
 * Migration lives in engine/save-migrate.ts (pure, self-checkable) and is
 * re-exported here for the pages.
 */

export interface CloudSaveRow {
  slot: number;
  name: string;
  updated_at: string;
  row_version: number;
}

export interface PushResult {
  ok: boolean;
  conflict: boolean;
  remoteRowVersion: number | null;
  error?: string;
}

function rowVersionKey(slot: SaveSlotId): string {
  return `mtm:sync:${slot}`;
}

function getKnownRowVersion(slot: SaveSlotId): number {
  const raw = localStorage.getItem(rowVersionKey(slot));
  return raw ? Number(raw) : 0;
}

function setKnownRowVersion(slot: SaveSlotId, version: number): void {
  localStorage.setItem(rowVersionKey(slot), String(version));
}

export async function pushCloud(slot: SaveSlotId, state: GameState, overwrite = false): Promise<PushResult> {
  if (!isCloudEnabled || !supabase) return { ok: false, conflict: false, remoteRowVersion: null, error: "Cloud is not configured." };
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { ok: false, conflict: false, remoteRowVersion: null, error: "Sign in to sync." };

  const expected = getKnownRowVersion(slot);
  const payload = { state: { ...state }, summary: summarize(state) };

  const { data: existing } = await supabase
    .from("campaigns")
    .select("row_version")
    .eq("user_id", user.id)
    .eq("slot", slot)
    .maybeSingle();

  if (existing && existing.row_version !== expected && !overwrite) {
    return { ok: false, conflict: true, remoteRowVersion: existing.row_version as number };
  }

  if (existing) {
    const nextVersion = overwrite ? (existing.row_version as number) + 1 : expected + 1;
    const update = supabase
      .from("campaigns")
      .update({ state: payload.state, summary: payload.summary, updated_at: new Date().toISOString(), row_version: nextVersion })
      .eq("user_id", user.id)
      .eq("slot", slot);
    const guarded = overwrite ? update : update.eq("row_version", expected);
    const { error } = await guarded;
    if (error) return { ok: false, conflict: false, remoteRowVersion: null, error: error.message };
    setKnownRowVersion(slot, nextVersion);
    return { ok: true, conflict: false, remoteRowVersion: nextVersion };
  }

  const { error } = await supabase.from("campaigns").insert({
    user_id: user.id,
    slot,
    name: state.meta.campaignName,
    state: payload.state,
    summary: payload.summary,
    row_version: 1,
  });
  if (error) return { ok: false, conflict: false, remoteRowVersion: null, error: error.message };
  setKnownRowVersion(slot, 1);
  return { ok: true, conflict: false, remoteRowVersion: 1 };
}

export async function pullCloud(slot: SaveSlotId): Promise<{ ok: boolean; error?: string }> {
  if (!isCloudEnabled || !supabase) return { ok: false, error: "Cloud is not configured." };
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { ok: false, error: "Sign in to sync." };

  const { data, error } = await supabase
    .from("campaigns")
    .select("state, row_version")
    .eq("user_id", user.id)
    .eq("slot", slot)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data || !data.state) return { ok: false, error: "No cloud save in this slot." };

  const migrated = migrateSave(data.state);
  if (!migrated) return { ok: false, error: "Cloud save has an unknown format." };

  saveLocal(slot, migrated.state);
  setKnownRowVersion(slot, data.row_version as number);
  return { ok: true };
}

export async function listCloud(): Promise<CloudSaveRow[]> {
  if (!isCloudEnabled || !supabase) return [];
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return [];
  const { data } = await supabase
    .from("campaigns")
    .select("slot, name, updated_at, row_version")
    .eq("user_id", user.id)
    .order("slot");
  return (data ?? []) as CloudSaveRow[];
}

export async function deleteCloud(slot: SaveSlotId): Promise<{ ok: boolean; error?: string }> {
  if (!isCloudEnabled || !supabase) return { ok: false, error: "Cloud is not configured." };
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { ok: false, error: "Sign in to sync." };
  const { error } = await supabase.from("campaigns").delete().eq("user_id", user.id).eq("slot", slot);
  return error ? { ok: false, error: error.message } : { ok: true };
}
