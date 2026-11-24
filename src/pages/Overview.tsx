import { useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { getEventById } from "../data/events";
import { governmentSeats, MAJORITY, coalitionById, COALITIONS } from "../data/parties";
import { stateById, type StateDef } from "../data/states";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Meter } from "../components/ui/Meter";
import { Stat } from "../components/ui/Stat";
import { PartyFlag } from "../components/ui/PartyFlag";
import { TrendChart } from "../components/charts/TrendChart";
import { NewsList } from "../components/news/NewsList";
import { MalaysiaMap } from "../components/geo/MalaysiaMap";
import { MapTheatre } from "../components/geo/MapTheatre";
import { chapterTitle, dateLabel } from "../engine/calendar";
import { useT } from "../i18n/store";
import { coalitionText, stateText, eventDisplay } from "../i18n/data";
import { X } from "lucide-react";

/** How to read each headline figure — threshold-based, never a new number. */
function verdictKey(value: number, stops: Array<[number, string]>): string {
  for (const [floor, key] of stops) {
    if (value >= floor) return key;
  }
  return stops[stops.length - 1][1];
}

/** One line of the situation dossier: label left, figure and track right. */
function DossierRow({
  label,
  value,
  track,
  tone,
  verdict,
}: {
  label: string;
  value: string;
  track?: number;
  tone?: "moss" | "gold" | "brick" | "navy";
  verdict?: string;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="kicker text-[10px] block">{label}</span>
        {verdict && <span className="block text-[11px] text-gold-text mt-0.5 leading-tight">{verdict}</span>}
      </span>
      <span className="flex items-center gap-3 min-w-[7.5rem] justify-end">
        {track !== undefined && (
          <span className="meter h-1.5 w-24 overflow-hidden rounded-[1px]" aria-hidden="true">
            <span
              className={`block h-full ${
                tone === "moss" ? "bg-moss" : tone === "brick" ? "bg-brick" : tone === "navy" ? "bg-navy" : "bg-gold"
              }`}
              style={{ width: `${Math.max(2, Math.min(100, track))}%` }}
            />
          </span>
        )}
        <span className="tabular text-base font-semibold whitespace-nowrap">{value}</span>
      </span>
    </div>
  );
}

/** The national situation, as a briefing sheet rather than a card grid. */
function MandateDossier({
  approval,
  coalition,
  seats,
  opposition,
  queueCount,
  dateText,
}: {
  approval: number;
  coalition: number;
  seats: number;
  opposition: number;
  queueCount: number;
  dateText: string;
}) {
  const { t, tf } = useT();
  const approvalVerdict = t(
    verdictKey(approval, [
      [55, "overview.verdictStrong"],
      [40, "overview.verdictOk"],
      [28, "overview.verdictWeak"],
    ]) as string,
  );
  const coalitionVerdict = t(
    verdictKey(coalition, [
      [55, "overview.coalitionHolding"],
      [35, "overview.coalitionStrained"],
    ]) as string,
  );
  const oppositionVerdict = t(opposition >= 60 ? "overview.oppositionHigh" : "overview.oppositionLow");
  const partners = COALITIONS.filter((c) => c.status === "government");

  return (
    <div className="bg-card border border-rule rounded-panel overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-rule flex items-baseline justify-between gap-2">
        <p className="kicker kicker-gold">{t("overview.mandate")}</p>
        <p className="kicker text-[10px]">{dateText}</p>
      </div>
      <dl className="divide-y divide-rule flex-1">
        <DossierRow label={t("overview.approval")} value={`${Math.round(approval)}%`} track={approval} tone={approval >= 45 ? "moss" : approval >= 30 ? "gold" : "brick"} verdict={approvalVerdict} />
        <DossierRow label={t("overview.coalition")} value={`${Math.round(coalition)}`} track={coalition} tone={coalition >= 55 ? "moss" : coalition >= 35 ? "gold" : "brick"} verdict={coalitionVerdict} />
        <DossierRow label={t("overview.seatsHouse")} value={`${seats}/222`} track={(seats / 222) * 100} tone="navy" />
        <DossierRow label={t("overview.opposition")} value={`${Math.round(opposition)}`} track={opposition} tone="brick" verdict={oppositionVerdict} />
      </dl>

      {/* who the majority actually runs through */}
      <div className="px-4 py-3 border-t border-rule">
        <p className="kicker text-[10px] mb-2">{t("overview.partners")}</p>
        <ul className="flex flex-wrap gap-1.5" aria-label={t("overview.partners")}>
          {partners.map((c) => (
            <li key={c.id}>
              <Link
                to="/game/parties"
                className="flex items-center gap-1.5 border border-rule rounded-[2px] px-2 py-0.5 text-xs text-muted hover:text-ink hover:border-gold/60 transition-colors"
                title={`${c.name} · ${c.seats}`}
              >
                <span aria-hidden="true" className="inline-block w-2 h-2 rounded-[1px]" style={{ backgroundColor: c.color }} />
                <span className="font-semibold">{c.abbr}</span>
                <span className="tabular">{c.seats}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3 border-t border-rule flex items-center justify-between gap-3">
        <span className="kicker text-[10px]">{t("overview.deskBriefings")}</span>
        <Link
          to="/game/briefing"
          className="text-sm font-semibold text-gold-text hover:text-gold-bright transition-colors"
        >
          {queueCount > 0 ? tf("overview.awaiting", { n: queueCount }) : t("overview.clear")} →
        </Link>
      </div>
    </div>
  );
}

/** A single state's file, opened from the map. */
function StateFile({ state, lang, onClear }: { state: StateDef; lang: "en" | "ms"; onClear: () => void }) {
  const { t } = useT();
  const bloc = coalitionById(state.ruling);
  const blocDisplay = bloc ? coalitionText(bloc, lang) : null;
  const relationTone = state.relation >= 55 ? "moss" : state.relation >= 40 ? "gold" : "brick";
  return (
    <div className="bg-card border border-gold/50 rounded-panel overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-rule flex items-center justify-between gap-2">
        <p className="kicker kicker-gold">{t("overview.stateFile")}</p>
        <button
          type="button"
          onClick={onClear}
          aria-label={t("overview.closeFile")}
          className="flex items-center justify-center w-8 h-8 border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold/60 transition-colors"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="px-4 py-4 flex-1">
        <div className="flex items-center gap-3">
          {bloc && <PartyFlag coalitionId={bloc.id} size={30} />}
          <div className="min-w-0">
            <h2 className="display text-2xl font-semibold leading-tight">{state.name}</h2>
            <p className="kicker text-[10px] mt-0.5">{state.capital}</p>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-rule border-y border-rule">
          <div className="py-2.5 flex items-baseline justify-between gap-3">
            <dt className="kicker text-[10px]">{t("overview.headOfGov")}</dt>
            <dd className="text-sm font-semibold text-right">{state.rulerTitle}</dd>
          </div>
          <div className="py-2.5 flex items-baseline justify-between gap-3">
            <dt className="kicker text-[10px]">{t("overview.alignment")}</dt>
            <dd className="text-sm font-semibold text-right" style={{ color: bloc?.color }}>
              {blocDisplay ? blocDisplay.name : t("overview.federalGov")}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <Meter label={t("overview.relations")} value={state.relation} tone={relationTone} />
        </div>

        <p className="text-sm text-muted leading-relaxed mt-4">{state.note}</p>
      </div>
      <div className="px-4 py-3 border-t border-rule">
        <Link to="/game/states" className="text-sm text-gold-text hover:text-gold-bright transition-colors">
          {t("overview.openStatesFile")} →
        </Link>
      </div>
    </div>
  );
}

export function Overview() {
  const game = useGameStore((s) => s.game);
  const { t, tf, lang } = useT();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [mapTheatre, setMapTheatre] = useState(false);
  const [trendKey, setTrendKey] = useState<"approval" | "coalitionStability" | "costOfLivingPressure">("approval");
  if (!game) return null;

  const prev = game.history[game.history.length - 2];
  const gov = governmentSeats();
  const queued = game.queuedEventIds.map((id) => getEventById(id)).filter(Boolean);
  const state = selectedState ? stateById(selectedState) : null;
  const displayState = state ? stateText(state, lang) : null;
  const TREND_SERIES = {
    approval: { key: "approval" as const, label: t("common.approval"), color: "var(--gold)", unit: "%" },
    coalitionStability: { key: "coalitionStability" as const, label: t("overview.coalition"), color: "var(--navy)" },
    costOfLivingPressure: { key: "costOfLivingPressure" as const, label: t("overview.costLiving"), color: "var(--brick)" },
  } as const;

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={`${chapterTitle(game.chapter, lang)} · ${dateLabel(game.turn, lang)}`}
        title={t("nav.overview")}
        lead={tf("overview.lead", { n: game.turn + 1, seats: gov, margin: Math.max(0, gov - MAJORITY) })}
      />

      {/* Situation room: the federation map beside the mandate dossier. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <MalaysiaMap
            selectedId={selectedState}
            onSelect={setSelectedState}
            onExpand={() => setMapTheatre(true)}
          />
        </div>
        <div className="lg:col-span-1 min-w-0">
          {displayState ? (
            <StateFile state={displayState} lang={lang} onClear={() => setSelectedState(null)} />
          ) : (
            <MandateDossier
              approval={game.politics.approval}
              coalition={game.politics.coalitionStability}
              seats={gov}
              opposition={game.politics.oppositionStrength}
              queueCount={queued.length}
              dateText={dateLabel(game.turn, lang)}
            />
          )}
        </div>
      </div>

      {mapTheatre && (
        <MapTheatre
          selectedId={selectedState}
          onSelect={setSelectedState}
          onClose={() => setMapTheatre(false)}
          state={state}
          onClearState={() => setSelectedState(null)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-5 mt-6">
        <div className="lg:col-span-3 space-y-5">
          <Panel kicker={t("overview.deskKicker")} title={t("overview.deskTitle")}>
            {queued.length === 0 ? (
              <p className="text-sm text-muted">
                {t("overview.deskEmpty")}{" "}
                <Link to="/game/briefing" className="text-gold-text underline underline-offset-4">
                  {t("overview.deskEmptyLink")}
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2.5">
                {queued.map((event) => (
                  <li
                    key={event!.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <span className="display font-semibold text-sm">{eventDisplay(event!, lang).title}</span>
                    <span className="kicker">{eventDisplay(event!, lang).location}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link to="/game/briefing" className="text-sm text-gold-text underline underline-offset-4">
                {t("overview.goBriefings")}
              </Link>
            </div>
          </Panel>

          <Panel kicker={t("overview.trendKicker")} title={t("overview.trendTitle")} bodyClassName="min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label={t("overview.trendKicker")}>
              {(Object.keys(TREND_SERIES) as Array<keyof typeof TREND_SERIES>).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTrendKey(k)}
                  aria-pressed={trendKey === k}
                  className={
                    trendKey === k
                      ? "border border-gold/70 bg-surface text-ink rounded-[2px] px-2 py-1 text-xs font-semibold transition-colors"
                      : "border border-transparent text-muted hover:text-ink hover:bg-surface/60 rounded-[2px] px-2 py-1 text-xs font-semibold transition-colors"
                  }
                >
                  {TREND_SERIES[k].label}
                </button>
              ))}
            </div>
            <TrendChart history={game.history} series={TREND_SERIES[trendKey]} height={180} />
          </Panel>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Panel kicker={t("overview.ledgerKicker")} title={t("overview.ledgerTitle")}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Stat label={t("overview.gdp")} value={game.economy.gdpGrowth} previous={prev?.gdpGrowth} unit="%" />
              <Stat label={t("overview.inflation")} value={game.economy.inflation} previous={prev?.inflation} unit="%" goodDirection="down" />
              <Stat label={t("overview.unemployment")} value={game.economy.unemployment} previous={prev?.unemployment} unit="%" goodDirection="down" decimals={1} />
              <Stat label={t("overview.ringgit")} value={game.economy.ringgit} previous={prev?.ringgit} unit="RM" goodDirection="down" decimals={2} />
              <Stat label={t("overview.deficit")} value={game.economy.fiscalDeficit} previous={prev?.fiscalDeficit} unit="% GDP" goodDirection="down" />
              <Stat label={t("overview.debt")} value={game.economy.debtToGdp} unit="% GDP" goodDirection="down" />
            </div>
          </Panel>

          <Panel kicker={t("overview.moodKicker")} title={t("overview.moodTitle")} variant="inset">
            <div className="divide-y divide-rule">
              <div className="pb-4 space-y-4">
                <Meter label={t("overview.costLiving")} value={game.social.costOfLivingPressure} tone="brick" />
                <Meter label={t("overview.satisfaction")} value={game.social.satisfaction} tone="gold" />
                <Meter label={t("overview.cohesion")} value={game.social.cohesion} tone="navy" />
              </div>
              <div className="pt-4">
                <Meter label={t("overview.integrity")} value={game.politics.institutionalIntegrity} tone="moss" />
              </div>
            </div>
          </Panel>

          <Panel kicker={t("overview.wireKicker")} title={t("overview.wireTitle")} variant="inset">
            <NewsList items={game.news.slice(-3).reverse()} lang={lang} />
            <div className="mt-3">
              <Link to="/game/news" className="text-sm text-gold-text underline underline-offset-4">
                {t("overview.allCoverage")}
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
