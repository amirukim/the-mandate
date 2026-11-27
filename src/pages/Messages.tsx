import { useState } from "react";
import { useGameStore } from "../stores/game-store";
import { CHARACTERS } from "../data/characters";
import { ADVISOR_ARCS } from "../data/dialogue";
import { CharacterPortrait } from "../components/game/CharacterPortrait";
import { PageHeader } from "../components/ui/PageHeader";
import { DialogueScene } from "../features/narrative/DialogueScene";
import { saveLocal } from "../services/save-service";
import { useT } from "../i18n/store";
import { characterText } from "../i18n/data";
import { cn } from "../utils/cn";

const COUNSELABLE = ["chiefOfStaff", "finance", "economicAdviser", "nationalSecurity", "foreign", "home"] as const;

/**
 * The Messages app (v2): adviser counsel as an iMessage-style thread — one
 * counsel per adviser per month — plus the advisor arcs (Phase 8): three
 * conversations that unlock as relationships are earned and play once.
 */
export function Messages() {
  const game = useGameStore((s) => s.game);
  const askCounsel = useGameStore((s) => s.askCounsel);
  const { t, lang } = useT();
  const [openId, setOpenId] = useState<string | null>(COUNSELABLE[0]);
  const [threads, setThreads] = useState<Record<string, string[]>>({});
  const [arcId, setArcId] = useState<string | null>(null);

  if (!game) return null;

  const opened = openId ? CHARACTERS.find((c) => c.id === openId) : null;
  const openedState = openId ? game.characters[openId] : null;
  const openedDisplay = opened ? characterText(opened, lang) : null;
  const counselUsed = openId ? game.characters[openId]?.counselUsedTurn === game.turn : false;
  const thread = openId ? threads[openId] ?? [] : [];

  const ask = (id: string) => {
    if (game.characters[id]?.counselUsedTurn === game.turn) return;
    askCounsel(id);
    const fresh = useGameStore.getState().lastCounsel;
    if (fresh && fresh.characterId === id) {
      setThreads((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), fresh.text] }));
    }
  };

  const arc = arcId ? ADVISOR_ARCS.find((a) => a.id === arcId) ?? null : null;

  if (arc) {
    return (
      <div className="page-enter">
        <PageHeader dense kicker={t("messages.kicker")} title={t("messages.arcsTitle")} lead={t("messages.arcsLead")} />
        <DialogueScene graphId={arc.graph.id} onDone={() => {
          setArcId(null);
          const g = useGameStore.getState().game;
          if (g) useGameStore.setState({ game: { ...g } });
        }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader dense kicker={t("messages.kicker")} title={t("messages.title")} lead={t("messages.lead")} />

      {/* advisor arcs: conversations that unlock as the relationship earns them */}
      <div className="grid gap-3 sm:grid-cols-3 mt-1 mb-6">
        {ADVISOR_ARCS.map((a) => {
          const rel = game.characters[a.characterId]?.relationship ?? 50;
          const done = game.flags[`arc.done.${a.id}`] === true;
          const locked = rel < a.minRelationship;
          const def = CHARACTERS.find((c) => c.id === a.characterId);
          const display = def ? characterText(def, lang) : null;
          return (
            <button
              key={a.id}
              type="button"
              disabled={locked || done}
              onClick={() => {
                setArcId(a.id);
                const g = useGameStore.getState().game;
                if (g) {
                  g.flags = { ...g.flags, [`arc.done.${a.id}`]: true };
                  saveLocal(0, g);
                }
              }}
              className={cn(
                "text-left bg-card border rounded-panel px-3.5 py-3 transition-colors min-h-[64px]",
                locked || done ? "border-rule opacity-60 cursor-not-allowed" : "border-rule hover:border-gold/70 hover:bg-gold/5",
              )}
            >
              <span className="display text-sm font-semibold block">{lang === "ms" ? a.title.ms : a.title.en}</span>
              <span className="kicker text-[11px] block mt-0.5">{display?.name ?? a.characterId}</span>
              <span className={cn("kicker text-[11px] mt-1 block", done ? "text-gold-text" : "text-muted")}>
                {done
                  ? (lang === "ms" ? "Telah dimainkan" : "Played")
                  : locked
                    ? `${lang === "ms" ? "Perlu hubungan" : "Needs relationship"} ${a.minRelationship} (${rel})`
                    : lang === "ms" ? "Perbualan baharu" : "New conversation"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <nav aria-label={t("messages.threadsAria")} className="lg:col-span-1">
          <ul className="space-y-2">
            {COUNSELABLE.map((id) => {
              const def = CHARACTERS.find((c) => c.id === id);
              if (!def) return null;
              const display = characterText(def, lang);
              const used = game.characters[id]?.counselUsedTurn === game.turn;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(id)}
                    aria-current={openId === id}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-panel border transition-colors",
                      openId === id ? "border-gold bg-surface" : "border-rule bg-card hover:border-rule-strong",
                    )}
                  >
                    <CharacterPortrait characterId={id} size="md" className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="display text-sm font-semibold block truncate">{display.name}</span>
                      <span className="kicker text-[11px] block truncate">{display.role}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn("w-2 h-2 rounded-full shrink-0", used ? "bg-rule-strong" : "bg-gold")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="lg:col-span-2 min-w-0">
          {opened && openedDisplay ? (
            <div className="bg-card border border-rule rounded-panel overflow-hidden flex flex-col min-h-[440px]">
              <header className="px-4 py-3 border-b border-rule flex items-center gap-3">
                <CharacterPortrait characterId={opened.id} size="md" className="shrink-0" />
                <div className="min-w-0">
                  <h2 className="display text-base font-semibold leading-tight">{openedDisplay.name}</h2>
                  <p className="kicker text-[11px]">{openedDisplay.role}</p>
                </div>
                <span className="ml-auto font-pixel text-[12px] text-gold-text shrink-0">
                  {openedState?.relationship ?? 50}
                </span>
              </header>

              <div className="flex-1 px-4 py-5 space-y-3 overflow-y-auto">
                <p className="text-center kicker text-[11px] text-muted">
                  {t("messages.today")} · {game.turn + 1}
                </p>
                {thread.length === 0 ? (
                  <p className="text-sm text-muted text-center max-w-prose mx-auto mt-10 leading-relaxed">
                    {t("messages.threadEmpty")}
                  </p>
                ) : (
                  thread.map((paragraph, i) => (
                    <p
                      key={`msg-${openId}-${i}`}
                      className={cn(
                        "max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 rounded-panel",
                        i % 2 === 0
                          ? "bg-paper-deep text-ink mr-auto rounded-bl-[2px]"
                          : "bg-navy text-paper ml-auto rounded-br-[2px]",
                      )}
                    >
                      {paragraph}
                    </p>
                  ))
                )}
              </div>

              <footer className="px-4 py-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => ask(opened.id)}
                  disabled={counselUsed}
                  className={cn(
                    "w-full py-2.5 text-sm font-semibold rounded-[3px] border transition-colors",
                    counselUsed
                      ? "border-rule text-muted cursor-not-allowed"
                      : "border-gold bg-gold/10 text-gold-text hover:bg-gold hover:text-paper",
                  )}
                >
                  {counselUsed ? t("messages.counselUsed") : t("messages.askCounsel")}
                </button>
              </footer>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
