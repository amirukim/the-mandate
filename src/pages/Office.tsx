import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { characterById } from "../data/characters";
import { CharacterPortrait } from "../components/game/CharacterPortrait";
import { GameScene, SceneLayer } from "../components/game/GameScene";
import { InteractiveHotspot } from "../components/game/InteractiveHotspot";
import { Button } from "../components/ui/Button";
import { Meter } from "../components/ui/Meter";
import { Panel } from "../components/ui/Panel";
import { dateLabel, chapterTitle } from "../engine/calendar";
import { useT } from "../i18n/store";
import { characterText } from "../i18n/data";
import { OfficeDynamic } from "../components/game/OfficeDynamic";
import { ENVIRONMENTS } from "../data/art";

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
      {/* the dateline: state time above the room, readable on every plate */}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <p className="kicker kicker-gold">Perdana Putra &middot; {dateLabel(game.turn, lang)}</p>
        <p className="kicker text-muted">{chapterTitle(game.chapter, lang)}</p>
      </div>

      <GameScene
        art={ENVIRONMENTS.officeHub}
        label={t("office.hubAria")}
        className="-mx-4 sm:-mx-8 -mt-2 -mb-1 aspect-[1440/760]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper/35 via-transparent to-paper/10" />

        {/* hint */}
        <p className="pointer-events-none absolute bottom-3 left-4 sm:left-7 kicker text-[9px] hidden sm:block">
          <span className="inline-block rounded-[2px] border border-rule/70 bg-paper/85 px-2 py-1">
            {t("office.hubHint")}
          </span>
        </p>

        {/* the office's living layer */}
      <OfficeDynamic state={game} />

      {/* the hotspots, aligned to the visible art crop */}
        <SceneLayer art={ENVIRONMENTS.officeHub} className="hidden sm:block">
          {HOTSPOTS.map((h) => {
            const isClock = h.action === "endMonth";
            const disabled = isClock && queued > 0;
            const label = disabled ? tf("overview.awaiting", { n: queued }) : t(h.labelKey);
            return (
              <InteractiveHotspot
                key={h.labelKey}
                label={label}
                x={h.x}
                y={h.y}
                w={h.w}
                h={h.h}
                baseWidth={1440}
                baseHeight={760}
                onActivate={() => runHotspot(h)}
                disabled={disabled}
                badge={h.labelKey === "nav.briefing" ? queued : undefined}
              />
            );
          })}
        </SceneLayer>
      </GameScene>

      {/* phones: the room is a plate, the destinations are a list */}
      <div className="sm:hidden mt-4">
        <ul className="grid grid-cols-2 gap-2">
          {HOTSPOTS.map((h) => {
            const isClock = h.action === "endMonth";
            const disabled = isClock && queued > 0;
            const label = disabled ? tf("overview.awaiting", { n: queued }) : t(h.labelKey);
            const inner = (
              <>
                <span className="min-w-0">{label}</span>
                {h.labelKey === "nav.briefing" && queued > 0 && (
                  <span className="tabular shrink-0 min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-brick text-on-brick text-[11px] font-bold rounded-[1px]">
                    {queued}
                  </span>
                )}
              </>
            );
            const cls =
              "flex items-center justify-between gap-2 min-h-[44px] w-full px-3 py-2 rounded-panel border border-rule bg-card text-sm font-semibold text-ink text-left";
            return (
              <li key={h.labelKey}>
                {isClock ? (
                  <button type="button" className={cls} onClick={() => runHotspot(h)} disabled={disabled}>
                    {inner}
                  </button>
                ) : (
                  <Link to={h.to!} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
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
