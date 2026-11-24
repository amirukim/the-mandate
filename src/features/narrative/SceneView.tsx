import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { GameEventDef } from "../../types/narrative";
import type { ChosenOutcome } from "../../engine/turn-flow";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { NewspaperArticle } from "../../components/game/NewspaperArticle";
import { PaintedScene } from "../../components/game/PaintedScene";
import { artForScene, paintedSceneSrcs, sceneKeyFor } from "../../data/art";
import { usePortalOverlay, trapTab, prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useGameStore } from "../../stores/game-store";
import { dateLabel } from "../../engine/calendar";
import { useT } from "../../i18n/store";
import { eventDisplay } from "../../i18n/data";
import { cn } from "../../utils/cn";

interface SceneViewProps {
  event: GameEventDef;
  chosen: ChosenOutcome | null;
  onDecide(optionId: string): void;
  onContinue(): void;
}

const stageFade = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/**
 * The scene unfolds beat by beat, the way a scene should:
 *   briefing (the file) → dialogue (one exchange at a time, typewriter
 *   reveal, Space/Enter to advance) → the reply → the wire.
 * Pacing is presentation only: the engine, options and consequences are
 * exactly the ones the event defines.
 */
type Phase = "briefing" | "dialogue" | "decision";

/** Reveals text a couple of characters at a time; instant under reduced motion. */
function useTypewriter(text: string, enabled: boolean) {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    setCount(enabled ? 0 : text.length);
    if (!enabled || !text) return;
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(timer);
          return c;
        }
        return c + 2;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [text, enabled]);
  const done = count >= text.length;
  const complete = useCallback(() => setCount(text.length), [text.length]);
  return { shown: text.slice(0, count), done, complete };
}

export function SceneView({ event, chosen, onDecide, onContinue }: SceneViewProps) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [lineIdx, setLineIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const { container } = usePortalOverlay("scene-theatre");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { t, lang } = useT();
  const display = eventDisplay(event, lang);
  const reduced = prefersReducedMotion();
  const turn = useGameStore((s) => s.game?.turn ?? null);

  useEffect(() => {
    setPhase("briefing");
    setLineIdx(0);
    setSelected(null);
  }, [event.id]);

  const line = display.dialogue[Math.min(lineIdx, Math.max(0, display.dialogue.length - 1))];
  const typing = useTypewriter(phase === "dialogue" && line ? line.text : "", !reduced);

  // Scene cast in order of first appearance — the speaker row.
  const cast: Array<{ speaker: string; role: string; idx: number }> = [];
  display.dialogue.forEach((l, i) => {
    if (!cast.some((c) => c.speaker === l.speaker)) cast.push({ speaker: l.speaker, role: l.role, idx: i });
  });

  const activeLine = phase === "dialogue" && line ? line : display.dialogue[Math.min(lineIdx, Math.max(0, display.dialogue.length - 1))];

  const proceed = useCallback(() => {
    if (!typing.done) {
      typing.complete();
      return;
    }
    if (phase === "briefing") {
      setPhase(display.dialogue.length > 0 ? "dialogue" : "decision");
    } else if (phase === "dialogue") {
      if (lineIdx < display.dialogue.length - 1) setLineIdx(lineIdx + 1);
      else setPhase("decision");
    }
  }, [typing, phase, lineIdx, display.dialogue.length]);

  const onStageKey = (e: React.KeyboardEvent) => {
    trapTab(e, rootRef.current);
    const el = e.target as HTMLElement | null;
    if (el && el.closest("button, a, input, textarea")) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      proceed();
    }
  };

  if (!container) return null;

  const scene = (
    <motion.div
      key="theatre"
      ref={rootRef}
      onKeyDown={onStageKey}
      className="fixed inset-0 z-[60] bg-[#0f0c08] text-ink overflow-hidden flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${display.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
    >
      {/* stage backdrop: the illustration, dimmed, warmed and vignetted */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={artForScene(display.location)}
          alt=""
          className="art-warm h-full w-full object-cover opacity-75"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <PaintedScene srcs={paintedSceneSrcs(sceneKeyFor(display.location))} className="opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_40%,rgba(10,8,5,0.88)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0c08]/70 via-[#0f0c08]/30 to-transparent" />
      </div>

      {/* letterbox bars */}
      <div aria-hidden="true" className="relative z-10 h-6 sm:h-8 bg-[#0a0806] border-b border-white/5" />
      <div aria-hidden="true" className="relative z-10 order-last h-6 sm:h-8 bg-[#0a0806] border-t border-white/5" />

      {/* top strip: location · category · date, and the scene title */}
      <div className="relative z-10 px-5 sm:px-10 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{display.location}</p>
          <span aria-hidden="true" className="text-rule">&middot;</span>
          <p className="kicker">{t(`category.${display.category}`)}</p>
          {turn !== null && (
            <>
              <span aria-hidden="true" className="text-rule">&middot;</span>
              <p className="kicker">{dateLabel(turn, lang)}</p>
            </>
          )}
        </div>
        <h1 className="display text-xl sm:text-2xl font-semibold mt-1.5 text-ink/90">{display.title}</h1>
      </div>

      {/* the stage: a figure in the room on the left, the beat panel on the right */}
      <div className="relative z-10 flex-1 min-h-0 flex items-stretch gap-8 px-5 sm:px-10 py-4">
        {/* portrait column — anchored to the floor, never squeezed */}
        <div className="hidden sm:flex flex-col items-center justify-end gap-3 shrink-0 pb-3">
          <AnimatePresence mode="wait" initial={false}>
            {activeLine && phase !== "briefing" ? (
              <motion.div
                key={activeLine.speaker}
                initial={{ opacity: 0, x: reduced ? 0 : -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : 10 }}
                transition={{ duration: 0.28 }}
                className="flex flex-col items-center gap-2.5"
              >
                <div className="relative">
                  <div aria-hidden="true" className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-4 w-4/5 rounded-[100%] bg-black/55 blur-[6px]" />
                  <motion.div
                    animate={reduced ? {} : { scale: [1, 1.03] }}
                    transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    className="relative"
                  >
                    <Avatar name={activeLine.speaker} size="stage" className="ring-1 ring-gold/40 shadow-lift" />
                  </motion.div>
                </div>
                <div className="text-center bg-[#120f0a]/80 border border-gold/30 rounded-[2px] px-3 py-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-bright">
                    {activeLine.speaker}
                  </p>
                  <p className="kicker text-[10px] mt-0.5">{activeLine.role}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {phase !== "briefing" && cast.length > 1 && (
            <SpeakerStrip
              cast={cast}
              active={activeLine?.speaker}
              onFocus={(idx) => {
                setLineIdx(idx);
                if (phase === "decision") setPhase("dialogue");
              }}
              className="hidden sm:flex"
            />
          )}
        </div>

        {/* the beat panel: one beat at a time, never a scrolling column */}
        <div className="flex-1 min-w-0 flex flex-col justify-end">
          <AnimatePresence mode="wait" initial={false}>
            {chosen !== null ? (
              <motion.section
                key="reaction"
                {...stageFade(0)}
                aria-labelledby="reaction-title"
                className="max-w-3xl w-full ml-auto bg-[#120f0a]/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-6 py-5 max-h-[62vh] overflow-y-auto"
              >
                <p className="stamp">{t("scene.stamp")}</p>
                <h1 id="reaction-title" className="display text-2xl sm:text-3xl font-semibold mt-3 leading-tight">
                  {chosen.option.label}
                </h1>
                <p className="text-muted text-sm mt-2 max-w-prose leading-relaxed">{chosen.option.summary}</p>
                <div className="rule-double mt-5" />

                {chosen.notes.length > 0 && (
                  <motion.section {...stageFade(0.15)} aria-label={t("scene.consequencesAria")} className="mt-5">
                    <p className="kicker kicker-gold mb-3">{t("scene.whatFollows")}</p>
                    <div className="space-y-3">
                      {chosen.notes.map((note, i) => (
                        <p
                          key={i}
                          className="display text-[1.0313rem] leading-relaxed text-ink/90 border-l-2 border-gold pl-4 py-0.5"
                        >
                          {note}
                        </p>
                      ))}
                    </div>
                  </motion.section>
                )}

                {chosen.news.length > 0 && (
                  <motion.section {...stageFade(0.3)} aria-label={t("scene.wire")} className="mt-6">
                    <div className="flex items-center gap-3">
                      <p className="kicker kicker-gold shrink-0">{t("scene.wire")}</p>
                      <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {chosen.news.map((item) => (
                        <NewspaperArticle key={item.id} item={item} />
                      ))}
                    </div>
                  </motion.section>
                )}

                <motion.div {...stageFade(0.4)} className="mt-6 flex items-center gap-4">
                  <Button onClick={onContinue}>{t("common.continue")}</Button>
                  <span className="text-xs text-muted">{t("common.monthEnd")}</span>
                </motion.div>
              </motion.section>
            ) : phase === "briefing" ? (
              <motion.section
                key="briefing"
                {...stageFade(0.05)}
                aria-label={t("scene.briefingAria")}
                className="max-w-3xl w-full ml-auto bg-[#120f0a]/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-7 py-5 max-h-[62vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3">
                  <p className="kicker kicker-gold shrink-0">{t("scene.file")}</p>
                  <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
                </div>
                <div className="space-y-4 mt-4">
                  {display.briefing.map((paragraph, i) => (
                    <p
                      key={i}
                      className={cn(
                        "display text-[1.0625rem] sm:text-[1.125rem] leading-[1.75] text-ink/90 max-w-prose",
                        i === 0 && "drop-cap",
                      )}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 mt-6">
                  {cast.length > 0 && (
                    <p className="kicker text-[9px] text-muted">
                      {cast.map((c) => c.speaker).join(" · ")}
                    </p>
                  )}
                  <Button onClick={proceed}>{t("scene.proceed")} &rarr;</Button>
                </div>
              </motion.section>
            ) : phase === "dialogue" ? (
              <motion.section
                key={`dialogue-${lineIdx}`}
                {...stageFade(0)}
                aria-label={t("scene.inRoom")}
                className="max-w-3xl w-full ml-auto bg-[#120f0a]/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-7 py-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-bright">{line?.speaker}</p>
                    <p className="kicker text-[10px]">{line?.role}</p>
                  </div>
                  <p className="tabular kicker text-[10px] text-muted">
                    {lineIdx + 1} / {display.dialogue.length}
                  </p>
                </div>
                <p className="display italic text-[1.2rem] sm:text-[1.32rem] leading-[1.6] mt-3 text-ink/95 min-h-[5.5rem]">
                  &ldquo;{typing.shown}
                  {!typing.done && <span aria-hidden="true" className="text-gold">▌</span>}
                  {typing.done && "\u201D"}
                </p>
                <span className="sr-only">{line?.text}</span>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <p className="text-[11px] text-muted">
                    {lang === "ms" ? "Klik atau tekan Space untuk teruskan." : "Click, or press Space, to continue."}
                  </p>
                  <Button onClick={proceed}>{t("common.continue")} &rarr;</Button>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="decision"
                {...stageFade(0)}
                aria-label={t("scene.decisionsAria")}
                className="max-w-3xl w-full ml-auto bg-[#120f0a]/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-7 py-5 max-h-[62vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3">
                  <p className="kicker kicker-gold shrink-0">{t("scene.reply")}</p>
                  <span aria-hidden="true" className="flex-1 border-t border-gold/30" />
                </div>
                {selected === null ? (
                  <>
                    <div className="grid gap-2 mt-3">
                      {display.options.map((option, i) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelected(option.id);
                            // Small pause so the selection reads before consequences land.
                            window.setTimeout(() => onDecide(option.id), reduced ? 120 : 260);
                          }}
                          className="group w-full text-left flex items-start gap-4 px-4 py-3 rounded-[3px] border border-white/10 bg-white/[0.04] transition-colors hover:border-gold/60 hover:bg-white/[0.07] focus-visible:border-gold"
                        >
                          <span className="tabular inline-flex w-7 h-7 shrink-0 mt-0.5 items-center justify-center border border-gold text-gold-text text-xs font-bold rounded-[2px] group-hover:bg-gold group-hover:text-paper transition-colors">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="display block text-base sm:text-lg font-semibold leading-snug">
                              {option.label}
                            </span>
                            <span className="block text-sm text-muted mt-0.5 leading-relaxed line-clamp-2 max-w-prose">
                              {option.detail}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="hidden sm:block ml-auto text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xl translate-y-0.5"
                          >
                            &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-3">
                      <p className="text-[11px] text-muted">{t("scene.noUndo")}</p>
                      <button
                        type="button"
                        onClick={() => setPhase("briefing")}
                        className="kicker text-[9px] text-muted hover:text-gold-bright underline underline-offset-4"
                      >
                        {t("scene.file")}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted text-sm py-2" aria-live="polite">
                    {t("scene.decisionMade").replace(
                      "%{choice}",
                      display.options.find((o) => o.id === selected)?.label ?? "",
                    )}
                  </p>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence mode="wait" initial={false}>
      {scene}
    </AnimatePresence>,
    container,
  );
}

/**
 * The scene cast as portrait plates: the Suzerain character row. The speaking
 * character is lit in gold; the others wait in shadow. Tapping one brings
 * them to the stage.
 */
function SpeakerStrip({
  cast,
  active,
  onFocus,
  className,
}: {
  cast: Array<{ speaker: string; role: string; idx: number }>;
  active?: string;
  onFocus: (idx: number) => void;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div className={cn("items-start gap-2 overflow-x-auto max-w-full pt-1", className)} role="group" aria-label={t("scene.inRoom")}>
      {cast.map((c) => {
        const isActive = active === c.speaker;
        return (
          <button
            key={c.speaker}
            type="button"
            onClick={() => onFocus(c.idx)}
            aria-pressed={isActive}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center gap-1 rounded-[2px] p-1 transition-all",
              isActive
                ? "bg-white/[0.07] opacity-100"
                : "opacity-55 hover:opacity-95 focus-visible:opacity-100",
            )}
            title={`${c.speaker} — ${c.role}`}
          >
            <Avatar name={c.speaker} size="md" className={isActive ? "ring-gold" : "ring-white/10"} />
            <span
              className={cn(
                "w-full truncate text-center text-[9px] font-semibold uppercase tracking-[0.06em] leading-tight",
                isActive ? "text-gold-bright" : "text-muted",
              )}
            >
              {c.speaker}
            </span>
          </button>
        );
      })}
    </div>
  );
}
