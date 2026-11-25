import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PixelScene } from "../../components/game/PixelScene";
import { PaintedScene } from "../../components/game/PaintedScene";
import { CharacterSprite } from "../../components/game/CharacterSprite";
import { artForScene, paintedSceneSrcs, sceneKeyFor } from "../../data/art";
import { trapTab, usePortalOverlay, prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useGameStore } from "../../stores/game-store";
import { dateLabel } from "../../engine/calendar";
import { useT } from "../../i18n/store";
import type { DialogueLine } from "../../types/narrative";
import type { Expression } from "../../data/pixel-portraits";
import { SpeakerStrip } from "./SpeakerStrip";
import type { CastMember } from "./cast";

interface SceneStageProps {
  title: string;
  location: string;
  category: string;
  /** The line on stage now; null during briefing. */
  activeLine: DialogueLine | null;
  cast: CastMember[];
  expression: Expression;
  showFigure: boolean;
  onAdvance(): void;
  onFocusCast(idx: number): void;
  /** The beat panel, wrapped in the caller's AnimatePresence. */
  children: ReactNode;
}

/**
 * The theatre itself: portal, keyboard, letterbox, backdrop, dateline and the
 * figure in the room. It knows nothing about which beat is showing — the
 * panels arrive as children.
 */
export function SceneStage({
  title,
  location,
  category,
  activeLine,
  cast,
  expression,
  showFigure,
  onAdvance,
  onFocusCast,
  children,
}: SceneStageProps) {
  const { container } = usePortalOverlay("scene-theatre");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { t, lang } = useT();
  const reduced = prefersReducedMotion();
  const turn = useGameStore((s) => s.game?.turn ?? null);

  const onStageKey = (e: React.KeyboardEvent) => {
    trapTab(e, rootRef.current);
    const el = e.target as HTMLElement | null;
    if (el && el.closest("button, a, input, textarea")) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onAdvance();
    }
  };

  if (!container) return null;

  return createPortal(
    <motion.div
      key="theatre"
      ref={rootRef}
      onKeyDown={onStageKey}
      className="fixed inset-0 z-[60] bg-chrome-deep stage text-ink overflow-hidden flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
    >
      {/* stage backdrop: the illustration, pixelated, dimmed and vignetted */}
      <div className="absolute inset-0" aria-hidden="true">
        <PixelScene src={artForScene(location)} width={480} height={140} className="art-warm opacity-75" />
        <PaintedScene srcs={paintedSceneSrcs(sceneKeyFor(location))} className="opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_40%,rgba(17,24,35,0.9)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111823]/70 via-[#111823]/30 to-transparent" />
      </div>

      {/* letterbox bars */}
      <div aria-hidden="true" className="relative z-10 h-6 sm:h-8 bg-black border-b border-chrome-ink/10" />
      <div aria-hidden="true" className="relative z-10 order-last h-6 sm:h-8 bg-black border-t border-chrome-ink/10" />

      {/* top strip: location · category · date, and the scene title */}
      <div className="relative z-10 px-5 sm:px-10 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{location}</p>
          <span aria-hidden="true" className="text-rule">&middot;</span>
          <p className="kicker">{t(`category.${category}`)}</p>
          {turn !== null && (
            <>
              <span aria-hidden="true" className="text-rule">&middot;</span>
              <p className="kicker">{dateLabel(turn, lang)}</p>
            </>
          )}
        </div>
        <h1 className="display text-xl sm:text-2xl font-semibold mt-1.5 text-ink/90">{title}</h1>
      </div>

      {/* the stage: a figure in the room on the left, the beat panel on the right */}
      <div className="relative z-10 flex-1 min-h-0 flex items-stretch gap-8 px-5 sm:px-10 py-4">
        {/* portrait column — anchored to the floor, never squeezed */}
        <div className="hidden sm:flex flex-col items-center justify-end gap-3 shrink-0 pb-3">
          <AnimatePresence mode="wait" initial={false}>
            {activeLine && showFigure ? (
              <motion.div
                key={activeLine.speaker}
                initial={{ opacity: 0, x: reduced ? 0 : -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : 10 }}
                transition={{ duration: 0.28 }}
              >
                <CharacterSprite
                  speaker={activeLine.speaker}
                  role={activeLine.role}
                  characterId={cast.find((c) => c.speaker === activeLine.speaker)?.characterId ?? null}
                  expression={expression}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          {showFigure && cast.length > 1 && (
            <SpeakerStrip
              cast={cast}
              active={activeLine?.speaker}
              onFocus={onFocusCast}
              className="hidden sm:flex"
            />
          )}
        </div>

        {/* the beat panel: one beat at a time, never a scrolling column */}
        <div className="flex-1 min-w-0 flex flex-col justify-end">{children}</div>
      </div>
    </motion.div>,
    container,
  );
}
