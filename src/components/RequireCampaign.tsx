import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGameStore } from "../stores/game-store";

/** Every /game route requires an active campaign; collapse forces the fallen screen. */
export function RequireCampaign({ children }: { children: ReactElement }) {
  const game = useGameStore((s) => s.game);
  const location = useLocation();

  if (!game) return <Navigate to="/" replace />;
  if (game.fallen && location.pathname !== "/game/fallen") return <Navigate to="/game/fallen" replace />;
  return children;
}
