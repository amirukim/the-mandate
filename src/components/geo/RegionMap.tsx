import type { KeyboardEvent } from "react";
import { Globe, Landmark, Star } from "lucide-react";
import type { DiplomacyKey } from "../../types/game";
import {
  GEO_Brunei,
  GEO_China,
  GEO_Indonesia,
  GEO_Malaysia,
  GEO_Papua_New_Guinea,
  GEO_Philippines,
  GEO_Thailand,
  GEO_Taiwan,
  GEO_East_Timor,
  GEO_Vietnam,
  GEO_VIEWBOX,
  type GeoRing,
} from "../../data/geo-paths";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/**
 * Regional chart of Malaysia's diplomatic world on real geography (Natural
 * Earth 1:50m, public domain). Countries with a live relation in the
 * simulation are clickable; neighbours without one are drawn as context and
 * stay inert. Washington, Brussels and the ASEAN secretariat sit beyond the
 * frame, so they are pinned as posts on the map's edge.
 */

interface Props {
  selected: DiplomacyKey | null;
  onSelect: (key: DiplomacyKey | null) => void;
}

/** The paper-atlas palette, shared with MalaysiaMap (see ART_BIBLE 5.7). */
const HOME_FILL = "#f7f4ec";
const HOME_STROKE = "#1a1e6e";
const LAND_FILL = "#e3e0d3";
const LAND_STROKE = "#c9c2ae";
const FAR_FILL = "#dcd8c8";
const SELECTED_FILL = "#f7f4ec";
const SELECTED_STROKE = "#1a1e6e";
const SEA = "#bfd7ea";
const LABEL_INK = "#5a7ea6";

function ringPath(ring: GeoRing): string {
  let d = "";
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = ring[i];
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d + "Z";
}

function Country({ rings, fill, stroke, strokeWidth, opacity }: { rings: GeoRing[]; fill: string; stroke: string; strokeWidth: number; opacity?: number }) {
  return (
    <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeLinejoin="round">
      {rings.map((r, i) => (
        <path key={i} d={ringPath(r)} />
      ))}
    </g>
  );
}

/** Relation-backed countries with real polygons. */
const ACTORS: Array<{ key: DiplomacyKey; rings: GeoRing[]; label: string; labelLon: number; labelLat: number }> = [
  { key: "china", rings: GEO_China, label: "CHINA", labelLon: 111.5, labelLat: 26.5 },
  { key: "indonesia", rings: GEO_Indonesia, label: "INDONESIA", labelLon: 114.5, labelLat: -4.6 },
];

const SINGAPORE_CENTROID = { lon: 103.82, lat: 1.32 };

/** Context labels placed at real coordinates. */
const CONTEXT_LABELS: Array<{ label: string; lon: number; lat: number; small?: boolean }> = [
  { label: "THAILAND", lon: 101.2, lat: 15.5 },
  { label: "VIETNAM", lon: 106.8, lat: 20.5 },
  { label: "PHILIPPINES", lon: 122.5, lat: 12.5, small: true },
  { label: "BRUNEI", lon: 114.75, lat: 4.7, small: true },
  { label: "PAPUA N. GUINEA", lon: 130.0, lat: -6.0, small: true },
];

const project = (() => {
  const { lon0, lon1, lat0, lat1, width, height } = GEO_VIEWBOX;
  return (lon: number, lat: number): [number, number] => [
    ((lon - lon0) / (lon1 - lon0)) * width,
    height - ((lat - lat0) / (lat1 - lat0)) * height,
  ];
})();

/** The overseas posts, pinned beyond the frame. */
const POSTS: Array<{ key: DiplomacyKey; labelKey: string; icon: typeof Globe; x: number; y: number }> = [
  { key: "asean", labelKey: "diplomacy.postAsean", icon: Globe, x: 90.5, y: 22 },
  { key: "unitedStates", labelKey: "diplomacy.postUs", icon: Star, x: 90.5, y: 40 },
  { key: "europeanUnion", labelKey: "diplomacy.postEu", icon: Landmark, x: 90.5, y: 58 },
];

export function RegionMap({ selected, onSelect }: Props) {
  const { t } = useT();
  const toggle = (key: DiplomacyKey) => onSelect(selected === key ? null : key);
  const keyHandler = (key: DiplomacyKey) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(key);
    }
  };
  const [sgx, sgy] = project(SINGAPORE_CENTROID.lon, SINGAPORE_CENTROID.lat);

  return (
    <section aria-label="Regional chart" className="bg-card border border-rule rounded-panel overflow-hidden">
      <div className="relative">
        <svg
          viewBox={`0 0 ${GEO_VIEWBOX.width} ${GEO_VIEWBOX.height}`}
          className="block w-full h-auto"
          role="group"
          aria-label="Malaysia and its neighbours"
        >
          <defs>
            {/* the atlas is flat: no grid, no sea gradient */}
          </defs>

          <rect width={GEO_VIEWBOX.width} height={GEO_VIEWBOX.height} fill={SEA} />

          {/* context neighbours, real geometry */}
          <Country rings={GEO_Thailand} fill={LAND_FILL} stroke={LAND_STROKE} strokeWidth={1.2} />
          <Country rings={GEO_Vietnam} fill={LAND_FILL} stroke={LAND_STROKE} strokeWidth={1.2} />
          <Country rings={GEO_Philippines} fill={LAND_FILL} stroke={LAND_STROKE} strokeWidth={1.2} />
          <Country rings={GEO_Brunei} fill="#efe9dc" stroke={LAND_STROKE} strokeWidth={1.2} />
          <Country rings={GEO_Taiwan} fill={FAR_FILL} stroke={LAND_STROKE} strokeWidth={1} />
          <Country rings={GEO_Papua_New_Guinea} fill={FAR_FILL} stroke={LAND_STROKE} strokeWidth={1} />
          <Country rings={GEO_East_Timor} fill={FAR_FILL} stroke={LAND_STROKE} strokeWidth={1} />

          {/* clickable countries on real polygons */}
          {ACTORS.map((actor) => {
            const key = actor.key;
            const isSel = selected === key;
            const [lx, ly] = project(actor.labelLon, actor.labelLat);
            return (
              <g
                key={key}
                role="button"
                tabIndex={0}
                aria-label={`${actor.label}: ${t("diplomacy.fileAria")}`}
                aria-pressed={isSel}
                onClick={() => toggle(key)}
                onKeyDown={keyHandler(key)}
                className="cursor-pointer outline-none"
              >
                <Country
                  rings={actor.rings}
                  fill={isSel ? SELECTED_FILL : LAND_FILL}
                  stroke={isSel ? SELECTED_STROKE : LAND_STROKE}
                  strokeWidth={isSel ? 2.5 : 1.4}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fill={isSel ? SELECTED_STROKE : LABEL_INK}
                  fontSize="15"
                  letterSpacing="4"
                  fontFamily="Public Sans, sans-serif"
                  stroke="#f7f4ec"
                  strokeWidth="3"
                  paintOrder="stroke"
                  style={{ pointerEvents: "none" }}
                >
                  {actor.label}
                </text>
              </g>
            );
          })}

          {/* Singapore: small but clickable, with a generous hit area */}
          <g
            role="button"
            tabIndex={0}
            aria-label={`Singapore: ${t("diplomacy.fileAria")}`}
            aria-pressed={selected === "singapore"}
            onClick={() => toggle("singapore")}
            onKeyDown={keyHandler("singapore")}
            className="cursor-pointer outline-none"
          >
            <circle cx={sgx} cy={sgy} r="16" fill="transparent" />
            <circle
              cx={sgx}
              cy={sgy}
              r={selected === "singapore" ? 8 : 5.5}
              fill={selected === "singapore" ? SELECTED_FILL : LAND_FILL}
              stroke={selected === "singapore" ? SELECTED_STROKE : LAND_STROKE}
              strokeWidth={selected === "singapore" ? 2.5 : 1.4}
              style={{ transition: "r 140ms ease" }}
            />
            <text
              x={sgx + 16}
              y={sgy + 4}
              fill={LABEL_INK}
              fontSize="12"
              letterSpacing="3"
              fontFamily="Public Sans, sans-serif"
              pointerEvents="none"
            >
              SINGAPORE
            </text>
          </g>

          {/* home: Malaysia, real coastline, gold-lined */}
          <g aria-label="Malaysia" role="img">
            <Country rings={GEO_Malaysia} fill={HOME_FILL} stroke={HOME_STROKE} strokeWidth={2.2} />
            {(() => {
              const [px1, py1] = project(102.2, 3.2);
              const [px2, py2] = project(113.0, 2.6);
              return (
                <>
                  <text x={px1} y={py1} textAnchor="middle" fill={SELECTED_STROKE} fontSize="15" letterSpacing="4" fontFamily="Public Sans, sans-serif" stroke="#f7f4ec" strokeWidth="3" paintOrder="stroke" style={{ pointerEvents: "none" }}>
                    MALAYSIA
                  </text>
                  <text x={px2} y={py2} textAnchor="middle" fill={SELECTED_STROKE} fontSize="14" letterSpacing="4" fontFamily="Public Sans, sans-serif" stroke="#f7f4ec" strokeWidth="3" paintOrder="stroke" style={{ pointerEvents: "none" }}>
                    MALAYSIA
                  </text>
                </>
              );
            })()}
          </g>

          {/* context labels */}
          {CONTEXT_LABELS.map((c) => {
            const [x, y] = project(c.lon, c.lat);
            return (
              <text
                key={c.label}
                x={x}
                y={y}
                fill={LABEL_INK}
                fontSize={c.small ? 12 : 14}
                letterSpacing="4"
                fontFamily="Public Sans, sans-serif"
                textAnchor="middle"
              >
                {c.label}
              </text>
            );
          })}

          {/* sea labels */}
          <g fill={LABEL_INK} fontFamily="Public Sans, sans-serif" fontSize="14" letterSpacing="5">
            {(() => {
              const [sx, sy] = project(114.5, 13.5);
              const [mx, my] = project(97.4, 4.5);
              const [jx, jy] = project(109.5, -7.0);
              return (
                <>
                  <text x={sx} y={sy} textAnchor="middle">SOUTH CHINA SEA</text>
                  <text x={mx} y={my} transform={`rotate(-64 ${mx} ${my})`}>STRAIT OF MALACCA</text>
                  <text x={jx} y={jy} textAnchor="middle">JAVA SEA</text>
                </>
              );
            })()}
          </g>

          {/* compass */}
          <g stroke="#c69b54" strokeOpacity="0.6" fill="none" transform={`translate(${GEO_VIEWBOX.width - 78} 64)`}>
            <circle r="24" />
            <path d="M0 -24v48M-24 0h48" />
            <path d="M0 -22l-6 11h12z" fill="#c69b54" stroke="none" />
          </g>
        </svg>

        {/* overseas posts */}
        {POSTS.map((post) => {
          const Icon = post.icon;
          const isSel = selected === post.key;
          const label = t(post.labelKey);
          return (
            <button
              key={post.key}
              type="button"
              aria-pressed={isSel}
              aria-label={`${label}: ${t("diplomacy.fileAria")}`}
              onClick={() => toggle(post.key)}
              title={label}
              className={cn("group absolute flex flex-col items-center gap-1 -translate-x-1/2 focus-visible:outline-none")}
              style={{ left: `${post.x}%`, top: `${post.y}%` }}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border transition-colors",
                  isSel
                    ? "border-gold bg-gold text-paper"
                    : "border-gold/60 bg-paper/92 text-gold-text hover:bg-gold hover:text-paper",
                )}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "kicker text-[8px] bg-paper/90 border px-1 py-0.5 transition-colors",
                  isSel ? "border-gold text-gold-text" : "border-rule text-muted",
                )}
              >
                {label.split(",")[0].toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-rule flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="kicker kicker-gold">{t("diplomacy.nearAbroad")}</p>
        <p className="text-xs text-muted">
          {t("diplomacy.mapHint")}
        </p>
      </div>
    </section>
  );
}
