import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { NewsList } from "../components/news/NewsList";
import { dateLabel } from "../engine/calendar";
import { useT } from "../i18n/store";
import { MonthTransition } from "../components/ui/MonthTransition";
import { cn } from "../utils/cn";

export function Summary() {
  const game = useGameStore((s) => s.game);
  const lastReport = useGameStore((s) => s.lastReport);
  const endMonth = useGameStore((s) => s.endMonth);
  const beginNextMonth = useGameStore((s) => s.beginNextMonth);
  const navigate = useNavigate();
  const { t, tf, lang } = useT();
  const [transition, setTransition] = useState<string | null>(null);

  // Engine movement labels are English; map them to dictionary keys.
  const MOVEMENT_KEY: Record<string, string> = {
    "Public approval": "overview.approval",
    "GDP growth": "overview.gdp",
    Inflation: "overview.inflation",
    Unemployment: "overview.unemployment",
    "Ringgit vs USD": "overview.ringgit",
    "Fiscal deficit": "overview.deficit",
    "Cost of living pressure": "overview.costLiving",
    "Coalition stability": "overview.coalition",
  };

  if (!game) return null;

  if (!lastReport) {
    return (
      <div className="page-enter max-w-2xl">
        <Panel kicker={dateLabel(game.turn, lang)} title={t("summary.notClosed")}>
          <p className="text-sm leading-relaxed text-ink/90">
            {t("summary.notClosedText")}
          </p>
          <div className="mt-5">
            <Button onClick={() => endMonth()}>{t("summary.endMonth")}</Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl">
      <header className="relative -mx-4 sm:-mx-8 -mt-8 mb-7 px-4 sm:px-8 pt-10 pb-7 bg-gradient-to-b from-surface/70 via-surface/30 to-transparent border-b border-rule">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{tf("summary.monthlyKicker", { date: lastReport.dateLabel })}</p>
        </div>
        <h1 className="headline mt-3">{t("summary.reviewTitle")}</h1>
      </header>

      <Panel kicker={t("summary.indicatorsKicker")} title={t("summary.indicatorsTitle")}>
        <div className="scroll-x">
          <table className="w-full text-sm tabular">
            <caption className="sr-only">{tf("summary.indicatorsCaption", { date: lastReport.dateLabel })}</caption>
            <thead>
              <tr className="text-left kicker border-b border-rule">
                <th scope="col" className="py-2 pr-3 font-medium">{t("summary.thIndicator")}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t("summary.thLast")}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t("summary.thNow")}</th>
                <th scope="col" className="py-2 font-medium">{t("summary.thChange")}</th>
              </tr>
            </thead>
            <tbody>
              {lastReport.movements.map((m) => {
                const delta = m.to - m.from;
                const improved = m.goodDirection === "up" ? delta > 0.04 : delta < -0.04;
                const worsened = m.goodDirection === "up" ? delta < -0.04 : delta > 0.04;
                return (
                  <tr key={m.label} className="border-b border-rule last:border-b-0">
                    <td className="py-2 pr-3 font-medium">{t(MOVEMENT_KEY[m.label] ?? m.label)}</td>
                    <td className="py-2 pr-3 text-muted">{m.from}</td>
                    <td className="py-2 pr-3 font-semibold">{m.to} {m.unit}</td>
                    <td
                      className={cn(
                        "py-2 font-semibold",
                        improved && "text-moss-text",
                        worsened && "text-brick-text",
                        !improved && !worsened && "text-muted",
                      )}
                    >
                      {delta > 0.04 ? "+" : delta < -0.04 ? "\u2212" : ""}
                      {Math.abs(delta).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Panel kicker={t("summary.delayedKicker")} title={t("summary.delayedTitle")}>
          {lastReport.delayedNotes.length === 0 ? (
            <p className="text-sm text-muted">{t("summary.noDelayed")}</p>
          ) : (
            <ul className="space-y-2.5">
              {lastReport.delayedNotes.map((note, i) => (
                <li key={i} className="text-sm leading-relaxed border-l-2 border-gold pl-3">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel kicker={t("summary.wireKicker")} title={t("summary.wireTitle")}>
          {lastReport.headlines.length === 0 ? (
            <p className="text-sm text-muted">{t("summary.quietWire")}</p>
          ) : (
            <NewsList items={lastReport.headlines} lang={lang} />
          )}
        </Panel>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            // Suzerain turn change: stamp the month, then enter it.
            setTransition(dateLabel(game.turn, lang));
            beginNextMonth();
          }}
        >
          {tf("summary.begin", { date: dateLabel(game.turn, lang) })}
        </Button>
        <Link to="/game/news">
          <Button variant="outline">{t("summary.readWire")}</Button>
        </Link>
      </div>

      {transition && (
        <MonthTransition
          dateLabel={transition}
          chapterTitle={game.chapter === 1 ? t("history.chapter1") : t("history.chapterOnward").replace("%{n}", String(game.chapter))}
          onDone={() => {
            setTransition(null);
            navigate("/game/briefing");
          }}
        />
      )}
    </div>
  );
}
