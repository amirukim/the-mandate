import { cn } from "../../utils/cn";

type Tone = "gold" | "brick" | "moss" | "navy";

const fillTone: Record<Tone, string> = {
  gold: "bg-gold border-gold",
  brick: "bg-brick border-brick",
  moss: "bg-moss border-moss",
  navy: "bg-navy border-navy",
};

const textTone: Record<Tone, string> = {
  gold: "text-gold-text",
  brick: "text-brick-text",
  moss: "text-moss-text",
  navy: "text-ink",
};

interface MeterProps {
  label: string;
  value: number;
  max?: number;
  tone?: Tone;
  unit?: string;
  hint?: string;
  decimals?: number;
}

/** Ruled indicator with tick marks, like a statistical abstract chart.
 *  v3a: the fill is segmented blocks — the kit's game-style gauge. */
export function Meter({ label, value, max = 100, tone = "gold", unit = "", hint, decimals = 0 }: MeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const segments = 20;
  const filled = Math.round((pct / 100) * segments);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="kicker">{label}</span>
        <span className={cn("tabular text-sm font-semibold", textTone[tone])}>
          {value.toFixed(decimals)}
          <span className="text-muted font-normal ml-0.5">{unit}</span>
        </span>
      </div>
      <div
        className="mt-2 flex gap-[2px] h-[9px]"
        role="img"
        aria-label={`${label}: ${value.toFixed(decimals)}${unit} out of ${max}`}
      >
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={cn("flex-1 border", i < filled ? cn("border", fillTone[tone]) : "bg-surface border-rule")}
          />
        ))}
      </div>
      {hint && <p className="text-xs text-muted mt-1.5 leading-snug">{hint}</p>}
    </div>
  );
}
