# V2 Plan — pixel-art iPad edition

Companion to `V2_AUDIT.md`. Nine phases, each ends with: `tsc` clean, `npm test` (all existing +
new checks) green, `npm run build` green, zero console errors, six-viewport screenshots, a pre-v2
save loading and advancing a month, EN/MS parity, contrast audit PASS. One commit per phase,
tagged `v2-phase-N`, each revertible. **Stop after each phase and wait for approval.**

Skill loading per phase (router verdict: custom web engine — React/TS/Vite; discipline skills
map onto project APIs): P2 `dialogue-systems` + `save-systems`; P3 `game-ui-ux`; P4
`create-game-assets` + `dialogue-systems`; P5/P6 `create-game-assets` + `game-feel`; P7
`dialogue-systems` + `game-docs`; P8/P9 `performance-optimization` + `game-ui-ux`.

---

## Phase 1 — Step 0 (this step)

Deliverables: `V2_AUDIT.md`, `V2_PLAN.md`, decision list D-06…D-11, package.json duplicate-key
fix. No other code.

## Phase 2 — Engine foundations (no visuals)

Files: NEW `src/engine/dialogue.ts` (graph types + validator + runner), NEW
`src/data/dialogue/` (legacy adapter + fixtures), `src/engine/turn-flow.ts` (mount the runner),
`src/types/game.ts` (optional v2 fields), `src/services/save-service.ts` (`migrateSave` v1→v2),
NEW `src/data/cast-v2.ts` (supporting cast), `scripts/run-selfcheck.ts` (+5 checks),
`src/types/lang.ts` (relocate `Lang`; engine drops the i18n/store type import).

- Dialogue node graph: speakers by character ID, per-line expression, EN/MS text keys, conditions
  (stats/flags/relationships/prior decisions), choices with `Effect[]` (existing type +
  `applyEffects`), locked choices with visible reason, goto/end nodes, flags.
- Legacy adapter converts every `GameEventDef` to a graph → all 15 events play unchanged.
- Save v2: additive optional fields (`flags: Record<string, boolean>`, `policy`, `parliament`,
  `cabinetState`, `budget`, `avatar`, `relationships?` unchanged), `SAVE_VERSION = 2`,
  `migrateSave` v1→v2, v1 fixture kept in self-checks.
- New self-checks: graph validator (dead ends/unreachable/missing keys), EN/MS key parity,
  legacy-adapter equivalence (same options and effects as the raw event), v1→v2 migration,
  12-month playthrough through the new runner.

## Phase 3 — iPad shell and app re-skin

Files: NEW `src/components/ipad/IPadFrame.tsx`, `HomeScreen.tsx`, `StatusBar.tsx`, `Dock.tsx`,
`NotificationBanner.tsx`; `src/layouts/GameLayout.tsx` (frame + routing shell); re-tokenise the
17 screens as apps (wrap + tokens, no logic rewrites); `src/styles/index.css` (iPad tokens);
`scripts/audit-contrast.mjs` (+ new pairs); `src/data/art/pixel` icons via `build-app-icons.mjs`;
NEW `/game/messages` shell (adviser threads land in Phase 7 content); notifications wired to the
news wire / crisis queue (ARIA live). App transitions ≤300ms, instant under reduced motion.

## Phase 4 — Characters and dialogue UI

Files: extend `src/data/pixel-portraits.ts` (shared spec/palette) + NEW
`scripts/build-sprites.mjs` → `public/art/pixel/sprites/` (10 characters × neutral/concerned/
pleased/stern × idle 2f + blink + walk 4f, 48×64); `src/data/asset-manifest.ts` + all files
registered; `src/components/game/CharacterSprite.tsx` (sprite states); `src/features/narrative/`
(dialogue UI: large bust, nameplate + PartyFlag, locked-choice chips, toasts);
`src/pages/NewGame.tsx` (PM avatar customisation → optional state fields).

## Phase 5 — PM Office

Files: `scripts/build-pixel-plate.mjs` (plate v2, layered exports), NEW layered plate exports
(window/skyline/day-night/weather, fan, steam, flag, clock, file stack, orchid, newspapers,
phone badge, PM desk sprite, visitor sprites); `src/pages/Office.tsx` (animation + state-reactive
props + Policy/Budget hotspots per D-09); hotspot floor restored (44px on touch, art-true on
pointer); phones keep the grid fallback.

## Phase 6 — Map

Files: `scripts/extract-geo.mjs` (+admin-1 source, provenance note), `src/data/geo-paths.ts`
(state polygons), NEW `scripts/build-map-plate.mjs` (build-time terrain plate: banded relief,
rivers, coast halo, landmarks), `src/components/geo/MalaysiaMap.tsx` (shape hit-testing off a
mask, data layers, bottom-sheet card, pinch/pan, keyboard), NEW ambient animation layer (stops
under reduced motion).

## Phase 7 — Policy, Parliament, Budget, Cabinet apps and endings

Files: NEW `src/engine/policy.ts`, `parliament.ts`, `budget.ts`, `cabinet.ts` (pure TS);
NEW routes `/game/policy`, `/game/budget`, `/game/press` (D-09) + pages; Parliament game UI
(bills/votes/defection/confidence/supply with visible arithmetic); cabinet appointments +
reshuffles; budget sliders; endings classifier + epilogue screens; content scaffolding for the
Phase 8 pass.

## Phase 8 — Content pass

Files: `src/data/events/` (+20 branching events on the graph), `src/data/dialogue/` (advisor
arcs ×3), endings content, EN/MS for every string (parity check gates the phase). The 15
originals stay byte-identical.

## Phase 9 — Polish, performance, accessibility, regression

Full sweep: 60fps budget on a mid-range phone profile, lazy-load heavy scenes, keep the Recharts
split, keyboard sweep, reduced motion, contrast, save matrix (v1 fixture, v2, cloud-off), both
languages, six-viewports. Docs sync (`ASSET_MANIFEST`, `DESIGN_SYSTEM`, `ART_BIBLE`, AGENTS.md
gate commands, decision log).

---

## Frozen-contract changes (proposed)

| # | Contract | Change | Migration | Rollback |
|---|---|---|---|---|
| C-1 | `GameState` shape | +optional `flags`, `policy`, `parliament`, `cabinetState`, `budget`, `avatar` | `SAVE_VERSION 2`; `migrateSave` fills defaults; v1 fixture in self-checks | Revert commit; v2 saves keep loading (extra fields ignored by v1 code paths) but lose new systems — acceptable, local-only |
| C-2 | `SAVE_VERSION` 1 → 2 | Bump + migrate | `migrateSave` handles `version < 2` and missing optional fields | Revert; `SAVE_VERSION 1` unchanged |
| C-3 | Event narration model | Events gain an *optional* `graph` (dialogue node graph); legacy briefing/dialogue/options remain the fallback path via adapter | Adapter equivalence self-check proves identical options/effects | Revert commit; events fall back to the legacy path (both already shipped) |
| C-4 | `DialogueLine.speaker` (display name in *data*) | New graph format keys speakers by character ID; legacy data keeps names and is bridged | Legacy adapter maps name → ID via the existing `ART_BY_NAME`/cast registry | Revert; adapter removed with the graph |
| C-5 | Routes 22 → +3 (`policy`, `budget`, `press`) | Additive only; `/game/press` gated on the Press Room decision (D-03 chain) | None (additive); nav + office hotspot gain entries | Remove the three route entries |
| C-6 | Character roster 10 → +9 supporting cast | NEW additive data file with IDs prefixed `sup-`; relationships default to 50 | Migration fills `relationships` for new IDs | Delete the file; engine treats missing IDs as absent |
| C-7 | Asset manifest | +sprites, +app icons, +map plate, +iPad tokens | `check:assets` extended (all files must exist) | Revert manifest; files are inert |
| C-8 | `Lang` type location | Move `Lang` to `src/types/lang.ts`; i18n store re-exports | Type-only move; zero runtime change | Revert import paths |
| C-9 | Calendar | +chapter extension (2–3) and ending turns, additive to `chapterOf`/anchors | Anchors unchanged (Nov 2026, Oct budget) | Revert calendar commit |
| C-10 | Hotspot floor | None at present → pointer-aware 44px floor | Touch: ≥44px; pointer: art-true + focus ring | Revert component edit |

Never touched: the 15 event IDs, option IDs a–d + effects, 10 character IDs, 7 coalition IDs,
16 state IDs, seat arithmetic (222/112/140), storage keys, `engine/` runtime purity, Supabase
schema, local no-env mode, the existing 8 self-checks (only additions).

---

## Decisions needed (with recommendation)

- **D-06 Pixel font** — allow ONE pixel font (Silkscreen via @fontsource) for iPad chrome labels
  and numerals only; narrative stays Fraunces, body ≥14px. **Recommend: allow.** It is the single
  strongest "pixel iPad" signal; scoping it to chrome keeps the document layer crisp and the
  print minimums intact. Adds ~30 kB woff2, self-hosted, no network dependency.
- **D-07 Office as live wallpaper** — the Office plate becomes the iPad's wallpaper with app
  icons floating over it (home screen = the office), with a "room view" toggle returning to the
  current full-bleed hub. **Recommend: yes.** It resolves the two-homes problem (menu vs office)
  in the player's favour, reuses the plate everywhere, and the toggle preserves the v1 feel.
- **D-08 Save v2** — additive optional fields + `SAVE_VERSION 2` + `migrateSave`. **Recommend:
  approve as specified.** `migrateSave` already exists; the v1 fixture self-check makes the
  promise testable.
- **D-09 New routes** — `/game/policy`, `/game/budget`, `/game/press` (additive). **Recommend:
  approve, with Press at the end of Phase 7** so the room plate and content exist before the
  route ships empty.
- **D-10 Playwright as devDependency** — for the per-phase screenshot matrix and the regression
  sweep. **Recommend: approve.** v1's hand-driven iframe harness proved the need three times;
  Playwright is dev-only (never shipped), replaces that harness, and makes "six-viewport
  screenshots" a reproducible command instead of a bespoke script each phase.
- **D-11 Natural Earth admin-1 polygons** — add state shapes (public domain; provenance recorded
  in `docs/ASSET_MANIFEST.md` and the geo source header). **Recommend: approve.** It is the only
  way to satisfy "all 13 states and 3 territories are real tappable shapes" without inventing
  geometry, and the licence permits it outright.

All six decisions are logged in the decision table above where they touch a frozen contract
(C-1/C-2 = D-08, C-3/C-4 = dialogue, C-5 = D-09, C-6 = cast, C-7 = D-10/D-11 assets, C-10 =
hotspot floor).

## Decision log (v2, approved this step)

**All six approved as recommended (2026-11-25):** D-06 pixel font allowed (chrome only);
D-07 office-as-wallpaper with room-view toggle; D-08 save v2 + migration; D-09 three additive
routes (press last); D-10 Playwright devDependency; D-11 admin-1 polygons with recorded
provenance. See `IMPLEMENTATION_PLAN.md` §12 for the formal D-06…D-11 entries.
