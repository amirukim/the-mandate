import { useState } from "react";
import { COALITIONS, MAJORITY, TOTAL_SEATS } from "../../data/parties";
import { cn } from "../../utils/cn";

/**
 * Dewan Rakyat hemicycle. 222 seats drawn as SVG arcs of dots, one per member,
 * grouped by coalition. Real chamber size; fictional 2026 composition.
 * The gold radial marks the 112th seat — every seat beyond it is above the
 * line. Seats and legend entries select a bloc; selecting one dims the rest.
 */
const ROWS = [20, 24, 28, 31, 35, 39, 45];
const WIDTH = 340;
const HEIGHT = 190;
const CX = WIDTH / 2;
const CY = HEIGHT - 14;
const R0 = 44;
const STEP = 19;
const MAJORITY_SEAT = MAJORITY - 1; // zero-based index of the seat on the line

interface Seat {
  x: number;
  y: number;
  color: string;
  coalitionId: string;
  abbr: string;
  name: string;
}

function buildSeats(): Seat[] {
  const seats: Seat[] = [];
  const order = COALITIONS.flatMap((c) => Array.from({ length: c.seats }, () => c));
  let index = 0;
  ROWS.forEach((count, row) => {
    const radius = R0 + row * STEP;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = Math.PI * (1 - t); // 180deg to 0deg across the arc
      const coalition = order[index];
      seats.push({
        x: CX + radius * Math.cos(angle),
        y: CY - radius * Math.sin(angle),
        color: coalition.color,
        coalitionId: coalition.id,
        abbr: coalition.abbr,
        name: coalition.name,
      });
      index += 1;
    }
  });
  return seats;
}

interface ParliamentChartProps {
  /** Currently highlighted coalition id, owned by the page. */
  selected?: string | null;
  onSelect?: (id: string | null) => void;
}

export function ParliamentChart({ selected = null, onSelect }: ParliamentChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const seats = buildSeats();
  const gov = COALITIONS.filter((c) => c.status === "government").reduce((sum, c) => sum + c.seats, 0);

  // The majority line: a radial through the 112th seat, out past the arc.
  const mark = seats[MAJORITY_SEAT];
  const markAngle = Math.atan2(mark.y - CY, mark.x - CX);
  const markOuterR = R0 + ROWS.length * STEP + 4;
  const lineEnd = { x: CX + markOuterR * Math.cos(markAngle), y: CY + markOuterR * Math.sin(markAngle) };
  const labelR = markOuterR + 9;
  const labelPos = { x: CX + labelR * Math.cos(markAngle), y: CY + labelR * Math.sin(markAngle) };

  const toggle = (id: string) => onSelect?.(selected === id ? null : id);
  const dimmed = (coalitionId: string) => selected !== null && selected !== coalitionId;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Dewan Rakyat chamber of ${TOTAL_SEATS} seats. Government blocs hold ${gov} seats, a majority of ${gov - MAJORITY} over the ${MAJORITY} needed.`}
      >
        {seats.map((seat, i) => {
          const isDim = dimmed(seat.coalitionId);
          const isHovered = hovered === i;
          return (
            <g
              key={i}
              onClick={onSelect ? () => toggle(seat.coalitionId) : undefined}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={onSelect ? "cursor-pointer" : undefined}
              opacity={isDim ? 0.18 : 1}
              style={{ transition: "opacity 160ms ease" }}
            >
              <title>{`${seat.name} · seat ${i + 1} of ${TOTAL_SEATS}`}</title>
              <circle
                cx={seat.x}
                cy={seat.y}
                r={isHovered ? 6 : 4.4}
                fill={seat.color}
                stroke={isHovered ? "#e6cd8e" : "var(--paper)"}
                strokeWidth={isHovered ? 1.5 : 1}
                style={{ transition: "r 120ms ease" }}
              />
            </g>
          );
        })}

        {/* the majority line */}
        <line
          x1={CX}
          y1={CY}
          x2={lineEnd.x}
          y2={lineEnd.y}
          stroke="#c9a96a"
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          fill="#d9b877"
          fontSize={9}
          fontWeight={700}
          fontFamily="Public Sans, sans-serif"
        >
          {MAJORITY}
        </text>

        <line x1={CX - R0 - 10} y1={CY} x2={CX + R0 + 10} y2={CY} stroke="var(--rule-strong)" strokeWidth={1} />
        <text x={CX} y={CY + 11} textAnchor="middle" className="tabular" fill="var(--muted)" fontSize={10}>
          222 seats · {gov} government · {TOTAL_SEATS - gov} opposition and others
        </text>
      </svg>
      <figcaption className="sr-only">
        {COALITIONS.map((c) => `${c.name}: ${c.seats} seats`).join(". ")}
      </figcaption>
      <ul className="flex flex-wrap gap-x-2 gap-y-1.5 mt-2">
        {COALITIONS.map((c) => {
          const active = selected === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={onSelect ? () => toggle(c.id) : undefined}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1.5 text-xs rounded-[2px] border px-1.5 py-0.5 transition-colors",
                  active
                    ? "border-gold/70 bg-surface text-ink"
                    : "border-transparent text-muted hover:text-ink hover:bg-surface/60",
                  !onSelect && "cursor-default",
                )}
              >
                <span aria-hidden="true" className="inline-block w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: c.color }} />
                <span className="font-medium text-ink">{c.abbr}</span>
                <span className="tabular">{c.seats}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
