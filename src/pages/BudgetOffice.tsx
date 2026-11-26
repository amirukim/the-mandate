import { useGameStore } from "../stores/game-store";
import { BUDGET_LINES, ENVELOPE, LINE_MAX, LINE_MIN, budgetSum, deriveStance, ensureBudget, stanceDeficit, withinEnvelope, type BudgetStance } from "../engine/budget";
import { tx } from "../data/lt";
import { effectLabel } from "../features/shared/effectLabel";
import { isBudgetTurn } from "../engine/calendar";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

const STANCE_KEY: Record<BudgetStance, string> = {
  expansion: "budget.stanceExpansion",
  investment: "budget.stanceInvestment",
  consolidation: "budget.stanceConsolidation",
  balanced: "budget.stanceBalanced",
};

const STANCE_DEFICIT: Record<BudgetStance, number> = {
  expansion: 0.5,
  investment: 0.3,
  consolidation: -0.4,
  balanced: 0,
};

/** The Budget Office (v2): sliders on the envelope, the stance they read as,
 * and the supply vote that turns the draft into law. */
export function BudgetOffice() {
  const game = useGameStore((s) => s.game);
  const setAllocation = useGameStore((s) => s.setBudgetAllocation);
  const tableBudget = useGameStore((s) => s.tableBudgetBill);
  const { t, lang } = useT();
  if (!game) return null;

  const budget = ensureBudget(game);
  const allocations = budget.allocations ?? {};
  const total = budgetSum(allocations);
  const fits = withinEnvelope(allocations);
  const stance = deriveStance(allocations);
  const season = isBudgetTurn(game.turn);
  const lastSupply = (game.parliament?.bills ?? []).filter((b) => b.kind === "supply").slice(-1)[0];

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("nav.budgetOffice")}
        title={t("budget.title")}
        lead={t("budget.lead")}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 min-w-0">
          <Panel kicker={t("budget.envelope")} title={`${total} / ${ENVELOPE}`}>
            {/* the envelope bar */}
            <div
              className="h-3 w-full bg-surface border border-rule rounded-[1px] overflow-hidden"
              role="img"
              aria-label={`${t("budget.total")}: ${total} / ${ENVELOPE}`}
            >
              <div
                className={cn("h-full", fits ? "bg-[#5f8a74]" : "bg-[#a44a3f]")}
                style={{ width: `${Math.min(100, (total / ENVELOPE) * 100)}%` }}
              />
            </div>
            {!fits && <p className="text-xs text-brick-text mt-2">{t("budget.over")}</p>}

            <ul className="mt-4 divide-y divide-rule">
              {BUDGET_LINES.map((line) => (
                <li key={line.id} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{tx(line.label, lang)}</span>
                    <span className="tabular text-sm font-semibold">{allocations[line.id] ?? 0}%</span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">{tx(line.note, lang)}</p>
                  <input
                    type="range"
                    min={LINE_MIN}
                    max={LINE_MAX}
                    step={1}
                    value={allocations[line.id] ?? LINE_MIN}
                    onChange={(e) => setAllocation(line.id, Number(e.target.value))}
                    aria-label={`${tx(line.label, lang)}: ${allocations[line.id] ?? 0}%`}
                    className="w-full mt-2 accent-[var(--gold)]"
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-2 min-w-0 space-y-6">
          <Panel kicker={t("budget.stance")} title={t(STANCE_KEY[stance])}>
            <p className="text-sm text-muted leading-relaxed">
              {tx({
                en: "This mix reads as the stance above. The economy model applies it when the budget passes: ",
                ms: "Gabungan ini dibaca sebagai pendirian di atas. Model ekonomi menggunakannya apabila belanjawan lulus: ",
              }, lang)}
              {effectLabel({ target: "economy.fiscalDeficit", delta: stanceDeficit(stance) }, lang)}
            </p>
            <p className="text-xs text-muted mt-2">{t("budget.deficitNote")}: {STANCE_DEFICIT[stance] > 0 ? "+" : ""}{STANCE_DEFICIT[stance]}% GDP</p>
          </Panel>

          <Panel kicker={season ? t("budget.season") : t("budget.supplementary")} title={season ? t("budget.season") : t("budget.supplementary")}>
            {lastSupply && (
              <p className="text-xs mb-3">
                <span className="kicker text-[10px] mr-2">{t("budget.passedOn")}</span>
                <span className={cn("font-semibold", lastSupply.passed ? "text-gold-text" : "text-brick-text")}>
                  {lastSupply.passed ? t("parliament.passed") : t("parliament.defeated")} · {lastSupply.votes.for}–{lastSupply.votes.against}
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={() => tableBudget()}
              disabled={!fits}
              className={cn(
                "w-full text-sm font-semibold rounded-[2px] px-3 py-2.5 border transition-colors",
                fits
                  ? "border-gold/60 text-gold-text hover:bg-gold hover:text-paper"
                  : "border-rule text-muted cursor-not-allowed",
              )}
            >
              {t("budget.table")} →
            </button>
            <p className="text-xs text-brick-text mt-3">{t("budget.supplyWarning")}</p>
            {budget.passedTurn !== undefined && (
              <p className="text-xs text-muted mt-2">{t("budget.passedOn")}: T{budget.passedTurn + 1}</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
