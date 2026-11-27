import { useMemo, useState } from "react";
import { CHARACTERS } from "../../data/characters";
import { SUPPORTING_CAST } from "../../data/cast-v2";
import { characterText } from "../../i18n/data";
import { PixelSprite } from "../../components/game/PixelSprite";
import { PartyFlag } from "../../components/ui/PartyFlag";
import { FIGURE_COALITION } from "../../data/cast-v2";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useGameStore } from "../../stores/game-store";
import { useT } from "../../i18n/store";
import { graphEventById, completeGraphEvent, chooseGraphEvent } from "../../engine/graph-events";
import { dialogueEnter, dialogueAdvance } from "../../engine/dialogue";
import type { DialogueView, DialogueChoicesView } from "../../engine/dialogue";
import { saveLocal } from "../../services/save-service";
import { cn } from "../../utils/cn";
import type { Expression } from "../../data/pixel-portraits";

/**
 * The v2 runner UI (Phase 8): renders a graph event on the desk â€” big bust,
 * nameplate, lines to advance, choices with effect-on-pick, locked chips with
 * their reasons. Choices apply through the engine and finalise the desk
 * bookkeeping (decision, wire, queue) on the pick, mirroring chooseOption.
 */
export function DialogueScene({ graphId, onDone }: { graphId: string; onDone: () => void }) {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  const def = graphEventById(graphId);
  const [view, setView] = useState<DialogueView | null>(null);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [chose, setChose] = useState(false);
  const reduced = prefersReducedMotion();

  const entered = useMemo(() => {
    if (!def || !game || view) return null;
    // resume mid-scene after a reload: if a pick was recorded, show the end
    const picked = Object.keys(game.flags).find((f) => f.startsWith(`dialog:${def.graph.id}:`));
    if (picked) {
      return { kind: "end" as const };
    }
    return dialogueEnter(game, def.graph, def.graph.start);
  }, [def, game, view]);

  if (!def || !game) return null;
  const meta = def.meta;
  const current = view ?? entered;

  const speakerInfo = (speaker: string): { name: string; role?: string; spriteId: string | null; bloc?: string } => {
    if (speaker === "pm") {
      return { name: game.meta.playerName, role: lang === "ms" ? "Perdana Menteri" : "Prime Minister", spriteId: null };
    }
    const main = CHARACTERS.find((c) => c.id === speaker);
    if (main) {
      const display = characterText(main, lang);
      return { name: display.name, role: display.role, spriteId: speaker, bloc: undefined };
    }
    const sup = SUPPORTING_CAST.find((c) => c.id === speaker);
    if (sup) {
      return { name: sup.name, role: speaker === "sup-palaceSecretary" ? (lang === "ms" ? "Setiausaha istana" : "Istana secretary") : sup.role, spriteId: speaker, bloc: FIGURE_COALITION[speaker] };
    }
    return { name: speaker, spriteId: null };
  };

  const persist = () => {
    // engine mutates the store object in place; clone so subscribers re-render
    useGameStore.setState({ game: { ...game } });
    saveLocal(0, game);
  };

  const advance = (nodeId: string) => {
    const next = dialogueAdvance(game, def.graph, nodeId);
    setView(next);
    persist();
  };

  const choose = (nodeId: string, choiceId: string) => {
    const choice = def.graph.nodes[nodeId].kind === "choices"
      ? def.graph.nodes[nodeId].choices.find((c) => c.id === choiceId)
      : null;
    const result = chooseGraphEvent(game, def.graph, nodeId, choiceId, {
      news: choice?.news,
      title: lang === "ms" ? meta.title.ms : meta.title.en,
    });
    setChose(true);
    if (choice?.news) setHeadlines((h) => [...h, choice.news!.headline[lang]]);
    completeGraphEvent(game, def.graph.id, choice?.news?.headline ?? null, meta.category, choice?.news?.outlet ?? "peninsula");
    setView(result.view);
    persist();
  };

  const finish = () => {
    onDone();
  };

  const kicker = `${lang === "ms" ? meta.location.ms : meta.location.en} Â· ${lang === "ms" ? meta.title.ms : meta.title.en}`;

  return (
    <div className="space-y-5">
      <header>
        <p className="kicker kicker-gold">{kicker}</p>
        <div className="rule mt-3" />
      </header>

      {current && current.kind === "line" && (() => {
        const info = speakerInfo(current.speaker);
        const expression = (current.expression ?? "neutral") as Expression;
        return (
          <div className="bg-card border border-rule rounded-panel p-5">
            <div className="flex gap-4">
              {info.spriteId ? (
                <PixelSprite characterId={info.spriteId} expression={expression} scale={1} className="shrink-0 rounded-[2px] bg-navy/90 border border-rule" />
              ) : (
                <div className="shrink-0 w-[96px] h-[128px] rounded-[2px] bg-navy/90 border border-rule flex items-center justify-center">
                  <span aria-hidden="true" className="font-pixel text-[12px] text-gold/80 text-center px-1">PM</span>
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="display text-lg font-semibold">{info.name}</h2>
                  {info.bloc && <PartyFlag coalitionId={info.bloc} size={16} />}
                </div>
                {info.role && <p className="kicker text-[12px] mt-0.5">{info.role}</p>}
                <p className="text-sm leading-relaxed text-ink/90 mt-3">{lang === "ms" ? current.text.ms : current.text.en}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => advance(current.nodeId)}
                className="text-sm font-semibold text-gold-text hover:text-gold-bright transition-colors"
              >
                {t("scene.continue")} â†’
              </button>
            </div>
          </div>
        );
      })()}

      {current && current.kind === "choices" && (
        <div className="bg-card border border-rule rounded-panel p-5">
          {current.prompt && (
            <p className="display text-sm font-semibold mb-3">{lang === "ms" ? current.prompt.ms : current.prompt.en}</p>
          )}
          <ul className="space-y-2">
            {(current as DialogueChoicesView).choices.map((choice) => {
              const label = lang === "ms" ? choice.label.ms : choice.label.en;
              const reason = choice.locked ? (choice.lockedReason ? (lang === "ms" ? choice.lockedReason.ms : choice.lockedReason.en) : null) : null;
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    disabled={choice.locked}
                    onClick={() => choose(current.nodeId, choice.id)}
                    aria-disabled={choice.locked}
                    className={cn(
                      "w-full text-left border rounded-[2px] px-3 py-2.5 min-h-[44px] transition-colors flex items-center justify-between gap-3",
                      choice.locked
                        ? "border-rule bg-surface/50 cursor-not-allowed"
                        : "border-rule hover:border-gold/70 hover:bg-gold/5",
                    )}
                  >
                    <span className={cn("text-sm font-semibold", choice.locked ? "text-muted" : "text-ink")}>{label}</span>
                    {choice.locked && <span className="kicker text-[11px] text-brick-text shrink-0">{reason ?? ""}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {current && current.kind === "end" && (
        <div className="bg-card border border-gold/50 rounded-panel p-5">
          <p className="kicker kicker-gold">{t("scene.desk")}</p>
          <p className="text-sm text-muted mt-2">
            {chose || headlines.length > 0
              ? (lang === "ms" ? "Keputusan direkodkan. Dawai berita telah diberitahu." : "The decision is on the record and the wire has been told.")
              : (lang === "ms" ? "Tiada keputusan diperlukan." : "No decision was required here.")}
          </p>
          {headlines.map((h, i) => (
            <p key={i} className="text-sm font-semibold mt-2">â€œ{h}â€</p>
          ))}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={finish}
              className="text-sm font-semibold text-gold-text hover:text-gold-bright transition-colors"
            >
              {t("scene.continue")} â†’
            </button>
          </div>
        </div>
      )}

      {!reduced && <p className="kicker text-[11px] text-muted">{t("scene.recorded")}</p>}
    </div>
  );
}
