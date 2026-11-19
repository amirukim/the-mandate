import { cn } from "../../utils/cn";

interface StatProps {
  label: string;
  value: number;
  previous?: number;
  unit?: string;
  goodDirection?: "up" | "down";
  decimals?: number;
  className?: string;
  large?: boolean;
}

function toneFor(delta: number, good: "up" | "down"): string {
  const improved = good === "up" ? delta > 0.05 : delta < -0.05;
  const worsened = good === "up" ? delta < -0.05 : delta > 0.05;
  if (improved) return "text-moss-text";
  if (worsened) return "text-brick-text";
  return "text-muted";
}

function sign(delta: number): string {
  if (delta > 0.05) return "+";
  if (delta < -0.05) return "\u2212";
  return "";
}

/** Large editorial figure with a real month-over-month delta when history exists. */
export function Stat({
  label,
  value,
  previous,
  unit = "",
  goodDirection = "up",
  decimals = 1,
  className,
  large = false,
}: StatProps) {
  const delta = previous !== undefined ? value - previous : null;
  return (
    <div className={className}>
      <p className="kicker">{label}</p>
      <p
        className={cn(
          "tabular display font-semibold mt-1 leading-none",
          large ? "text-[2.6rem] sm:text-[3.2rem]" : "text-[1.7rem]",
        )}
      >
        {value.toFixed(decimals)}
        <span className="text-[0.5em] text-muted font-sans font-normal ml-1 align-baseline">{unit}</span>
      </p>
      {delta !== null && (
        <p className={cn("tabular text-xs mt-1.5 font-medium", toneFor(delta, goodDirection))}>
          {sign(delta)}
          {Math.abs(delta).toFixed(decimals)}
          {unit} this month
        </p>
      )}
    </div>
  );
}
