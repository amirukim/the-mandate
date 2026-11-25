import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { useAuthStore } from "../stores/auth-store";
import {
  deleteCloud,
  deleteLocal,
  listCloud,
  loadLocal,
  migrateSave,
  pullCloud,
  pushCloud,
  saveLocal,
  type CloudSaveRow,
} from "../services/save-service";
import { isCloudEnabled } from "../services/supabase";
import { SAVE_VERSION, type GameSave, type SaveSlotId } from "../types/game";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useT, tf } from "../i18n/store";

const MANUAL_SLOTS: SaveSlotId[] = [1, 2, 3];

function downloadJson(save: GameSave): void {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `mandate-slot-${save.slot}-${save.summary.dateLabel.replace(/\s+/g, "-")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Saves() {
  const game = useGameStore((s) => s.game);
  const loadFromSave = useGameStore((s) => s.loadFromSave);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { t } = useT();
  const [note, setNote] = useState<string | null>(null);
  const [conflictSlot, setConflictSlot] = useState<SaveSlotId | null>(null);
  const [cloudRows, setCloudRows] = useState<CloudSaveRow[]>([]);
  const [localSaves, setLocalSaves] = useState<GameSave[]>(() => {
    return MANUAL_SLOTS.map((slot) => loadLocal(slot)).filter((s): s is GameSave => s !== null);
  });
  const autosave = loadLocal(0);
  const importRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const refresh = () => {
    setLocalSaves(MANUAL_SLOTS.map((slot) => loadLocal(slot)).filter((s): s is GameSave => s !== null));
  };

  useEffect(() => {
    if (isCloudEnabled && user) listCloud().then(setCloudRows);
  }, [user]);

  function saveToSlot(slot: SaveSlotId) {
    if (!game) return;
    saveLocal(slot, game);
    setNote(tf("saves.savedNote", { n: slot }));
    refresh();
  }

  async function push(slot: SaveSlotId, overwrite = false) {
    if (!game) return;
    const result = await pushCloud(slot, game, overwrite);
    if (result.conflict) {
      setConflictSlot(slot);
      setNote(tf("saves.conflictNote", { n: slot }));
      return;
    }
    setConflictSlot(null);
    setNote(result.ok ? tf("saves.pushOk", { n: slot }) : result.error ?? t("saves.pushFail"));
    listCloud().then(setCloudRows);
  }

  async function pull(slot: SaveSlotId) {
    const result = await pullCloud(slot);
    setConflictSlot(null);
    setNote(result.ok ? tf("saves.pullOk", { n: slot }) : result.error ?? t("saves.pullFail"));
    refresh();
  }

  function onImport(slot: SaveSlotId, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = migrateSave(JSON.parse(String(reader.result)));
        if (!parsed) {
          setNote(t("saves.importNotSave"));
          return;
        }
        saveLocal(slot, parsed.state);
        setNote(tf("saves.importOk", { n: slot }));
        refresh();
      } catch {
        setNote(t("saves.importBad"));
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader
        kicker={t("saves.kicker")}
        title={t("saves.title")}
        lead={t("saves.lead")}
      />

      {note && (
        <p role="status" className="text-sm text-muted border border-rule bg-paper-deep rounded-[2px] px-3 py-2 mb-6">
          {note}
        </p>
      )}

      <Panel kicker={t("saves.autosaveKicker")} title={t("saves.autosaveTitle")}>
        {autosave ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {autosave.summary.campaignName} · {autosave.summary.dateLabel} · {t("saves.approvalWord")}{" "}
              <span className="tabular">{autosave.summary.approval}%</span>
            </p>
            <Button
              size="sm"
              onClick={() => {
                if (loadFromSave(0)) navigate("/game/home");
              }}
            >
              {t("saves.loadAutosave")}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("saves.noAutosave")}</p>
        )}
      </Panel>

      <section className="mt-8" aria-label={t("saves.manualAria")}>
        <h2 className="kicker text-gold-text">{t("saves.manualSlots")}</h2>
        <div className="rule-gold mt-2 mb-4" />
        <ul className="space-y-3">
          {MANUAL_SLOTS.map((slot) => {
            const save = localSaves.find((s) => s.slot === slot);
            return (
              <li key={slot}>
                <Panel>
                  {save ? (
                    <div>
                      <p className="display text-base font-semibold">{save.summary.campaignName}</p>
                      <p className="text-sm text-muted mt-0.5">
                        {save.summary.playerName} · {save.summary.dateLabel} · {t("saves.approvalWord")}{" "}
                        <span className="tabular">{save.summary.approval}%</span> · schema v{save.version}
                        {save.version !== SAVE_VERSION && ` ${t("saves.schemaOld")}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (loadFromSave(slot)) navigate("/game/home");
                          }}
                        >
                          {t("saves.load")}
                        </Button>
                        {game && (
                          <Button size="sm" variant="outline" onClick={() => saveToSlot(slot)}>
                            {t("saves.overwrite")}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => downloadJson(save)}>
                          {t("saves.exportFile")}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (!window.confirm(t("saves.confirmDeleteLocal"))) return;
                            deleteLocal(slot);
                            setNote(tf("saves.deletedNote", { n: slot }));
                            refresh();
                          }}
                        >
                          {t("saves.delete")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted">{tf("saves.slotEmpty", { n: slot })}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" disabled={!game} onClick={() => saveToSlot(slot)}>
                          {t("saves.saveHere")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => importRefs.current[slot]?.click()}>
                          {t("saves.importFile")}
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={(el) => {
                      importRefs.current[slot] = el;
                    }}
                    type="file"
                    accept="application/json"
                    className="sr-only"
                    aria-label={tf("saves.importAria", { n: slot })}
                    onChange={(event) => onImport(slot, event)}
                  />
                </Panel>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8" aria-label={t("saves.cloudAria")}>
        <h2 className="kicker text-gold-text">{t("saves.cloudSlots")}</h2>
        <div className="rule-gold mt-2 mb-4" />
        {!isCloudEnabled ? (
          <p className="text-sm text-muted max-w-prose">
            {t("saves.cloudOff")}
          </p>
        ) : !user ? (
          <p className="text-sm text-muted">{t("saves.cloudSignIn")}</p>
        ) : (
          <ul className="space-y-3">
            {MANUAL_SLOTS.map((slot) => {
              const row = cloudRows.find((r) => r.slot === slot);
              return (
                <li key={slot}>
                  <Panel>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="kicker">{tf("saves.cloudSlot", { n: slot })}</p>
                        {row ? (
                          <p className="text-sm mt-0.5">
                            {row.name} · <span className="text-muted">{new Date(row.updated_at).toLocaleString()}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-muted mt-0.5">{t("saves.emptyCloud")}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={!game} onClick={() => push(slot)}>
                          {t("saves.pushCurrent")}
                        </Button>
                        <Button size="sm" variant="outline" disabled={!row} onClick={() => pull(slot)}>
                          {t("saves.pullDevice")}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={!row}
                          onClick={async () => {
                            if (!window.confirm(t("saves.confirmDeleteCloud"))) return;
                            const result = await deleteCloud(slot);
                            setNote(result.ok ? tf("saves.cloudDeleted", { n: slot }) : result.error ?? t("saves.deleteFail"));
                            listCloud().then(setCloudRows);
                          }}
                        >
                          {t("saves.deleteCloud")}
                        </Button>
                      </div>
                    </div>
                    {conflictSlot === slot && (
                      <div className="mt-3 border-l-2 border-brick pl-3">
                        <p className="text-sm text-brick-text">
                          {t("saves.conflictText")}
                        </p>
                        <Button size="sm" variant="danger" className="mt-2" onClick={() => push(slot, true)}>
                          {t("saves.overwriteCloud")}
                        </Button>
                      </div>
                    )}
                  </Panel>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
