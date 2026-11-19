import type { KeyboardEvent } from "react";
import { Maximize2 } from "lucide-react";
import { STATES, type StateDef } from "../../data/states";
import { GEO_Brunei, GEO_Indonesia, GEO_Malaysia, GEO_Papua_New_Guinea, GEO_Philippines, GEO_Singapore, GEO_Thailand, GEO_East_Timor, GEO_Vietnam, GEO_Taiwan, GEO_China, GEO_VIEWBOX, type GeoRing } from "../../data/geo-paths";
import { coalitionById } from "../../data/parties";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/**
 * Real geography (Natural Earth 1:50m, public domain) of Malaysia and its
 * immediate neighbours, rendered as quantized SVG paths. Each federated
 * state is an interactive token placed at its real-world centroid; the state
 * shapes themselves are not drawn (admin-1 polygons are a separate dataset)
 * — the token carries colour, focus and the state file.
 */

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Full-viewport theatre mode: taller canvas, no inline expand button. */
  expanded?: boolean;
  onExpand?: () => void;
}

/** Real equirectangular centroids of the 16 states/territories (lon, lat). */
const CENTROIDS: Record<string, { lon: number; lat: number; dx?: number; dy?: number }> = {
  perlis: { lon: 100.25, lat: 6.72 },
  kedah: { lon: 100.7, lat: 5.9 },
  penang: { lon: 100.35, lat: 5.35, dx: -16 },
  perak: { lon: 101.2, lat: 4.9 },
  kelantan: { lon: 102.15, lat: 5.5 },
  terengganu: { lon: 103.1, lat: 4.8 },
  pahang: { lon: 102.6, lat: 3.7 },
  selangor: { lon: 101.45, lat: 3.45 },
  "kuala-lumpur": { lon: 101.69, lat: 3.14 },
  putrajaya: { lon: 101.68, lat: 2.93, dx: 22, dy: 6 },
  "negeri-sembilan": { lon: 102.15, lat: 2.75 },
  melaka: { lon: 102.35, lat: 2.25 },
  johor: { lon: 103.3, lat: 1.95 },
  sabah: { lon: 117.3, lat: 5.4 },
  sarawak: { lon: 112.5, lat: 2.2 },
  labuan: { lon: 115.25, lat: 5.3, dx: -20, dy: -12 },
};

const project = (() => {
  const { lon0, lon1, lat0, lat1, width, height } = GEO_VIEWBOX;
  return (lon: number, lat: number): [number, number] => [
    ((lon - lon0) / (lon1 - lon0)) * width,
    height - ((lat - lat0) / (lat1 - lat0)) * height,
  ];
})();

function ringPath(ring: GeoRing): string {
  let d = "";
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = ring[i];
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d + "Z";
}

function Country({ rings, fill, stroke, strokeWidth, opacity }: { rings: GeoRing[]; fill: string; stroke?: string; strokeWidth?: number; opacity?: number }) {
  return (
    <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeLinejoin="round">
      {rings.map((r, i) => (
        <path key={i} d={ringPath(r)} />
      ))}
    </g>
  );
}

function fillFor(state: StateDef): string {
  if (state.ruling === "federal") return "#8a8478";
  return coalitionById(state.ruling)?.color ?? "#8a8478";
}

const ABBR: Record<string, string> = {
  "negeri-sembilan": "N9",
  "kuala-lumpur": "KL",
  putrajaya: "PJY",
  labuan: "LBN",
};

export function MalaysiaMap({ selectedId, onSelect, expanded = false, onExpand }: Props) {
  const { t, lang } = useT();
  const toggle = (id: string) => onSelect(selectedId === id ? null : id);
  const keyHandler = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  const sea = expanded ? "#0c1320" : "#0d1420";

  return (
    <section
      aria-label={t("overview.mapAria")}
      className={cn(
        "bg-card border border-rule overflow-hidden flex flex-col",
        expanded ? "rounded-none border-0 h-full w-full" : "rounded-panel",
      )}
    >
      <div className={cn("relative", expanded ? "flex-1 min-h-0" : "")}>
        <svg
          viewBox={`0 0 ${GEO_VIEWBOX.width} ${GEO_VIEWBOX.height}`}
          preserveAspectRatio={expanded ? "xMidYMid meet" : undefined}
          className={cn("block w-full h-auto", expanded && "h-full w-full")}
          role="group"
          aria-label={lang === "ms" ? "Negeri-negeri persekutuan" : "States of the federation"}
        >
          <defs>
            <pattern id="sea-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0v48" fill="none" stroke="#2c3441" strokeWidth="0.5" opacity="0.5" />
            </pattern>
            <radialGradient id="sea-glow" cx="0.5" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#16202e" />
              <stop offset="1" stopColor={sea} />
            </radialGradient>
          </defs>

          <rect width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} fill="url(#sea-glow)" />
          <rect width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} fill="url(#sea-grid)" />

          {/* neighbours and context, real geometry */}
          <Country rings={GEO_Thailand} fill="#1a202a" stroke="#2c3441" strokeWidth={1.2} />
          <Country rings={GEO_Indonesia} fill="#1a202a" stroke="#2c3441" strokeWidth={1.2} />
          <Country rings={GEO_Vietnam} fill="#1a202a" stroke="#2c3441" strokeWidth={1.2} />
          <Country rings={GEO_Philippines} fill="#1a202a" stroke="#2c3441" strokeWidth={1.2} />
          <Country rings={GEO_Brunei} fill="#1f2530" stroke="#3a4351" strokeWidth={1.2} />
          <Country rings={GEO_Singapore} fill="#1f2530" stroke="#3a4351" strokeWidth={1} />
          <Country rings={GEO_China} fill="#161c26" stroke="#232b37" strokeWidth={1} />
          <Country rings={GEO_Taiwan} fill="#161c26" stroke="#232b37" strokeWidth={1} />
          <Country rings={GEO_Papua_New_Guinea} fill="#161c26" stroke="#232b37" strokeWidth={1} />
          <Country rings={GEO_East_Timor} fill="#161c26" stroke="#232b37" strokeWidth={1} />

          {/* the federation: real coastline, gold-lined */}
          <g strokeLinejoin="round">
            <Country rings={GEO_Malaysia} fill={selectedId ? "#20303c" : "#2a3f3c"} stroke="#c9a96a" strokeWidth={2} />
          </g>

          {/* state tokens at real centroids */}
          {STATES.map((state) => {
            const c = CENTROIDS[state.id];
            if (!c) return null;
            const [cx, cy] = project(c.lon, c.lat);
            const x = cx + (c.dx ?? 0);
            const y = cy + (c.dy ?? 0);
            const selected = selectedId === state.id;
            const fill = fillFor(state);
            const isTerritory = ["kuala-lumpur", "putrajaya", "labuan"].includes(state.id);
            const abbr = ABBR[state.id] ?? state.name.toUpperCase().slice(0, 3);
            const handle = () => toggle(state.id);
            const label = `${state.name} — ${t("overview.mapHint")}`;
            return (
              <g
                key={state.id}
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={selected}
                onClick={handle}
                onKeyDown={keyHandler(state.id)}
                className="cursor-pointer outline-none"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={selected ? 13 : 9}
                  fill={fill}
                  fillOpacity={selected ? 0.95 : 0.75}
                  stroke={selected ? "#e6cd8e" : "#0d1420"}
                  strokeWidth={selected ? 2.5 : 1.2}
                  style={{ transition: "r 140ms ease, fill-opacity 140ms ease" }}
                />
                {isTerritory ? (
                  <circle cx={x} cy={y} r={2.4} fill="#e6cd8e" />
                ) : (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#ece5d5"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="Public Sans, sans-serif"
                    pointerEvents="none"
                  >
                    {abbr}
                  </text>
                )}
                {selected && (
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    fill="#e6cd8e"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="Public Sans, sans-serif"
                    stroke="#0d1420"
                    strokeWidth="3"
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {state.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* sea labels at real positions */}
          <g fill="#465062" fontFamily="Public Sans, sans-serif" fontSize="14" letterSpacing="5">
            <text x={project(112.5, 12.8)[0]} y={project(112.5, 12.8)[1]}>SOUTH CHINA SEA</text>
            <text x={project(97.6, 1.2)[0]} y={project(97.6, 1.2)[1]} transform={`rotate(-72 ${project(97.6, 1.2)[0]} ${project(97.6, 1.2)[1]})`}>
              STRAIT OF MALACCA
            </text>
            <text x={project(120.5, -6.5)[0]} y={project(120.5, -6.5)[1]}>CELEBES SEA</text>
          </g>
        </svg>
      </div>

      <div className="px-4 py-3 border-t border-rule flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="kicker kicker-gold">{t("overview.mapTitle")}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5" aria-label={t("overview.mapTitle")}>
          <LegendSwatch label={t("overview.legendGov")} color="#5578a5" />
          <LegendSwatch label={t("overview.legendOpp")} color="#4e7d6e" />
          <LegendSwatch label={t("overview.legendOther")} color="#8a8478" />
          <p className="text-xs text-muted">{t("overview.mapHint")}</p>
          {!expanded && onExpand && (
            <button
              type="button"
              onClick={onExpand}
              aria-label={t("overview.expandMap")}
              title={t("overview.expandMap")}
              className="flex items-center gap-1.5 text-xs font-semibold text-gold-text border border-gold/50 rounded-[2px] px-2 py-1 hover:bg-gold hover:text-paper transition-colors"
            >
              <Maximize2 size={12} aria-hidden="true" />
              {t("overview.expandMap")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LegendSwatch({ label, color }: { label: string; color: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className={cn("w-3.5 h-3.5 rounded-[1px] border border-gold/40")} style={{ backgroundColor: color }} />
      <span className="text-xs text-muted">{label}</span>
    </span>
  );
}
