import { COALITIONS, TOTAL_SEATS } from "../../data/parties";

/**
 * Dewan Rakyat hemicycle. 222 seats drawn as SVG arcs of dots, one per member,
 * grouped by coalition. Real chamber size; fictional 2026 composition.
 */
const ROWS = [20, 24, 28, 31, 35, 39, 45];
const WIDTH = 340;
const HEIGHT = 190;
const CX = WIDTH / 2;
const CY = HEIGHT - 14;
const R0 = 44;
const STEP = 19;

interface Seat {
  x: number;
  y: number;
  color: string;
  coalition: string;
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
        coalition: coalition.abbr,
      });
      index += 1;
    }
  });
  return seats;
}

export function ParliamentChart() {
  const seats = buildSeats();
  const gov = COALITIONS.filter((c) => c.status === "government").reduce((sum, c) => sum + c.seats, 0);
  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Dewan Rakyat chamber of ${TOTAL_SEATS} seats. Government blocs hold ${gov} seats, a majority of ${gov - 112} over the ${112} needed.`}
      >
        {seats.map((seat, i) => (
          <circle key={i} cx={seat.x} cy={seat.y} r={4.4} fill={seat.color} stroke="var(--paper)" strokeWidth={1} />
        ))}
        <line x1={CX - R0 - 10} y1={CY} x2={CX + R0 + 10} y2={CY} stroke="var(--rule-strong)" strokeWidth={1} />
        <text x={CX} y={CY + 11} textAnchor="middle" className="tabular" fill="var(--muted)" fontSize={10}>
          222 seats · {gov} government · {TOTAL_SEATS - gov} opposition and others
        </text>
      </svg>
      <figcaption className="sr-only">
        {COALITIONS.map((c) => `${c.name}: ${c.seats} seats`).join(". ")}
      </figcaption>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
        {COALITIONS.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5 text-xs text-muted">
            <span aria-hidden="true" className="inline-block w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: c.color }} />
            <span className="font-medium text-ink">{c.abbr}</span>
            <span className="tabular">{c.seats}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
