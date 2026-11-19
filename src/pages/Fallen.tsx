import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { dateLabel } from "../engine/calendar";
import { useT } from "../i18n/store";

export function Fallen() {
  const game = useGameStore((s) => s.game);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const navigate = useNavigate();
  const { t, tf, lang } = useT();

  if (!game) return null;

  return (
    <div className="page-enter max-w-3xl">
      <header className="mb-7">
        <p className="stamp">{t("fallen.stamp")}</p>
        <h1 className="headline mt-5">{t("fallen.title")}</h1>
        <div className="rule-double mt-5" />
      </header>

      <Panel kicker={dateLabel(game.turn, lang)} title={t("fallen.panelTitle")}>
        <p className="text-sm leading-relaxed text-ink/90">
          {tf("fallen.body", {
            approval: Math.round(game.politics.approval),
            stability: Math.round(game.politics.coalitionStability),
            month: game.turn + 1,
            decisions: game.decisions.length,
          })}
        </p>
        <p className="text-sm leading-relaxed text-ink/90 mt-3">
          {t("fallen.body2")}
        </p>
      </Panel>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/game/history">
          <Button variant="outline">{t("fallen.reviewHistory")}</Button>
        </Link>
        <Button
          onClick={() => {
            closeCampaign();
            navigate("/");
          }}
        >
          {t("fallen.returnMenu")}
        </Button>
      </div>
    </div>
  );
}
