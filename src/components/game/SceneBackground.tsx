import { useState } from "react";
import { PixelScene } from "./PixelScene";
import { PaintedScene } from "./PaintedScene";
import { paintedSceneSrcs, type EnvironmentArt } from "../../data/art";
import { cn } from "../../utils/cn";

/**
 * The art stack for a room, in resolution order:
 *   1. the vector illustration, rasterised at ⅓ scale (always shipped);
 *   2. the authored pixel plate at native size (no resampling);
 *   3. a painted raster drop-in, which wins when an artist provides one.
 * A missing optional layer is silent: the layer beneath simply shows.
 */
export function SceneBackground({ art, className }: { art: EnvironmentArt; className?: string }) {
  const [pixelFailed, setPixelFailed] = useState(false);
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <PixelScene src={art.vector} width={art.width} height={art.height} className="art-warm" />
      {art.pixel && !pixelFailed && (
        <img
          src={art.pixel}
          alt=""
          onError={() => setPixelFailed(true)}
          className="absolute inset-0 h-full w-full object-cover [image-rendering:pixelated]"
        />
      )}
      {art.painted && <PaintedScene srcs={paintedSceneSrcs(art.painted)} />}
    </div>
  );
}
