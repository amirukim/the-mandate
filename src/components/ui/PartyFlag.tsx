import { coalitionById } from "../../data/parties";
import { cn } from "../../utils/cn";

/**
 * Party standard: a small hand-drawn banner per coalition.
 * Marks are invented heraldry for this fiction — no real party logos.
 * The field colour comes from the coalition definition so flag and data
 * can never drift apart.
 */
function Emblem({ id }: { id: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const };
  switch (id) {
    case "ph": // reform ring: open circle, forward chevron
      return (
        <g {...common}>
          <circle cx="16" cy="11" r="6.4" />
          <path d="M13.4 11l2 2 3.4-4" />
        </g>
      );
    case "bn": // establishment: three pillars under a lintel
      return (
        <g {...common}>
          <path d="M9.5 6.5h13" />
          <path d="M12 6.5v9M16 6.5v9M20 6.5v9" />
          <path d="M9.5 15.5h13" />
        </g>
      );
    case "gps": // Sarawak: river wave under a peak
      return (
        <g {...common}>
          <path d="M9.5 12.5l4.5-6 4 5 1.5-2 3 3" />
          <path d="M9.5 15.5c2-1.4 4-1.4 6 0s4 1.4 6 0" />
        </g>
      );
    case "grs": // Sabah: twin peaks, Kinabalu silhouette
      return (
        <g {...common}>
          <path d="M8.5 15.5l4.5-8 3.5 5.5 2-3 5 5.5z" />
        </g>
      );
    case "warisan": // heritage: stacked diamond
      return (
        <g {...common}>
          <path d="M16 5l6.5 6.5L16 18 9.5 11.5z" />
          <path d="M16 9l2.5 2.5L16 14l-2.5-2.5z" />
        </g>
      );
    case "pn": // opposition: crescent arc with star point
      return (
        <g {...common}>
          <path d="M19.5 6.8a6.4 6.4 0 1 0 0 9.2" />
          <path d="M22.5 5.5l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" />
        </g>
      );
    default: // independents: unaligned, a lone dot on open field
      return (
        <g {...common}>
          <path d="M9.5 11.5h13" strokeDasharray="3 3" />
          <circle cx="16" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
        </g>
      );
  }
}

interface PartyFlagProps {
  coalitionId: string;
  /** Pixel height of the banner; width follows the 3:2 field. */
  size?: number;
  className?: string;
  title?: string;
}

export function PartyFlag({ coalitionId, size = 24, className, title }: PartyFlagProps) {
  const coalition = coalitionById(coalitionId);
  const field = coalition?.color ?? "#8a8478";
  const label = title ?? (coalition ? `${coalition.name} party standard` : "Party standard");
  return (
    <svg
      viewBox="0 0 32 22"
      height={size}
      width={(size * 32) / 22}
      role="img"
      aria-label={label}
      className={cn("shrink-0", className)}
    >
      <title>{label}</title>
      {/* field: party colour over a deeper shade for depth */}
      <rect width="32" height="22" fill={field} />
      <rect y="15" width="32" height="7" fill="#000" opacity="0.22" />
      {/* hoist stripe + border so pale fields keep their edge on dark pages */}
      <rect width="3.5" height="22" fill="#0b1018" opacity="0.55" />
      <rect x="0.5" y="0.5" width="31" height="21" fill="none" stroke="#0b1018" strokeOpacity="0.7" />
      <rect x="0.5" y="0.5" width="31" height="21" fill="none" stroke="#e6cd8e" strokeOpacity="0.35" />
      <g className="text-[#f2ede3]" transform="translate(0 -1)">
        <Emblem id={coalitionId} />
      </g>
    </svg>
  );
}
