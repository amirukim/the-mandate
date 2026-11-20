import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { getEventById } from "../data/events";
import { characterById } from "../data/characters";
import { CharacterPortrait } from "../components/game/CharacterPortrait";
import { Button } from "../components/ui/Button";
import { Meter } from "../components/ui/Meter";
import { Panel } from "../components/ui/Panel";
import { dateLabel } from "../engine/calendar";
import { useT } from "../i18n/store";
import { characterText, eventDisplay } from "../i18n/data";
import { getLang } from "../i18n/store";

const COUNSELABLE = ["chiefOfStaff", "finance", "economicAdviser", "nationalSecurity", "foreign", "home"] as const;

export function Office() {
  const game = useGameStore((s) => s.game);
  const lastCounsel = useGameStore((s) => s.lastCounsel);
  const askCounsel = useGameStore((s) => s.askCounsel);
  const endMonth = useGameStore((s) => s.endMonth);
  const navigate = useNavigate();
  const { t, tf, lang } = useT();

  if (!game) return null;
  const queued = game.queuedEventIds.map((id) => getEventById(id)).filter(Boolean);
  const morning =
    queued.length === 0
      ? t("office.morningClear")
      : queued.length === 1
        ? t("office.morningOne")
        : tf("office.morningFiles", { n: queued.length });

  return (
    <div className="page-enter">
      {/* Masthead: the office at night, dense ministry band over the art. */}
      <header className="relative -mx-4 sm:-mx-8 -mt-8 mb-6 border-b border-rule overflow-hidden">
        <div className="absolute inset-0 glow-art" aria-hidden="true">
          <img
            src="/art/scene-office.svg"
            alt=""
            className="h-full w-full object-cover object-[center_58%] opacity-70"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-paper/55" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
        </div>
        <div className="relative px-4 sm:px-8 pt-10 pb-6">
          <p className="kicker kicker-gold">Perdana Putra &middot; {dateLabel(game.turn, lang)}</p>
          <h1 className="display text-2xl sm:text-3xl font-semibold mt-1.5">{t("office.title")}</h1>
          <div className="rule mt-3" />
        </div>
      </header>

      {/* The secretary's desk: today's file count and the way in. */}
      <Panel kicker={t("office.pps")} title="Sarah Tan" variant="inset">
        <div className="flex gap-4">
          <CharacterPortrait characterId="chiefOfStaff" size="xl" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="display text-[1.0313rem] leading-relaxed text-ink/90">
              {morning}
            </p>
            {queued.length > 0 && (
              <ul className="mt-4 border-t border-rule pt-3 space-y-2">
                {queued.map((event) => (
                  <li key={event!.id} className="flex items-baseline justify-between gap-3">
                    <span className="display font-semibold text-sm">{eventDisplay(event!, lang).title}</span>
                    <span className="kicker shrink-0">{eventDisplay(event!, lang).location}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {queued.length > 0 ? (
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
        <Panel kicker={t("office.advice")} className="mt-6">
          <div role="status" className="flex gap-3">
            <CharacterPortrait characterId={lastCounsel.characterId} className="shrink-0" />
            <div className="min-w-0">
              <p className="kicker">{characterText(characterById(lastCounsel.characterId)!, getLang()).role ?? t("office.adviser")}</p>
              <p className="display italic text-[1.0313rem] leading-relaxed mt-1 text-ink/90">
                &ldquo;{lastCounsel.text}&rdquo;
              </p>
            </div>
          </div>
        </Panel>
      )}

      <section className="mt-9" aria-label={t("office.seekCounsel")}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="kicker kicker-gold">{t("office.seekCounsel")}</h2>
          <p className="text-xs text-muted">{t("office.seekNote")}</p>
        </div>
        <div className="rule-gold mt-2 mb-4" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {COUNSELABLE.map((id) => {
            const def = characterById(id);
            const state = game.characters[id];
            if (!def || !state) return null;
            const used = state.counselUsedTurn === game.turn;
            const display = characterText(def, lang);
            return (
              <li key={id}>
                <article className="bg-card border border-rule rounded-panel p-4 flex gap-3">
                  <CharacterPortrait characterId={id} size="lg" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="display font-semibold text-sm leading-tight">{display.name}</p>
                    <p className="text-xs text-muted mt-0.5">{display.role}</p>
                    <div className="mt-2.5">
                      <Meter
                        label={t("cabinet.relationship")}
                        value={state.relationship}
                        tone={state.relationship >= 60 ? "moss" : state.relationship >= 35 ? "gold" : "brick"}
                      />
                    </div>
                    <div className="mt-3">
                      <Button size="sm" variant="outline" disabled={used} onClick={() => askCounsel(id)}>
                        {used ? t("office.consulted") : t("office.seek")}
                      </Button>
                    </div>
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
