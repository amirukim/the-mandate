import { useEffect, useState, type KeyboardEvent } from "react";
import { Maximize2 } from "lucide-react";
import { STATES, type StateDef } from "../../data/states";
import { GEO_Brunei, GEO_Indonesia, GEO_Malaysia, GEO_Papua_New_Guinea, GEO_Philippines, GEO_Singapore, GEO_Thailand, GEO_East_Timor, GEO_Vietnam, GEO_Taiwan, GEO_China, GEO_VIEWBOX, type GeoRing } from "../../data/geo-paths";
import { coalitionById } from "../../data/parties";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/**
 * Real geography (Natural Earth 1:50m, public domain) of Malaysia and its
 * immediate neighbours, rendered as a pixel-art chart: the static layer is
 * rasterized to ⅓ scale and upscaled crisp. Each federated
 * state is an interactive token placed at its real-world centroid; the state
 * shapes themselves are not drawn (admin-1 polygons are a separate dataset)
 * — hover and selection light a stepped ground tint under the token, and the
 * token itself carries colour, focus and the state file.
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

/** Federal territories and unaligned seats: the neutral stone tone. */
const NEUTRAL_FILL = "#8a8478";

function fillFor(state: StateDef): string {
  if (state.ruling === "federal") return NEUTRAL_FILL;
  return coalitionById(state.ruling)?.color ?? NEUTRAL_FILL;
}

const ABBR: Record<string, string> = {
  "negeri-sembilan": "N9",
  "kuala-lumpur": "KL",
  putrajaya: "PJY",
  labuan: "LBN",
};

/* The static layer — sea, neighbours, the federation — serialized once and
   rasterized to ⅓ scale, then upscaled with pixelated rendering. */
let staticPixelUrl: string | null = null;

function staticMapSvgString(): string {
  const { width, height } = GEO_VIEWBOX;
  const country = (rings: GeoRing[], fill: string, stroke: string, sw: number) =>
    `<g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round">${rings
      .map((r) => `<path d="${ringPath(r)}"/>`)
      .join("")}</g>`;
  // each neighbour its own paper tone, so the region reads as atlas plates
  const thailand = "#e3e0d3";
  const indonesia = "#e0dcc9";
  const vietnam = "#e6e2d6";
  const philippines = "#ded9c4";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="#bfd7ea"/>` +
    // shore halo: two flat, lighter bands radiating from the federation
    country(GEO_Malaysia, "none", "#cfe3f2", 26) +
    country(GEO_Malaysia, "none", "#d8eaf6", 12) +
    country(GEO_Thailand, thailand, "#c9c2ae", 2.4) +
    country(GEO_Indonesia, indonesia, "#c9c2ae", 2.4) +
    country(GEO_Vietnam, vietnam, "#c9c2ae", 2.4) +
    country(GEO_Philippines, philippines, "#c9c2ae", 2.4) +
    country(GEO_Brunei, "#efe9dc", "#c9c2ae", 2.2) +
    country(GEO_Singapore, "#efe9dc", "#c9c2ae", 2) +
    country(GEO_China, "#dcd8c8", "#c9c2ae", 2) +
    country(GEO_Taiwan, "#dcd8c8", "#c9c2ae", 2) +
    country(GEO_Papua_New_Guinea, "#dcd8c8", "#c9c2ae", 2) +
    country(GEO_East_Timor, "#dcd8c8", "#c9c2ae", 2) +
    country(GEO_Malaysia, "#f7f4ec", "#1a1e6e", 4) +
    "</svg>"
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`pixelate: failed to load ${src}`));
    img.src = src;
  });
}

function useStaticPixelMap(): string | null {
  const [url, setUrl] = useState<string | null>(staticPixelUrl);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (url || failed) return;
    const { width, height } = GEO_VIEWBOX;
    const w = Math.round(width / 3);
    const h = Math.round(height / 3);
    const blob = new Blob([staticMapSvgString()], { type: "image/svg+xml" });
    const objectUrl = URL.createObjectURL(blob);
    (async () => {
      try {
        const img = await loadImage(objectUrl);
        // pass 1 — full-resolution raster of the chart, then pass 2 —
        // nearest-neighbour downsample onto the pixel grid
        const full = document.createElement("canvas");
        full.width = width;
        full.height = height;
        const fctx = full.getContext("2d");
        if (!fctx) return;
        fctx.drawImage(img, 0, 0, width, height);
        const out = document.createElement("canvas");
        out.width = w;
        out.height = h;
        const octx = out.getContext("2d");
        if (!octx) return;
        octx.imageSmoothingEnabled = false;
        octx.drawImage(full, 0, 0, w, h);
        staticPixelUrl = out.toDataURL("image/png");
        URL.revokeObjectURL(objectUrl);
        setUrl(staticPixelUrl);
      } catch {
        URL.revokeObjectURL(objectUrl);
        setFailed(true);
      }
    })();
  }, [url, failed]);
  return failed ? null : url;
}

export function MalaysiaMap({ selectedId, onSelect, expanded = false, onExpand }: Props) {
  const { t, lang } = useT();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const staticMapUrl = useStaticPixelMap();
  const toggle = (id: string) => onSelect(selectedId === id ? null : id);
  const keyHandler = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  const sea = expanded ? "#a9c4dd" : "#bfd7ea";
  // the hovered or selected token renders last, so SVG stacking never buries
  // it under a dense neighbour (Selangor/KL/Putrajaya)
  const activeId = selectedId ?? hoverId;

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
          {staticMapUrl ? (
            <image href={staticMapUrl} x={0} y={0} width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} />
          ) : (
            <>
              <defs>
                <pattern id="sea-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0H0v48" fill="none" stroke="#a9c4dd" strokeWidth="0.5" opacity="0.5" />
                </pattern>
                <radialGradient id="sea-glow" cx="0.5" cy="0.35" r="0.8">
                  <stop offset="0" stopColor="#d3e4f2" />
                  <stop offset="1" stopColor={sea} />
                </radialGradient>
              </defs>

              <rect width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} fill="url(#sea-glow)" />
              <rect width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} fill="url(#sea-grid)" />

              {/* shore halo: two flat, lighter bands radiating from the federation */}
              <Country rings={GEO_Malaysia} fill="none" stroke="#cfe3f2" strokeWidth={26} />
              <Country rings={GEO_Malaysia} fill="none" stroke="#d8eaf6" strokeWidth={12} />

              {/* neighbours and context, real geometry */}
              <Country rings={GEO_Thailand} fill="#e3e0d3" stroke="#c9c2ae" strokeWidth={2.4} />
              <Country rings={GEO_Indonesia} fill="#e0dcc9" stroke="#c9c2ae" strokeWidth={2.4} />
              <Country rings={GEO_Vietnam} fill="#e6e2d6" stroke="#c9c2ae" strokeWidth={2.4} />
              <Country rings={GEO_Philippines} fill="#ded9c4" stroke="#c9c2ae" strokeWidth={2.4} />
              <Country rings={GEO_Brunei} fill="#efe9dc" stroke="#c9c2ae" strokeWidth={2.2} />
              <Country rings={GEO_Singapore} fill="#efe9dc" stroke="#c9c2ae" strokeWidth={2} />
              <Country rings={GEO_China} fill="#dcd8c8" stroke="#c9c2ae" strokeWidth={2} />
              <Country rings={GEO_Taiwan} fill="#dcd8c8" stroke="#c9c2ae" strokeWidth={2} />
              <Country rings={GEO_Papua_New_Guinea} fill="#dcd8c8" stroke="#c9c2ae" strokeWidth={2} />
              <Country rings={GEO_East_Timor} fill="#dcd8c8" stroke="#c9c2ae" strokeWidth={2} />

              {/* the federation: real coastline, canton-lined */}
              <g strokeLinejoin="round">
                <Country rings={GEO_Malaysia} fill="#f7f4ec" stroke="#1a1e6e" strokeWidth={4} />
              </g>
            </>
          )}

          {/* state tokens at real centroids */}
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
                onMouseEnter={() => setHoverId(state.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(state.id)}
                onBlur={() => setHoverId(null)}
                className="cursor-pointer outline-none"
              >
                {/* the state's area lights up: a stepped, pixel-grid tint under
                    the token. Admin-1 polygons are a separate dataset (see the
                    header note), so the highlight marks ground, not coastline. */}
                {(selected || hovered) && (
                  <g fill={fill} opacity={0.26} pointerEvents="none">
                    <rect x={x - 21} y={y - 21} width={42} height={42} />
                    <rect x={x - 29} y={y - 11} width={58} height={22} />
                    <rect x={x - 11} y={y - 29} width={22} height={58} />
                  </g>
                )}
                {/* the token: a pixel square on a paper gap ring, snapped to the grid */}
                {(() => {
                  const size = selected ? 30 : hovered ? 26 : 20;
                  const half = size / 2;
                  return (
                    <>
                      <rect
                        x={x - half - 2}
                        y={y - half - 2}
                        width={size + 4}
                        height={size + 4}
                        fill="#f7f4ec"
                      />
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
          <g fill="#5a7ea6" fontFamily="Public Sans, sans-serif" fontSize="14" letterSpacing="5">
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
          <LegendSwatch label={t("overview.legendGov")} color={coalitionById("ph")?.color ?? NEUTRAL_FILL} />
          <LegendSwatch label={t("overview.legendOpp")} color={coalitionById("pn")?.color ?? NEUTRAL_FILL} />
          <LegendSwatch label={t("overview.legendOther")} color={NEUTRAL_FILL} />
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
