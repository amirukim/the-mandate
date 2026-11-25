import { SAVE_VERSION, type GameSave } from "../types/game";

/**
 * Save migration (plan C-1/C-2, decision D-08). Pure functions, kept forever:
 * v1 → v2 stamps the new version and leaves the optional v2 slices absent
 * until their systems write them; engines apply defaults with `??` on read.
 * Lives in engine/ so the self-checks can run it without touching services.
 */
export function migrateSave(raw: unknown): GameSave | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as GameSave;
  if (typeof candidate.version !== "number") return null;
  if (candidate.version > SAVE_VERSION) return null; // newer build wrote it: refuse, never half-load
  if (!candidate.state || !candidate.state.meta) return null;
  if (candidate.version < 2) {
    candidate.version = 2;
    // v2 slices are optional and default on read; nothing to fill here yet.
    // v1 `flags` and `characters` carry over as-is.
  }
  return candidate;
}
