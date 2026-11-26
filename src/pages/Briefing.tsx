import { Navigate, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import { currentEvent } from "../engine/turn-flow";
import { isGraphEvent, graphEventById } from "../engine/graph-events";
import { ensureContentRegistered } from "../data/dialogue";
import { SceneView } from "../features/narrative/SceneView";
import { DialogueScene } from "../features/narrative/DialogueScene";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { useT } from "../i18n/store";

export function Briefing() {
  const game = useGameStore((s) => s.game);
  const chosen = useGameStore((s) => s.chosen);
  const makeDecision = useGameStore((s) => s.makeDecision);
  const clearChosen = useGameStore((s) => s.clearChosen);
  const endMonth = useGameStore((s) => s.endMonth);
  const navigate = useNavigate();
  const { t } = useT();

  ensureContentRegistered();

  if (!game) return null;
  if (game.fallen) return <Navigate to="/game/fallen" replace />;
  if (game.phase === "summary") return <Navigate to="/game/summary" replace />;

  // The queue head decides the desk: v2 graph events run the new runner UI.
  const head = game.queuedEventIds[0] ?? null;
  if (head && isGraphEvent(head)) {
    const graphDef = graphEventById(head)!;
    return (
      <div className="page-enter max-w-3xl">
        <DialogueScene graphId={graphDef.graph.id} onDone={() => useGameStore.setState({ game: { ...game } })} />
      </div>
    );
  }

  const event = currentEvent(game);
  // While a decision's reaction is on screen, keep showing that event, not the next one.
  const sceneEvent = chosen ? chosen.event : event;

  if (!sceneEvent) {
    return (
      <div className="page-enter max-w-2xl">
        <Panel kicker={t("scene.desk")} title={t("scene.noneTitle")}>
          <p className="text-sm leading-relaxed text-ink/90">{t("scene.noneText")}</p>
          <div className="mt-5">
            <Button
              onClick={() => {
                endMonth();
                navigate("/game/summary");
              }}
            >
              {t("office.endMonth")}
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-3xl">
      <SceneView
        key={sceneEvent.id}
        event={sceneEvent}
        chosen={chosen && chosen.event.id === sceneEvent.id ? chosen : null}
        onDecide={makeDecision}
        onContinue={clearChosen}
      />
    </div>
  );
}
