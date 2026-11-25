import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { EnvironmentArt } from "../../data/art";
import { SceneBackground } from "./SceneBackground";
import { cn } from "../../utils/cn";

interface GameSceneProps {
  art: EnvironmentArt;
  /** Accessible description of the room. */
  label: string;
  /** Frame treatment: height, gutter bleed, border. */
  className?: string;
  children?: ReactNode;
}

/**
 * A room on screen: full-bleed art, a labelled group for assistive tech, and
 * whatever the screen layers on top (hotspots, dateline, scrims). The scene
 * itself holds no game state and knows nothing about the simulation.
 */
export function GameScene({ art, label, className, children }: GameSceneProps) {
  return (
    <div role="group" aria-label={label} className={cn("relative overflow-hidden border-b border-rule", className)}>
      <SceneBackground art={art} />
      {children}
    </div>
  );
}

interface SceneLayerProps {
  art: EnvironmentArt;
  children: ReactNode;
  className?: string;
}

/**
 * A layer aligned to the *visible* art, not the container. `object-cover`
 * crops the plate at aspect ratios that differ from the art, so hotspots
 * measured in art pixels must live inside a box that reproduces that crop.
 * The box is measured once per resize; the first paint uses the full frame.
 */
export function SceneLayer({ art, children, className }: SceneLayerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const update = () => {
      const { width: cw, height: ch } = host.getBoundingClientRect();
      if (!cw || !ch) return;
      const scale = Math.max(cw / art.width, ch / art.height);
      const width = art.width * scale;
      const height = art.height * scale;
      setBox({ left: (cw - width) / 2, top: (ch - height) / 2, width, height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [art.width, art.height]);

  return (
    <div
      ref={ref}
      className={cn("absolute", className)}
      style={box ? { left: box.left, top: box.top, width: box.width, height: box.height } : { inset: 0 }}
    >
      {children}
    </div>
  );
}
