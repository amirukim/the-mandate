import { useGameStore } from "../stores/game-store";
import { shortDateLabel } from "../engine/calendar";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { useT, tf } from "../i18n/store";

export function History() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  if (!game) return null;

  const chapters = [...new Set(game.decisions.map((d) => d.chapter))].sort((a, b) => a - b);

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader
        kicker={t("history.kicker")}
        title={t("history.title")}
        lead={t("history.lead")}
      />

      {game.decisions.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            {t("history.empty")}
          </p>
        </Panel>
      ) : (
        chapters.map((chapter) => (
          <section key={chapter} className="mt-8" aria-label={tf("history.decisionsAria", { n: chapter })}>
            <h2 className="kicker text-gold-text">
              {chapter === 1 ? t("history.chapter1") : tf("history.chapterOnward", { n: chapter })}
            </h2>
            <div className="rule-gold mt-2 mb-4" />
            <ol className="space-y-3">
              {game.decisions
                .filter((d) => d.chapter === chapter)
                .map((decision, i) => (
                  <li key={`${decision.id}-${i}`}>
                    <Panel>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="display text-base font-semibold">{decision.eventTitle}</h3>
                        <span className="kicker tabular">{shortDateLabel(decision.turn, lang)}</span>
                      </div>
                      <p className="text-sm mt-1.5">
                        <span className="font-semibold text-gold-text">{decision.optionLabel}.</span>{" "}
                        <span className="text-ink/90">{decision.summary}</span>
                      </p>
                    </Panel>
                  </li>
                ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
