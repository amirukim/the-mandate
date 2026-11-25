import { cn } from "../../utils/cn";

interface InteractiveHotspotProps {
  /** Accessible label and tooltip text. */
  label: string;
  /** Rectangle in the art's native coordinate space. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Native size of the art the rectangle is measured against. */
  baseWidth: number;
  baseHeight: number;
  onActivate: () => void;
  disabled?: boolean;
  /** Count shown on the top-right tab (queued briefings). */
  badge?: number;
  /** Extra classes for the hotspot box. */
  className?: string;
}

const pct = (value: number, base: number) => `${(value / base) * 100}%`;

/**
 * A button laid over an object in the scene. Position is authored in the art's
 * native pixel space and converted to percentages, so the hotspot follows the
 * plate at every viewport. Phones get a list instead of hotspots (see Office),
 * so rectangles stay exactly as authored rather than growing over neighbours.
 */
export function InteractiveHotspot({
  label,
  x,
  y,
  w,
  h,
  baseWidth,
  baseHeight,
  onActivate,
  disabled = false,
  badge,
  className,
}: InteractiveHotspotProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "group absolute rounded-[2px] outline-none touch-manipulation",
        // touch devices get the 44px floor; pointer devices keep art-true rects
        "pointer-coarse:min-w-[44px] pointer-coarse:min-h-[44px]",
        disabled && "cursor-not-allowed",
        className,
      )}
      style={{ left: pct(x, baseWidth), top: pct(y, baseHeight), width: pct(w, baseWidth), height: pct(h, baseHeight) }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-[2px] border transition-all",
          !disabled &&
            "border-transparent group-hover:border-gold/80 group-hover:bg-gold/10 group-focus-visible:border-gold group-focus-visible:bg-gold/10",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap rounded-[2px] border border-gold/50 bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink opacity-0 transition-opacity",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
          disabled && "text-brick-text border-brick/50",
        )}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="tabular absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brick text-on-brick text-[10px] font-bold rounded-[1px] border border-paper">
          {badge}
        </span>
      )}
    </button>
  );
}
