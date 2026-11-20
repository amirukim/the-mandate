import type { ReactNode } from "react";

/**
 * Character portrait registry.
 *
 * Three layers, tried in order by Avatar / CharacterPortrait:
 *   1. Painted assets — PORTRAITS maps a CHARACTER ID to a file under
 *      public/portraits/. The artwork does not ship yet; exact requirements
 *      are documented in public/portraits/README.md. Dropping a file in and
 *      registering its id here changes the whole app — no component edits.
 *   2. Engraved portraits — banknote-style line art below, one per fictional
 *      character. This is the shipped presentation, not a placeholder.
 *   3. Generic bust — speakers with no registered art get an anonymous
 *      silhouette, never bare initials.
 * Every character is fictional; no asset may depict a real politician.
 */

/** Character ID → painted portrait file. Keyed by ID, not display name. */
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

export function portraitArtId(name: string): string | null {
  return ART_BY_NAME[name] ?? null;
}

/* ------------------------------------------------------------------ */
/* Engraving primitives                                                */
/* ------------------------------------------------------------------ */

const LINE = "#d9d2c0";

/** Dark plate + soft highlight, the base every engraving sits on. */
function Plate({ children }: { children: ReactNode }) {
  return (
    <>
      <rect width="64" height="64" fill="#141a23" />
      <circle cx="32" cy="24" r="23" fill="#1a2230" />
      {children}
    </>
  );
}

/** Shoulders, neck and head — the shared bust. */
function Bust({ attire = "suit" }: { attire?: "suit" | "open" | "mandarin" }) {
  return (
    <g stroke={LINE} strokeOpacity="0.7" strokeWidth="0.9">
      <path d="M9 64c2-13 11-19 23-19s21 6 23 19z" fill="#1e2633" />
      {attire === "suit" && (
        <>
          <path d="M25 46l7 4.5L39 46" fill="none" strokeOpacity="0.5" strokeWidth="0.8" />
          <path d="M32 50.5l-2.4 2.2L32 62l2.4-9.3z" fill="#5d2a31" strokeOpacity="0.45" strokeWidth="0.7" />
        </>
      )}
      {attire === "open" && (
        <>
          <path d="M27 46l5 3.2-6.8 5z" fill="#242e3c" strokeWidth="0.8" />
          <path d="M37 46l-5 3.2 6.8 5z" fill="#242e3c" strokeWidth="0.8" />
        </>
      )}
      {attire === "mandarin" && (
        <g fill="none" strokeOpacity="0.55" strokeWidth="0.8">
          <path d="M28.5 47v7M35.5 47v7" />
          <circle cx="32" cy="50.5" r="0.9" fill={LINE} stroke="none" />
        </g>
      )}
      <path d="M27 37h10v8.5c-2.2 1.6-7.8 1.6-10 0z" fill="#232c3a" />
      <ellipse cx="32" cy="26.5" rx="11" ry="13" fill="#27313f" />
    </g>
  );
}

/** The shared engraved face: minimal lines, no pupils. */
function Face({ older = false, mouth = "firm" }: { older?: boolean; mouth?: "firm" | "set" | "soft" }) {
  return (
    <g fill="none" stroke={LINE} strokeLinecap="round">
      <g strokeOpacity="0.6" strokeWidth="0.85">
        <path d="M26.8 23.4c1-.9 2.6-1 3.8-.4M33.4 23c1.2-.6 2.8-.5 3.8.4" />
        <path d="M27 26.4h3.4M33.6 26.4H37" />
        <path d="M32 26.5v5.2c0 .8-.5 1.3-1.2 1.6" strokeOpacity="0.45" />
      </g>
      {older && (
        <g strokeOpacity="0.3" strokeWidth="0.7">
          <path d="M24.3 31c.9 1.6.9 3.2 0 4.8M39.7 31c-.9 1.6-.9 3.2 0 4.8" />
        </g>
      )}
      {mouth === "firm" && <path d="M28.6 36.2c2.2 1.1 4.6 1.1 6.8 0" strokeOpacity="0.7" strokeWidth="0.9" />}
      {mouth === "set" && <path d="M28.4 36.4h7.2" strokeOpacity="0.75" strokeWidth="1" />}
      {mouth === "soft" && <path d="M28.8 35.8c2 1.5 4.4 1.5 6.4 0" strokeOpacity="0.65" strokeWidth="0.85" />}
    </g>
  );
}

function Glasses() {
  return (
    <g fill="none" stroke={LINE} strokeOpacity="0.8" strokeWidth="0.9">
      <rect x="24.2" y="23.8" width="6.8" height="5.2" rx="1.6" />
      <rect x="33" y="23.8" width="6.8" height="5.2" rx="1.6" />
      <path d="M31 25.8h2M24.2 25.2l-3.2-1.1M39.8 25.2l3.2-1.1" strokeOpacity="0.6" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The ten engravings                                                  */
/* ------------------------------------------------------------------ */

const ART: Record<string, ReactNode> = {
  /* Sarah Tan — bob, silk scarf at the collar. */
  chiefOfStaff: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M20.5 21c0-8 5-12.5 11.5-12.5S43.5 13 43.5 21v13.5c0 1.6-2 1.8-2.2.3l-.3-10.3c-2.6-3.4-5.6-4.6-9-4.6s-6.4 1.2-9 4.6l-.3 10.3c-.2 1.5-2.2 1.3-2.2-.3z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.65"
        strokeWidth="0.8"
      />
      <Face mouth="soft" />
      <path d="M28.5 47.5L32 50l3.5-2.5-.6 4h-5.8z" fill="#8a6c1f" stroke={LINE} strokeOpacity="0.4" strokeWidth="0.6" />
    </Plate>
  ),

  /* Azlan Mahmud — receding hair, glasses, Treasury tie. */
  finance: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M20.5 21.5C21 14 25.5 10 32 10s11 4 11.5 11.5c-2.4-3-4.2-4.2-6-4.8-3.6-1.2-7.4-1.2-11 0-1.8.6-3.6 1.8-6 4.8z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
      <Face older mouth="set" />
      <Glasses />
    </Plate>
  ),

  /* Kavitha Rao — long hair, bindi, earrings. */
  economicAdviser: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M20 20c0-8 5-12 12-12s12 4 12 12l.6 21.5c0 2-2.6 2.1-2.8.1l-1-17.6c-2.6-3.2-5.6-4.4-8.8-4.4s-6.2 1.2-8.8 4.4l-1 17.6c-.2 2-2.8 1.9-2.8-.1z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.65"
        strokeWidth="0.8"
      />
      <Face mouth="soft" />
      <circle cx="32" cy="20" r="0.9" fill="#c9a96a" />
      <circle cx="20.8" cy="30" r="0.9" fill="#c9a96a" />
      <circle cx="43.2" cy="30" r="0.9" fill="#c9a96a" />
    </Plate>
  ),

  /* Faridah Yusof — crisp tudung, firm mouth. */
  nationalSecurity: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M13 46c0-26 8-38 19-38s19 12 19 38l-4.4-.2c0-19.6-5.8-31.3-14.6-31.3S17.4 26.2 17.4 45.8z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.7"
        strokeWidth="0.9"
      />
      <g fill="none" stroke={LINE} strokeOpacity="0.3" strokeWidth="0.7">
        <path d="M15.5 40c3-1.5 5-2 7-2.2M48.5 40c-3-1.5-5-2-7-2.2" />
      </g>
      <Face mouth="set" />
    </Plate>
  ),

  /* Lim Wei Sheng — side part, thin glasses. */
  foreign: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M20.5 22C21 13 26 8.5 32 8.5S43 13 43.5 22c-2.8-4.4-6-6-10.8-6-4.5 0-8 1.4-12.2 6z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.65"
        strokeWidth="0.8"
      />
      <path d="M28.4 9.3c-1.2 1.8-1.7 3.6-1.8 5.6" fill="none" stroke={LINE} strokeOpacity="0.45" strokeWidth="0.7" />
      <Face mouth="firm" />
      <Glasses />
    </Plate>
  ),

  /* Norliza Ahmad — softer tudung drape, gold brooch. */
  home: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M12.5 44C12.5 20 20 7.5 32 7.5S51.5 20 51.5 44l-4.6-.2C46.9 24.6 41 13.5 32 13.5S17.1 24.6 17.1 43.8z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.7"
        strokeWidth="0.9"
      />
      <g fill="none" stroke={LINE} strokeOpacity="0.3" strokeWidth="0.7">
        <path d="M14.5 38c4-2 6.5-2.6 9-2.8M49.5 38c-4-2-6.5-2.6-9-2.8" />
      </g>
      <Face mouth="firm" />
      <circle cx="32" cy="45.5" r="1.7" fill="#c9a96a" stroke={LINE} strokeOpacity="0.5" strokeWidth="0.5" />
    </Plate>
  ),

  /* Peter Mojuntin — short curls, open collar. */
  borneoMinister: (
    <Plate>
      <Bust attire="open" />
      <path
        d="M20.5 22c0-7.5 5-12 11.5-12s11.5 4.5 11.5 12c-1.5-2.6-3-3.9-4.5-4.3.5 1.2.5 2.4.2 3.4-1.5-2.7-3.4-4-6-4.2-.4 1.2-1.2 2.2-2.4 2.9-1.2-1.4-2.8-2.2-4.6-2.2-.4 1-.5 2-.2 3-2-.5-3.8-.6-5.5-.6z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
      <Face mouth="firm" />
    </Plate>
  ),

  /* Jonathan Lingga — combed-back grey hair, heavier glasses. */
  gpsPremier: (
    <Plate>
      <Bust attire="suit" />
      <path
        d="M20.5 22C21 13.5 26 9 32 9s11 4.5 11.5 13c-2.4-3-4.4-4.4-6-4.9-3.8-1.3-7.2-1.3-11 0-1.6.5-3.6 1.9-6 4.9z"
        fill="#39424e"
        stroke={LINE}
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
      <Face older mouth="firm" />
      <Glasses />
    </Plate>
  ),

  /* Raja Nordin — songkok, moustache, mandarin collar. */
  bnChair: (
    <Plate>
      <Bust attire="mandarin" />
      <path
        d="M19.5 17.5C21 9.5 26 5.5 32 5.5s11 4 12.5 12l.3 3.2c-8.6 1.6-16.6 1.6-25.6 0z"
        fill="#10151d"
        stroke={LINE}
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
      <Face older mouth="set" />
      <path
        d="M27.3 34.4c1.6 1.3 3.1 1.8 4.7 1.8s3.1-.5 4.7-1.8"
        fill="none"
        stroke={LINE}
        strokeOpacity="0.8"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </Plate>
  ),

  /* Iskandar Rahman — kopiah and full beard, the adversary. */
  oppositionLeader: (
    <Plate>
      <Bust attire="mandarin" />
      <path
        d="M21.5 28c0 10 3.5 16.5 10.5 16.5S42.5 38 42.5 28l2 1.2c.4 9.5-3.8 17.6-12.5 17.6S19.1 38.7 19.5 29.2z"
        fill="#1c2430"
        stroke={LINE}
        strokeOpacity="0.65"
        strokeWidth="0.8"
      />
      <path
        d="M21.5 15.5c1.5-6.5 5.5-10 10.5-10s9 3.5 10.5 10l.3 2.6c-7.2 1.3-13.9 1.3-21.6 0z"
        fill="#9aa3af"
        stroke={LINE}
        strokeOpacity="0.6"
        strokeWidth="0.7"
      />
      <Face mouth="set" />
      <path
        d="M27.2 34.6c1.5 1.1 3 1.6 4.8 1.6s3.3-.5 4.8-1.6"
        fill="none"
        stroke={LINE}
        strokeOpacity="0.7"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Plate>
  ),

  /* Anonymous bust — speakers outside the registry, rendered as a designed
     silhouette rather than bare initials. */
  generic: (
    <Plate>
      <Bust attire="suit" />
      <g fill="none" stroke={LINE} strokeLinecap="round">
        <path d="M26.8 23.4c1-.9 2.6-1 3.8-.4M33.4 23c1.2-.6 2.8-.5 3.8.4" strokeOpacity="0.5" strokeWidth="0.85" />
        <path d="M27 26.4h3.4M33.6 26.4H37" strokeOpacity="0.5" strokeWidth="0.85" />
        <path d="M28.6 36.2c2.2 1.1 4.6 1.1 6.8 0" strokeOpacity="0.6" strokeWidth="0.9" />
      </g>
    </Plate>
  ),
};

/**
 * The engraved portrait for a character id, sized to fill its Avatar plate.
 * Callers pass `portraitArtId(name) ?? "generic"` so an unknown speaker
 * renders the anonymous bust instead of bare initials.
 */
export function PortraitArt({ id }: { id: string }) {
  const art = ART[id];
  if (!art) return null;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="absolute inset-0 h-full w-full">
      {art}
    </svg>
  );
}
