import { useRef, useState } from "react";
import { useGameStore } from "../stores/game-store";
import { shortDateLabel } from "../engine/calendar";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { DocumentViewer } from "../components/ui/DocumentViewer";
import { prefersReducedMotion } from "../hooks/usePortalOverlay";
import { useT, tf } from "../i18n/store";
import { cn } from "../utils/cn";

/**
 * The decision record, bound like a minute book: one sheet, chapter dividers,
 * numbered entries. Filtering by chapter is presentation only — the log
 * itself never changes.
 */
export function History() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  const [chapter, setChapter] = useState<number | "all">("all");
  const listRef = useRef<HTMLOListElement | null>(null);
  if (!game) return null;

  const chapters = [...new Set(game.decisions.map((d) => d.chapter))].sort((a, b) => a - b);

  const jumpTo = (id: string) => {
    const reduced = prefersReducedMotion();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  let entry = 0;

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader
        kicker={t("history.kicker")}
        title={t("history.title")}
        lead={t("history.lead")}
      />

      {game.decisions.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">{t("history.empty")}</p>
        </Panel>
      ) : (
        <>
          {/* chapter filter */}
          <div role="tablist" aria-label={t("history.filterAria")} className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              role="tab"
              aria-selected={chapter === "all"}
              onClick={() => setChapter("all")}
              className={cn(
                "px-3.5 py-2.5 text-xs font-semibold border rounded-[2px] transition-colors",
                chapter === "all"
                  ? "border-gold text-gold-text bg-paper-deep"
                  : "border-rule-strong text-muted hover:text-ink hover:border-gold/60",
              )}
            >
              {t("history.allChapters")}
            </button>
            {chapters.map((n) => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={chapter === n}
                onClick={() => {
                  setChapter(n);
                  jumpTo("decision-record");
                }}
                className={cn(
                  "px-3.5 py-2.5 text-xs font-semibold border rounded-[2px] transition-colors tabular",
                  chapter === n
                    ? "border-gold text-gold-text bg-paper-deep"
                    : "border-rule-strong text-muted hover:text-ink hover:border-gold/60",
                )}
              >
                {tf("history.chapterTab", { n })}
              </button>
            ))}
          </div>

          <DocumentViewer label={t("history.title")}>
            {/* the bound sheet: spine rule, then the minute entries */}
            <div className="border-l-2 border-rule-strong pl-5 sm:pl-7">
              <p className="kicker text-[11px]">{t("history.recordTag")}</p>
              <ol ref={listRef} id="decision-record" className="mt-5 space-y-6" aria-label={t("history.lead")}>
                {chapters
                  .filter((n) => chapter === "all" || n === chapter)
                  .map((n) => (
                    <li key={n}>
                      <section aria-label={tf("history.decisionsAria", { n: n })}>
                        <div className="flex items-baseline justify-between gap-3">
                          <h2 className="kicker text-gold-text">
                            {n === 1 ? t("history.chapter1") : tf("history.chapterOnward", { n })}
                          </h2>
                          <span aria-hidden="true" className="flex-1 border-t border-rule" />
                        </div>
                        <ol className="mt-3 space-y-5">
                          {game.decisions
                            .filter((d) => d.chapter === n)
                            .map((decision, i) => {
                              entry += 1;
                              return (
                                <li key={`${decision.id}-${i}`} className="flex gap-4">
                                  <span
                                    aria-hidden="true"
                                    className="tabular shrink-0 inline-flex items-center justify-center w-7 h-7 border border-rule-strong text-gold-text text-xs font-bold rounded-[2px]"
                                  >
                                    {String(entry).padStart(2, "0")}
                                  </span>
                                  <div className="min-w-0 flex-1 border-b border-rule pb-4 last:border-b-0">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                      <h3 className="display text-base font-semibold">{decision.eventTitle}</h3>
                                      <span className="kicker tabular">{shortDateLabel(decision.turn, lang)}</span>
                                    </div>
                                    <p className="text-sm mt-1.5 leading-relaxed">
                                      <span className="font-semibold text-gold-text">{decision.optionLabel}.</span>{" "}
                                      <span className="text-ink/90">{decision.summary}</span>
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                        </ol>
                      </section>
                    </li>
                  ))}
              </ol>
              <p className="kicker text-[11px] mt-8">{t("history.recordEnd")}</p>
            </div>
          </DocumentViewer>
        </>
      )}
    </div>
  );
}
