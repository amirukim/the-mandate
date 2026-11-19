import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { GameEventDef } from "../../types/narrative";
import type { ChosenOutcome } from "../../engine/turn-flow";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { artForScene } from "../../data/art";
import { usePortalOverlay, trapTab, prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useT } from "../../i18n/store";
import { eventDisplay } from "../../i18n/data";
import { cn } from "../../utils/cn";

const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

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
 * The scene theatre, Suzerain-style: a dark full-viewport stage with the
 * illustrated setting, letterbox bars, a large stage-left portrait that
 * cross-fades as speakers change, and the reply docked at the bottom.
 * The reaction screen plays inside the same theatre.
 */
export function SceneView({ event, chosen, onDecide, onContinue }: SceneViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { container } = usePortalOverlay("scene-theatre");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { t, lang } = useT();
  const display = eventDisplay(event, lang);
  const reduced = prefersReducedMotion();

  // The active speaker drives the big portrait; default to the first line.
  const [speakerIdx, setSpeakerIdx] = useState(0);
  useEffect(() => {
    setSpeakerIdx(0);
    setSelected(null);
  }, [event.id]);

  if (!container) return null;

  const activeLine = display.dialogue[Math.min(speakerIdx, Math.max(0, display.dialogue.length - 1))];

  const scene = (
    <motion.div
      key="theatre"
      ref={rootRef}
      onKeyDown={(e) => trapTab(e, rootRef.current)}
      className="fixed inset-0 z-[60] bg-[#0a0e15] text-ink overflow-hidden flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${display.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
    >
      {/* stage backdrop: the illustration, dimmed and vignetted */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={artForScene(display.location)}
          alt=""
          className="h-full w-full object-cover opacity-55"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_40%,rgba(6,9,14,0.92)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e15]/85 via-[#0a0e15]/40 to-transparent" />
      </div>

      {/* letterbox bars */}
      <div aria-hidden="true" className="relative z-10 h-6 sm:h-8 bg-[#06090e] border-b border-white/5" />
      <div aria-hidden="true" className="relative z-10 order-last h-6 sm:h-8 bg-[#06090e] border-t border-white/5" />

      {/* top strip: location · category, and the scene title small */}
      <div className="relative z-10 px-5 sm:px-10 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{display.location}</p>
          <span aria-hidden="true" className="text-rule">&middot;</span>
          <p className="kicker">{t(`category.${display.category}`)}</p>
        </div>
        <h1 className="display text-xl sm:text-2xl font-semibold mt-1.5 text-ink/90">{display.title}</h1>
      </div>

      {/* the stage: portrait left, script right */}
      <div className="relative z-10 flex-1 min-h-0 flex items-stretch gap-6 px-5 sm:px-10 py-6">
        {/* portrait column — cross-fades on speaker change */}
        <div className="hidden sm:flex items-start shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            {activeLine ? (
              <motion.div
                key={activeLine.speaker}
                initial={{ opacity: 0, x: reduced ? 0 : -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : 10 }}
                transition={{ duration: 0.28 }}
                className="flex flex-col items-center gap-3"
              >
                <Avatar name={activeLine.speaker} size="stage" className="ring-1 ring-gold/50 shadow-lift" />
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-bright">
                    {activeLine.speaker}
                  </p>
                  <p className="kicker text-[10px] mt-0.5">{activeLine.role}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* script column: briefing → dialogue → (chosen) reaction */}
        <div className="flex-1 min-w-0 overflow-y-auto pr-1 sm:pr-4">
          <AnimatePresence mode="wait" initial={false}>
            {chosen === null ? (
              <motion.div key="script" {...stageFade(0.05)}>
                {/* the file */}
                <section aria-label={t("scene.briefingAria")}>
                  <p className="kicker mb-3">{t("scene.file")}</p>
                  <div className="space-y-4">
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
                </section>

                {/* in the room: the conversation, speaker-aware */}
                {display.dialogue.length > 0 && (
                  <section aria-label={t("scene.inRoom")} className="mt-8 max-w-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="kicker kicker-gold shrink-0">{t("scene.inRoom")}</p>
                      <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
                    </div>
                    <div className="space-y-3">
                      {display.dialogue.map((line, i) => {
                        const active = i === speakerIdx;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSpeakerIdx(i)}
                            aria-pressed={active}
                            className={cn(
                              "w-full text-left rounded-[3px] border-l-2 px-4 py-3 transition-colors",
                              active ? "border-gold bg-white/[0.05]" : "border-rule/60 hover:bg-white/[0.03]",
                            )}
                          >
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-bright">
                                {line.speaker}
                              </p>
                              <p className="kicker text-[10px]">{line.role}</p>
                            </div>
                            <p className="display text-[1.0313rem] leading-relaxed mt-1.5 text-ink/90 italic">
                              &ldquo;{line.text}&rdquo;
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="kicker text-[9px] mt-3 text-muted">
                      {lang === "ms" ? "Ketik satu baris untuk menampilkan penceramah di pentas." : "Tap a line to bring its speaker to the stage."}
                    </p>
                  </section>
                )}
              </motion.div>
            ) : (
              <motion.section key="reaction" {...stageFade(0)} aria-labelledby="reaction-title" className="max-w-2xl">
                <p className="stamp">{t("scene.stamp")}</p>
                <h1 id="reaction-title" className="display text-3xl sm:text-4xl font-semibold mt-4 leading-tight">
                  {chosen.option.label}
                </h1>
                <p className="text-muted text-sm mt-3 max-w-prose leading-relaxed">{chosen.option.summary}</p>
                <div className="rule-double mt-6" />

                {chosen.notes.length > 0 && (
                  <section aria-label={t("scene.consequencesAria")} className="mt-6">
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
                  </section>
                )}

                {chosen.news.length > 0 && (
                  <section aria-label={t("scene.wire")} className="mt-8">
                    <div className="flex items-center gap-3">
                      <p className="kicker kicker-gold shrink-0">{t("scene.wire")}</p>
                      <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {chosen.news.map((item) => (
                        <article key={item.id} className="bg-card/80 border border-rule rounded-panel p-4">
                          <p className="kicker">{OUTLET_NAME[item.outlet]}</p>
                          <h3 className="display text-base font-semibold leading-snug mt-1">{item.headline}</h3>
                          {item.body && <p className="text-sm text-muted mt-1.5 leading-relaxed">{item.body}</p>}
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* bottom dock: reply bars in the theatre, or the continue control */}
      <div className="relative z-10 border-t border-white/10 bg-[#0b0f16]/90 backdrop-blur-sm px-5 sm:px-10 py-4">
        {chosen === null ? (
          <section aria-label={t("scene.decisionsAria")} className="max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-2.5">
              <p className="kicker kicker-gold shrink-0">{t("scene.reply")}</p>
              <span aria-hidden="true" className="flex-1 border-t border-gold/30" />
            </div>
            {selected === null ? (
              <>
                <div className="grid gap-2">
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
                      <span className="inline-flex w-7 h-7 shrink-0 mt-0.5 items-center justify-center border border-gold text-gold-text text-xs font-bold rounded-[2px] group-hover:bg-gold group-hover:text-paper transition-colors">
                        {LETTERS[i]}
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
                <p className="text-[11px] text-muted mt-2">{t("scene.noUndo")}</p>
              </>
            ) : (
              <p className="text-muted text-sm" aria-live="polite">
                {t("scene.decisionMade").replace(
                  "%{choice}",
                  display.options.find((o) => o.id === selected)?.label ?? "",
                )}
              </p>
            )}
          </section>
        ) : (
          <div className="max-w-3xl mx-auto w-full flex items-center gap-4">
            <Button onClick={onContinue}>{t("common.continue")}</Button>
            <span className="text-xs text-muted">{t("common.monthEnd")}</span>
          </div>
        )}
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

const OUTLET_NAME: Record<string, string> = {
  peninsula: "The Peninsula Post",
  borneo: "Borneo Herald",
  sinar: "Sinar Waktu",
};
