import { useGameStore } from "../stores/game-store";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Stat } from "../components/ui/Stat";
import { TrendChart } from "../components/charts/TrendChart";
import { useT } from "../i18n/store";

/** The economic abstract: one ledger band of figures, then the four lines. */
export function Economy() {
  const game = useGameStore((s) => s.game);
  const { t } = useT();
  if (!game) return null;
  const prev = game.history[game.history.length - 2];

  const ledger: Array<Parameters<typeof Stat>[0]> = [
    { label: t("economy.deficit"), value: game.economy.fiscalDeficit, previous: prev?.fiscalDeficit, unit: "% GDP", goodDirection: "down" },
    { label: t("economy.debt"), value: game.economy.debtToGdp, unit: "% GDP", goodDirection: "down" },
    { label: t("economy.revenue"), value: game.economy.revenue, unit: "RM bn", decimals: 0 },
    { label: t("economy.medianIncome"), value: game.economy.householdIncome, unit: "RM/mo", decimals: 0, goodDirection: "up" },
    { label: t("economy.fdi"), value: game.economy.fdi, decimals: 0 },
    { label: t("economy.productivity"), value: game.economy.productivity, decimals: 0 },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("economy.kicker")}
        title={t("economy.title")}
        lead={t("economy.lead")}
      />

      {/* Ledger band: hairlines, not cards. */}
      <section
        aria-label={t("economy.ledgerAria")}
        className="bg-card border border-rule rounded-panel divide-y sm:divide-y-0 sm:divide-x divide-rule grid grid-cols-2 lg:grid-cols-6"
      >
        {ledger.map((entry) => (
          <div key={entry.label} className="p-4">
            <Stat {...entry} />
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel kicker={t("economy.growth")} title={t("economy.growthTitle")}>
          <TrendChart history={game.history} series={{ key: "gdpGrowth", label: t("overview.gdp"), color: "var(--gold)", unit: "%" }} />
        </Panel>
        <Panel kicker={t("economy.prices")} title={t("economy.pricesTitle")}>
          <TrendChart history={game.history} series={{ key: "inflation", label: t("overview.inflation"), color: "var(--brick)", unit: "%" }} />
        </Panel>
        <Panel kicker={t("economy.jobs")} title={t("economy.jobsTitle")}>
          <TrendChart history={game.history} series={{ key: "unemployment", label: t("overview.unemployment"), color: "var(--moss)", unit: "%" }} />
        </Panel>
        <Panel kicker={t("economy.currency")} title={t("economy.currencyTitle")}>
          <TrendChart history={game.history} series={{ key: "ringgit", label: t("overview.ringgit"), color: "var(--navy)" }} />
        </Panel>
      </div>

      <Panel kicker={t("economy.tradeoffKicker")} title={t("economy.tradeoffTitle")} className="mt-6" variant="inset">
        <p className="display text-[1.0313rem] text-ink/90 leading-relaxed max-w-prose">
          {t("economy.tradeoffText").split(t("economy.decisionHistory"))[0]}
          <span className="font-semibold text-gold-text">{t("economy.decisionHistory")}</span>
          {t("economy.tradeoffText").split(t("economy.decisionHistory"))[1]}
        </p>
      </Panel>
    </div>
  );
}
