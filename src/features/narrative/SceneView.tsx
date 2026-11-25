import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { GameEventDef } from "../../types/narrative";
import type { ChosenOutcome } from "../../engine/turn-flow";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useT } from "../../i18n/store";
import { eventDisplay } from "../../i18n/data";
import { SceneStage } from "./SceneStage";
import { BriefingPanel } from "./panels/BriefingPanel";
import { DialoguePanel } from "./panels/DialoguePanel";
import { DecisionPanel } from "./panels/DecisionPanel";
import { ConsequencePanel } from "./panels/ConsequencePanel";
import { castOf, expressionForOutcome } from "./cast";
import { useTypewriter } from "./useTypewriter";

interface SceneViewProps {
  event: GameEventDef;
  chosen: ChosenOutcome | null;
  onDecide(optionId: string): void;
  onContinue(): void;
}

type Phase = "briefing" | "dialogue" | "decision";

/**
 * The scene unfolds beat by beat, the way a scene should:
 *   briefing (the file) → dialogue (one exchange at a time, typewriter
 *   reveal, Space/Enter to advance) → the reply → the wire.
 *
 * This module is only the state machine and the routing of beats to panels;
 * the shell lives in SceneStage, the beats in ./panels, the cast and its
 * expression rules in ./cast. Pacing is presentation only: the engine, options
 * and consequences are exactly the ones the event defines.
 */
export function SceneView({ event, chosen, onDecide, onContinue }: SceneViewProps) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [lineIdx, setLineIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const { lang } = useT();
  const display = eventDisplay(event, lang);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    setPhase("briefing");
    setLineIdx(0);
    setSelected(null);
  }, [event.id]);

  const cast = useMemo(() => castOf(display.dialogue), [display.dialogue]);
  const line = display.dialogue[Math.min(lineIdx, Math.max(0, display.dialogue.length - 1))];
  const activeLine = line;
  const typing = useTypewriter(phase === "dialogue" && line ? line.text : "", !reduced);

  const proceed = () => {
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
  };

  const pick = (optionId: string) => {
    setSelected(optionId);
    // Small pause so the selection reads before consequences land.
    window.setTimeout(() => onDecide(optionId), reduced ? 120 : 260);
  };

  // The stage figure reacts to the outcome; neutral while the scene talks.
  const expression = chosen ? expressionForOutcome(chosen.option) : "neutral";

  return (
    <SceneStage
      title={display.title}
      location={display.location}
      category={display.category}
      activeLine={activeLine}
      cast={cast}
      expression={expression}
      showFigure={phase !== "briefing"}
      onAdvance={proceed}
      onFocusCast={(idx) => {
        setLineIdx(idx);
        if (phase === "decision") setPhase("dialogue");
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {chosen !== null ? (
          <ConsequencePanel key="reaction" chosen={chosen} onContinue={onContinue} />
        ) : phase === "briefing" ? (
          <BriefingPanel
            key="briefing"
            briefing={display.briefing}
            cast={cast}
            onProceed={proceed}
          />
        ) : phase === "dialogue" ? (
          <DialoguePanel
            key={`dialogue-${lineIdx}`}
            speaker={line?.speaker ?? ""}
            role={line?.role ?? ""}
            shown={typing.shown}
            text={line?.text ?? ""}
            done={typing.done}
            lineIdx={lineIdx}
            total={display.dialogue.length}
            onProceed={proceed}
          />
        ) : (
          <DecisionPanel
            key="decision"
            options={display.options}
            selected={selected}
            onPick={pick}
            onBackToBriefing={() => setPhase("briefing")}
          />
        )}
      </AnimatePresence>
    </SceneStage>
  );
}
