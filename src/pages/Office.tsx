import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { characterById } from "../data/characters";
import { CharacterPortrait } from "../components/game/CharacterPortrait";
import { PaintedScene } from "../components/game/PaintedScene";
import { Button } from "../components/ui/Button";
import { Meter } from "../components/ui/Meter";
import { Panel } from "../components/ui/Panel";
import { dateLabel, chapterTitle } from "../engine/calendar";
import { useT } from "../i18n/store";
import { characterText } from "../i18n/data";
import { paintedSceneSrcs } from "../data/art";
import { cn } from "../utils/cn";

const COUNSELABLE = ["chiefOfStaff", "finance", "economicAdviser", "nationalSecurity", "foreign", "home"] as const;

/**
 * The hub, Suzerain-style: the office is the menu. Everything on the desk or
 * the walls is a hotspot — the folders are the briefings, the phone reaches
 * the cabinet, the ledger is the economy, the wall map is the federation, the
 * clock ends the month. The drawer behind the HUD lists the same destinations
 * as plain links for anyone who prefers to read a menu.
 */
interface Hotspot {
  /** nav.* key or office verb. */
  labelKey: string;
  /** Destination path, or the end-month action when action is set. */
  to?: string;
  action?: "endMonth";
  /** Rectangle in the 1440×760 scene art. */
  x: number;
  y: number;
  w: number;
  h: number;
}

const pct = (v: number, base: number) => `${(v / base) * 100}%`;

const HOTSPOTS: Hotspot[] = [
  { labelKey: "nav.briefing", to: "/game/briefing", x: 640, y: 422, w: 126, h: 58 },
  { labelKey: "nav.news", to: "/game/news", x: 786, y: 444, w: 100, h: 38 },
  { labelKey: "nav.history", to: "/game/history", x: 540, y: 440, w: 76, h: 36 },
  { labelKey: "nav.economy", to: "/game/economy", x: 872, y: 460, w: 82, h: 32 },
  { labelKey: "nav.cabinet", to: "/game/cabinet", x: 902, y: 436, w: 80, h: 52 },
  { labelKey: "nav.overview", to: "/game/overview", x: 112, y: 100, w: 266, h: 214 },
  { labelKey: "nav.states", to: "/game/states", x: 140, y: 372, w: 116, h: 52 },
  { labelKey: "nav.parliament", to: "/game/parliament", x: 1088, y: 96, w: 232, h: 168 },
  { labelKey: "nav.parties", to: "/game/parties", x: 1340, y: 86, w: 66, h: 182 },
  { labelKey: "nav.diplomacy", to: "/game/diplomacy", x: 68, y: 362, w: 120, h: 134 },
  { labelKey: "nav.security", to: "/game/security", x: 1112, y: 512, w: 134, h: 126 },
  { labelKey: "nav.saves", to: "/game/saves", x: 466, y: 496, w: 188, h: 162 },
  { labelKey: "office.endMonth", action: "endMonth", x: 962, y: 64, w: 106, h: 108 },
];

export function Office() {
  const game = useGameStore((s) => s.game);
  const lastCounsel = useGameStore((s) => s.lastCounsel);
  const askCounsel = useGameStore((s) => s.askCounsel);
  const endMonth = useGameStore((s) => s.endMonth);
  const navigate = useNavigate();
  const { t, tf, lang } = useT();

  if (!game) return null;
  const queued = game.queuedEventIds.length;
  const morning =
    queued === 0
      ? t("office.morningClear")
      : queued === 1
        ? t("office.morningOne")
        : tf("office.morningFiles", { n: queued });

  const runHotspot = (h: Hotspot) => {
    if (h.action === "endMonth") {
      endMonth();
      navigate("/game/summary");
      return;
    }
    if (h.to) navigate(h.to);
  };

  return (
    <div className="page-enter">
      {/* the office as the menu: painted room, live hotspots */}
      <div
        className="relative -mx-4 sm:-mx-8 -mt-8 -mb-1 h-[min(68vh,660px)] min-h-[420px] border-b border-rule overflow-hidden"
        role="group"
        aria-label={t("office.hubAria")}
      >
        <img
          src="/art/scene-hub.svg"
          alt=""
          className="art-warm absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <PaintedScene srcs={paintedSceneSrcs("hub")} />
        <div className="absolute inset-0 bg-gradient-to-t from-paper/70 via-transparent to-paper/30" />

        {/* dateline */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-7">
          <p className="kicker kicker-gold">Perdana Putra &middot; {dateLabel(game.turn, lang)}</p>
          <p className="kicker mt-0.5">{chapterTitle(game.chapter, lang)}</p>
        </div>

        {/* hint */}
        <p className="absolute bottom-3 left-4 sm:left-7 kicker text-[9px]">{t("office.hubHint")}</p>

        {/* the hotspots */}
        {HOTSPOTS.map((h) => {
          const isClock = h.action === "endMonth";
          const label = isClock && queued > 0 ? tf("overview.awaiting", { n: queued }) : t(h.labelKey);
          return (
            <button
              key={h.labelKey}
              type="button"
              onClick={() => runHotspot(h)}
              disabled={isClock && queued > 0}
              title={label}
              aria-label={label}
              className={cn(
                "group absolute rounded-[2px] outline-none",
                isClock && queued > 0 && "cursor-not-allowed",
              )}
              style={{
                left: pct(h.x, 1440),
                top: pct(h.y, 760),
                width: pct(h.w, 1440),
                height: pct(h.h, 760),
                minWidth: 40,
                minHeight: 32,
              }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-[2px] border transition-all",
                  isClock && queued > 0
                    ? "border-transparent"
                    : "border-transparent group-hover:border-gold/80 group-hover:bg-gold/10 group-focus-visible:border-gold group-focus-visible:bg-gold/10",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap rounded-[2px] border border-gold/50 bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink opacity-0 transition-opacity",
                  "group-hover:opacity-100 group-focus-visible:opacity-100",
                  isClock && queued > 0 && "text-brick-text border-brick/50",
                )}
              >
                {label}
              </span>
              {h.labelKey === "nav.briefing" && queued > 0 && (
                <span className="tabular absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brick text-ink text-[10px] font-bold rounded-[1px] border border-paper">
                  {queued}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* the morning note + the last word you were given */}
      <div className="grid gap-4 lg:grid-cols-5 mt-5">
        <Panel kicker={t("office.pps")} title="Sarah Tan" variant="inset" className="lg:col-span-3">
          <div className="flex gap-4">
            <CharacterPortrait characterId="chiefOfStaff" size="lg" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="display text-[1.0313rem] leading-relaxed text-ink/90">{morning}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {queued > 0 ? (
                  <Link to="/game/briefing">
                    <Button>{t("office.openBriefings")}</Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      endMonth();
                      navigate("/game/summary");
                    }}
                  >
                    {t("office.endMonth")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Panel>

        {lastCounsel && (
          <Panel kicker={t("office.advice")} className="lg:col-span-2">
            <div role="status" className="flex gap-3">
              <CharacterPortrait characterId={lastCounsel.characterId} className="shrink-0" />
              <div className="min-w-0">
                <p className="kicker">
                  {characterText(characterById(lastCounsel.characterId)!, lang).role ?? t("office.adviser")}
                </p>
                <p className="display italic text-[1.0313rem] leading-relaxed mt-1 text-ink/90">
                  &ldquo;{lastCounsel.text}&rdquo;
                </p>
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* in the room: the advisers, waiting */}
      <section className="mt-8" aria-label={t("office.seekCounsel")}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="kicker kicker-gold">{t("office.seekCounsel")}</h2>
          <p className="text-xs text-muted">{t("office.seekNote")}</p>
        </div>
        <div className="rule-gold mt-2 mb-4" />
        <ul className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {COUNSELABLE.map((id) => {
            const def = characterById(id);
            const state = game.characters[id];
            if (!def || !state) return null;
            const used = state.counselUsedTurn === game.turn;
            const display = characterText(def, lang);
            return (
              <li key={id} className="shrink-0 w-[210px]">
                <article className="bg-card border border-rule rounded-panel p-3.5 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <CharacterPortrait characterId={id} size="lg" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="display font-semibold text-sm leading-tight">{display.name}</p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">{display.role}</p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <Meter
                      label={t("cabinet.relationship")}
                      value={state.relationship}
                      tone={state.relationship >= 60 ? "moss" : state.relationship >= 35 ? "gold" : "brick"}
                    />
                  </div>
                  <div className="mt-auto pt-3">
                    <Button size="sm" variant="outline" disabled={used} onClick={() => askCounsel(id)} className="w-full">
                      {used ? t("office.consulted") : t("office.seek")}
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
