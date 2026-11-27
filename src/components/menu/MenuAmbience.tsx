import { useMemo } from "react";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { cn } from "../../utils/cn";

/**
 * The title-screen ambience (v3a phase 5): pixel stars, drifting clouds,
 * flickering window lights, a bird crossing, and a slow day-dusk tint over
 * the key art. Everything is CSS animation, everything stills under reduced
 * motion. Coordinates are percentages of the menu container.
 */

interface Star {
  x: number;
  y: number;
  delay: number;
  big: boolean;
}
interface Cloud {
  x: number;
  y: number;
  scale: number;
  duration: number;
  delay: number;
}
interface Light {
  x: number;
  y: number;
  delay: number;
}

/** Deterministic pseudo-random from a seed, so the sky is authored-stable. */
function seeded(seed: number): () => number {
  let v = seed;
  return () => {
    v = (v * 16807) % 2147483647;
    return (v - 1) / 2147483646;
  };
}

export function MenuAmbience({ dusk = true }: { dusk?: boolean }) {
  const reduced = prefersReducedMotion();

  const stars = useMemo<Star[]>(() => {
    const rng = seeded(20261101);
    return Array.from({ length: 14 }, () => ({
      x: 18 + rng() * 80,
      y: 2 + rng() * 22,
      delay: rng() * 4,
      big: rng() > 0.7,
    }));
  }, []);

  const clouds = useMemo<Cloud[]>(() => {
    const rng = seeded(5711);
    return Array.from({ length: 3 }, (_, i) => ({
      x: 30 + i * 30,
      y: 8 + rng() * 14,
      scale: 0.8 + rng() * 0.6,
      duration: 90 + i * 40,
      delay: -rng() * 90,
    }));
  }, []);

  const lights = useMemo<Light[]>(() => {
    const rng = seeded(919);
    return Array.from({ length: 5 }, () => ({
      x: 55 + rng() * 38,
      y: 42 + rng() * 30,
      delay: rng() * 6,
    }));
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* stars: upper sky, twinkle */}
      {stars.map((s, i) => (
        <span
          key={`star-${i}`}
          className={cn(
            "absolute bg-[#f2ede1]",
            reduced ? "opacity-70" : "animate-[twinkle_3.4s_ease-in-out_infinite]",
            s.big ? "w-[3px] h-[3px]" : "w-[2px] h-[2px]",
          )}
          style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* clouds: two-block pixel shapes drifting right to left */}
      {clouds.map((c, i) => (
        <div
          key={`cloud-${i}`}
          aria-hidden="true"
          className={cn("absolute", reduced ? "opacity-0" : "animate-[drift_cloud_linear_infinite]")}
          style={{
            top: `${c.y}%`,
            left: `${c.x}%`,
            transform: `scale(${c.scale})`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <div className="w-16 h-2 bg-[#e9dfc9]/25" />
          <div className="w-10 h-2 bg-[#e9dfc9]/25 ml-3" />
        </div>
      ))}

      {/* window lights: warm pixels that flicker in the towers */}
      {lights.map((l, i) => (
        <span
          key={`light-${i}`}
          className={cn(
            "absolute w-[3px] h-[4px]",
            reduced ? "bg-[#e6cd8e]/80" : "animate-[flicker_5s_steps(3,end)_infinite]",
          )}
          style={{ left: `${l.x}%`, top: `${l.y}%`, animationDelay: `${l.delay}s` }}
        />
      ))}

      {/* the bird: crosses the sky every 26 s (skipped under reduced motion) */}
      {!reduced && (
        <div aria-hidden="true" className="absolute animate-[flyby_26s_linear_infinite]" style={{ top: "16%" }}>
          <div className="w-[6px] h-[2px] bg-[#17202b]/80 relative">
            <span className="absolute -top-[2px] left-[1px] w-[3px] h-[2px] bg-[#17202b]/80 animate-[birdflap_0.5s_steps(2)_infinite]" />
          </div>
        </div>
      )}

      {/* the day-dusk tint: a slow breathing colour wash */}
      {dusk && !reduced && (
        <div className="absolute inset-0 animate-[daydusk_70s_ease-in-out_infinite] bg-[#2c3d5c] opacity-0" />
      )}
    </div>
  );
}
