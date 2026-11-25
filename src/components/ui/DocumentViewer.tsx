import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface DocumentViewerProps {
  children: ReactNode;
  /** Screen-reader label when the sheet has no internal heading. */
  label?: string;
  className?: string;
}

/**
 * One sheet of paper at desk scale: the newsprint token scope plus page
 * padding, and whatever the caller prints on it — front page, article,
 * archive record. Body type is vector (Fraunces / Public Sans), never a pixel
 * font, and the sheet keeps its own token scope so it reads the same on any
 * desk, in either theme.
 */
export function DocumentViewer({ children, label, className }: DocumentViewerProps) {
  return (
    <article aria-label={label} className={cn("newspaper doc px-5 sm:px-10 py-7 sm:py-9", className)}>
      {children}
    </article>
  );
}
