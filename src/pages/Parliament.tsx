import { useGameStore } from "../stores/game-store";
import { COALITIONS, MAJORITY, TOTAL_SEATS } from "../data/parties";
import { Panel } from "../components/ui/Panel";
import { PartyFlag } from "../components/ui/PartyFlag";
import { Meter } from "../components/ui/Meter";
import { Stat } from "../components/ui/Stat";
import { ParliamentChart } from "../components/charts/ParliamentChart";
import { useT } from "../i18n/store";
import { coalitionText } from "../i18n/data";

/** The chamber briefing: arithmetic first, then the floor. */
export function Parliament() {
  const game = useGameStore((s) => s.game);
  const { t, tf, lang } = useT();
  if (!game) return null;
  const gov = COALITIONS.filter((c) => c.status === "government").reduce((sum, c) => sum + c.seats, 0);
  const margin = gov - MAJORITY;

  return (
    <div className="page-enter">
      {/* Illustrated masthead: the chamber, dense band over the art. */}
      <header className="relative -mx-4 sm:-mx-8 -mt-8 mb-6 border-b border-rule overflow-hidden">
        <div className="absolute inset-0 glow-art" aria-hidden="true">
          <img
            src="/art/scene-chamber.svg"
            alt=""
            className="h-full w-full object-cover object-[center_45%] opacity-70"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-paper/55" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
        </div>
        <div className="relative px-4 sm:px-8 pt-10 pb-6">
          <p className="kicker kicker-gold">{t("parliament.kicker")}</p>
          <h1 className="display text-2xl sm:text-3xl font-semibold mt-1.5">{t("parliament.title")}</h1>
          <p className="text-sm text-muted leading-relaxed mt-2 max-w-4xl">
            {tf("parliament.lead", { majority: MAJORITY, gov })}
          </p>
          <div className="rule mt-3" />
        </div>
      </header>

      {/* Confidence arithmetic */}
      <section
        aria-label="Confidence arithmetic"
        className="bg-card border border-rule rounded-panel divide-y sm:divide-y-0 sm:divide-x divide-rule grid sm:grid-cols-3"
      >
        <div className="p-5">
          <Stat label={lang === "ms" ? "Bangku kerajaan" : "Government benches"} value={gov} unit={lang === "ms" ? "kerusi" : "seats"} decimals={0} large />
        </div>
        <div className="p-5">
          <Stat label={lang === "ms" ? "Garis majoriti" : "Majority line"} value={MAJORITY} unit={lang === "ms" ? "kerusi" : "seats"} decimals={0} large />
          <p className="text-xs text-muted mt-2">
            {margin >= 0
              ? lang === "ms" ? `${margin} kerusi majoriti kerja` : `${margin} seats of working majority`
              : lang === "ms" ? `${-margin} kerusi kurang untuk keyakinan` : `${-margin} seats short of confidence`}
          </p>
        </div>
        <div className="p-5">
          <Stat label={lang === "ms" ? "Bangku lain" : "All other benches"} value={TOTAL_SEATS - gov} unit={lang === "ms" ? "kerusi" : "seats"} decimals={0} large goodDirection="down" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5 mt-6">
        <div className="lg:col-span-3">
          <Panel kicker={lang === "ms" ? "Komposisi" : "Composition"} title={lang === "ms" ? "Dewan" : "The chamber"}>
            <ParliamentChart />
          </Panel>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Panel kicker={lang === "ms" ? "Kekuatan bangku" : "Bench strength"} title={lang === "ms" ? "Angka yang penting" : "Numbers that matter"}>
            <div className="space-y-4">
              <Meter label={t("overview.coalition")} value={game.politics.coalitionStability} tone="gold" hint={lang === "ms" ? "Disiplin dalaman merentas PH, BN, GPS dan GRS." : "Internal discipline across PH, BN, GPS and GRS."} />
              <Meter label={t("overview.opposition")} value={game.politics.oppositionStrength} tone="brick" hint={lang === "ms" ? "Kohesi PN dan momentum nasionalnya." : "PN's cohesion and national momentum."} />
              <Meter label={t("overview.integrity")} value={game.politics.institutionalIntegrity} tone="moss" hint={lang === "ms" ? "Seberapa bersih tangan mesin ini bulan ini." : "How clean the machine's hands look this month."} />
            </div>
            <p className="text-xs text-muted mt-4 leading-relaxed">
              {tf("parliament.arithmeticText", { gov, other: TOTAL_SEATS - gov, margin: gov - MAJORITY + 1 })}
            </p>
          </Panel>

          <Panel kicker={t("parliament.blocsKicker")} title={t("parliament.blocsTitle")}>
            <ul className="divide-y divide-rule">
              {COALITIONS.map((c) => {
                const display = coalitionText(c, lang);
                return (
                  <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PartyFlag coalitionId={c.id} size={17} />
                      <span className="text-sm font-semibold truncate">{display.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="tabular text-sm font-semibold">{display.seats}</span>
                      <span className="kicker ml-2">
                        {display.status === "government" ? t("parties.statusGov") : display.status === "opposition" ? t("parties.statusOpp") : t("parties.statusKing")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
