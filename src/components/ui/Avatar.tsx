import { useState } from "react";
import { portraitFor, portraitArtId, PortraitArt } from "../../data/portraits";
import { cn } from "../../utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | "stage";
  className?: string;
}

/**
 * Character identity plate. Resolution order:
 *   1. A painted portrait registered under the speaker's character id in
 *      data/portraits.tsx (file missing or broken → falls through silently).
 *   2. The character's engraved line-art portrait.
 *   3. The anonymous engraved bust — never bare initials.
 * No page needs to change when painted assets are added.
 */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = portraitFor(name);
  const artId = portraitArtId(name) ?? "generic";
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
        ? "w-14 h-14 text-base"
        : size === "stage"
          ? "w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52"
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
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-top grayscale-[0.25] contrast-[1.05]"
        />
      ) : (
        <PortraitArt id={artId} />
      )}
    </span>
  );
}
