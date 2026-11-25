# V2 Audit — "Malaysia: The Mandate" as a pixel-art iPad game

Date: 2026-11-25. Method: read AGENTS.md, docs/ (all six Phase 1 documents), the v2 directive,
and the current tree; verified every baseline claim against the code. No feature code was written
(the one exception, ordered by the prompt itself: the duplicate `build` key in package.json,
fixed and re-verified — see §2.8).

---

## 1. Baseline verification

| Claim in the directive | Verified? | Note |
|---|---|---|
| `tsc --noEmit` clean | ✔ | ran during this audit |
| `npm test` 8/8 | ✔ | self-check suite (`scripts/run-selfcheck.ts`) |
| Build green, main chunk 854 kB | ✔ | exit 0; warning is the known Recharts split |
| 15 events, briefing + dialogue + a–d options | ✔ | `src/data/events/chapter1.ts` (9) + `recurring.ts` (6) |
| 12-month playthrough | ✔ | self-check #2 |
| Seeded RNG (mulberry32) | ✔ | `src/engine/rng.ts` |
| 10 fictional characters | ✔ | `src/data/characters.ts` |
| 64×64 procedural busts | ✔ | `src/data/pixel-portraits.ts` (refined in the art pass) |
| Expression rules in `features/narrative/cast.ts` | ✔ | neutral/concerned/pleased/stern, rule-driven |
| Casting "matches speakers by display name" | ◑ | **partially stale**: `cast.ts` already resolves a `characterId` per speaker and `Avatar` accepts `artId`; but `DialogueLine.speaker` in event *data* is still a display-name string, so the engine's data model is name-keyed. The v2 dialogue format (A) makes ID-keying the rule; the legacy adapter bridges the old data. |
| Office plate 480×253 via `build-pixel-plate.mjs` | ✔ | rebuilt and committed |
| 13 hotspots in 1440×760 space | ✔ | `src/pages/Office.tsx` |
| Hotspot floor "is 40×32" | ✖ | **stale, and worse than stated**: `InteractiveHotspot` currently has *no* size floor at all (`touch-manipulation` only — removed during the Phase 2 audit because art-anchored rects collided at tablet widths). Phones use the 44px destination grid fallback. v2 must restore a pointer-aware floor (§E). |
| Map over Natural Earth outlines, no state polygons | ✔ | `src/data/geo-paths.ts` + `scripts/extract-geo.mjs`; confirmed admin-1 polygons absent |
| Shell GameLayout + GameHUD + GameNavigation | ✔ | extracted in v1 Phase 4 |
| 17 screens | ✔ | 23 `path=` entries in `App.tsx` (22 routes + `/` redirect) |
| EN/MS i18n, **no automated key-parity check** | ✔ | confirmed: no parity script exists in `scripts/` |
| Paper/Midnight themes; audit-contrast.mjs | ✔ | 18/18 PASS (added in v1 Phase 8) |
| Duplicate `build` key in package.json | ✔ | **fixed in this audit** (kept the full `tsc + check:assets + vite build`; JSON now parses to a single key; build re-run exit 0) |

Other baseline facts checked: `SAVE_VERSION = 1` and `migrateSave()` already exist in
`save-service.ts` (v2 extends them); `engine/` imports only types/data/engine modules (one
compile-time-only `import type { Lang }` from `i18n/store` — no runtime coupling, worth
relocating in v2 for strict purity); `scripts/extract-geo.mjs` exists as the geo pipeline;
storage keys `mtm:*` unchanged.

---

## 2. Gap analysis by directive section

### A. Gameplay — Suzerain-style systems

**Exists:** turn engine with delayed effects (`DelayedEffect`, `delayTurns` on consequences),
calendar anchors (Nov 2026 start, `isBudgetTurn` Oct, `isMonsoonTurn`), government-fall
(`stateIsFallen`), counsel/relationships (`seekCounsel`), seeded RNG, event scheduling
(`schedule: "budget" | "monsoon"`), decision log, 15 linear events.

**Missing:**
- A dialogue **node graph** (current events are a fixed briefing → linear dialogue → options flow;
  no conditions on lines, no gotos, no flags read back by later scenes).
- **Policy dossier** domain (no policy levers/measures state at all).
- **Parliament as a game**: seats exist as static `COALITIONS` data + `governmentSeats()`; there
  are no bills, votes, two-thirds arithmetic, defections, confidence or supply mechanics.
- **Cabinet appointments/reshuffles**: characters are fixed with `cabinet` flags and
  relationships; no appointment state, no faction model.
- **Budget allocation sliders**: `isBudgetTurn` gates two budget *events*; no allocation state.
- **Multiple endings/epilogue**: only `stateIsFallen`; no ending classifier or epilogue.
- **Self-checks**: 8 exist; none cover dialogue graphs, key parity, save migration, or a
  new-system playthrough.
- Engine purity note: `import type { Lang } from "../i18n/store"` (type-only, erased at runtime,
  but couples compile-time to a UI store — relocate the type to `types/` in v2).

### B. iPad shell

**Missing entirely:** `IPadFrame`, home screen with app icons, dock, status bar, app
open/close transitions, notification banners, Messages app, iPad tokens. The 17 screens are
game-page styled (paper cards), not app-styled. No swipe/home gesture. The six-viewport matrix
and reduced-motion policy exist from v1 Phase 8 and carry over.

### C. Characters

**Exists:** 10 IDs + names; 64×64 busts with expressions; portrait chain (raster drop-in → bust →
generic); manifest + `check:assets`.

**Missing:** full-body 48×64 sprites (any state), 2-frame idle, blink, 4-frame walk; a sprite
build pipeline; the supporting cast (9 roles named in the directive); PM avatar customisation at
New Game; the dialogue UI upgrades (large bust + nameplate + PartyFlag, locked-choice chips,
relationship/stat toasts — some exist from v1: nameplate, typewriter, toasts partially).

### D. Map

**Exists:** real geometry + centroid tokens, atlas palette, shape highlight (ground tint),
legend from data, selection files, expanded theatre, keyboard access, both themes.

**Missing:** admin-1 state polygons (the D-11 dependency); per-state hit shapes (hit-testing
today is DOM per token, not per shape); authored pixel terrain (relief, rivers, coast halo);
landmark props; data layers (economy/sentiment/crises/projects as map overlays); bottom-sheet
state card (a dossier exists on Overview, not on the map itself); pinch-zoom/pan; ambient
animation (sea shimmer, ships, planes, cloud shadows, monsoon rain, day/night).

### E. PM Office

**Exists:** authored plate (v1 art pass: drapes, rug, cornice, plant, brass details), 13
hotspots, phones grid fallback, hint text, state file panel.

**Missing:** layering/animation (day/night + weather, ceiling fan, coffee steam, flag sway,
clock tied to the month); state-reactive props (unread-file stack, orchid state, flag furled,
awards, newspapers, phone badge); PM sprite at the desk; visitors walking in; Policy (laptop)
and Budget (ledger) hotspots (depends on D-09 routes); a restored hotspot floor.

### F. Content

**Exists:** 15 events (EN/MS complete, no hard-coded Malay in JSX — MS overrides live in
`ms-events-*.ts` / `ms-world.ts`).

**Missing:** 20+ new branching events on the dialogue graph, 3 advisor arcs, 3 endings beyond
the fall state, chapter extension past the current window (chapter logic is
`chapterOf(turn)`-derived, so extension is additive).

### G. Process

**Exists:** gate commands in AGENTS.md (accurate: `tsc`, `npm test`, `npm run build` — the
latter now includes the asset check), one-commit-per-phase discipline from v1, tag practice
absent (v1 used plain commits; v2 adds `v2-phase-N` tags). Playwright not installed.
Netlify static hosting ✓.

---

## 3. Risks worth naming before planning

1. **GameState surface grows** (policy, parliament, cabinet, budget, avatar, flags). Mitigation:
   all new fields optional with defaults; `SAVE_VERSION 2` + `migrateSave`; v1 fixture check.
2. **SceneStage restyle vs the visual-novel feel**: wrapping the theatre as an "app" must not
   break the beat machine, timings, or `role="dialog"` semantics — restyle is wrap + tokens only.
3. **Admin-1 data volume**: 16 polygons at Natural Earth 1:50m is fine, but rendering them
   pixel-authored needs a build-time plate or the 60fps budget suffers on a mid-range phone.
4. **iPad frame vs six-viewports**: the frame must be full-bleed at 1024×768/768×1024/390×844
   and framed only on desktop, or the matrix regresses.
5. **Content volume (20+ events × EN/MS)** is the long pole; the engine and UI phases must land
   first so content authors write against stable schemas.
6. **i18n parity** is currently enforced by hand; the new parity self-check must land *before*
   the content pass or drift becomes certain.
