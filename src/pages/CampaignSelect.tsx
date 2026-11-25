import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { listLocalSaves, loadLocal } from "../services/save-service";
import { isCloudEnabled } from "../services/supabase";
import { useAuthStore } from "../stores/auth-store";
import { listCloud, pullCloud, type CloudSaveRow } from "../services/save-service";
import type { GameSave } from "../types/game";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { useT } from "../i18n/store";

export function CampaignSelect() {
  const loadFromSave = useGameStore((s) => s.loadFromSave);
  const navigate = useNavigate();
  const { t, tf } = useT();
  const user = useAuthStore((s) => s.user);
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [cloudRows, setCloudRows] = useState<CloudSaveRow[]>([]);
  const [pullNote, setPullNote] = useState<string | null>(null);

  const refresh = () => setSaves(listLocalSaves());

  useEffect(() => {
    refresh();
    if (isCloudEnabled && user) {
      listCloud().then(setCloudRows);
    }
  }, [user]);

  return (
    <div className="min-h-screen atmosphere">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline">
          {t("campaigns.back")}
        </Link>
        <div className="flex items-center gap-3 mt-8">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{t("campaigns.kicker")}</p>
        </div>
        <h1 className="headline mt-3">{t("campaigns.title")}</h1>
        <div className="rule-double mt-5" />

        {loadLocal(0) && (
          <div className="mt-8">
            <Button
              onClick={() => {
                if (loadFromSave(0)) navigate("/game/home");
              }}
            >
              {t("campaigns.continueAutosave")}
            </Button>
          </div>
        )}

        <section className="mt-8" aria-label={t("campaigns.localSlots")}>
          <h2 className="kicker text-gold-text">{t("campaigns.localSlots")}</h2>
          <div className="rule-gold mt-2 mb-4" />
          {saves.filter((s) => s.slot !== 0).length === 0 ? (
            <p className="text-muted text-sm py-4">
              {t("campaigns.empty1")}{" "}
              <Link to="/new" className="text-gold-text underline underline-offset-4">
                {t("campaigns.empty2")}
              </Link>{" "}
              {t("campaigns.empty3")}
            </p>
          ) : (
            <ul className="space-y-3">
              {saves
                .filter((s) => s.slot !== 0)
                .map((save) => (
                  <li key={save.slot}>
                    <Panel>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="kicker">{tf("campaigns.slot", { n: save.slot })}</p>
                          <p className="display text-lg font-semibold mt-0.5">{save.summary.campaignName}</p>
                          <p className="text-sm text-muted mt-0.5">
                            {save.summary.playerName} · {save.summary.dateLabel} · {t("campaigns.approvalWord")}{" "}
                            <span className="tabular">{save.summary.approval}%</span> · {t("campaigns.savedWord")}{" "}
                            {new Date(save.savedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (loadFromSave(save.slot)) navigate("/game/home");
                          }}
                        >
                          {t("campaigns.load")}
                        </Button>
                      </div>
                    </Panel>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="mt-10" aria-label={t("campaigns.cloudSlots")}>
          <h2 className="kicker text-gold-text">{t("campaigns.cloudSlots")}</h2>
          <div className="rule-gold mt-2 mb-4" />
          {!isCloudEnabled ? (
            <p className="text-muted text-sm">
              {t("campaigns.cloudOff")}
            </p>
          ) : !user ? (
            <p className="text-muted text-sm">
              <Link to="/login" className="text-gold-text underline underline-offset-4">
                {t("auth.signIn")}
              </Link>{" "}
              {t("campaigns.signInToSync")}
            </p>
          ) : (
            <>
              {pullNote && (
                <p role="status" className="text-sm text-muted mb-3">
                  {pullNote}
                </p>
              )}
              {cloudRows.length === 0 ? (
                <p className="text-muted text-sm py-2">{t("campaigns.emptyCloud")}</p>
              ) : (
                <ul className="space-y-2">
                  {cloudRows.map((row) => (
                    <li key={row.slot} className="flex flex-wrap items-center justify-between gap-3 border border-rule rounded-panel bg-card px-4 py-3">
                      <div>
                        <p className="kicker">{tf("campaigns.slot", { n: row.slot })}</p>
                        <p className="text-sm font-medium mt-0.5">{row.name}</p>
                        <p className="text-xs text-muted">{new Date(row.updated_at).toLocaleString()}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const result = await pullCloud(row.slot as 1 | 2 | 3);
                          setPullNote(result.ok ? t("campaigns.pulled") : result.error ?? t("campaigns.pullFail"));
                          refresh();
                        }}
                      >
                        {t("campaigns.pullDevice")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
