import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface PageHeaderProps {
  kicker: string;
  title: string;
  lead?: ReactNode;
  /** Dense, Suzerain-style ministry band: compact, full-width, rule below. */
  dense?: boolean;
}

/**
 * Screen title band. Default is the editorial masthead (menu, news, auth);
 * `dense` renders the Suzerain ministry-panel header — small caps kicker,
 * medium serif title, one hairline — used on all data screens.
 */
export function PageHeader({ kicker, title, lead, dense = false }: PageHeaderProps) {
  if (dense) {
    return (
      <header className="mb-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="display text-2xl sm:text-3xl font-semibold leading-tight">{title}</h1>
          <p className="kicker text-[10px]">{kicker}</p>
        </div>
        <div className="rule mt-3" />
        {lead && <p className="text-sm text-muted leading-relaxed mt-3 max-w-4xl">{lead}</p>}
      </header>
    );
  }
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-6 bg-gold" />
        <p className="kicker kicker-gold">{kicker}</p>
      </div>
      <h1 className="headline mt-3">{title}</h1>
      <div className="rule-double mt-4 max-w-5xl" />
      {lead && <p className="lede mt-4 text-sm sm:text-base">{lead}</p>}
    </header>
  );
}

/** Thin gold kicker row used between dense panels. */
export function BandLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <p className="kicker kicker-gold shrink-0">{children}</p>
      <span aria-hidden="true" className="flex-1 border-t border-gold/30" />
    </div>
  );
}
