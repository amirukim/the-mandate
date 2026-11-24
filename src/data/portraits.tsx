import type { ReactNode } from "react";

/**
 * Character portrait registry.
 *
 * Three layers, tried in order by Avatar / CharacterPortrait:
 *   1. Painted raster assets — PORTRAITS maps a CHARACTER ID to a file under
 *      public/portraits/. Generation is not available in this environment;
 *      exact requirements are documented in public/portraits/README.md.
 *      Registering an id here upgrades the whole app with no component edits.
 *   2. Painted portraits (below) — soft-edged, colour-graded SVG busts with
 *      per-character palettes, directional light and rim light. The shipped
 *      presentation, tuned to read at both 32px and stage size.
 *   3. Anonymous silhouette — speakers with no registered art, never initials.
 * Every character is fictional; no asset may depict a real politician.
 */

/** Character ID → painted raster file. Keyed by ID, not display name. */
export const PORTRAITS: Record<string, string> = {
  // chiefOfStaff: "/portraits/chiefOfStaff.webp",
};

/** Character display name → art id. Stable across locales: names never translate. */
const ART_BY_NAME: Record<string, string> = {
  "Sarah Tan": "chiefOfStaff",
  "Tan Sri Azlan Mahmud": "finance",
  "Dr. Kavitha Rao": "economicAdviser",
  "Dato' Faridah Yusof": "nationalSecurity",
  "Datuk Lim Wei Sheng": "foreign",
  "Datuk Seri Norliza Ahmad": "home",
  "Datuk Seri Peter Mojuntin": "borneoMinister",
  "Datuk Patinggi Jonathan Lingga": "gpsPremier",
  "Tan Sri Raja Nordin": "bnChair",
  "Dato' Iskandar Rahman": "oppositionLeader",
};

/** Painted portrait for a character ID, or null while artwork is missing. */
export function portraitForId(id: string): string | null {
  return PORTRAITS[id] ?? null;
}

export function portraitFor(name: string): string | null {
  const id = ART_BY_NAME[name];
  return id ? PORTRAITS[id] ?? null : null;
}

/** Painted-portrait art id for a display name, or null for unregistered speakers. */
export function portraitArtId(name: string): string | null {
  return ART_BY_NAME[name] ?? null;
}

/* ------------------------------------------------------------------ */
/* Painted portrait system                                             */
/* ------------------------------------------------------------------ */

interface PortraitSpec {
  /** [base, shadow, light] skin tones. */
  skin: [string, string, string];
  /** Background gradient stops, top → bottom, plus a glow hue. */
  bg: [string, string, string];
  attire: {
    kind: "suit" | "open" | "mandarin";
    color: string;
    /** Lapel / placket accent. */
    trim: string;
    /** Shirt or blouse visible at the collar. */
    shirt: string;
    /** Tie, if any. */
    tie?: string;
    /** Pocket square / brooch accent. */
    accent?: string;
  };
  hair?: {
    color: string;
    sheen: string;
    style: "bob" | "short" | "receding" | "tied" | "sidepart" | "curls" | "combed" | "white";
  };
  hijab?: { color: string; shade: string; pin?: string };
  /** Headwear drawn above the hair. */
  songkok?: string;
  kopiah?: string;
  glasses?: { heavy?: boolean };
  facial?: "beard" | "beard-grey" | "moustache" | "moustache-grey";
  age?: "mid" | "older";
  expression?: "firm" | "set" | "soft";
  earrings?: boolean;
  bindi?: boolean;
  scarf?: string;
}

const LINE = "#d9d2c0";

/** Unique-per-id ids so multiple portraits on one page don't share defs. */
function PaintedPortrait({ id, spec }: { id: string; spec: PortraitSpec }) {
  const u = (s: string) => `pp-${id}-${s}`;
  const age = spec.age ?? "mid";
  const mouth = spec.expression ?? "firm";
  const skin = spec.skin;

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={u("bg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={spec.bg[0]} />
          <stop offset="1" stopColor={spec.bg[1]} />
        </linearGradient>
        <radialGradient id={u("glow")} cx="0.5" cy="0.38" r="0.62">
          <stop offset="0" stopColor={spec.bg[2]} stopOpacity="0.85" />
          <stop offset="1" stopColor={spec.bg[2]} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={u("skin")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={skin[2]} />
          <stop offset="0.55" stopColor={skin[0]} />
          <stop offset="1" stopColor={skin[1]} />
        </linearGradient>
        <linearGradient id={u("attire")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={spec.attire.color} />
          <stop offset="1" stopColor="#12161e" />
        </linearGradient>
        <linearGradient id={u("rim")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e6cd8e" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#e6cd8e" stopOpacity="0.1" />
          <stop offset="1" stopColor="#e6cd8e" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={u("vig")} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0.55" stopColor="#0a0e15" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0e15" stopOpacity="0.55" />
        </radialGradient>
        <filter id={u("soft")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.65" />
        </filter>
      </defs>

      {/* backdrop */}
      <rect width="64" height="64" fill={`url(#${u("bg")})`} />
      <rect width="64" height="64" fill={`url(#${u("glow")})`} />

      {/* shoulders */}
      <path d="M7 64c1.5-12 11.5-19 25-19s23.5 7 25 19z" fill={`url(#${u("attire")})`} />
      <Collar spec={spec} />

      {/* neck */}
      <path d="M27 35h10v9.5c-3 1.6-7 1.6-10 0z" fill={skin[1]} />
      <path d="M27 35h10v3.2c-3.2 1.5-6.8 1.5-10 0z" fill={skin[1]} filter={`url(#${u("soft")})`} opacity="0.7" />

      {/* head */}
      <ellipse cx="32" cy="24.5" rx="11.2" ry="13" fill={`url(#${u("skin")})`} />
      {/* jaw shadow, right side */}
      <path d="M36 15c5 2 7.5 6 7 11.5-.4 4.6-3 8.5-7 10 3-4 4.4-8 4-12.5-.3-3.8-1.7-6.8-4-9z" fill={skin[1]} opacity="0.55" filter={`url(#${u("soft")})`} />
      {/* forehead light, left */}
      <path d="M27.5 13c-3.2 2.2-5 5.6-4.8 10 .1 3.6 1.3 6.8 3.6 9.4-2.6-3.4-3.4-7.4-2.9-11.4.4-3.3 1.8-6 4.1-8z" fill={skin[2]} opacity="0.75" filter={`url(#${u("soft")})`} />
      {/* ears */}
      <ellipse cx="20.9" cy="26" rx="1.8" ry="2.7" fill={skin[0]} />
      <ellipse cx="43.1" cy="26" rx="1.8" ry="2.7" fill={skin[1]} />

      {/* hair or headwear */}
      <Hair spec={spec} />
      {(spec.songkok || spec.kopiah) && <Cap spec={spec} />}

      {/* face — restrained engraved-tinted features, no cartoon whites */}
      <g>
        {/* eye sockets: soft shadow beds */}
        <ellipse cx="28.1" cy="23.1" rx="2.5" ry="1.5" fill={skin[1]} opacity="0.5" filter={`url(#${u("soft")})`} />
        <ellipse cx="35.9" cy="23.1" rx="2.5" ry="1.5" fill={skin[1]} opacity="0.5" filter={`url(#${u("soft")})`} />
        {/* lids: dark almond slits with a glint */}
        <path d="M26.1 23c1.2-.9 2.9-.9 4-.1l-.4.9c-1-.5-2.3-.5-3.2 0z" fill="#26222a" />
        <path d="M33.9 22.9c1.2-.8 2.9-.8 4 .1l-.4.9c-1-.5-2.2-.5-3.2 0z" fill="#26222a" />
        <circle cx="28.2" cy="23.2" r="0.62" fill="#1d1a20" />
        <circle cx="35.8" cy="23.2" r="0.62" fill="#1d1a20" />
        <circle cx="28.05" cy="22.9" r="0.2" fill={LINE} />
        <circle cx="35.65" cy="22.9" r="0.2" fill={LINE} />
        {/* upper lid lines */}
        <path d="M26 22c1.3-.8 2.9-.8 4.2 0" stroke="#241f26" strokeOpacity="0.8" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M33.8 22c1.3-.8 2.9-.8 4.2 0" stroke="#241f26" strokeOpacity="0.8" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        {/* brows */}
        <path d="M25.8 19.4c1.3-1 3-1.2 4.5-.6" stroke="#26222a" strokeOpacity={age === "older" ? 0.55 : 0.8} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M33.7 18.9c1.5-.6 3.2-.4 4.5.6" stroke="#26222a" strokeOpacity={age === "older" ? 0.55 : 0.8} strokeWidth="1" fill="none" strokeLinecap="round" />
        {age === "older" && (
          <g stroke={skin[1]} strokeWidth="0.5" fill="none" opacity="0.9">
            <path d="M25.4 20.6l1.4 2M36.6 20.6l-1.4 2" />
            <path d="M30.8 17.6c.8-.2 1.6-.2 2.4 0" strokeOpacity="0.5" />
          </g>
        )}
        {/* nose: shadow side + tip line */}
        <path d="M31.6 23.4v5c0 1-.5 1.6-1.4 1.9" stroke={skin[1]} strokeWidth="0.85" fill="none" strokeLinecap="round" opacity="0.95" />
        <path d="M30 30.9c1.3.5 2.7.5 4-.2" stroke={skin[1]} strokeWidth="0.75" fill="none" strokeLinecap="round" opacity="0.75" />
        <path d="M31.3 24.6c-.7 1.5-.7 2.8 0 4" stroke={skin[2]} strokeWidth="0.5" fill="none" opacity="0.55" />
        {/* mouth */}
        {mouth === "set" && <path d="M28.6 35.5h6.8" stroke="#4d3230" strokeWidth="0.9" strokeLinecap="round" />}
        {mouth === "firm" && <path d="M28.8 35.3c2.1 1 4.3 1 6.4 0" stroke="#4d3230" strokeWidth="0.85" fill="none" strokeLinecap="round" />}
        {mouth === "soft" && <path d="M29 34.9c1.9 1.3 4.2 1.3 6.1 0" stroke="#4d3230" strokeWidth="0.8" fill="none" strokeLinecap="round" />}
        {mouth !== "set" && <path d="M30.6 37.4c.9.4 1.9.4 2.8 0" stroke={skin[1]} strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.6" />}
        {spec.facial && <FacialHair kind={spec.facial} />}
        {/* cheek planes */}
        <ellipse cx="26.6" cy="28.4" rx="2.2" ry="1.4" fill={skin[2]} opacity="0.42" filter={`url(#${u("soft")})`} />
        <ellipse cx="38" cy="28.6" rx="2" ry="1.4" fill={skin[1]} opacity="0.42" filter={`url(#${u("soft")})`} />
        {spec.bindi && <circle cx="32" cy="18.4" r="0.85" fill="#b3452e" />}
      </g>

      {spec.glasses && <Glasses heavy={spec.glasses.heavy} />}
      {spec.hijab && <HijabFront hijab={spec.hijab} />}
      {spec.earrings && (
        <g fill="#e6cd8e">
          <circle cx="20.9" cy="29.4" r="0.9" />
          <circle cx="43.1" cy="29.4" r="0.9" />
        </g>
      )}

      {/* rim light from the left, painterly */}
      <path d="M23.2 9.5c-3.6 3-5.8 8.3-5.6 14.7.2 6.5 2 12.2 4.6 16.3" fill="none" stroke={`url(#${u("rim")})`} strokeWidth="1.4" filter={`url(#${u("soft")})`} />
      <path d="M12.5 52c3-5 8-7.6 14.5-8.1" fill="none" stroke={`url(#${u("rim")})`} strokeWidth="1.2" filter={`url(#${u("soft")})`} />

      {/* vignette */}
      <rect width="64" height="64" fill={`url(#${u("vig")})`} />
      {/* banknote frame hint */}
      <rect x="0.5" y="0.5" width="63" height="63" fill="none" stroke={LINE} strokeOpacity="0.22" strokeWidth="1" />
    </svg>
  );
}

/** Collar details per attire kind. */
function Collar({ spec }: { spec: PortraitSpec }) {
  const a = spec.attire;
  return (
    <g>
      {a.kind === "suit" && (
        <g>
          <path d="M25 45.5l7 4.5 7-4.5" fill="none" stroke={a.trim} strokeWidth="1.1" strokeOpacity="0.9" />
          <path d="M32 50l-3.2 2.9L32 63l3.2-10.1z" fill={a.shirt} />
          {a.tie && <path d="M32 50l-1.8 1.6L32 60l1.8-8.4z" fill={a.tie} />}
          {a.accent && <rect x="42" y="52" width="4.5" height="2.2" rx="0.5" fill={a.accent} />}
        </g>
      )}
      {a.kind === "open" && (
        <g>
          <path d="M26.5 45.5l5.5 3.4-6.5 5.4z" fill={a.shirt} />
          <path d="M37.5 45.5l-5.5 3.4 6.5 5.4z" fill={a.shirt} />
          <path d="M26.5 45.5l5.5 3.4-6.5 5.4z" fill="none" stroke={a.trim} strokeWidth="0.7" strokeOpacity="0.7" />
        </g>
      )}
      {a.kind === "mandarin" && (
        <g>
          <path d="M26 46.5v7.5M38 46.5v7.5" fill="none" stroke={a.trim} strokeWidth="1" strokeOpacity="0.85" />
          <circle cx="32" cy="50" r="1" fill={a.accent ?? a.trim} />
          {a.shirt !== a.color && <path d="M27 47h10v5h-10z" fill={a.shirt} opacity="0.35" />}
        </g>
      )}
    </g>
  );
}

function Hair({ spec }: { spec: PortraitSpec }) {
  const h = spec.hair;
  if (spec.hijab) {
    return (
      <g>
        <path d="M13 45.5C13 20 20.5 8 32 8s19 12 19 37.5l-5-.3C46 25.5 40.5 14 32 14s-14 11.5-14 31.2z" fill={spec.hijab.color} />
        <path d="M13 45.5C13 20 20.5 8 32 8c-4.5 2-8 7.5-9.5 15.5-1.6 8.6-1.4 14.6-1 22z" fill={spec.hijab.shade} opacity="0.75" />
        <path d="M44.5 16.5c3 5.5 4.5 12.5 4.7 21.5" fill="none" stroke="#e6cd8e" strokeOpacity="0.35" strokeWidth="0.8" />
        {spec.hijab.pin && <rect x="22" y="41" width="5" height="1.7" rx="0.8" fill={spec.hijab.pin} />}
        {/* forehead fringe under the hijab */}
        <path d="M22.8 17.5c2.2-2.6 5.4-4 9.2-4s7 1.4 9.2 4c-2.4-1.3-5.6-2-9.2-2s-6.8.7-9.2 2z" fill={spec.skin[1]} />
      </g>
    );
  }
  if (!h) return null;
  const c = h.color;
  const s = h.sheen;
  switch (h.style) {
    case "bob":
      return (
        <g>
          <path d="M20.5 20.5c0-8 5-12.5 11.5-12.5S43.5 12.5 43.5 20.5V33c0 2.3-2.6 2.5-2.9.4l-.6-9.4c-2.6-3.3-5.4-4.5-8-4.5s-5.4 1.2-8 4.5l-.6 9.4c-.3 2.1-2.9 1.9-2.9-.4z" fill={c} />
          <path d="M23.5 12.5c1.6-2 4-3.3 7-3.7-2.6 1-4.6 2.5-6 4.6z" fill={s} />
          <path d="M40.5 12.5c.6 3.5.8 7.4.6 11.5" fill="none" stroke={s} strokeWidth="0.8" opacity="0.8" />
        </g>
      );
    case "receding":
      return (
        <g>
          <path d="M21 21c.8-6.5 5-11 11-11s10.2 4.5 11 11c-2.6-3.2-4.4-4.5-6.2-5.1-3.4-1.2-6.4-1.2-9.6 0-1.8.6-3.6 1.9-6.2 5.1z" fill={c} />
          <path d="M23.5 14.5c1.8-2 4.2-3.2 7-3.5-2.4.9-4.2 2-5.5 3.7z" fill={s} />
        </g>
      );
    case "tied":
      return (
        <g>
          <path d="M20 20c0-8 5-12 12-12s12 4 12 12l.7 6c0 1.8-2.3 1.9-2.6.1l-.9-5.4c-2.7-3.3-5.8-4.5-9.2-4.5s-6.5 1.2-9.2 4.5l-.9 5.4c-.3 1.8-2.6 1.7-2.6-.1z" fill={c} />
          {/* tied bun behind */}
          <ellipse cx="46.5" cy="26" rx="2.6" ry="4.2" fill={c} />
          <path d="M24 12.5c2-2.2 4.8-3.4 8-3.6-2.7 1-4.9 2.2-6.5 4z" fill={s} />
        </g>
      );
    case "sidepart":
      return (
        <g>
          <path d="M20.5 21.5C21 13 26 8.5 32 8.5S43 13 43.5 21.5c-2.8-4.4-6-6-10.8-6-4.5 0-8 1.4-12.2 6z" fill={c} />
          <path d="M28.4 9.3c-1.2 1.8-1.7 3.6-1.8 5.6" fill="none" stroke={s} strokeWidth="0.7" opacity="0.85" />
          <path d="M36 10c2 1.2 3.5 3 4.5 5.4" fill="none" stroke={s} strokeWidth="0.7" opacity="0.6" />
        </g>
      );
    case "curls":
      return (
        <g fill={c}>
          <circle cx="24.5" cy="14.5" r="4" />
          <circle cx="31" cy="11.5" r="4.5" />
          <circle cx="38" cy="13" r="4.2" />
          <circle cx="21.5" cy="19" r="3.4" />
          <circle cx="42.5" cy="18" r="3.4" />
          <path d="M20.5 20.5c0-7.5 5-12 11.5-12s11.5 4.5 11.5 12c-1.5-2.6-3-3.9-4.5-4.3.5 1.2.5 2.4.2 3.4-1.5-2.7-3.4-4-6-4.2-.4 1.2-1.2 2.2-2.4 2.9-1.2-1.4-2.8-2.2-4.6-2.2-.4 1-.5 2-.2 3-2-.5-3.8-.6-5.5-.6z" />
          <circle cx="27" cy="12.5" r="1.6" fill={s} opacity="0.7" />
        </g>
      );
    case "combed":
      return (
        <g>
          <path d="M20.5 21.5C21 13.5 26 9 32 9s11 4.5 11.5 12.5c-2.4-3-4.4-4.4-6-4.9-3.8-1.3-7.2-1.3-11 0-1.6.5-3.6 1.9-6 4.9z" fill={c} />
          <path d="M22 15.5c3-3.4 7-5 12-5-3.2.6-6 1.8-8.5 3.8z" fill={s} opacity="0.9" />
          <path d="M40.8 12.2c1.6 1.6 2.6 3.4 3 5.4" fill="none" stroke={s} strokeWidth="0.8" opacity="0.7" />
        </g>
      );
    case "white":
      return (
        <g>
          <path d="M20.5 21C21 13 26 9 32 9s11 4 11.5 12c-2.4-3-4.4-4.4-6-4.9-3.6-1.2-7.4-1.2-11 0-1.6.5-3.6 1.9-6 4.9z" fill={c} />
          <path d="M23 14.5c2.8-3 6.5-4.6 11-4.6-3 .8-5.6 2.2-8 4.2z" fill={s} opacity="0.85" />
        </g>
      );
    case "short":
    default:
      return (
        <g>
          <path d="M20.5 21.5c0-7.5 5-12 11.5-12s11.5 4.5 11.5 12c-1.5-2.6-3-3.9-4.5-4.3.5 1.2.5 2.4.2 3.4-1.5-2.7-3.4-4-6-4.2-.4 1.2-1.2 2.2-2.4 2.9-1.2-1.4-2.8-2.2-4.6-2.2-.4 1-.5 2-.2 3-2-.5-3.8-.6-5.5-.6z" fill={c} />
          <path d="M24.5 12.2c1.6-1.8 3.9-2.9 6.8-3.2-2.3.9-4 2-5.3 3.6z" fill={s} />
        </g>
      );
  }
}

/** Songkok (dark) or kopiah (white, pleated) — worn above the hairline. */
function Cap({ spec }: { spec: PortraitSpec }) {
  if (spec.songkok) {
    return (
      <g>
        <path d="M21.3 15.8c1.6-5.6 5.8-8.8 10.7-8.8s9.1 3.2 10.7 8.8l.3 1.9c-7.2 1.1-14.5 1.1-22 0z" fill={spec.songkok} />
        <path d="M21.6 17.2c7.3 1 14.4 1 21.6 0" fill="none" stroke="#c9a96a" strokeOpacity="0.55" strokeWidth="0.6" />
        <path d="M24.5 9.5c2-1.6 4.6-2.5 7.5-2.5-2.4.7-4.4 1.5-6 2.7z" fill="#2b323e" opacity="0.8" />
      </g>
    );
  }
  if (spec.kopiah) {
    return (
      <g fill={spec.kopiah}>
        <path d="M21.6 15.4c1.4-5.4 5.5-8.5 10.4-8.5s9 3.1 10.4 8.5l.3 1.7c-7.1 1-14.3 1-21.4 0z" />
        <path d="M27.5 8.6c.3 2.6.5 5.3.6 8M32 7.9v8.8M36.5 8.6c-.3 2.6-.5 5.3-.6 8" fill="none" stroke="#8f8a7c" strokeWidth="0.5" strokeOpacity="0.8" />
        <path d="M21.9 16.7c7 1 14.2 1 21.2 0" fill="none" stroke="#8f8a7c" strokeWidth="0.6" strokeOpacity="0.9" />
      </g>
    );
  }
  return null;
}

function HijabFront({ hijab }: { hijab: NonNullable<PortraitSpec["hijab"]> }) {
  const spec = hijab;
  return (
    <g>
      {/* drape folds falling to the shoulders */}
      <path d="M18.5 44c0-4 1.5-7 4-9 0 5-.5 9.5-1.2 13z" fill={spec.shade} opacity="0.9" />
      <path d="M45.5 44c0-4-1.5-7-4-9 0 5 .5 9.5 1.2 13z" fill={spec.shade} opacity="0.9" />
      <path d="M32 8c-3.5 0-6.5 2.2-8.5 6" fill="none" stroke={spec.shade} strokeWidth="1.4" opacity="0.8" />
    </g>
  );
}

function Glasses({ heavy }: { heavy?: boolean }) {
  const stroke = heavy ? 1.1 : 0.9;
  return (
    <g fill="none" stroke="#39414c" strokeWidth={stroke} strokeOpacity="0.95">
      <rect x="24" y="21.4" width="7.2" height="5.6" rx="1.7" fill="#8ea0b5" fillOpacity="0.16" />
      <rect x="32.8" y="21.4" width="7.2" height="5.6" rx="1.7" fill="#8ea0b5" fillOpacity="0.16" />
      <path d="M31.2 23.6h1.6" />
      <path d="M24 23l-3.4-1M40 23l3.4-1" strokeOpacity="0.7" />
      <path d="M25.2 25.8l2.4 1.2" stroke="#e6cd8e" strokeOpacity="0.5" strokeWidth="0.6" />
    </g>
  );
}

function FacialHair({ kind }: { kind: PortraitSpec["facial"] }) {
  if (kind === "moustache" || kind === "moustache-grey") {
    return (
      <path
        d="M27.3 33.4c1.6 1.3 3.1 1.8 4.7 1.8s3.1-.5 4.7-1.8"
        fill="none"
        stroke={kind === "moustache-grey" ? "#b9bdb6" : "#20242e"}
        strokeOpacity="0.85"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    );
  }
  const grey = kind === "beard-grey";
  const c = grey ? "#a7aca4" : "#232833";
  return (
    <g fill={c} fillOpacity="0.92">
      {/* beard mass along the jaw, leaving mouth clear */}
      <path d="M22.6 28.5c-.3 5.5 1.4 9.8 4.6 12 2.9 2 7.3 2 10.2 0 3.2-2.2 4.9-6.5 4.6-12l1.5.9c.3 6.4-3.2 12.4-9.4 13.1-.2.02-3.4.02-3.6 0-6.2-.7-9.7-6.7-9.4-13.1z" />
      <path d="M27.3 33.4c1.6 1.3 3.1 1.8 4.7 1.8s3.1-.5 4.7-1.8" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      {grey && <path d="M25 36.5c1.8 2.6 4.2 4 7 4s5.2-1.4 7-4" fill="none" stroke="#c9cdc6" strokeWidth="0.6" strokeOpacity="0.6" />}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The ten painted portraits                                           */
/* ------------------------------------------------------------------ */

const ART: Record<string, ReactNode> = {
  chiefOfStaff: (
    <PaintedPortrait
      id="chiefOfStaff"
      spec={{
        skin: ["#c99a76", "#8f6247", "#e6bd98"],
        bg: ["#1b2434", "#10141d", "#2c3c55"],
        attire: { kind: "suit", color: "#2a3140", trim: "#4a5468", shirt: "#e9e2d2", accent: "#c9a96a" },
        hair: { color: "#1d222c", sheen: "#4d5a6e", style: "bob" },
        expression: "soft",
        scarf: undefined,
      }}
    />
  ),
  finance: (
    <PaintedPortrait
      id="finance"
      spec={{
        skin: ["#c49a72", "#8a6244", "#e2ba92"],
        bg: ["#1d2740", "#10141d", "#31456e"],
        attire: { kind: "suit", color: "#232a36", trim: "#3d4757", shirt: "#dde2e8", tie: "#6e3440", accent: "#c9a96a" },
        hair: { color: "#8f8f8c", sheen: "#c4c4c0", style: "receding" },
        glasses: {},
        age: "older",
        expression: "set",
      }}
    />
  ),
  economicAdviser: (
    <PaintedPortrait
      id="economicAdviser"
      spec={{
        skin: ["#b5825a", "#7d5539", "#dcae84"],
        bg: ["#173028", "#0f1a17", "#2b5a48"],
        attire: { kind: "suit", color: "#1f4440", trim: "#39655c", shirt: "#d8b86a" },
        hair: { color: "#191d24", sheen: "#3f4a5a", style: "tied" },
        glasses: {},
        bindi: true,
        earrings: true,
        expression: "firm",
      }}
    />
  ),
  nationalSecurity: (
    <PaintedPortrait
      id="nationalSecurity"
      spec={{
        skin: ["#c19a72", "#87613f", "#dfb894"],
        bg: ["#20262e", "#11151b", "#3a4a5c"],
        attire: { kind: "suit", color: "#262d38", trim: "#48536a", shirt: "#cfd6de" },
        hijab: { color: "#20262e", shade: "#141920", pin: "#c9a96a" },
        age: "older",
        expression: "set",
      }}
    />
  ),
  foreign: (
    <PaintedPortrait
      id="foreign"
      spec={{
        skin: ["#d0a276", "#96684a", "#ecd0a8"],
        bg: ["#1c2436", "#10141d", "#2e4268"],
        attire: { kind: "suit", color: "#2c3d5c", trim: "#51678c", shirt: "#ece9e0", accent: "#e6cd8e" },
        hair: { color: "#2a2f38", sheen: "#8b93a1", style: "sidepart" },
        glasses: {},
        age: "older",
        expression: "firm",
      }}
    />
  ),
  home: (
    <PaintedPortrait
      id="home"
      spec={{
        skin: ["#c39c74", "#896248", "#e0bd97"],
        bg: ["#33202a", "#170f14", "#5e3a48"],
        attire: { kind: "suit", color: "#2a2632", trim: "#4a4458", shirt: "#d8d3c8" },
        hijab: { color: "#6e2f3a", shade: "#451d26", pin: "#e6cd8e" },
        age: "older",
        expression: "firm",
        earrings: false,
      }}
    />
  ),
  borneoMinister: (
    <PaintedPortrait
      id="borneoMinister"
      spec={{
        skin: ["#a9744c", "#74502f", "#cc9871"],
        bg: ["#1c2e1f", "#0f1812", "#31563a"],
        attire: { kind: "open", color: "#223026", trim: "#3f5a48", shirt: "#c6cdc2" },
        hair: { color: "#262b30", sheen: "#6e747c", style: "curls" },
        age: "older",
        expression: "firm",
      }}
    />
  ),
  gpsPremier: (
    <PaintedPortrait
      id="gpsPremier"
      spec={{
        skin: ["#bd8a5e", "#835a38", "#d9ad82"],
        bg: ["#2e2417", "#171208", "#5e4c2a"],
        attire: { kind: "suit", color: "#2b2a24", trim: "#4e4c40", shirt: "#e4ded0", accent: "#c9a96a" },
        hair: { color: "#8a8a84", sheen: "#bdbdb6", style: "combed" },
        glasses: { heavy: true },
        age: "older",
        expression: "firm",
        earrings: false,
      }}
    />
  ),
  bnChair: (
    <PaintedPortrait
      id="bnChair"
      spec={{
        skin: ["#bd9268", "#84603e", "#dfb98e"],
        bg: ["#2c2416", "#15100a", "#5a4826"],
        attire: { kind: "mandarin", color: "#1f232c", trim: "#c9a96a", shirt: "#d9d2c0", accent: "#e6cd8e" },
        hair: { color: "#e5e2da", sheen: "#f7f5ef", style: "white" },
        songkok: "#10141d",
        facial: "moustache-grey",
        age: "older",
        expression: "set",
      }}
    />
  ),
  oppositionLeader: (
    <PaintedPortrait
      id="oppositionLeader"
      spec={{
        skin: ["#c39a70", "#8a6244", "#dfba92"],
        bg: ["#341d20", "#18100f", "#66393c"],
        attire: { kind: "mandarin", color: "#23272e", trim: "#3c434f", shirt: "#c9cdd4", accent: "#8a474e" },
        hair: { color: "#31353d", sheen: "#7d8492", style: "short" },
        kopiah: "#d9d2c0",
        facial: "beard",
        expression: "set",
      }}
    />
  ),
  generic: (
    <PaintedPortrait
      id="generic"
      spec={{
        skin: ["#3a4350", "#2a303b", "#4d5866"],
        bg: ["#161b23", "#0e1218", "#242c38"],
        attire: { kind: "suit", color: "#1c222c", trim: "#313a48", shirt: "#262e3a" },
        expression: "firm",
      }}
    />
  ),
};

/**
 * The painted portrait for a character id, sized to fill its Avatar plate.
 * Callers pass `portraitArtId(name) ?? "generic"` so an unknown speaker
 * renders the anonymous bust instead of bare initials.
 */
export function PortraitArt({ id }: { id: string }) {
  const art = ART[id];
  if (!art) return null;
  return art;
}
