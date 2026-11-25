import { Meter } from "./Meter";
import { cn } from "../../utils/cn";

export interface PoliticalIndicator {
  label: string;
  value: string;
  /** Optional 0-100 track behind the value. */
  track?: number;
  tone?: "moss" | "gold" | "brick" | "navy";
  /** A verdict (dossier) or hint (meters) under the label. */
  detail?: string;
}

interface PoliticalIndicatorsProps {
  items: PoliticalIndicator[];
  /** "dossier" = briefing-sheet rows; "meters" = stacked tracks with hints. */
  variant?: "dossier" | "meters";
  ariaLabel?: string;
  className?: string;
}

const trackTone = (tone?: PoliticalIndicator["tone"]) =>
  tone === "moss" ? "bg-moss" : tone === "brick" ? "bg-brick" : tone === "navy" ? "bg-navy" : "bg-gold";

/**
 * The approval/coalition/opposition/integrity cluster that four screens read
 * from the same politics state, in one markup. Two presentations of one data
 * shape: the dossier row sheet (Overview) and the meter stack (Parliament, and
 * the Phase 6 rooms as they land).
 */
export function PoliticalIndicators({ items, variant = "meters", ariaLabel, className }: PoliticalIndicatorsProps) {
  if (variant === "dossier") {
    return (
      <dl aria-label={ariaLabel} className={cn("divide-y divide-rule", className)}>
        {items.map((item) => (
          <div key={item.label} className="px-4 py-3 flex items-center justify-between gap-4">
            <span className="min-w-0">
              <span className="kicker text-[10px] block">{item.label}</span>
              {item.detail && <span className="block text-[11px] text-gold-text mt-0.5 leading-tight">{item.detail}</span>}
            </span>
            <span className="flex items-center gap-3 min-w-[7.5rem] justify-end">
              {item.track !== undefined && (
                <span className="meter h-1.5 w-24 overflow-hidden rounded-[1px]" aria-hidden="true">
                  <span
                    className={cn("block h-full", trackTone(item.tone))}
                    style={{ width: `${Math.max(2, Math.min(100, item.track))}%` }}
                  />
                </span>
              )}
              <span className="tabular text-base font-semibold whitespace-nowrap">{item.value}</span>
            </span>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div aria-label={ariaLabel} className={cn("space-y-4", className)}>
      {items.map((item) => (
        <Meter
          key={item.label}
          label={item.label}
          value={Number(item.value) || 0}
          tone={item.tone ?? "gold"}
          hint={item.detail}
        />
      ))}
    </div>
  );
}
