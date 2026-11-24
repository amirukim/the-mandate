import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Painted raster scene layer. Sits above the vector illustration and shows
 * the first file in `srcs` that exists; when every candidate is missing the
 * component renders nothing and the vector art shows through untouched.
 * This is the whole drop-in pipeline: save a painting at the right path and
 * the game adopts it, no code changes.
 */
export function PaintedScene({ srcs, className }: { srcs: string[]; className?: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [srcs.join("|")]);
  if (idx >= srcs.length) return null;
  return (
    <img
      src={srcs[idx]}
      alt=""
      className={cn("art-warm absolute inset-0 h-full w-full object-cover", className)}
      onError={() => setIdx(idx + 1)}
    />
  );
}
