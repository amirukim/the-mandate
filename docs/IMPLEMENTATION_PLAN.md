# Implementation Plan — Malaysia: The Mandate

**Status:** Phase 1 deliverable. Phase 1 only produced documentation; **no application code has changed.**
**Directive:** eight phases, each completed and validated before the next. Presentation-only overhaul; the simulation, saves, routes and narrative data are frozen (see `PRESERVATION_CHECKLIST.md`).

---

## 1. Governing rules

1. **No engine work.** `src/engine/**`, `src/types/game.ts`, `src/data/events/**`, `src/services/**` are read-only unless a separately approved migration is proposed.
2. **One phase, one pull request.** No phase begins before the previous phase's gates are green and its screenshots reviewed.
3. **Every phase ends with the same four gates:**

   ```
   npx.cmd tsc --noEmit
   npm.cmd test            → 8/8
   npm.cmd run build
   screenshots at 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844
   ```

   plus zero console errors and a save/load round-trip on a **pre-overhaul save**.
4. **Extraction before addition.** `GameHUD`, `GameNavigation`, `GameScene`, `DialoguePanel`, `DecisionPanel` are extractions of code that already exists in `GameLayout.tsx`, `Office.tsx` and `SceneView.tsx` — not new architectures beside them.
5. **No new runtime dependency** without justification and approval. No Phaser, no game engine, no sprite framework. Framer Motion is sufficient.
6. **Reversible.** Tag each phase (`phase-2`, `phase-3`, …). Every phase must be revertible to the previous tag with no data migration.
7. **Fallbacks compulsory.** Every painted/AI raster asset is optional; the vector or procedural path must still render the screen.

---

## 2. Phase map

| Phase | Theme | Primary files | Depends on |
|---|---|---|---|
| 1 | Audit + design system + art bible + manifest + plan + preservation | `docs/*` | — |
| 2 | Palette foundation + PM Office vertical slice | `styles/index.css`, `data/pixelate.ts`, `pages/Office.tsx`, new `components/game/*` | 1 + D-01 |
| 3 | Dialogue, sprites, decisions, consequences | `features/narrative/SceneView.tsx` (split), `components/game/*`, `data/pixel-portraits.ts` | 2 |
| 4 | HUD, navigation, main menu | `layouts/GameLayout.tsx`, `pages/MainMenu.tsx` | 2 |
| 5 | Overview, Parliament, Economy, Parties, States | `pages/Overview.tsx`, `Parliament.tsx`, `Economy.tsx`, `Parties.tsx`, `FederalState.tsx`, `components/geo/*` | 3 |
| 6 | Cabinet, Diplomacy, Security + rooms | `pages/Cabinet.tsx`, `Diplomacy.tsx`, `Security.tsx`, new environments | 5 |
| 7 | News, documents, history, archives | `pages/News.tsx`, `History.tsx`, `components/game/NewspaperArticle.tsx`, new `DocumentViewer` | 4 |
| 8 | Responsive, performance, accessibility, regression | all | 2–7 |

---

## 3. Phase 1 — this phase (complete on approval)

**Deliverables:** `DESIGN_SYSTEM.md`, `ART_BIBLE.md`, `ASSET_MANIFEST.md`, `ARCHITECTURE_AUDIT.md`, `IMPLEMENTATION_PLAN.md`, `PRESERVATION_CHECKLIST.md`.

**Exit criteria:** user reviews the audit, accepts or amends decision D-01 (palette), and approves M1.

**Explicitly not done:** no token changes, no component extraction, no new art files, no dependency changes.

---

## 4. Recommended first implementation milestone — M1 "The Office, end to end"

Scope = **Phase 2**. This is the smallest slice that proves every part of the new pipeline on the screen the player sees first.

### 4.1 Workstream A — palette foundation (no structural change)

| Step | Change | Files |
|---|---|---|
| A1 | Apply canonical tokens (Paper + Midnight), keeping existing variable names | `styles/index.css` |
| A2 | Fix the stale pre-paint script and `theme-color` meta | `index.html` |
| A3 | Sweep hard-coded hexes in shared chrome: HUD, drawer, floor bar, stage scope, map theatre shell, majority line, skyline, flag chips exception list | `GameLayout.tsx`, `SceneView.tsx`, `MonthTransition.tsx`, `MapTheatre.tsx`, `ParliamentChart.tsx`, `MainMenu.tsx` |
| A4 | Keep real-world flag colours literal (documented exception) | `Diplomacy.tsx`, flag art |
| A5 | Remove duplicated CSS imports | `styles/index.css:1–7` |

**Exit:** `grep` for six-digit hexes returns only documented exceptions; both schemes screenshot-verified; contrast pairs match `DESIGN_SYSTEM.md` §2.4.

### 4.2 Workstream B — scene component family (extraction)

| Component | Responsibility | Extracted from |
|---|---|---|
| `GameScene` | Full-bleed scene frame: aspect wrapper, art layering, scrims, safe zones, `aria-label` | `Office.tsx:85–155`, mastheads in `Parliament/Economy/Security` |
| `SceneBackground` | Chooses authored pixel plate → painted drop-in → vector fallback; applies `art-warm` only to legacy vectors | `PixelScene` + `PaintedScene` usage |
| `InteractiveHotspot` | Percentage-positioned button over an object: label, tooltip, focus ring, badge, disabled reason, 44 px floor | `Office.tsx:104–154` |
| `SceneLegend` | Optional hint line / dateline / status strip | `Office.tsx:94–101` |

`PixelScene` and `PaintedScene` remain as low-level helpers. No duplicate raster logic.

**Exit:** `Office.tsx` contains no inline hotspot geometry beyond the data table; keyboard tab order unchanged; screen-reader labels identical or better.

### 4.3 Workstream C — authored office plate

- Produce `public/art/pixel/env-office-hub.png` at **480×253** per `ART_BIBLE.md` §5.1 (authored pixels, ≤24 colours, left key light, calm lower-right).
- Extend `SceneBackground` with an authored-pixel branch (`/art/pixel/<id>.png` used directly, no rasterisation).
- Re-anchor the 13 hotspots against the new plate, verify each visually.
- Keep `public/art/scene-hub.svg` as fallback until the plate is proven; do not delete it in this phase.
- Optional: `env-office-hub-night.png`; if absent, the day plate plus a Midnight scrim is acceptable.

**Exit:** screenshots at all six widths; every hotspot lands on its object; no blur; no 404.

### 4.4 Workstream D — asset manifest seed

Create `src/data/asset-manifest.ts` with the schema from `ASSET_MANIFEST.md` §7 and a `scripts/check-assets.ts` validator (existence + dimensions + ID uniqueness). Wire it into `npm run test` **only if** it cannot break the 8/8 self-check contract; otherwise run it as a separate script.

### 4.5 M1 definition of done

- [ ] Canonical palette live in both schemes; documented hex exceptions only.
- [ ] `index.html` no longer references `theme-paper` or the old theme colour.
- [ ] `GameScene` / `SceneBackground` / `InteractiveHotspot` in use on the Office screen.
- [ ] Authored 480×253 pixel office plate shipped with the original SVG as fallback.
- [ ] 13 hotspots verified; 44 px touch floor met.
- [ ] Asset manifest + validator committed.
- [ ] `tsc` clean, 8/8, build green, zero console errors.
- [ ] Six-viewport screenshots reviewed.
- [ ] Pre-overhaul save loads and a month advances.
- [ ] Before/after visual comparison sent to the user.

**Not in M1:** sprites, dialogue rewrite, HUD/nav extraction, map changes, other environments.

---

## 5. Phase 3 — Narrative (Mode B)

**Goal:** make scenes play like a visual novel without touching the turn loop.

1. Split `SceneView.tsx` into:
   - `SceneStage` — portal, keyboard, letterbox, backdrop, reduced motion.
   - `BriefingPanel` — file sheet, drop cap, cast line.
   - `DialoguePanel` — speaker plate, typewriter, `Space`/`Enter`, screen-reader copy.
   - `DecisionPanel` — numbered options, detail, "no undo", selection pause.
   - `ConsequencePanel` — stamp, notes, wire cards, continue.
2. `CharacterSprite` — swaps expression frames on speaker change; portrait column becomes a sprite-plus-plate composition; hides below 640 px exactly as today.
3. Casting by **character ID**: map display names to IDs once (helpers in `i18n/data.ts` or a new presentation-only `cast.ts`), so art lookup never depends on a mutable name.
4. Expression selection rules: default neutral; `concerned` on negative consequence notes; `pleased` on positive; `stern` on refusals/warnings; never random.
5. Preserve: beat order, typewriter timing (2 chars / 24 ms, instant under reduced motion), decision delay (260 ms / 120 ms reduced), wire markup, keyboard handling, `role="dialog"` semantics.

**Exit:** every one of the 15 events plays to the wire in both languages; a 12-month playthrough passes; portraits never blank; no layout shift when panels swap.

---

## 6. Phase 4 — HUD, navigation, menu (shell)

1. Extract `GameHUD` (date, chapter, approval, coalition, seats, queue badge) and `GameNavigation` (drawer sections, active state, exit) from `GameLayout.tsx`.
2. Replace the canton bar with the canonical identity: Deep Navy bar on Paper, Midnight bar on Midnight; antique-gold rule; the real Jalur ribbon is **removed from chrome** if D-01 is accepted (flag belongs in the world, not the toolbar) — or retained as a 2 px ribbon if the user prefers continuity.
3. Main menu: authored 480×200 key art, logo lockup, one accent rule, five quiet items. Remove the hard-coded skyline SVG or convert it to a pixel prop.
4. Scene-cut transition retuned to Midnight; no flash on route change.
5. Keep all `aria` labels, focus order, offline notice, Escape handling, and the 44 px floor.

**Exit:** HUD reads correctly at 390 px (no collision between date and readouts); drawer traps focus and restores it; menu key art crisp at 1920 and 390.

---

## 7. Phase 5 — Management screens (Mode C)

1. **Overview:** map plate retained, state tokens gain shape-level hover/selection fills; dossier panel spacing tightened; charts tokenised; map theatre shell aligned to the scheme.
2. **Parliament:** chamber masthead from the new plate; hemicycle untouched arithmetically; majority line tokenised; selected-bloc dossier refined.
3. **Economy:** ledger band retained; four trend panels share one chart frame; masthead rebuilt.
4. **Parties:** standards enlarged to a card header; no layout invention; text-safe labels.
5. **States:** add map entry (reuse `MalaysiaMap`) beside the region list, or a region strip; preserve all 16 data rows and Malay copy.
6. **Shared:** `PoliticalIndicators` component for the recurring approval/coalition/opposition/integrity cluster, so four pages stop re-implementing it.

**Exit:** no chart uses a hard-coded colour; party colours never carry text alone; all 16 states reachable by keyboard; map works in both schemes.

---

## 8. Phase 6 — Cabinet, Diplomacy, Security and the missing rooms

1. Cabinet becomes a room: environment header with hotspots for the cabinet table, the Borneo file, the coalition bench; the existing roster remains below as the dossier (no data loss).
2. Diplomacy: region map restyled to the atlas language; flag chips kept as real flags; six dials unchanged.
3. Security: ops room rebuilt; six domains unchanged.
4. **New venues (approval required):** Cabinet Room, Meeting Room, Press Room. Each needs an entry point; Press Room likely needs a route (`/game/press`) — propose before building.
5. `SceneKey` extension: `sceneKeyFor()` currently maps press/cabinet/meeting to `chamber`. Adding keys is a **presentation** change but affects the art contract; document in the manifest.

**Exit:** every directive Mode A venue is reachable from the Office; no route removal; Malay copy added for any new label.

---

## 9. Phase 7 — News, documents, archives

1. `DocumentViewer` — one component for a sheet of paper at desk scale (briefing, article, archive record), with paper texture, rules, and crisp type.
2. News front page: mastheads, columns, lead hierarchy refined; keep all copy and outlet voices.
3. History/archives: decision log as a bound record, filterable by chapter; no data change.
4. Wire cards in the theatre reuse the same typographic sheet.
5. Print minimums: 14 px body, 4.5:1 contrast on cream, no pixel fonts.

**Exit:** long text remains crisp at every zoom; newspaper sheets keep their own token scope; no clipped columns on 390 px.

---

## 10. Phase 8 — Responsive, performance, accessibility, regression

1. Six-viewport matrix for every screen; fix collisions, overflow and tap targets.
2. Performance: measure raster cost; move authored plates off the main thread or to build time; lazy-load heavy scenes; keep the Recharts split.
3. Accessibility: full keyboard sweep, focus restoration, reduced motion, contrast audit against §2.4, `lang` attributes, screen-reader pass on the theatre and map.
4. Regression: 12-month playthrough, government-fall path, save/load (local + cloud conflict), import/export, both languages, both themes.
5. Remove superseded assets only after a phase has shipped and proven the replacement.

**Exit:** the directive's final product goal demonstrated on a clean profile: no console errors, no 404s, no layout break at any required width.

---

## 11. Effort shape (relative, not calendar)

| Phase | Size | Dominant cost |
|---|---|---|
| 2 (M1) | L | Authoring the office plate + hotspot verification |
| 3 | L | SceneView split + expression art |
| 4 | M | Shell extraction + menu art |
| 5 | L | Map interaction + five screens |
| 6 | XL | Three new environments + two screen rebuilds |
| 7 | M | Typography refinement, low structural risk |
| 8 | L | Breadth of regression testing |

The critical path is **art production**, not code. Code extraction is predictable; each environment plate is the item most likely to slip.

---

## 12. Decision log

| ID | Decision | Status |
|---|---|---|
| D-01 | Palette: directive Midnight/Warm Paper/Antique Gold/Burgundy replaces shipped Jalur chrome; true flag colours remain in-world only | **Resolved (Option A)** — directive palette is canonical |
| D-02 | Hub coordinate space stays 1440×760 (percentages) rather than migrating to 480×253 | **Resolved** — kept; the 480×253 plate renders at 3× into the same space |
| D-03 | Press Room needs a new `/game/press` route | **Resolved** — deferred to Phase 6, as planned |
| D-04 | Jalur ribbon in the HUD: remove (world-only flag) vs retain 2 px | **Resolved** — HUD carries a 2px antique-gold rule; flag stays world-only (menu lapel, room standard) |
| D-05 | Manifest validator joins `npm test` or ships as `npm run check:assets` | **Resolved** — `check:assets` stays standalone and also runs inside `npm run build` (engine self-check untouched) |
| D-06 | Pixel font for iPad chrome (Silkscreen via @fontsource), labels/numerals only | **Resolved (v2)** — approved; narrative stays Fraunces, body ≥ 14px |
| D-07 | Office plate doubles as the iPad home-screen wallpaper | **Resolved (v2)** — approved, with a room-view toggle back to the full-bleed hub |
| D-08 | Save v2: additive optional fields, `SAVE_VERSION 2`, `migrateSave` v1→v2 | **Resolved (v2)** — approved; v1 fixture stays in the self-checks |
| D-09 | New additive routes `/game/policy`, `/game/budget`, `/game/press` | **Resolved (v2)** — approved; policy/budget land with their apps, press ships last with content |
| D-10 | Playwright as a devDependency for screenshots | **Resolved (v2)** — approved; dev-only, never shipped |
| D-11 | Natural Earth admin-1 state polygons | **Resolved (v2)** - approved; public domain, provenance recorded in the manifest and geo source |
| D-16 | Sprite canvas 48x64 -> 64x96, busts 96x96 later; integer display scales only (>= 3x) | **Approved (v3a)** - faces need the room; PixelSprite quantises |
| D-17 | Layered paper-doll generator (body/clothing/head/hair-headwear/face/props) as the single spec source for bust + sprite + portrait | **Approved (v3a)** - variety becomes data, silhouettes checkable |
| D-18 | Six expressions (neutral, concerned, pleased, stern, weary, surprised) with a >= 3% non-transparent-pixel delta gate vs neutral | **Approved (v3a)** |
| D-19 | Five body types (slim, average, broad, tall, heavy) + older-stoop variant, with a pairwise silhouette gate: IoU < 0.8 across body classes, < 0.9 within a class (same-class characters differentiate by stance, height jitter, hair and headwear) | **Approved (v3a)** |
| D-20 | Accurate culture wardrobe (tudung/hijab draped scarf, songkok, kopiah, batik, kebaya, baju Melayu, sherwani, sarong) with per-character signature colours | **Approved (v3a)** - phase 3 |
| D-21 | Web Audio sound kit, synthesised, muted until first gesture, silent under reduced motion | **Approved (v3a)** - phase 4 |
| D-22 | Playwright (existing devDependency, D-10) as the before/after screenshot tool | **Approved (v3a)** |

---

## 13. Approval checkpoints

1. **Now:** accept Phase 1 documents; rule on D-01.
2. **Before Phase 2 code:** confirm M1 scope and that authored pixel art is to be produced in-house (AI generation is currently unavailable).
3. **After M1:** review the before/after office screenshots; then authorise Phase 3.
4. **Before Phase 6:** approve the new venues/routes (D-03).

---

## 14. Status (updated at the end of Phase 8)

| Phase | Status | Evidence |
|---|---|---|
| 1 | Complete | `docs/*` committed with the resolved decision log |
| 2 (M1) | Complete | office plate + scene family + manifest/validator (`env-office-hub.png` byte-reproducible) |
| 3 | Complete | theatre split, cast by id, expression frames, paper wire |
| 4 | Complete | shell extraction, drawer focus trap, 480×200 menu key art |
| 5 | Complete | management screens, map highlight, PoliticalIndicators |
| 6 | Complete | cabinet/diplomacy/security rooms; press route stays deferred (D-03) |
| 7 | Complete | DocumentViewer, news front page, bound decision record |
| 8 | Complete | six-viewport audit (0 overflow on 13 routes), tap-target fixes, contrast audit script (18/18 PASS, one `--chrome-bad` tone corrected), `lang` sync, reduced-motion gap closed, save roundtrip verified |
5. **Before Phase 8:** freeze art scope; only fixes.

No checkpoint may be skipped by starting the next phase "in parallel": parallel art production is allowed, parallel *merges* are not.
