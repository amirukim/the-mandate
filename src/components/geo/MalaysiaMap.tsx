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

/** The playable frame: the viewBox crops to Malaysia and its immediate seas.
 * The plate still covers the whole 1200x640 projection; the crop is what makes
 * the federation read big instead of a thin band across an empty ocean. */
const VIEW = { x: 189, y: 305, w: 651, h: 167 } as const;

/** One-tap regions: the cure for "difficult to navigate". */
const PRESETS = {
  federation: { zoom: 1, lon: 106, lat: 3.5 },
  peninsula: { zoom: 2.6, lon: 102.0, lat: 3.9 },
  borneo: { zoom: 1.8, lon: 114.3, lat: 3.6 },
} as const;

const PRESET_LABEL: Record<keyof typeof PRESETS, string> = {
  federation: "overview.presetFederation",
  peninsula: "overview.presetPeninsula",
  borneo: "overview.presetBorneo",
};

const ABBR: Record<string, string> = {
  "negeri-sembilan": "N9",
  "kuala-lumpur": "KL",
  putrajaya: "PJY",
  labuan: "LBN",
};

/** Federal territories and unaligned seats: the neutral stone tone. */
const NEUTRAL_FILL = "#8a8478";

/** Sentiment layer: relation with Putrajaya reads as a warm-to-brick gradient. */
function sentimentFill(relation: number): string {
  if (relation >= 60) return "#c69b54";
  if (relation >= 45) return "#8a8478";
  return "#a44a3f";
}

function fillFor(state: { ruling: string; relation: number }, layer: "political" | "sentiment"): string {
  if (layer === "sentiment") return sentimentFill(state.relation);
  if (state.ruling === "federal") return NEUTRAL_FILL;
  return coalitionById(state.ruling)?.color ?? NEUTRAL_FILL;
}

function ringPath(ring: GeoRing | number[][]): string {
  let d = "";
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = ring[i];
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d + "Z";
}

const TERRAIN_PLATE = "/art/pixel/map-federation.png";
const ZOOM_MAX = 3.5;

/**
 * The federation map (v2 revamp): a smooth high-resolution terrain plate
 * (built at build time from the real admin-1 polygons) with state-shape
 * hover/click fills, cursor tooltip, Political/Sentiment data layers, one-tap
 * region presets, wheel + drag + double-click + keyboard navigation, and a
 * bottom-sheet card for the selected state.
 */
export function MalaysiaMap({ selectedId, onSelect, expanded = false, onExpand }: Props) {
  const { t, lang } = useT();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [layer, setLayer] = useState<"political" | "sentiment">("political");
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  /** The untransformed frame: never measure the transformed wrapper — its rect
   * is already scaled by zoom, which compounds every pan/zoom computation. */
  const frameRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);
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

  const rectOf = () => frameRef.current?.getBoundingClientRect();

  /** Pan is a css-px translation; clamp against the live rendered box. */
  const clampPan = (z: number, x: number, y: number): { x: number; y: number } => {
    const rect = rectOf();
    if (!rect || rect.width === 0) return { x: 0, y: 0 };
    const maxX = (z - 1) * rect.width;
    const maxY = (z - 1) * rect.height;
    return { x: Math.max(-maxX, Math.min(0, x)), y: Math.max(-maxY, Math.min(0, y)) };
  };

  /** Zoom to `next`, keeping the fractional point (fx, fy) fixed. */
  const zoomAt = (next: number, fx = 0.5, fy = 0.5) => {
    const clamped = Math.max(1, Math.min(ZOOM_MAX, next));
    const rect = rectOf();
    if (!rect) {
      setZoom(clamped);
      return;
    }
    const wx = (fx * rect.width - pan.x) / zoom;
    const wy = (fy * rect.height - pan.y) / zoom;
    setZoom(clamped);
    setPan(clampPan(clamped, fx * rect.width - wx * clamped, fy * rect.height - wy * clamped));
  };

  const applyPreset = (p: keyof typeof PRESETS) => {
    const { zoom: z, lon, lat } = PRESETS[p];
    const rect = rectOf();
    if (!rect || p === "federation") {
      setZoom(PRESETS.federation.zoom);
      setPan({ x: 0, y: 0 });
      return;
    }
    const k = rect.width / VIEW.w;
    // world coords must be rebased to the wrapper origin (the viewBox offset)
    const cx = (project(lon, lat)[0] - VIEW.x) * k;
    const cy = (project(lon, lat)[1] - VIEW.y) * k;
    setZoom(z);
    setPan(clampPan(z, rect.width / 2 - cx * z, rect.height / 2 - cy * z));
  };

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = rectOf();
    if (!rect) return;
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const next = zoom - e.deltaY * 0.0015;
    if (next === zoom) return;
    zoomAt(next, fx, fy);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = rectOf();
    if (rect) setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setPan(clampPan(zoom, dragRef.current.px + dx, dragRef.current.py + dy));
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const onMapKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 90;
    if (e.key === "ArrowLeft") { e.preventDefault(); setPan((p) => clampPan(zoom, p.x + step, p.y)); }
    else if (e.key === "ArrowRight") { e.preventDefault(); setPan((p) => clampPan(zoom, p.x - step, p.y)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setPan((p) => clampPan(zoom, p.x, p.y + step)); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setPan((p) => clampPan(zoom, p.x, p.y - step)); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomAt(zoom + 0.5); }
    else if (e.key === "-") { e.preventDefault(); zoomAt(zoom - 0.5); }
    else if (e.key === "0") { e.preventDefault(); setZoom(1); setPan({ x: 0, y: 0 }); }
  };

  const activeState = STATES.find((s) => s.id === activeId) ?? null;
  const selectedState = STATES.find((s) => s.id === selectedId) ?? null;
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
      <div ref={frameRef} className={cn("relative overflow-hidden", expanded ? "flex-1 min-h-0" : "")}>
        <div
          ref={viewRef}
          tabIndex={0}
          role="application"
          aria-label={t("overview.mapAria")}
          onKeyDown={onMapKeyDown}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={() => { endDrag(); setTip(null); setHoverId(null); }}
          onDoubleClick={(e) => {
            const rect = rectOf();
            if (!rect) return;
            zoomAt(zoom * 1.5, (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
          }}
          className={cn(
            "relative outline-none",
            zoom > 1 && (dragging ? "cursor-grabbing" : "cursor-grab"),
          )}
          style={
            reduced || dragging
              ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }
              : { transition: "transform 200ms ease-out", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }
          }
        >
          <svg
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            className={cn("block w-full h-auto", expanded && "h-full w-full")}
            role="presentation"
          >
            {/* terrain plate: high-resolution smooth render, built at build time from the same polygons */}
            <image
              href={TERRAIN_PLATE}
              x={0}
              y={0}
              width={GEO_VIEWBOX.width}
              height={GEO_VIEWBOX.height}
            />

            {/* state shapes: hover and click on the real polygons */}
            {STATES.map((state) => {
              const rings = GEO_STATES[state.id];
              if (!rings) return null;
              const selected = selectedId === state.id;
              const hovered = hoverId === state.id;
              const fill = fillFor(state, layer);
              return (
                <path
                  key={`shape-${state.id}`}
                  d={rings.map((ring) => ringPath(ring)).join(" ")}
                  fill={fill}
                  fillOpacity={selected ? 0.5 : hovered ? 0.32 : 0.14}
                  stroke={selected || hovered ? "#1a1e6e" : "#5a7ea6"}
                  strokeWidth={(selected || hovered ? 3 : 1.6) / zoom}
                  className="cursor-pointer"
                  onClick={() => toggle(state.id)}
                  onMouseEnter={() => setHoverId(state.id)}
                  onMouseLeave={() => setHoverId(null)}
                />
              );
            })}

            {/* tokens at real centroids — the precise keyboard layer */}
            {STATES.slice()
              .sort((a, b) => Number(a.id === activeId) - Number(b.id === activeId))
              .map((state) => {
                const c = CENTROIDS[state.id];
                if (!c) return null;
                const [cx, cy] = project(c.lon, c.lat);
                const x = cx + (c.dx ?? 0);
                const y = cy + (c.dy ?? 0);
                const selected = selectedId === state.id;
                const hovered = hoverId === state.id;
                const fill = fillFor(state, layer);
                const isTerritory = ["kuala-lumpur", "putrajaya", "labuan"].includes(state.id);
                const abbr = ABBR[state.id] ?? state.name.toUpperCase().slice(0, 3);
                /** s scales world units so tokens stay ~26px on screen at any zoom. */
                const s = 1 / zoom;
                const size = (selected ? 17 : hovered ? 15 : 13) * s;
                const half = size / 2;
                return (
                  <g
                    key={state.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${state.name} — ${t("overview.mapHint")}`}
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
                        <rect x={x - size * 1.6} y={y - size * 1.6} width={size * 3.2} height={size * 3.2} />
                        <rect x={x - size * 2.5} y={y - size * 0.8} width={size * 5} height={size * 1.6} />
                        <rect x={x - size * 0.8} y={y - size * 2.5} width={size * 1.6} height={size * 5} />
                      </g>
                    )}
                    <rect x={x - half - 1.2 * s} y={y - half - 1.2 * s} width={size + 2.4 * s} height={size + 2.4 * s} fill="#f7f4ec" />
                    <rect
                      x={x - half}
                      y={y - half}
                      width={size}
                      height={size}
                      fill={fill}
                      fillOpacity={selected ? 0.95 : hovered ? 0.88 : 0.75}
                      stroke={selected || hovered ? "#1a1e6e" : "#5a7ea6"}
                      strokeWidth={(selected ? 2.2 : hovered ? 1.8 : 1.2) * s}
                      style={{ transition: "fill-opacity 140ms ease" }}
                    />
                    {isTerritory ? (
                      <rect x={x - 2 * s} y={y - 2 * s} width={4 * s} height={4 * s} fill="#cc0001" />
                    ) : (
                      <text
                        x={x}
                        y={y + 2.5 * s}
                        textAnchor="middle"
                        fill="#14163a"
                        fontSize={6.5 * s}
                        fontWeight="700"
                        fontFamily="Public Sans, sans-serif"
                        pointerEvents="none"
                      >
                        {abbr}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* sea labels at real positions, inside the crop */}
            <g fill="#5a7ea6" fontFamily="Public Sans, sans-serif" fontSize="8" letterSpacing="3" pointerEvents="none">
              <text x={project(113.5, 7.5)[0]} y={project(113.5, 7.5)[1]}>SOUTH CHINA SEA</text>
              <text x={project(98.6, 4.8)[0]} y={project(98.6, 4.8)[1]} transform={`rotate(-90 ${project(98.6, 4.8)[0]} ${project(98.6, 4.8)[1]})`}>
                STRAIT OF MALACCA
              </text>
            </g>
          </svg>
        </div>

        {/* cursor tooltip: name + relation follows the pointer, on the frame layer */}
        {activeState && tip && (
          <div
            aria-hidden="true"
            className="absolute z-30 pointer-events-none bg-paper border border-gold shadow-lift px-2 py-1 rounded-[2px]"
            style={{ left: tip.x + 16, top: tip.y + 18 }}
          >
            <p className="display text-xs font-semibold leading-none">{activeState.name}</p>
            <p className="kicker text-[11px] mt-1">
              {t("overview.relationShort")}: {Math.round(activeState.relation)}
            </p>
          </div>
        )}

        {/* bottom-sheet card: the selected state's dossier */}
        {selectedState && card && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-paper border-t-2 border-gold shadow-lift px-4 py-3" role="region" aria-label={selectedState.name}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="display text-base font-semibold">{selectedState.name}</h3>
              <span className="kicker text-[11px]">
                {selectedState.capital} · {card.population} · {card.industry}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              {t("overview.relations")}: {selectedState.relation} · {selectedBloc ? `${selectedBloc.abbr} (${selectedBloc.seats})` : selectedState.ruling}
              {card.issues.length > 0 && ` · ${card.issues.join(" · ")}`}
            </p>
          </div>
        )}
      </div>

      {/* footer: title, presets, zoom, layers, legend */}
      <div className="px-4 py-3 border-t border-rule space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="kicker kicker-gold">{t("overview.mapTitle")}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1" role="group" aria-label={lang === "ms" ? "Kawasan" : "Regions"}>
              {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={cn(
                    "rounded-[2px] px-2 py-1.5 text-xs font-semibold transition-colors border",
                    zoom === PRESETS[p].zoom
                      ? "border-gold/70 bg-surface text-ink"
                      : "border-transparent text-muted hover:text-ink hover:bg-surface/60",
                  )}
                >
                  {t(PRESET_LABEL[p])}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1" role="group" aria-label="Zoom">
              <MapButton label="Zoom in" onPress={() => zoomAt(zoom + 0.5)} glyph="+" />
              <MapButton label="Zoom out" onPress={() => zoomAt(zoom - 0.5)} glyph="−" />
              <MapButton label="Reset view" onPress={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} glyph="⤾" />
            </div>
            <div className="flex items-center gap-1" role="group" aria-label={lang === "ms" ? "Lapisan peta" : "Map layers"}>
              <button
                type="button"
                onClick={() => setLayer("political")}
                aria-pressed={layer === "political"}
                className={cn(
                  "rounded-[2px] px-2 py-1.5 text-xs font-semibold transition-colors border",
                  layer === "political" ? "border-gold/70 bg-surface text-ink" : "border-transparent text-muted hover:text-ink hover:bg-surface/60",
                )}
              >
                {t("overview.layerPolitical")}
              </button>
              <button
                type="button"
                onClick={() => setLayer("sentiment")}
                aria-pressed={layer === "sentiment"}
                className={cn(
                  "rounded-[2px] px-2 py-1.5 text-xs font-semibold transition-colors border",
                  layer === "sentiment" ? "border-gold/70 bg-surface text-ink" : "border-transparent text-muted hover:text-ink hover:bg-surface/60",
                )}
              >
                {t("overview.layerSentiment")}
              </button>
            </div>
            {!expanded && onExpand && (
              <button
                type="button"
                onClick={onExpand}
                aria-label={t("overview.expandMap")}
                title={t("overview.expandMap")}
                className="flex items-center gap-1.5 text-xs font-semibold text-gold-text border border-gold/50 rounded-[2px] px-2 py-1.5 hover:bg-gold hover:text-paper transition-colors"
              >
                <Maximize2 size={12} aria-hidden="true" />
                {t("overview.expandMap")}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <LegendSwatch label={t("overview.legendGov")} color={coalitionById("ph")?.color ?? NEUTRAL_FILL} />
          <LegendSwatch label={t("overview.legendOpp")} color={coalitionById("pn")?.color ?? NEUTRAL_FILL} />
          <LegendSwatch label={t("overview.legendOther")} color={NEUTRAL_FILL} />
          {layer === "sentiment" && (
            <>
              <LegendSwatch label={lang === "ms" ? "Sokongan tinggi" : "Strong support"} color="#c69b54" />
              <LegendSwatch label={lang === "ms" ? "Sederhana" : "Moderate"} color="#8a8478" />
              <LegendSwatch label={lang === "ms" ? "Dingin" : "Cool"} color="#a44a3f" />
            </>
          )}
          <p className="text-xs text-muted">{t("overview.mapHint")}</p>
        </div>
      </div>
    </section>
  );
}

/** 32px square control — the iPad touch floor. */
function MapButton({ label, onPress, glyph }: { label: string; onPress(): void; glyph: string }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      title={label}
      className="w-8 h-8 flex items-center justify-center border border-rule-strong rounded-[2px] text-ink text-sm font-bold hover:border-gold hover:text-gold-text transition-colors"
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
