# Preservation Checklist — Malaysia: The Mandate

**Status:** Phase 1 deliverable. Binding for every phase of the visual overhaul.
**Principle:** the overhaul may change how the game *looks and feels*. It may not change what the game *is*.

Any change that would require an entry in the "Forbidden" column must be proposed as a separate, approved migration — never slipped into a visual commit.

---

## 1. Frozen contracts

### 1.1 Save format

| Contract | Value | File |
|---|---|---|
| Schema version | `SAVE_VERSION = 1` | `src/types/game.ts:195` |
| Local storage key | `"mtm:slots"` | `src/services/save-service.ts:4` |
| Slot record shape | `{ version, slot, savedAt, summary, state }` | `src/types/game.ts:187–193` |
| Slots | `0` autosave, `1–3` manual | `src/types/game.ts:176` |
| Cloud row version key | `mtm:sync:<slot>` | `src/services/save-service.ts:82–84` |
| Cloud table | `campaigns` (`user_id`, `slot`, `name`, `state`, `summary`, `updated_at`, `row_version`) | `supabase/migrations/0001_init.sql` |
| Migration hook | `migrateSave()` only | `src/services/save-service.ts:60–66` |
| Export format | the `GameSave` object as JSON, unchanged | `src/pages/Saves.tsx` |

**Never** add a field that is required to load a save, reorder the record, or change the version without a migration + approval.

### 1.2 Game state

`GameState` (`src/types/game.ts:135–157`), field-for-field:

`meta`, `turn`, `chapter`, `phase`, `fallen`, `economy`, `politics`, `social`, `security`, `diplomacy`, `federal`, `characters`, `flags`, `pendingEffects`, `firedEvents`, `queuedEventIds`, `history`, `news`, `decisions`, `lastReport?`.

Nested shapes are equally frozen: `EconomyState` (10 fields), `PoliticsState` (4), `SocialState` (8), `SecurityState` (6), `FederalState` (5), `CharacterState` (2), `HistoryPoint` (10), `NewsItem`, `DecisionRecord`, `DelayedEffect`, `TurnReport`, `Movement`.

`DiplomacyKey` = `asean | china | unitedStates | singapore | indonesia | europeanUnion` — frozen.

### 1.3 Engine

| File | Exports that must not change behaviour |
|---|---|
| `engine/simulation.ts` | `endTurn`, `economyHeadline` |
| `engine/turn-flow.ts` | `beginTurn`, `currentEvent`, `chooseOption`, `advanceMonth`, `ChosenOutcome` shape |
| `engine/effects.ts` | `TARGET_BOUNDS`, `applyEffect`, `applyEffects` |
| `engine/narrative.ts` | `selectEventsForTurn`, `dequeueNext` |
| `engine/relationships.ts` | `seekCounsel`, `CounselResult` |
| `engine/calendar.ts` | `START_YEAR = 2026`, `START_MONTH = 10`, `dateLabel`, `chapterOf`, `chapterTitle`, `isBudgetTurn`, `isMonsoonTurn`, `stateIsFallen`, `clamp`, `round1` |
| `engine/rng.ts` | `mulberry32`, `makeRng` |
| `engine/array-guard.ts` | `ensureMutable` (guards five array-growth sites) |

The engine is pure TypeScript and must remain React-free, DOM-free and presentation-free. Presentation code may import engine *pure functions* (`dateLabel`, `chapterTitle`, `currentEvent`, `stateIsFallen`) but must not mutate state.

### 1.4 Narrative data

- **15 events**, IDs frozen:
  `c1_swearing_in`, `c1_subsidy_file`, `c1_budget_2027`, `c1_ma63_demand`, `c1_minimum_wage`, `c1_backdoor_whispers`, `c1_maritime_incident`, `c1_monsoon_floods`, `c1_hundred_days`, `r_annual_budget`, `r_monsoon_season`, `r_cost_of_living_watch`, `r_by_election`, `r_ma63_review`, `r_water_crisis`.
- Option IDs (`a`–`d`) and their effects, delays and news are frozen.
- `GameEventDef` shape (`types/narrative.ts:36–55`) frozen: `id`, `kind`, `chapter`, `priority`, `window`, `minGap`, `schedule`, `title`, `location`, `category`, `briefing`, `dialogue`, `options`, `available`.
- Event **location strings** drive art (`sceneKeyFor`). Changing a location string changes the backdrop; do not edit them for art reasons.

### 1.5 Identifiers

| Set | Values |
|---|---|
| Character IDs | `chiefOfStaff`, `finance`, `economicAdviser`, `nationalSecurity`, `foreign`, `home`, `borneoMinister`, `gpsPremier`, `bnChair`, `oppositionLeader` |
| Coalition IDs | `ph`, `bn`, `gps`, `grs`, `warisan`, `pn`, `others` |
| Coalition colours | PH `#5578A5`, BN `#3F5F8A`, GPS `#A3822F`, GRS `#B3714A`, WARISAN `#7A6FA8`, PN `#4E7D6E`, IND `#8A8478` |
| Seat arithmetic | `TOTAL_SEATS = 222`, `MAJORITY = 112`, government 140 |
| State IDs (16) | `selangor`, `johor`, `penang`, `perak`, `kelantan`, `terengganu`, `pahang`, `kedah`, `perlis`, `negeri-sembilan`, `melaka`, `sabah`, `sarawak`, `kuala-lumpur`, `putrajaya`, `labuan` |
| News outlets | `peninsula`, `borneo`, `sinar` |
| Scene keys | `office`, `chamber`, `treasury`, `ops`, `flood` (+ `hub` for the painted drop-in) |
| Storage keys | `mtm:slots`, `mtm:sync:<slot>`, `mtm:ui:v2`, `mtm:locale:v1` |

Character names are display data and are also used as art keys (`portraits.tsx:24–35`). **Do not rename a character** as part of a visual change.

### 1.6 Routes

All 22 route patterns in `App.tsx:52–83` stay. `/game` still redirects to `/game/office`. Unknown paths still redirect to `/`. A new route (e.g. `/game/press`) requires approval (D-03).

### 1.7 Services and auth

`src/services/auth-service.ts`, `supabase.ts`, `save-service.ts` are frozen. Local mode must keep working with no `.env`; cloud features must stay hidden when unconfigured. Import/export must remain byte-compatible with `GameSave`.

### 1.8 i18n

- `en.ts` and `ms.ts` must stay in **exact key parity**.
- Event translations in `ms-events-ch1.ts`, `ms-events-recurring.ts`, `ms-world.ts` are content, not decoration.
- New UI strings for a phase are added to both dictionaries in the same commit.
- Do not "translate" a screen by hard-coding Malay in JSX.

---

## 2. Change control

| Area | Allowed | Forbidden |
|---|---|---|
| CSS tokens, fonts, spacing, colour | ✅ | removing accessibility pairs |
| Component structure (extraction) | ✅ if behaviour and ARIA are preserved | changing store wiring |
| New presentational components | ✅ | new global state for visuals |
| Art files, manifest, drop-ins | ✅ | remote URLs; deleting fallbacks |
| Copy (UI strings) | ✅ both languages | editing event narrative text |
| Routes | ❌ without approval | removing/renaming |
| `GameState`, saves, engine | ❌ | any edit |
| Event/character/coalition/state data | ❌ | any edit |
| Dependencies | ❌ without justification | Phaser/engine/framework swap |
| Supabase schema/RLS | ❌ | any edit |
| `netlify.toml`, `vite.config.ts` | ❌ unless required | changing build output |

---

## 3. Pre-flight (before touching code in any phase)

- [ ] `git status` clean; on `main`; note the current commit.
- [ ] `npx.cmd tsc --noEmit` green.
- [ ] `npm.cmd test` → 8/8.
- [ ] `npm.cmd run build` green.
- [ ] Export a save from an existing campaign (`Saves → Export`) and keep the JSON for the post-phase load test.
- [ ] Note the current visual state with one screenshot per affected screen at 1440×900.

---

## 4. Post-flight (every phase, before merge)

### 4.1 Automated gates

```
npx.cmd tsc --noEmit     → no output
npm.cmd test             → 8/8 checks passed
npm.cmd run build        → "built in …"; no new errors
```

Expected self-check names (all PASS):

1. All event effect targets resolve
2. 12-month playthrough survives
3. No repeated chapter events
4. Decision log complete
5. Counsel once per month per character
6. JSON save roundtrip
7. Calendar anchors (Nov 2026 start, Oct budget)
8. Government-fall condition triggers

### 4.2 Data-integrity checks

- [ ] Import the pre-phase save → campaign loads at the correct turn, chapter and approval.
- [ ] End the month → report renders, history gains one point, autosave written to slot 0.
- [ ] Decide one event → notes, news and delayed effects appear exactly as before.
- [ ] Reload during summary → summary restores (`lastReport` intact).
- [ ] Cloud off (no `.env`) → no cloud UI, no errors.
- [ ] Both languages: switch `EN ⇄ MS` on every affected screen; no missing key, no English leak in event copy.

### 4.3 Visual/behaviour checks

- [ ] Screenshots at 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844.
- [ ] Zero console errors; zero failed requests for optional drop-ins.
- [ ] Keyboard: Tab reaches every control; `Enter`/`Space` activate hotspots and map tokens; `Escape` closes theatre, map, drawer.
- [ ] Focus ring visible on every control; focus returns to the trigger after an overlay closes.
- [ ] Reduced motion: typewriter instant, no ambient drift, no scene-cut flash.
- [ ] Text contrast ≥ 4.5:1 against its actual background (not just the token pair).
- [ ] No horizontal page scroll at 390 px; tables scroll inside `.scroll-x`.

---

## 5. Manual regression script (run at Phase 3, 5, 6, 8)

1. Main menu → New campaign → name, campaign name, difficulty → start.
2. Office hub → Briefings → read briefing → advance every dialogue beat → choose option → notes → wire → continue.
3. Repeat until the queue empties; confirm the clock hotspot is disabled while files remain.
4. Seek counsel from each of the six advisers; confirm one use per month.
5. End the month → summary table, delayed notes, headlines → begin next month (transition stamp).
6. Overview → select three states, open/close the map theatre, expand/collapse.
7. Parliament → select each bloc; verify seat arithmetic and majority line.
8. Economy → switch trend series (Overview), verify four charts render.
9. Parties → all seven standards; States → all 16 rows; region tabs.
10. Diplomacy → select each of six relationships; Security → six meters.
11. News → three outlet filters, open an article, back to front page.
12. History → decision log matches the decisions taken.
13. Saves → export, delete a slot, import the file, load it.
14. Settings → switch theme (Paper ⇄ Midnight), language (EN ⇄ MS), body size.
15. Force government fall (or load a fallen save) → Fallen screen → no broken navigation.
16. Reload mid-scene → the same beat/decision state restores.

---

## 6. Visual-change ledger

Every phase must state, in its PR description:

| Item | Example |
|---|---|
| Screens touched | `office`, `briefing` |
| Tokens changed | `--paper`, `--ink`, `--gold-text` |
| Components extracted | `GameScene`, `InteractiveHotspot` |
| Assets added | `env.officeHub`, `prop.clock` |
| Assets superseded (not deleted) | `art.hub` → fallback |
| Known intentional visual deltas | HUD ribbon removed |
| Anything user-visible that was NOT requested | must be listed or removed |

---

## 7. Red flags — stop and ask

- A change makes an existing save fail to load.
- A change edits anything under `src/engine/`, `src/types/game.ts`, `src/data/events/`, or `src/services/save-service.ts`.
- A route disappears or changes behaviour.
- A screen shows invented data instead of store data.
- A Malay string is missing, or English appears in a Malay-only context.
- A visual fix requires deleting the only fallback for an asset.
- A dependency is added.
- Contrast drops below AA anywhere.

---

## 8. Sign-off record

| Phase | Gates green | Saves verified | Six viewports | Console clean | i18n parity | Approved by |
|---|---|---|---|---|---|---|
| 1 (docs) | n/a — no code | n/a | n/a | n/a | n/a | _pending_ |
| 2 (M1) | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 3 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 4 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 5 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 6 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 7 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 8 | ☐ | ☐ | ☐ | ☐ | ☐ | |
