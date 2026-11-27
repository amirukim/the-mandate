import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { dateLabel } from "../engine/calendar";
import { classifyMandate } from "../engine/endings";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

/**
 * The ending screen (v2): the endings classifier names how the mandate ended
 * and grades it. The prose is Phase 8 content; the classification is final.
 */
export function Fallen() {
  const game = useGameStore((s) => s.game);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const navigate = useNavigate();
  const { t, tf, lang } = useT();

  if (!game) return null;
  const verdict = classifyMandate(game);
  const grades: Array<{ labelKey: string; value: string }> = [
    { labelKey: "endings.gradeEconomy", value: verdict.grades.economy },
    { labelKey: "endings.gradeSocial", value: verdict.grades.social },
    { labelKey: "endings.gradePolitics", value: verdict.grades.politics },
    { labelKey: "endings.gradeSecurity", value: verdict.grades.security },
    { labelKey: "endings.gradeInstitutions", value: verdict.grades.institutions },
  ];

  return (
    <div className="page-enter max-w-3xl">
      <header className="mb-7">
        <p className="stamp">{t("fallen.stamp")}</p>
        <h1 className="headline mt-5">{t(verdict.titleKey)}</h1>
        <div className="rule-double mt-5" />
      </header>

      <Panel kicker={dateLabel(game.turn, lang)} title={t("fallen.panelTitle")}>
        <p className="text-sm leading-relaxed text-ink/90">
          {t(verdict.bodyKeys[0])}
        </p>
        <p className="text-sm leading-relaxed text-ink/90 mt-3">
          {t(verdict.bodyKeys[1])}
        </p>
        <p className="text-xs text-muted mt-4">
          {tf("fallen.body", {
            approval: Math.round(game.politics.approval),
            stability: Math.round(game.politics.coalitionStability),
            month: game.turn + 1,
            decisions: game.decisions.length,
          })}
        </p>
      </Panel>

      <Panel kicker={t("endings.grades")} title={t("endings.grades")} className="mt-5">
        <dl className="divide-y divide-rule">
          {grades.map((g) => (
            <div key={g.labelKey} className="py-2 flex items-baseline justify-between gap-3">
              <dt className="kicker text-[12px]">{t(g.labelKey)}</dt>
              <dd
                className={cn(
                  "font-pixel text-sm",
                  g.value === "A" || g.value === "B" ? "text-[#3f6b57]" : g.value === "F" || g.value === "D" ? "text-brick-text" : "text-gold-text",
                )}
              >
                {g.value}
              </dd>
            </div>
          ))}
        </dl>
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
