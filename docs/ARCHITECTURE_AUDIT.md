# Architecture Audit — Malaysia: The Mandate

**Status:** Phase 1 deliverable. No application code was changed to produce this document.
**Audited commit:** `2efdd98` (branch `main`, clean working tree at time of audit).
**Method:** full read of `src/`, `public/`, `scripts/`, `supabase/`; route trace from `src/App.tsx`; asset dimensions read from the SVG sources; contrast figures computed with the WCAG 2.1 relative-luminance formula.

---

## 1. Repository facts

| Item | Value |
|---|---|
| Stack | React 19.3, TypeScript 7.0 (`strict`, `noUnusedLocals`, `noUnusedParameters`), Vite 8.3, Tailwind CSS 4.3 (`@theme inline`), Zustand 5, Framer Motion 14, Recharts 3 |
| Backend | Supabase **optional** (`@supabase/supabase-js`); fully playable offline |
| Hosting | Netlify (`netlify.toml`: `npm run build` → `dist`, SPA redirect) |
| Source size | 83 files under `src/` (44 `.tsx`, 38 `.ts`, 1 `.css`), ~13,400 lines |
| Screens | 17 game screens + menu, new campaign, auth (login/register), campaign select |
| Routes | 22 patterns, all in `src/App.tsx` |
| Tests | 8 engine self-checks (`npm run test` → `scripts/run-selfcheck.ts` → `src/engine/selfcheck.ts`) |
| Assets | 7 art SVGs in `public/art/`, 1 favicon; **no raster art shipped**; portrait drop-in folders documented but empty |
| Build output | 3,079 modules; single largest chunk >500 kB (Recharts, pre-existing warning) |

**Gate commands (must stay green in every phase):**

```
npx.cmd tsc --noEmit
npm.cmd test          # 8/8
npm.cmd run build
```

---

## 2. Runtime architecture

```
main.tsx
  └─ App.tsx ── MotionConfig(reducedMotion="user") ── BrowserRouter
       ├─ "/" ─ MainMenu
       ├─ "/new", "/login", "/register", "/campaigns"      (shell pages)
       └─ "/game" ─ RequireCampaign ─ GameLayout ─ <Outlet/>
            ├─ office / briefing / summary
            ├─ overview / cabinet / parliament / economy
            ├─ parties / states / diplomacy / security
            └─ news / history / saves / settings / fallen

Presentation
  styles/index.css  →  CSS custom properties (:root, .theme-night)
                    →  @theme inline (Tailwind colour/font/radius tokens)
                    →  components (Tailwind utilities + var(--token))
                    →  art: PixelScene / PaintedScene / Avatar
Game
  stores/game-store.ts ─ engine/* (pure TS) ─ data/* (events, parties, states)
                       └ services/save-service.ts → localStorage + Supabase
```

The engine (`src/engine/`) is pure TypeScript and knows nothing about React, the DOM or presentation. This is the boundary the overhaul must not cross.

---

## 3. Screen inventory

Mode letters follow the directive: **A** exploration, **B** narrative, **C** political management.

| Route | File | Mode | Primary components | Data read | Current visual state |
|---|---|---|---|---|---|
| `/` | `pages/MainMenu.tsx` | shell | `PixelScene` (menu art), inline `Skyline`, `jalur-stripes` | `loadLocal(0)` | Off-white Jalur menu, pixel key art |
| `/new` | `pages/NewGame.tsx` | shell | `PageHeader`, `Button`, `Panel` | — | Document form |
| `/login`, `/register` | `pages/Auth.tsx` | shell | `AuthShell`, `Button` | `auth-store` | Document panel |
| `/campaigns` | `pages/CampaignSelect.tsx` | shell | `PageHeader`, `Panel` | save-service | Save list |
| `/game/office` | `pages/Office.tsx` | **A** | `PixelScene` hub + 13 inline hotspots, `CharacterPortrait`, `Meter`, `Panel` | `game`, `lastCounsel` | **Hub scene.** Hotspot rectangles hard-coded in 1440×760 art space |
| `/game/briefing` | `pages/Briefing.tsx` | **B** | `SceneView` (portal overlay) | `currentEvent`, `chosen` | Full-viewport dark theatre, beat-by-beat |
| `/game/summary` | `pages/Summary.tsx` | B/C | `Panel`, table, `NewsList`, `MonthTransition` | `lastReport` | Report sheet |
| `/game/overview` | `pages/Overview.tsx` | **C** | `MalaysiaMap`, `MapTheatre`, `TrendChart`, `NewsList`, `Panel`, `Stat`, `Meter` | `game.*` | Map + dossier + charts |
| `/game/cabinet` | `pages/Cabinet.tsx` | C | `CharacterCard` ×10, `PartyFlag`, `Meter` | `CHARACTERS`, `game.characters` | Roster document |
| `/game/parliament` | `pages/Parliament.tsx` | C | `ParliamentChart`, `PixelScene` masthead, `PartyFlag`, `Meter`, `Stat` | `COALITIONS`, `game.politics` | Hemicycle + arithmetic |
| `/game/economy` | `pages/Economy.tsx` | C | 4× `TrendChart`, `Stat` ledger, `PixelScene` masthead | `game.economy`, `game.history` | Treasury masthead + ledger |
| `/game/parties` | `pages/Parties.tsx` | C | `PartyFlag` cards | `COALITIONS` | Party standards grid |
| `/game/states` | `pages/FederalState.tsx` | C | `Meter`, region tabs, inline cards | `STATES`, `game.federal` | Federal relations list (no map) |
| `/game/diplomacy` | `pages/Diplomacy.tsx` | C | `RegionMap`, `FlagChip` (inline SVG), `Meter` | `game.diplomacy` | Region map + dials |
| `/game/security` | `pages/Security.tsx` | C | 6× `Panel` + `Meter`, `PixelScene` masthead | `game.security` | Ops-room masthead |
| `/game/news` | `pages/News.tsx` | C | `FrontPage`, `ArticleView`, `.newspaper` | `game.news` | Print broadsheet |
| `/game/history` | `pages/History.tsx` | C | `PageHeader`, timeline list | `game.decisions` | Decision log |
| `/game/saves` | `pages/Saves.tsx` | shell | `Panel`, slots, import/export | save-service | Slot manager |
| `/game/settings` | `pages/Settings.tsx` | shell | theme/language/body size, fact primer | `ui-store`, `i18n` | Preferences |
| `/game/fallen` | `pages/Fallen.tsx` | B | `PageHeader`, `Panel` | `game` | Government-fall card |

### Route coverage gaps against the directive

The directive names **Cabinet Room, Meeting Room and Press Room** as exploration environments. Today:

- **Cabinet** is a roster page (Mode C), not a room.
- **Press Room** does not exist as a route; press appears only as the News broadsheet and wire cards.
- **Meeting Room** does not exist; conversations happen inside the `SceneView` theatre.

No new routes are required to close this: Cabinet and the News screen can gain an environment header/hotspot layer without touching routing. A Press Room would need a new route and is therefore flagged for approval.

---

## 4. Component inventory and reuse verdict

| Component | Path | What it does | Verdict |
|---|---|---|---|
| `Panel` | `components/ui/Panel.tsx` | Base container, 3 variants (`panel`/`inset`/`bare`), kicker+title chrome | **Keep.** Becomes the document surface inside `GameScene` |
| `Button` | `components/ui/Button.tsx` | 4 variants, 44 px min height | **Keep**; retoken for new palette |
| `PageHeader` | `components/ui/PageHeader.tsx` | Editorial masthead + dense ministry band | **Keep** |
| `Meter` | `components/ui/Meter.tsx` | Ruled indicator, 4 tones, ARIA | **Keep** |
| `Stat` | `components/ui/Stat.tsx` | Figure + month delta | **Keep** |
| `PartyFlag` | `components/ui/PartyFlag.tsx` | Per-coalition invented standard, colour from data | **Keep**; hoist/gold constants need tokenising |
| `Avatar` | `components/ui/Avatar.tsx` | 3-layer portrait resolver (raster → 64×64 pixel bust → generic) | **Keep.** Core of the sprite roadmap |
| `CharacterPortrait` | `components/game/CharacterPortrait.tsx` | ID-keyed wrapper + locale-aware alt text | **Keep** |
| `PixelScene` | `components/game/PixelScene.tsx` | Rasterises any art file to a pixel grid, smooth fallback beneath | **Extend** into `SceneBackground` |
| `PaintedScene` | `components/game/PaintedScene.tsx` | Raster drop-in chain over the vector scene | **Keep** |
| `NewspaperArticle` | `components/game/NewspaperArticle.tsx` | Wire card with outlet voice | **Keep**; print colours are hard-coded |
| `NewsList` | `components/news/NewsList.tsx` | Compact wire rows | **Keep** |
| `MalaysiaMap` | `components/geo/MalaysiaMap.tsx` | Real Natural Earth geometry, static pixel raster + 16 state tokens, expand | **Extend** (state-shape fills, richer tokens) |
| `MapTheatre` | `components/geo/MapTheatre.tsx` | Full-viewport map with floating dossier | **Keep** |
| `RegionMap` | `components/geo/RegionMap.tsx` | ASEAN/neighbour map for diplomacy | **Keep**; shares geometry with the federation map |
| `ParliamentChart` | `components/charts/ParliamentChart.tsx` | 222-seat hemicycle, selectable blocs, majority line | **Keep**; one hard-coded gold |
| `TrendChart` | `components/charts/TrendChart.tsx` | Recharts line with tokens | **Keep** |
| `MonthTransition` | `components/ui/MonthTransition.tsx` | Black interstitial stamp | **Keep**; re-skin to Midnight |
| `SceneView` | `features/narrative/SceneView.tsx` | Monolithic theatre: briefing → typewriter dialogue → decision → wire | **Split** into `GameScene`, `DialoguePanel`, `DecisionPanel`, `CharacterSprite` |
| `GameLayout` | `layouts/GameLayout.tsx` | Viewport frame, HUD readout, drawer nav, scene cut | **Split** into `GameHUD` + `GameNavigation` |
| `usePortalOverlay` | `hooks/usePortalOverlay.ts` | Portal + scroll lock + tab trap + reduced motion | **Keep**; reuse for every full-screen scene |

### Components that do not exist yet

`GameScene`, `SceneBackground` (distinct from the raster helper), `CharacterSprite` (full-body, expression states), `DialoguePanel`, `DecisionPanel`, `InteractiveHotspot`, `GameHUD`, `GameNavigation`, `PoliticalIndicators`, `DocumentViewer`, and a machine-readable asset manifest.

Several of these are **not new concepts**, only new names for inline code: the hotspot logic already lives in `Office.tsx` (lines 40–54, 104–154), the HUD in `GameLayout.tsx` (lines 160–208), the dialogue/decision panels in `SceneView.tsx` (lines 258–384). The plan is extraction, not parallel implementation.

---

## 5. State, persistence and integration map

### `GameState` (`src/types/game.ts`)

`meta`, `turn`, `chapter`, `phase` (`scene` | `summary`), `fallen`, `economy`, `politics`, `social`, `security`, `diplomacy`, `federal`, `characters`, `flags`, `pendingEffects`, `firedEvents`, `queuedEventIds`, `history`, `news`, `decisions`, optional `lastReport`.

Presentation code reads this and **must never write** it. Every mutation lives in `engine/` and is invoked by `stores/game-store.ts`.

### Stores

| Store | File | Persisted? | Notes |
|---|---|---|---|
| Game | `stores/game-store.ts` | No (autosaved to slot 0 by every mutating action) | `game`, `chosen`, `lastReport`, `lastCounsel` |
| Auth | `stores/auth-store.ts` | Session only | Local mode works without Supabase |
| UI | `stores/ui-store.ts` | `mtm:ui:v2` | `theme: "night" \| "paper"`, `bodySize` |
| Locale | `i18n/store.ts` | `mtm:locale:v1` | `en` \| `ms`, no persistence middleware beyond that key |

### Save layer (`src/services/save-service.ts`)

- `SAVE_VERSION = 1` (`types/game.ts:195`), `LOCAL_KEY = "mtm:slots"` (line 4).
- Slots: `0` autosave, `1–3` manual. `GameSave = { version, slot, savedAt, summary, state }`.
- `mtm:sync:<slot>` stores the last known cloud `row_version` for optimistic concurrency.
- Cloud table `campaigns`, columns `user_id`, `slot`, `name`, `state` (JSONB), `summary`, `updated_at`, `row_version`.
- `migrateSave()` is the only migration hook (lines 60–66).

### i18n

Dictionaries in `i18n/en.ts` and `i18n/ms.ts` (~25 kB each) plus event/world translations (`ms-events-ch1.ts`, `ms-events-recurring.ts`, `ms-world.ts`). `i18n/data.ts` resolves display strings by language; some pages inline Malay ternaries (Parliament, Save screens) instead of using the dictionary — an inconsistency, not a defect.

**Rule:** English and Malay must remain in exact key parity. `npm run test` does not check this; it is a manual review item (see `PRESERVATION_CHECKLIST.md`).

---

## 6. Narrative pipeline (Mode B)

```
selectEventsForTurn(state, ALL_EVENTS)   engine/narrative.ts
        ↓ queuedEventIds
currentEvent(state)                      engine/turn-flow.ts
        ↓ GameEventDef (data/events/*)
eventDisplay(event, lang)                i18n/data.ts
        ↓ SceneView: phase "briefing" → "dialogue" → "decision"
chooseOption(state, optionId)            engine/turn-flow.ts
        ↓ ChosenOutcome { notes, news, option }
chosen rendered as "reaction" phase      SceneView
advanceMonth(state)                      engine/turn-flow.ts → engine/simulation.ts
        ↓ TurnReport { movements, delayedNotes, headlines, fallen }
Summary screen                           pages/Summary.tsx
```

Content volume: **15 events** (9 chapter-one, 6 recurring), 45 option records, each option carrying 1–3 consequences. Events are keyed by location string; `sceneKeyFor()` (`data/art.ts:23`) maps that string to one of five backdrops. Press Room, Cabinet Room and Meeting Room all currently collapse to `chamber`.

**Constraint:** `SceneView` matches speakers by **display name**, and `Avatar` resolves art by name (`portraits.tsx:24–35`). Names are locale-stable, but any future rename silently breaks portrait lookup. Character IDs already exist and should drive casting in the rewrite.

---

## 7. Art and rendering pipeline

### CSS tokens

`styles/index.css` defines the scheme twice:

- `:root` — Jalur daylight (off-white `#F7F4EC`, canton `#1A1E6E`, star gold `#FFCC00`, flag red `#CC0001`).
- `.theme-night` — warm umber dark scheme.

`@theme inline` maps them to Tailwind (`--color-paper`, `--color-ink`, …). `.stage` re-binds text tokens inside the dark theatre; `.newspaper` re-binds everything to newsprint.

### Pixel pipeline

`src/data/pixelate.ts` performs a two-pass raster: draw the SVG at full size (`width × 3`), then downsample with `imageSmoothingEnabled = false`, so upscaled cells are hard-edged. `PixelScene` caches per `src@WxH`.

- Environment convention: `width = natural/3`. Hub uses `480×253` from a `1440×760` source; theatre backdrops use `480×140` from `1440×420`.
- The result is a **downscaled vector illustration**, not hand-placed pixel art. It reads crisply at 1× but has no deliberate dithering, no limited palette, and detail is lost at the ⅓ grid. This is the Art Bible's central correction.
- Map: `MalaysiaMap.tsx` serialises the static chart to an SVG string (lines 89–113), rasterises 1200×640 → 400×213, caches in a module variable `staticPixelUrl` (survives navigation, lost on reload). Interactive tokens are live SVG on top.

### Portrait chain (`Avatar.tsx`)

1. `public/portraits/<id>.webp|png|jpg` (or manual `PORTRAITS` entry) — tried in order, 404 falls through.
2. 64×64 canvas bust from `data/pixel-portraits.ts` — per-character spec (skin triple, attire kind, hair/hijab/songkok, glasses, facial hair, expression).
3. Anonymous pixel figure.

Sizes: `sm` 32, `md` 44, `lg` 56, `xl` 80/96, `stage` up to 280 px. `image-rendering: pixelated` is applied only at `xl`/`stage`; smaller sizes render smooth so the cast strip stays legible.

### Current asset inventory

| File | Native size | Consumer |
|---|---|---|
| `public/art/scene-hub.svg` | 1440×760 | Office hub |
| `public/art/scene-office.svg` | 1440×420 | `office` scene key |
| `public/art/scene-chamber.svg` | 1440×420 | `chamber` key + Parliament masthead |
| `public/art/scene-treasury.svg` | 1440×420 | `treasury` key + Economy masthead |
| `public/art/scene-ops.svg` | 1440×420 | `ops` key + Security masthead |
| `public/art/scene-flood.svg` | 1440×420 | `flood` key |
| `public/art/menu-putrajaya.svg` | 1440×600 | Main menu key art |
| `public/portraits/README.md` | — | Drop-in specification only |

There is no `public/art/painted/` directory yet (the code tolerates its absence). There are no character sprites, no prop sheets, no UI icon set beyond Lucide, no environment for Cabinet/Press/Meeting rooms.

### Geography

`src/data/geo-paths.ts` (114 kB, generated by `scripts/extract-geo.mjs`) holds Natural Earth 1:50m rings for Malaysia and ten neighbours, plus `GEO_VIEWBOX = { width: 1200, height: 640, lon0: 92, lon1: 132, lat0: -12, lat1: 30 }`. State tokens are placed at real centroid coordinates in `MalaysiaMap.tsx:27–44` with manual pixel nudges for the three federal territories.

---

## 8. Findings

Severity: **S1** blocks the directive, **S2** visible defect, **S3** hygiene.

### S1 — Structural (must be resolved before Phase 2/3)

1. **No scene abstraction.** Office hotspots, theatre backdrop, mastheads and menu art each implement their own art layering. There is no `GameScene`/`SceneBackground` contract, so each new environment would be bespoke. → Extract as part of Phase 2.
2. **Theatre is a monolith.** `SceneView.tsx` is 449 lines holding typewriter, cast selection, three panel layouts, decision handling and the wire. Adding sprites and expression states inside it would compound risk. → Split before extending.
3. **Palette conflict (decision required).** The directive specifies Midnight/Deep Navy/Government Green/Antique Gold/Warm Paper/Burgundy; the shipped app uses Jalur Gemilang colours from commit `59bba86`. Both cannot be canonical. → `DESIGN_SYSTEM.md` §2 records the decision and recommendation.
4. **"HD pixel art" is not currently authored as pixel art.** Downsampling vectors produces crisp edges but not deliberate pixel craft (no limited palette, no hand-placed highlights, no dithering). → Art Bible defines the authoring spec; Phase 2 replaces the hub source with a true pixel plate.
5. **No character sprites.** Only 64×64 busts exist. Exploration scenes cannot show a character standing in a room, and dialogue cannot show expression change. → New sprite pipeline.

### S2 — Visible defects / inconsistencies

6. **Stale pre-paint theme script.** `index.html` (lines 12–19) and `<meta name="theme-color" content="#101722">` still target the pre-Jalur scheme: the inline script adds a `theme-paper` class that no longer exists, and Night users get a light flash before hydration.
7. **Hard-coded dark shells with light children.** `MapTheatre` uses `bg-[#0a0e15]` while its header uses `bg-card` (light in Paper) — a dark band over a light map. The `.stage` scope fixes text but the theatre background remains `#0f0c08`, which is outside both schemes.
8. **188 hard-coded hex values** across `.tsx/.ts`. The highest-risk clusters: `GameLayout` HUD (`#1a1e6e`, `#ffcc00`, `#0a0806`), `SceneView` panels, `MonthTransition`, `NewspaperArticle`, `PartyFlag`, `ParliamentChart` (`#d9b877`), `MainMenu` skyline, `MalaysiaMap` labels, `Diplomacy` flag chips. These will not follow a palette change.
9. **Party colours used as body text.** `Overview` StateFile sets `style={{ color: bloc.color }}` on a text node; GPS `#A3822F` is 2.74:1 on Warm Paper, GRS 2.95:1, IND 2.81:1. Fails AA.
10. **Office hotspot targets below 44 px.** Hotspots clamp to `minWidth: 40, minHeight: 32` at small viewports. Acceptable for a mouse-driven scene, not for touch.
11. **Duplicated CSS imports.** `styles/index.css` lines 1–7 import the two font families and Tailwind twice.
12. **`src.zip`** (103 kB) sits in the repo root; it is git-ignored, so this is local clutter only.

### S3 — Hygiene / performance

13. **Rasterisation runs on the main thread** at first paint of each art surface; each scene is ~1440×760 of canvas work plus a PNG encode. Acceptable now, will not scale to dozens of environments; move to build-time or a small off-thread step.
14. **Recharts chunk >500 kB.** Lazy-loaded on `/game/overview` and `/game/economy` (`App.tsx:27–32`), so initial load is unaffected.
15. **Measurement mix.** Some screens use Tailwind arbitrary sizes (`text-[1.0313rem]`, `h-[100dvh]`); acceptable, but the type scale should be named before new screens multiply it.
16. **Inline Malay strings** in Parliament and elsewhere bypass the dictionary, so future copy edits need two places. Not a functional risk.
17. **No automated visual or component tests.** Verification is manual screenshots + engine self-checks.

---

## 9. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Palette migration half-done → mixed Jalur/Midnight screens | High | High | Tokenise first, then sweep hard-coded hexes file-by-file with screenshots; forbid literal colours in new code |
| R2 | Splitting `SceneView` breaks the turn flow | Medium | High | Split by copy-then-delete inside one phase; engine untouched; 8/8 self-checks + a full 12-month playthrough after every split |
| R3 | New scenery art costs more than budgeted | High | Medium | Ship in-house SVG/pixel plates; raster paintings are optional drop-ins that must never be required for a screen to work |
| R4 | Save incompatibility from a careless `GameState` edit | Low | Critical | `PRESERVATION_CHECKLIST.md`; never touch `types/game.ts`; verify a pre-overhaul save loads after each phase |
| R5 | Mobile layout regressions from fixed-size pixel scenes | Medium | Medium | Scene container uses aspect-ratio + `object-cover`; test all six directive viewports per phase |
| R6 | Character art drift between busts, sprites and scenes | High | Medium | Single Art Bible palette/proportion spec + asset manifest IDs; sprite and bust share the palette file |
| R7 | i18n drift as new UI strings arrive | Medium | Low | Every new string added to both dictionaries in the same commit |
| R8 | Accessibility regressions (focus, contrast, motion) | Medium | High | Contrast pairs pre-approved in `DESIGN_SYSTEM.md`; focus/reduced-motion tests in every phase gate |

---

## 10. What exists / what can be reused / what must be created

**Already exists and works**

- Complete, self-checked simulation and turn loop; 15 authored events with Malay translations.
- 17 screens with real data wiring, keyboard focus handling and overlay plumbing.
- A token-based theme system with two schemes (Jalur daylight, umber night).
- Seven vector environment plates, one menu plate, a 64×64 portrait engine for 10 characters, a real-geography map with pixel rasterisation.
- Save/cloud/import-export stack, auth, settings, history, newspaper.

**Reusable without redesign**

`Panel`, `Button`, `PageHeader`, `Meter`, `Stat`, `PartyFlag`, `Avatar`, `CharacterPortrait`, `PixelScene`, `PaintedScene`, `NewspaperArticle`, `NewsList`, `TrendChart`, `ParliamentChart`, `MapTheatre`, `RegionMap`, `MalaysiaMap` (geometry layer), `MonthTransition`, `usePortalOverlay`, the token pipeline, the drop-in portrait/scene chains.

**Must be created**

- A scene component family (scene shell, background, sprite, hotspot) and the dialogue/decision panel split.
- A true pixel-art authoring spec plus the Phase 2 hub plate at 480×270 with deliberate pixels.
- Character sprite sheets (10 characters + generic), at least one expression set each.
- Environments for Cabinet Room, Meeting Room, Press Room; richer versions of Chamber/Treasury/Ops/Flood.
- A machine-readable asset manifest and asset-ID conventions.
- Tokenised palette covering every hard-coded colour listed in §8.
- A press/document viewer surface consistent with the game world without turning the News page into a walkable room.

---

## 11. Recommended first milestone

See `IMPLEMENTATION_PLAN.md` §4. In short: **M1 — "The Office, end to end"**: palette tokenisation, the `GameScene` family, a genuine 480×270 pixel office plate, hotspot extraction, HUD/nav extraction, verified at six viewports. It proves every part of the pipeline on the one screen the player sees first, before any other environment is authored.
