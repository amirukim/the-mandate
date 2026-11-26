import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Maximize2 } from "lucide-react";
import { STATES } from "../../data/states";
import { GEO_STATES } from "../../data/geo-states";
import { GEO_VIEWBOX, type GeoRing } from "../../data/geo-paths";
import { coalitionById } from "../../data/parties";
import { cardFor } from "../../data/state-cards";
import { useT } from "../../i18n/store";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { cn } from "../../utils/cn";

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
  selangor: { lon: 101.45, lat: 3.45, dx: -26 },
  "kuala-lumpur": { lon: 101.69, lat: 3.14, dx: 26 },
  putrajaya: { lon: 101.68, lat: 2.93, dx: 30, dy: 16 },
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

const ABBR: Record<string, string> = {
  "negeri-sembilan": "N9",
  "kuala-lumpur": "KL",
  putrajaya: "PJY",
  labuan: "LBN",
};

/** Federal territories and unaligned seats: the neutral stone tone. */
const NEUTRAL_FILL = "#8a8478";

function fillFor(ruling: string): string {
  if (ruling === "federal") return NEUTRAL_FILL;
  return coalitionById(ruling)?.color ?? NEUTRAL_FILL;
}

function ringPath(ring: number[][] | GeoRing): string {
  let d = "";
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = ring[i];
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d + "Z";
}

const TERRAIN_PLATE = "/art/pixel/map-federation.png";

/**
 * The federation map (v2): a build-time terrain plate with state-shape
 * overlays from Natural Earth admin-1 polygons (decision D-11). Shapes fill
 * on hover and selection; tokens stay the precise clickable layer; wheel and
 * drag zoom/pan when zoomed; a bottom sheet opens with the selected state's
 * card. All ambient animation stills under reduced motion.
 */
export function MalaysiaMap({ selectedId, onSelect, expanded = false, onExpand }: Props) {
  const { t, lang } = useT();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const reduced = prefersReducedMotion();

  const activeId = selectedId ?? hoverId;
  const toggle = (id: string) => onSelect(selectedId === id ? null : id);
  const keyHandler = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  const clampPan = (x: number, y: number): { x: number; y: number } => {
    const maxX = (zoom - 1) * GEO_VIEWBOX.width;
    const maxY = (zoom - 1) * GEO_VIEWBOX.height;
    return { x: Math.max(-maxX, Math.min(0, x)), y: Math.max(-maxY, Math.min(0, y)) };
  };

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const next = Math.max(1, Math.min(3, zoom - e.deltaY * 0.0015));
    if (next === zoom) return;
    const worldX = (fx * GEO_VIEWBOX.width - pan.x) / zoom;
    const worldY = (fy * GEO_VIEWBOX.height - pan.y) / zoom;
    setZoom(next);
    setPan(clampPan(-worldX * next + fx * GEO_VIEWBOX.width, -worldY * next + fy * GEO_VIEWBOX.height));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = GEO_VIEWBOX.width / rect.width;
    const dx = (e.clientX - dragRef.current.x) * scale;
    const dy = (e.clientY - dragRef.current.y) * scale;
    setPan(clampPan(dragRef.current.px + dx, dragRef.current.py + dy));
  };
  const endDrag = () => { dragRef.current = null; };

  const selectedState = STATES.find((s) => s.id === selectedId);
  const card = selectedState ? cardFor(selectedState) : null;
  const selectedBloc = selectedState ? coalitionById(selectedState.ruling) : null;

  return (
    <section
      aria-label={t("overview.mapAria")}
      className={cn(
        "bg-card border border-rule overflow-hidden flex flex-col",
        expanded ? "rounded-none border-0 h-full w-full" : "rounded-panel",
      )}
    >
      <div className={cn("relative overflow-hidden", expanded ? "flex-1 min-h-0" : "")}>
        <div
          className="relative"
          style={reduced ? undefined : { transition: "transform 200ms ease-out", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <svg
            viewBox={`0 0 ${GEO_VIEWBOX.width} ${GEO_VIEWBOX.height}`}
            className={cn("block w-full h-auto", expanded && "h-full w-full")}
            role="group"
            aria-label={lang === "ms" ? "Negeri-negeri persekutuan" : "States of the federation"}
          >
            {/* terrain plate: built at build time from the same polygons */}
            <image href={TERRAIN_PLATE} x={0} y={0} width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} />

            {/* state shapes: real polygons, fill on hover/selection */}
            {STATES.map((state) => {
              const rings = GEO_STATES[state.id];
              if (!rings) return null;
              const selected = selectedId === state.id;
              const hovered = hoverId === state.id;
              const fill = fillFor(state.ruling);
              return (
                <path
                  key={`shape-${state.id}`}
                  d={rings.map((ring) => ringPath(ring)).join(" ")}
                  fill={fill}
                  fillOpacity={selected ? 0.5 : hovered ? 0.32 : 0.14}
                  stroke={selected || hovered ? "#1a1e6e" : "#5a7ea6"}
                  strokeWidth={selected || hovered ? 3 : 1.6}
                  className="cursor-pointer transition-[fill-opacity] duration-150"
                  pointerEvents="none"
                />
              );
            })}

            {/* tokens at real centroids â€” the clickable layer */}
            {STATES.slice()
              .sort((a, b) => Number(b.id === activeId) - Number(a.id === activeId))
              .map((state) => {
                const c = CENTROIDS[state.id];
                if (!c) return null;
                const [cx, cy] = project(c.lon, c.lat);
                const x = cx + (c.dx ?? 0);
                const y = cy + (c.dy ?? 0);
                const selected = selectedId === state.id;
                const hovered = hoverId === state.id;
                const fill = fillFor(state.ruling);
                const isTerritory = ["kuala-lumpur", "putrajaya", "labuan"].includes(state.id);
                const abbr = ABBR[state.id] ?? state.name.toUpperCase().slice(0, 3);
                const label = `${state.name} â€” ${t("overview.mapHint")}`;
                return (
                  <g
                    key={state.id}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    aria-pressed={selected}
                    onClick={() => toggle(state.id)}
                    onKeyDown={keyHandler(state.id)}
                    onMouseEnter={() => setHoverId(state.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(state.id)}
                    onBlur={() => setHoverId(null)}
                    className="cursor-pointer outline-none"
                  >
                    {(selected || hovered) && (
                      <g fill={fill} opacity={0.26} pointerEvents="none">
                        <rect x={x - 21} y={y - 21} width={42} height={42} />
                        <rect x={x - 29} y={y - 11} width={58} height={22} />
                        <rect x={x - 11} y={y - 29} width={22} height={58} />
                      </g>
                    )}
                    {(() => {
                      const size = selected ? 30 : hovered ? 26 : 20;
                      const half = size / 2;
                      return (
                        <>
                          <rect x={x - half - 2} y={y - half - 2} width={size + 4} height={size + 4} fill="#f7f4ec" />
                          <rect
                            x={x - half}
                            y={y - half}
                            width={size}
                            height={size}
                            fill={fill}
                            fillOpacity={selected ? 0.95 : hovered ? 0.88 : 0.75}
                            stroke={selected || hovered ? "#1a1e6e" : "#5a7ea6"}
                            strokeWidth={selected ? 2.5 : hovered ? 2 : 1.2}
                            style={{ transition: "fill-opacity 140ms ease" }}
                          />
                        </>
                      );
                    })()}
                    {isTerritory ? (
                      <rect x={x - 3} y={y - 3} width={6} height={6} fill="#cc0001" />
                    ) : (
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill="#14163a"
                        fontSize="12"
                        fontWeight="700"
                        fontFamily="Public Sans, sans-serif"
                        pointerEvents="none"
                      >
                        {abbr}
                      </text>
                    )}
                    {(selected || hovered) && (
                      <text
                        x={x}
                        y={y - 18}
                        textAnchor="middle"
                        fill="#1a1e6e"
                        fontSize="13"
                        fontWeight="700"
                        fontFamily="Public Sans, sans-serif"
                        stroke="#f7f4ec"
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
            <g fill="#5a7ea6" fontFamily="Public Sans, sans-serif" fontSize="14" letterSpacing="5" pointerEvents="none">
              <text x={project(112.5, 12.8)[0]} y={project(112.5, 12.8)[1]}>SOUTH CHINA SEA</text>
              <text x={project(97.6, 1.2)[0]} y={project(97.6, 1.2)[1]} transform={`rotate(-72 ${project(97.6, 1.2)[0]} ${project(97.6, 1.2)[1]})`}>
                STRAIT OF MALACCA
              </text>
              <text x={project(120.5, -6.5)[0]} y={project(120.5, -6.5)[1]}>CELEBES SEA</text>
            </g>
          </svg>
        </div>

        {/* bottom-sheet card: the selected state's dossier */}
        {selectedState && card && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-paper border-t-2 border-gold shadow-lift px-4 py-3" role="region" aria-label={selectedState.name}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="display text-base font-semibold">{selectedState.name}</h3>
              <span className="kicker text-[9px]">
                {selectedState.capital} Â· {card.population} Â· {card.industry}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              {t("overview.relations")}: {selectedState.relation} Â· {selectedBloc ? `${selectedBloc.abbr} (${selectedBloc.seats})` : selectedState.ruling}
              {card.issues.length > 0 && ` Â· ${card.issues.join(" Â· ")}`}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-rule flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="kicker kicker-gold">{t("overview.mapTitle")}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5" aria-label={t("overview.mapTitle")}>
          <LegendSwatch label={t("overview.legendGov")} color={coalitionById("ph")?.color ?? NEUTRAL_FILL} />
          <LegendSwatch label={t("overview.legendOpp")} color={coalitionById("pn")?.color ?? NEUTRAL_FILL} />
          <LegendSwatch label={t("overview.legendOther")} color={NEUTRAL_FILL} />
          <p className="text-xs text-muted">{t("overview.mapHint")}</p>
          <div className="flex items-center gap-1" role="group" aria-label="Zoom">
            <ZoomButton label="Zoom in" onZoom={() => setZoom(Math.min(3, zoom + 0.5))} glyph="+" />
            <ZoomButton label="Zoom out" onZoom={() => setZoom(Math.max(1, zoom - 0.5))} glyph="âˆ’" />
            <ZoomButton label="Reset view" onZoom={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} glyph="â¤¾" />
          </div>
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

function ZoomButton({ label, onZoom, glyph }: { label: string; onZoom(): void; glyph: string }) {
  return (
    <button
      type="button"
      onClick={onZoom}
      aria-label={label}
      title={label}
      className="w-7 h-7 flex items-center justify-center border border-rule-strong rounded-[2px] text-ink text-xs font-bold hover:border-gold hover:text-gold-text transition-colors"
    >
      {glyph}
    </button>
  );
}

function LegendSwatch({ label, color }: { label: string; color: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span aria-hidden="true" className="w-2.5 h-2.5 rounded-[1px] border border-rule-strong" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}