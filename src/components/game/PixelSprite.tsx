import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { SPRITE_W, SPRITE_H, type Expression } from "../../data/pixel-portraits";

interface PixelSpriteProps {
  characterId: string;
  expression?: Expression;
  /** "idle" cycles the two idle frames and blinks; "stand" holds one frame. */
  mode?: "idle" | "stand";
  /** Integer display multiple of the 64x96 sheet (D-16: >= 3). */
  scale?: 1 | 2 | 3 | 4;
  /** Staggers blink/idle timing so a row of sprites never moves as one. */
  phaseOffsetMs?: number;
  className?: string;
}

const IDLE_MS = 900;
const BLINK_MS = 150;
const BLINK_EVERY = 4200;

/**
 * A full-body character sprite (v2): plays the two idle frames, blinks on its
 * own clock, and swaps expression on command. Files come from
 * `npm run build:sprites` (public/art/pixel/sprites).
 */
export function PixelSprite({
  characterId,
  expression = "neutral",
  mode = "idle",
  scale = 1,
  phaseOffsetMs = 0,
  className,
}: PixelSpriteProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (mode !== "idle") return;
    const timer = window.setInterval(() => setTick((t) => t + 1), IDLE_MS);
    return () => window.clearInterval(timer);
  }, [mode]);

  const [blinkOn, setBlinkOn] = useState(false);
  useEffect(() => {
    if (mode !== "idle") return;
    let showTimer: number;
    let hideTimer: number;
    let alive = true;
    const schedule = () => {
      if (!alive) return;
      showTimer = window.setTimeout(() => {
        setBlinkOn(true);
        hideTimer = window.setTimeout(() => {
          setBlinkOn(false);
          schedule();
        }, BLINK_MS);
      }, BLINK_EVERY + phaseOffsetMs);
    };
    schedule();
    return () => {
      alive = false;
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [mode, phaseOffsetMs]);

  const idleFrame = Math.floor(tick / 2) % 2 === 0 ? 1 : 2;
  let file: string;
  if (mode === "idle" && blinkOn) file = `sprite-${characterId}-blink.png`;
  else if (mode === "idle" && expression === "neutral") file = `sprite-${characterId}-idle-${idleFrame}.png`;
  else file = `sprite-${characterId}-${expression}.png`;

  return (
    <img
      src={`/art/pixel/sprites/${file}`}
      alt=""
      width={SPRITE_W * scale}
      height={SPRITE_H * scale}
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}
