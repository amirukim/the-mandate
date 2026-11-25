import { useState, useEffect } from "react";
import { portraitFiles, portraitArtId } from "../../data/portraits";
import { pixelPortraitDataUrl } from "../../data/pixel-portraits";
import { cn } from "../../utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | "stage";
  className?: string;
}

/** Cycles a list of candidate files; hides itself once they are exhausted. */
function PaintedFile({ srcs }: { srcs: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [srcs.join("|")]);
  if (idx >= srcs.length) return null;
  return (
    <img
      src={srcs[idx]}
      alt=""
      loading="lazy"
      onError={() => setIdx(idx + 1)}
      className="absolute inset-0 h-full w-full object-cover object-top grayscale-[0.25] contrast-[1.05]"
    />
  );
}

/**
 * Character identity plate. Resolution order:
 *   1. Painted raster files (public/portraits/<id>.webp|png|jpg or a manual
 *      PORTRAITS entry) — tried in order, missing files fall through.
 *   2. The 32×32 pixel bust (the shipped presentation, deliberate style).
 * Unknown speakers get the anonymous pixel figure — never bare initials.
 */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  const srcs = portraitFiles(name);
  const pixel = pixelPortraitDataUrl(portraitArtId(name) ?? "generic");
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
        ? "w-14 h-14 text-base"
        : size === "stage"
          ? "h-[min(34vh,280px)] w-[min(34vh,280px)]"
          : size === "xl"
            ? "w-20 h-20 text-xl sm:w-24 sm:h-24 sm:text-2xl"
            : "w-11 h-11 text-sm";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-[2px] select-none",
        "bg-navy text-paper font-display font-semibold tracking-wide ring-1 ring-gold/30",
        sizeClass,
        className,
      )}
    >
      {/* the pixel bust sits under any raster file; a 404 chain reveals it */}
      <img
        src={pixel}
        alt=""
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: size === "stage" || size === "xl" ? "pixelated" : "auto" }}
      />
      {srcs.length > 0 && <PaintedFile srcs={srcs} />}
    </span>
  );
}
