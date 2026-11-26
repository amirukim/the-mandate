import { useState } from "react";
import { useGameStore } from "../stores/game-store";
import { COALITIONS, MAJORITY, TOTAL_SEATS } from "../data/parties";
import { Panel } from "../components/ui/Panel";
import { PartyFlag } from "../components/ui/PartyFlag";
import { PoliticalIndicators } from "../components/ui/PoliticalIndicators";
import { Stat } from "../components/ui/Stat";
import { ParliamentChart } from "../components/charts/ParliamentChart";
import { PixelScene } from "../components/game/PixelScene";
import { OrderPaper } from "../features/parliament/OrderPaper";
import { useT } from "../i18n/store";
import { coalitionText } from "../i18n/data";
import { cn } from "../utils/cn";

/** The chamber briefing: arithmetic first, then the floor. */
export function Parliament() {
  const game = useGameStore((s) => s.game);
  const { t, tf, lang } = useT();
  const [selectedBloc, setSelectedBloc] = useState<string | null>(null);
  if (!game) return null;
  const gov = COALITIONS.filter((c) => c.status === "government").reduce((sum, c) => sum + c.seats, 0);
  const margin = gov - MAJORITY;
  const partners = COALITIONS.filter((c) => c.status === "government");
  const selected = selectedBloc ? COALITIONS.find((c) => c.id === selectedBloc) : null;
  const selectedDisplay = selected ? coalitionText(selected, lang) : null;

  return (
    <div className="page-enter">
      {/* Illustrated masthead: the chamber, dense band over the art. */}
      <header className="relative -mx-4 sm:-mx-8 -mt-8 mb-6 border-b border-rule overflow-hidden">
        <div className="absolute inset-0 glow-art" aria-hidden="true">
          <PixelScene src="/art/scene-chamber.svg" width={480} height={140} className="art-warm opacity-70 object-[center_45%]" />
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
          <p className={cn("text-xs mt-2", margin >= 0 ? "text-muted" : "text-brick-text")}>
            {tf("parliament.collapseHint", { n: margin + 1 })}
          </p>
        </div>
      </section>

      {/* The order paper: bills, forecasts, divisions, confidence. */}
      <div className="grid gap-6 lg:grid-cols-5 mt-6">
        <div className="lg:col-span-3 min-w-0">
          <Panel kicker={t("parliament.orderTitle")} title={t("parliament.orderKicker")}>
            <OrderPaper />
          </Panel>
        </div>
        <div className="lg:col-span-2 min-w-0">
          <Panel kicker={t("parliament.arithmetic")} title={t("parliament.arithmetic")}>
            <p className="text-sm text-muted leading-relaxed">
              {lang === "ms"
                ? "Blok kerajaan melompat kepada kuarang apabila kemarahan melebihi 30; blok yang diurbulkan berkurang kekecohan; pengikut raja memihak kepada kerajaan yang bertahan. Garisan blok di bawah ialah fungsi itu."
                : "Government blocs defect to abstention as anger rises past 30; courted blocs soften; kingmakers back a government that holds. The bloc lines in the order paper are that function."}
            </p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 mt-6">
        <div className="lg:col-span-3 min-w-0 space-y-6">
          <Panel
            kicker={lang === "ms" ? "Komposisi" : "Composition"}
            title={lang === "ms" ? "Dewan" : "The chamber"}
            bodyClassName="min-w-0"
          >
            <p className="kicker text-[10px] mb-2">{t("parliament.selectHint")}</p>
            <ParliamentChart selected={selectedBloc} onSelect={setSelectedBloc} />
          </Panel>

          {/* The selected bloc's file, beside the chamber it was picked from. */}
          {selected && selectedDisplay && (
            <Panel kicker={selectedDisplay.abbr} title={selectedDisplay.name}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <PartyFlag coalitionId={selected.id} size={26} />
                <span className="kicker flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block w-2 h-2 rounded-[1px]" style={{ backgroundColor: selected.color }} />
                  {selectedDisplay.status === "government"
                    ? t("parties.statusGov")
                    : selectedDisplay.status === "opposition"
                      ? t("parties.statusOpp")
                      : t("parties.statusKing")}
                </span>
                <span className="tabular text-sm font-semibold">{selectedDisplay.seats} {lang === "ms" ? "kerusi" : "seats"}</span>
              </div>
              <dl className="mt-4 divide-y divide-rule border-y border-rule">
                <div className="py-2.5 flex items-baseline justify-between gap-3">
                  <dt className="kicker text-[10px]">{lang === "ms" ? "Ketua" : "Leader"}</dt>
                  <dd className="text-sm font-semibold text-right">{selectedDisplay.leader}</dd>
                </div>
                <div className="py-2.5 flex items-start justify-between gap-3">
                  <dt className="kicker text-[10px] shrink-0 pt-0.5">{lang === "ms" ? "Kedudukan" : "Stance"}</dt>
                  <dd className="text-sm text-right leading-relaxed">{selectedDisplay.stance}</dd>
                </div>
              </dl>
              <p className="text-sm text-muted leading-relaxed mt-3">{selectedDisplay.note}</p>
            </Panel>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6 min-w-0">
          <Panel kicker={lang === "ms" ? "Kekuatan bangku" : "Bench strength"} title={lang === "ms" ? "Angka yang penting" : "Numbers that matter"}>
            <PoliticalIndicators
              variant="meters"
              aria-label={lang === "ms" ? "Angka yang penting" : "Numbers that matter"}
              items={[
                {
                  label: t("overview.coalition"),
                  value: `${Math.round(game.politics.coalitionStability)}`,
                  tone: "gold",
                  detail: lang === "ms" ? "Disiplin dalaman merentas PH, BN, GPS dan GRS." : "Internal discipline across PH, BN, GPS and GRS.",
                },
                {
                  label: t("overview.opposition"),
                  value: `${Math.round(game.politics.oppositionStrength)}`,
                  tone: "brick",
                  detail: lang === "ms" ? "Kohesi PN dan momentum nasionalnya." : "PN's cohesion and national momentum.",
                },
                {
                  label: t("overview.integrity"),
                  value: `${Math.round(game.politics.institutionalIntegrity)}`,
                  tone: "moss",
                  detail: lang === "ms" ? "Seberapa bersih tangan mesin ini bulan ini." : "How clean the machine's hands look this month.",
                },
              ]}
            />

            {/* who the majority actually runs through */}
            <p className="kicker text-[10px] mt-5 mb-2">{t("parliament.partners")}</p>
            <ul className="flex flex-wrap gap-1.5" aria-label={t("parliament.partners")}>
              {partners.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedBloc(selectedBloc === c.id ? null : c.id)}
                    aria-pressed={selectedBloc === c.id}
                    className={cn(
                      "flex items-center gap-1.5 border rounded-[2px] px-2 min-h-[28px] text-xs transition-colors",
                      selectedBloc === c.id
                        ? "border-gold/70 bg-surface text-ink"
                        : "border-rule text-muted hover:text-ink hover:border-rule-strong",
                    )}
                  >
                    <span aria-hidden="true" className="inline-block w-2 h-2 rounded-[1px]" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold">{c.abbr}</span>
                    <span className="tabular">{c.seats}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="rule mt-4" />
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="kicker text-[10px]">{t("parliament.collapse")}</span>
              <span className="tabular text-base font-semibold text-brick-text">{margin + 1}</span>
            </div>
            <p className="text-xs text-muted mt-4 leading-relaxed">
              {tf("parliament.arithmeticText", { gov, other: TOTAL_SEATS - gov, margin: gov - MAJORITY + 1 })}
            </p>
          </Panel>

          <Panel kicker={t("parliament.blocsKicker")} title={t("parliament.blocsTitle")}>
            <ul className="divide-y divide-rule">
              {COALITIONS.map((c) => {
                const display = coalitionText(c, lang);
                const active = selectedBloc === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedBloc(active ? null : c.id)}
                      aria-pressed={active}
                      aria-expanded={active}
                      className={cn(
                        "w-full text-left py-2.5 px-2 -mx-2 flex items-center justify-between gap-3 transition-colors rounded-[2px]",
                        active ? "bg-surface" : "hover:bg-surface/60",
                      )}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <PartyFlag coalitionId={c.id} size={17} />
                        <span className={cn("text-sm truncate", active ? "font-semibold text-ink" : "font-semibold")}>{display.name}</span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="tabular text-sm font-semibold">{display.seats}</span>
                        <span className={cn("kicker ml-2", active && "text-gold-text")}>
                          {display.status === "government" ? t("parties.statusGov") : display.status === "opposition" ? t("parties.statusOpp") : t("parties.statusKing")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="kicker text-[9px] mt-3 text-muted">{t("parliament.selectHint")}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
