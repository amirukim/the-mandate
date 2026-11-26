import { useState } from "react";
import { useGameStore } from "../../stores/game-store";
import { BILLS } from "../../data/bills";
import { tx } from "../../data/lt";
import { whip, ensureParliament, MAJORITY, TWO_THIRDS } from "../../engine/parliament";
import { VoteResultCard } from "./VoteResultCard";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/**
 * The order paper: the bills the PM may table, the whip's forecast for each,
 * and the division when it is called. Forecast and outcome share one
 * deterministic function, so the arithmetic the player audits is exactly the
 * arithmetic that lands.
 */
export function OrderPaper() {
  const game = useGameStore((s) => s.game);
  const runBillVote = useGameStore((s) => s.runBillVote);
  const moveConfidence = useGameStore((s) => s.moveConfidence);
  const { t, lang } = useT();
  const [openBill, setOpenBill] = useState<string | null>(null);
  if (!game) return null;

  const parliament = ensureParliament(game);
  const decided = new Map(parliament.bills.map((b) => [b.id, b]));
  const undecided = BILLS.filter((b) => !decided.has(b.id));
  const confidenceRecord = parliament.bills.filter((b) => b.kind === "confidence").slice(-1)[0];

  return (
    <div className="space-y-5">
      {undecided.length === 0 && (
        <p className="text-sm text-muted">{lang === "ms" ? "Tiada lagi rang undang-undang dalam penggal ini." : "Nothing left on the order paper this sitting."}</p>
      )}

      <ul className="space-y-3">
        {undecided.map((bill) => {
          const forecast = whip(game, bill);
          const open = openBill === bill.id;
          return (
            <li key={bill.id} className="bg-card border border-rule rounded-panel overflow-hidden">
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="display text-sm font-semibold">{tx(bill.title, lang)}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{tx(bill.summary, lang)}</p>
                  </div>
                  <span
                    className={cn(
                      "kicker text-[9px] shrink-0 px-1.5 py-0.5 border rounded-[2px]",
                      bill.kind === "constitution" ? "border-gold/60 text-gold-text" : bill.kind === "supply" ? "border-brick/50 text-brick-text" : "border-rule text-muted",
                    )}
                  >
                    {bill.kind === "constitution" ? t("parliament.constitution") : bill.kind === "supply" ? t("parliament.supply") : t("parliament.ordinary")}
                  </span>
                </div>

                {open && (
                  <div className="mt-3 border-t border-rule pt-3">
                    <p className="kicker text-[10px] mb-1.5">{t("parliament.forecast")}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
                      <span className="text-[#3f6b57] font-semibold">{t("parliament.forVotes")}: <span className="tabular">{forecast.forVotes}</span></span>
                      <span className="text-[#8f4038] font-semibold">{t("parliament.againstVotes")}: <span className="tabular">{forecast.againstVotes}</span></span>
                      <span className="text-muted font-semibold">{t("parliament.abstain")}: <span className="tabular">{forecast.abstain}</span></span>
                      <span className={cn("font-semibold", forecast.pass ? "text-gold-text" : "text-brick-text")}>
                        {forecast.pass ? t("parliament.passed") : t("parliament.defeated")}
                      </span>
                    </div>
                    {(bill.kind === "supply") && <p className="text-xs text-brick-text mb-2">{t("parliament.supplyDanger")}</p>}
                    <button
                      type="button"
                      onClick={() => runBillVote(bill.id)}
                      className="text-sm font-semibold text-gold-text hover:text-gold-bright transition-colors"
                    >
                      {t("parliament.callVote")} →
                    </button>
                  </div>
                )}

                {!open && (
                  <button
                    type="button"
                    onClick={() => setOpenBill(bill.id)}
                    className="mt-3 text-sm font-semibold text-gold-text hover:text-gold-bright transition-colors"
                  >
                    {t("parliament.table")} →
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* the chamber's record */}
      {parliament.bills.length > 0 && (
        <div>
          <p className="kicker text-[10px] mb-2">{t("parliament.orderKicker")}</p>
          <ul className="divide-y divide-rule border-y border-rule">
            {[...parliament.bills].reverse().map((b) => (
              <li key={`${b.id}-${b.turn}`} className="py-2 flex items-center justify-between gap-3">
                <span className="text-sm truncate">{b.title}</span>
                <span className="text-right shrink-0">
                  <span className="tabular text-sm font-semibold">{b.votes.for}–{b.votes.against}</span>
                  <span className={cn("kicker ml-2", b.passed ? "text-gold-text" : "text-brick-text")}>
                    {b.passed ? t("parliament.passed") : t("parliament.defeated")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {/* the latest division, drawn as bars */}
          {(() => {
            const last = parliament.bills[parliament.bills.length - 1];
            const arithmetic = {
              forVotes: last.votes.for,
              againstVotes: last.votes.against,
              abstain: last.votes.abstain,
              threshold: last.kind === "constitution" ? TWO_THIRDS : MAJORITY,
              kindLabel: last.kind === "constitution" ? ("two-thirds" as const) : ("majority" as const),
              pass: last.passed,
              blocs: [],
            };
            return (
              <div className="mt-3">
                <VoteResultCard arithmetic={arithmetic} passed={last.passed} title={last.title} lang={lang} compact />
              </div>
            );
          })()}
        </div>
      )}

      {/* confidence motion */}
      <div className="bg-card border border-brick/40 rounded-panel p-4">
        <h4 className="display text-sm font-semibold">{t("parliament.confidenceTitle")}</h4>
        <p className="text-xs text-muted mt-1 leading-relaxed">{t("parliament.confidenceHint")}</p>
        {confidenceRecord && (
          <p className="text-xs mt-2">
            <span className="kicker text-[10px] mr-2">{t("parliament.confidenceLast")}</span>
            <span className={cn("font-semibold", confidenceRecord.passed ? "text-gold-text" : "text-brick-text")}>
              {confidenceRecord.passed ? t("parliament.passed") : t("parliament.defeated")} · {confidenceRecord.votes.for}–{confidenceRecord.votes.against}
            </span>
          </p>
        )}
        <button
          type="button"
          onClick={() => moveConfidence()}
          className="mt-3 text-sm font-semibold text-brick-text hover:text-brick transition-colors"
        >
          {t("parliament.confidenceCall")} →
        </button>
      </div>

      {/* the majority line reminder */}
      <p className="text-[11px] text-muted">{MAJORITY} {lang === "ms" ? "kerusi untuk majoriti; 148 untuk dua pertiga." : "seats for a majority; 148 for two-thirds."}</p>
    </div>
  );
}
