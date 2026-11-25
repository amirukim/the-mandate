import { useEffect, useState } from "react";
import { pixelateArt } from "../../data/pixelate";
import { cn } from "../../utils/cn";

interface PixelSceneProps {
  src: string;
  /** Target raster width — ⅓ of the art's natural width by convention. */
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders an art file as a pixel scene: the smooth illustration stays
 * underneath until the low-resolution raster is ready, then the pixelated
 * version covers it. Same drop-in chain as everywhere else.
 */
export function PixelScene({ src, width, height, className }: PixelSceneProps) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    pixelateArt(src, width, height)
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src, width, height]);
  return (
    <>
      <img
        src={src}
        alt=""
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      {url && (
        <img
          src={url}
          alt=""
          className={cn("absolute inset-0 h-full w-full object-cover [image-rendering:pixelated]", className)}
        />
      )}
    </>
  );
}
