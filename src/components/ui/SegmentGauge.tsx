import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Segmented pixel gauge (v3a UI kit): blocks instead of smooth hairlines, a
 * tick-up numeral, a delta arrow against the previous value, and low/critical
 * states marked with an icon AND a label — never colour alone.
 */
export function SegmentGauge({
  label,
  value,
  previous,
  max = 100,
  unit,
  tone = "gold",
  segments = 20,
}: {
  label: string;
  value: number;
  /** Value one step ago, for the delta arrow. */
  previous?: number;
  max?: number;
  unit?: string;
  tone?: "gold" | "navy" | "moss" | "brick";
  segments?: number;
}) {
  const filled = Math.round((Math.max(0, Math.min(max, value)) / max) * segments);
  const delta = previous === undefined ? null : Math.round((value - previous) * 10) / 10;
  const [shown, setShown] = useState(0);
  const raf = useRef(0);

  // tick-up numeral: animate from the shown value toward the target
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(value);
      return;
    }
    const start = shown;
    const t0 = performance.now();
    const duration = 420;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      setShown(Math.round(start + (value - start) * t));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const critical = value <= 25;
  const low = value <= 45;
  const toneFill = tone === "navy" ? "bg-navy border-navy" : tone === "brick" ? "bg-brick border-brick" : tone === "gold" ? "bg-gold/80 border-gold" : "bg-moss border-moss";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="kicker text-[12px]">
          {critical && <span aria-hidden="true">▼ </span>}
          {label}
          {critical && <span className="font-semibold normal-case tracking-normal"> — {label} critical</span>}
        </span>
        <span className="tabular text-sm font-semibold" aria-live="off">
          {Math.round(shown)}
          {unit && <span className="text-muted"> {unit}</span>}
          {delta !== null && delta !== 0 && (
            <span
              aria-label={(delta > 0 ? "up " : "down ") + Math.abs(delta)}
              className={cn("ml-1.5 text-xs font-bold", delta > 0 ? "text-[#3f6b57]" : "text-brick-text")}
            >
              {delta > 0 ? "▲" : "▼"}
              {Math.abs(delta)}
            </span>
          )}
          {delta === 0 && <span aria-hidden="true" className="ml-1.5 text-xs text-muted">—</span>}
        </span>
      </div>
      <div
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="mt-1.5 flex gap-[2px] h-3.5"
      >
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={cn(
              "flex-1 border",
              i < filled
                ? critical
                  ? "bg-brick border-brick"
                  : low
                    ? "bg-gold/80 border-gold"
                    : toneFill
                : "bg-surface border-rule",
            )}
          />
        ))}
      </div>
      {critical && (
        <p className="text-[11px] font-semibold text-brick-text mt-1">
          ▼ {label} critical — attention required
        </p>
      )}
    </div>
  );
}
