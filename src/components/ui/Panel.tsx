import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "panel" | "bare" | "inset";

interface PanelProps {
  kicker?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** panel: bordered charcoal block (default). bare: editorial, no chrome. inset: recessed well. */
  variant?: Variant;
}

/**
 * The base container of the interface.
 * Screens compose these differently so containers never read as one repeated card.
 */
export function Panel({ kicker, title, children, className, bodyClassName, variant = "panel" }: PanelProps) {
  const chrome = variant === "bare" ? "" : "px-4 pt-3.5 pb-3 border-b border-rule";

  return (
    <section
      className={cn(
        variant === "panel" && "bg-card border-2 border-rule-strong rounded-[4px] shadow-[inset_0_2px_0_rgb(255_255_255/0.05),inset_0_-2px_0_rgb(0_0_0/0.18),3px_3px_0_rgb(0_0_0/0.22)]",
        variant === "inset" && "bg-paper-deep border border-rule rounded-panel",
        className,
      )}
    >
      {(kicker || title) && (
        <header className={chrome}>
          <div className="flex items-center gap-3">
            {kicker && <p className="kicker kicker-gold shrink-0">{kicker}</p>}
            <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
          </div>
          {title && <h2 className="display text-[1.15rem] leading-tight font-semibold mt-1.5 text-ink">{title}</h2>}
        </header>
      )}
      <div className={cn(variant === "bare" ? "" : "p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
