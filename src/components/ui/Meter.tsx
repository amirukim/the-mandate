import { cn } from "../../utils/cn";

type Tone = "gold" | "brick" | "moss" | "navy";

const fillTone: Record<Tone, string> = {
  gold: "bg-gold",
  brick: "bg-brick",
  moss: "bg-moss",
  navy: "bg-navy",
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

/** Ruled indicator with tick marks, like a statistical abstract chart. */
export function Meter({ label, value, max = 100, tone = "gold", unit = "", hint, decimals = 0 }: MeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
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
        className="meter h-[7px] mt-2 rounded-[1px] overflow-hidden"
        role="img"
        aria-label={`${label}: ${value.toFixed(decimals)}${unit} out of ${max}`}
      >
        <div
          className={cn("h-full rounded-[1px] transition-[width] duration-500 ease-out", fillTone[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-xs text-muted mt-1.5 leading-snug">{hint}</p>}
    </div>
  );
}
