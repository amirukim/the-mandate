import { cn } from "../../utils/cn";

export interface WireItem {
  outlet: string;
  headline: string;
  body?: string;
}

interface OutletStyle {
  name: string;
  /** Masthead typeface treatment. */
  face: string;
  /** Paper accent: the thin bar that marks the outlet. */
  bar: string;
}

/**
 * Wire copy laid out as cut newspaper clippings, one per outlet. Each masthead
 * gets its own typographic identity so the press reads as several voices, not
 * one feed. Names are shared with components/news/NewsList (OUTLETS), which
 * owns the canonical registry.
 */
const OUTLET_STYLE: Record<string, OutletStyle> = {
  peninsula: {
    name: "The Peninsula Post",
    face: "font-display font-semibold tracking-tight",
    bar: "bg-gold",
  },
  borneo: {
    name: "Borneo Herald",
    face: "font-sans font-bold uppercase tracking-[0.08em]",
    bar: "bg-teal",
  },
  sinar: {
    name: "Sinar Waktu",
    face: "font-display italic font-semibold",
    bar: "bg-brick",
  },
};

export function NewspaperArticle({ item, className }: { item: WireItem; className?: string }) {
  const style = OUTLET_STYLE[item.outlet] ?? {
    name: item.outlet,
    face: "font-display font-semibold",
    bar: "bg-rule-strong",
  };

  return (
    <article className={cn("bg-card/80 border border-rule rounded-panel p-4 text-[#1d1f25]", className)}>
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className={cn("h-3 w-0.5 shrink-0", style.bar)} />
        <p className={cn("text-[13px] leading-none", style.face)}>{style.name}</p>
      </div>
      <div className="rule mt-2.5" />
      <h3 className="display text-base font-semibold leading-snug mt-2.5">{item.headline}</h3>
      {item.body && <p className="text-sm text-[#5b564b] mt-1.5 leading-relaxed">{item.body}</p>}
    </article>
  );
}
