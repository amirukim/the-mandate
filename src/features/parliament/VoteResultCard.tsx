import type { Lang } from "../../types/lang";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";
import type { VoteArithmetic, BlocVote } from "../../engine/parliament";
import { coalitionById } from "../../data/parties";
import { MAJORITY, TOTAL_SEATS } from "../../engine/parliament";

/**
 * The division result: the arithmetic a player can audit — bars for/against/
 * abstain against the threshold line, the stamp, and the bloc lines with any
 * defected seats marked. Used by the order paper, the confidence motion and
 * the Budget Office's supply vote.
 */
export function VoteResultCard({
  arithmetic,
  passed,
  title,
  lang,
  compact = false,
}: {
  arithmetic: VoteArithmetic;
  passed: boolean;
  title: string;
  lang: Lang;
  compact?: boolean;
}) {
  const { t } = useT();
  const scale = Math.max(arithmetic.threshold, TOTAL_SEATS);
  return (
    <div className={cn("bg-card border rounded-[2px] overflow-hidden", passed ? "border-gold/60" : "border-brick/50", compact ? "p-3" : "p-4")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="display text-sm font-semibold">{title}</h4>
        <span
          className={cn(
            "font-pixel text-[10px] px-2 py-1 rounded-[2px] tracking-wider",
            passed ? "bg-gold/15 text-gold-text border border-gold/50" : "bg-brick/10 text-brick-text border border-brick/50",
          )}
        >
          {passed ? t("parliament.passed") : t("parliament.defeated")}
        </span>
      </div>

      <div className="mt-3" role="img" aria-label={`${t("parliament.forVotes")} ${arithmetic.forVotes}, ${t("parliament.againstVotes")} ${arithmetic.againstVotes}, ${t("parliament.abstain")} ${arithmetic.abstain}`}>
        <div className="h-3 w-full bg-surface border border-rule rounded-[1px] overflow-hidden flex">
          <div className="h-full bg-[#5f8a74]" style={{ width: `${(arithmetic.forVotes / scale) * 100}%` }} />
          <div className="h-full bg-[#a44a3f]" style={{ width: `${(arithmetic.againstVotes / scale) * 100}%` }} />
          <div className="h-full bg-rule-strong" style={{ width: `${(arithmetic.abstain / scale) * 100}%` }} />
        </div>
        <div className="relative h-4" aria-hidden="true">
          <div
            className="absolute top-0 h-3 w-[2px] bg-gold"
            style={{ left: `${(arithmetic.threshold / scale) * 100}%` }}
          />
          <span className="absolute top-3 text-[10px] text-muted" style={{ left: `${(arithmetic.threshold / scale) * 100}%`, transform: "translateX(-50%)" }}>
            {arithmetic.kindLabel === "two-thirds" ? t("parliament.twoThirdsLine") : t("parliament.majorityLine")} · {arithmetic.threshold}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="font-semibold text-[#3f6b57]">{t("parliament.forVotes")}: <span className="tabular">{arithmetic.forVotes}</span></span>
        <span className="font-semibold text-[#8f4038]">{t("parliament.againstVotes")}: <span className="tabular">{arithmetic.againstVotes}</span></span>
        <span className="font-semibold text-muted">{t("parliament.abstain")}: <span className="tabular">{arithmetic.abstain}</span></span>
      </div>

      {!compact && (
        <ul className="mt-3 divide-y divide-rule border-t border-rule text-xs">
          {arithmetic.blocs.map((bloc: BlocVote) => {
            const c = coalitionById(bloc.blocId);
            return (
              <li key={bloc.blocId} className="py-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span aria-hidden="true" className="inline-block w-2 h-2 rounded-[1px] shrink-0" style={{ backgroundColor: c?.color }} />
                  <span className="font-semibold truncate">{c?.abbr ?? bloc.blocId}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="tabular">{bloc.seats}</span>
                  <span className={cn("kicker ml-2", bloc.position === "for" && "text-[#3f6b57]", bloc.position === "against" && "text-[#8f4038]")}>
                    {bloc.position === "for" ? t("parliament.forVotes") : bloc.position === "against" ? t("parliament.againstVotes") : t("parliament.abstain")}
                  </span>
                  {bloc.defected > 0 && bloc.position !== "abstain" && (
                    <span className="ml-1 text-brick-text">· {bloc.defected} {t("parliament.defected")}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {compact && <p className="text-[11px] text-muted mt-2">{MAJORITY} {lang === "ms" ? "kerusi majoriti" : "seats for a majority"}</p>}
    </div>
  );
}
