# Design System — Malaysia: The Mandate

**Status:** Phase 1 deliverable. Canonical for Phases 2–8.
**Companion documents:** `ART_BIBLE.md` (how art is made), `ASSET_MANIFEST.md` (what art exists), `PRESERVATION_CHECKLIST.md` (what must not move).

The system is called **"The Federal Document"**: warm paper, midnight ink, antique gold rules, burgundy for danger, government green for the things a state is supposed to do well. Illustrated and interactive surfaces are drawn in a single pixel language; documents and statistics are set in crisp type.

---

## 1. Design intent

Five rules that resolve most decisions:

1. **The screen is a document or a room.** Data screens read as federal paper. Exploration and narrative screens read as a place. Never blur the two into a dashboard.
2. **Ink is for reading.** Body copy, figures and headlines are set in ink on paper, or paper on midnight. Colour never carries a number on its own.
3. **Gold is a rule, not a highlight.** Antique gold draws hairlines, ticks and small ornaments. It is never used for body text on paper (1.93:1).
4. **One pixel density.** Every pixel asset is authored on the same grid and scaled by whole numbers. No half-pixels, no blur.
5. **Motion is a scene cut, not a bounce.** Fades and short slides only; nothing loops except ambient key art, and never under reduced motion.

---

## 2. Palette — and the decision the project must take

### 2.1 The conflict

| Source | Paper | Primary | Accent | Danger |
|---|---|---|---|---|
| **Directive (this overhaul)** | Warm Paper `#E9DFC9` | Midnight `#17202B` / Deep Navy `#263849` | Antique Gold `#C69B54` | Burgundy `#803F45` |
| **Shipped app** (commit `59bba86`) | Off-white `#F7F4EC` | Canton blue `#1A1E6E` | Star gold `#FFCC00` / text `#8A6D00` | Flag red `#CC0001` |

Both are defensible; they cannot both be canonical. Every asset, component and screenshot doubles if the project tries to keep both as first-class identities.

### 2.2 Decision D-01 (requires sign-off before Phase 2)

**Recommended — "Midnight document, true flag":**

- Adopt the directive palette for **all UI chrome and all new artwork**.
- Keep the **actual Jalur Gemilang colours** (`#CC0001`, `#FFCC00`, `#1A1E6E`, white) **only inside depictions of the flag and of real-world flags** — a flag must look like the flag. No UI surface uses flag red/gold as a theme colour.
- Map the existing "Night (umber)" scheme onto **Midnight**, so the two shipped schemes become *Paper* and *Midnight* rather than *Jalur daylight* and *umber*.
- Migration is token-level: components keep their class names, only variable values change (plus the hard-coded exceptions in §8).

**Why this is recommended:** it satisfies the directive literally, restores the warm period-drama register the README already documented ("cream paper, deep navy ink, muted gold, brick red"), and keeps Malaysian specificity where it matters most — in the world, on the flag, in the rooms.

**Alternatives on record**

- **A. Keep Jalur as UI, directive palette as art only.** No migration cost; contradicts the directive's "Primary palette" section; risks a permanent split between chrome and world.
- **B. Two full identities the player can switch.** Maximum choice, maximum QA surface, and neither identity becomes recognisable. Not recommended for a first overhaul.

**Consequence of the recommendation:** one deliberate, visible change to the shipped look — off-white→warm paper, canonical blue→deep navy, star gold→antique gold, flag red→burgundy — plus a truer flag in-world. This must be shown to the user as a before/after screenshot in Phase 2, not slipped in silently.

### 2.3 Canonical palette

Core six (directive):

| Token | Hex | Role |
|---|---|---|
| `midnight` | `#17202B` | Ink on paper; page on Midnight scheme; stage shell |
| `deep-navy` | `#263849` | Primary actions, civic identity, charts |
| `gov-green` | `#527B72` | Positive movement, institutional health |
| `antique-gold` | `#C69B54` | Rules, ticks, ornaments, focus ring, meters |
| `warm-paper` | `#E9DFC9` | Page, panels, light text on Midnight |
| `burgundy` | `#803F45` | Danger, warnings, opposition pressure, stamps |

Derived neutrals and text-safe variants (all verified, see §2.4):

| Token | Paper scheme | Midnight scheme | Notes |
|---|---|---|---|
| `--paper` | `#E9DFC9` | `#17202B` | page |
| `--paper-deep` | `#DED3B8` | `#111823` | recessed wells, table stripes |
| `--card` | `#F1E9D6` | `#1D2835` | panels (slightly lifted from page) |
| `--surface` | `#E1D5BA` | `#263849` | hover / raised |
| `--ink` | `#17202B` | `#E9DFC9` | body + headlines |
| `--navy` | `#263849` | `#E9DFC9` | primary button fill (inverts) |
| `--navy-deep` | `#1A2A38` | `#CFC4AD` | primary hover |
| `--rule` | `#CFC2A6` | `#3A4A5C` | hairlines |
| `--rule-strong` | `#AB9C7E` | `#55677C` | section rules |
| `--muted` | `#5F5A4D` | `#B9AE97` | metadata |
| `--gold` | `#C69B54` | `#C69B54` | ornaments, meter fill |
| `--gold-text` | `#7A5C22` | `#D9B877` | gold as text |
| `--gold-bright` | `#6B5119` | `#E6CD8E` | gold text hover / highlight |
| `--brick` | `#803F45` | `#803F45` | danger fill, stamp border |
| `--brick-text` | `#6E3339` | `#C98B91` | danger as text |
| `--moss` | `#527B72` | `#527B72` | positive fill |
| `--moss-text` | `#3E625A` | `#8FB3A8` | positive as text |
| `--teal` | `#4E7A86` | `#4E7A86` | **data-viz only** (diplomacy series); not a UI identity colour |
| `--teal-text` | `#2F5C66` | `#9FCBD3` | data-viz label |

> Naming note: the existing CSS names (`--navy`, `--brick`, `--moss`) are retained so Tailwind utilities and ~40 components keep working. Renaming them to `--primary`, `--danger`, `--positive` is a Phase 8 tidy-up, not a dependency.

### 2.4 Contrast evidence (WCAG 2.1, computed)

| Pair | Ratio | Verdict |
|---|---|---|
| Ink `#17202B` on Warm Paper | **12.41** | AAA |
| Deep Navy `#263849` on Warm Paper | **9.09** | AAA |
| Muted `#5F5A4D` on Warm Paper | **5.19** | AA |
| Gold text `#7A5C22` on Warm Paper | **4.69** | AA |
| Burgundy `#803F45` on Warm Paper | **5.84** | AA |
| Burgundy text `#6E3339` on Warm Paper | **7.22** | AAA |
| Gov green text `#3E625A` on Warm Paper | **5.12** | AA |
| Antique Gold `#C69B54` on Warm Paper | **1.93** | **decorative only** |
| Gov green `#527B72` on Warm Paper | **3.58** | fills/large marks only |
| Warm Paper on Midnight | **12.41** | AAA |
| Warm Paper on Deep Navy | **9.09** | AAA |
| Muted `#B9AE97` on Midnight | **7.48** | AAA |
| Antique Gold on Midnight | **6.43** | AA (text-safe on dark) |
| Gold text `#D9B877` on Midnight | **8.66** | AAA |
| Burgundy `#803F45` on Midnight | **2.12** | **fills only** |
| Burgundy text `#C98B91` on Midnight | **5.94** | AA |
| Gov green text `#8FB3A8` on Midnight | **7.18** | AAA |

**Party colours are never text on paper.** On Warm Paper: PH 3.44, BN 4.93, GPS 2.74, GRS 2.95, WARISAN 3.40, PN 3.54, IND 2.81. Use them as swatches, map tokens, hemicycle dots, 3 px card rails — always adjacent to an ink label.

### 2.5 Colour usage rules

- **Primary action**: `--navy` fill, `--paper` text. One per view.
- **Secondary**: transparent + `--rule-strong` border, `--ink` text, gold on hover.
- **Danger**: `--brick` border/fill, `--brick-text` label. Never a solid burgundy button with burgundy text.
- **Positive trend**: `--moss-text`; negative: `--brick-text`; neutral: `--muted`.
- **Selected state**: `--surface` background + `--gold` 2 px rail or 1 px border. Never rely on colour alone — pair with `aria-pressed`/`aria-selected`.
- **Focus**: `2px solid var(--gold)`, offset 2, on every interactive element. Never remove.
- **Stamp**: burgundy 1 px border, `--brick-text` label, `-1.5deg` rotation — one per sheet, maximum.

---

## 3. Typography

| Role | Face | Size / line | Usage |
|---|---|---|---|
| Display XL | Fraunces Variable 600 | `clamp(2rem, 1.1rem + 3.4vw, 3.4rem)` / 1.02 | menu logo, screen titles |
| Display L | Fraunces 600 | 1.5–1.9 rem / 1.1 | panel titles, decision options |
| Display body | Fraunces 400 | 1.03–1.125 rem / 1.7 | briefings, consequences, quotes |
| UI body | Public Sans 400 | 0.875 rem / 1.55 | descriptions, tables |
| Kicker | Public Sans 600, uppercase | 0.625–0.6875 rem / 1.4, `0.16em` tracking | labels, metadata |
| Figure | Fraunces 600, tabular | 1.7 rem (3.2 rem for hero) | stats, seat counts |
| Tabular | Public Sans 500, `font-variant-numeric: tabular-nums` | 0.75–0.875 rem | dates, deltas |

Rules:

- One display headline per screen band. Kickers are labels, not headings — never a sentence.
- Minimum body 14 px; 16 px is the default (`--mtm-body-size`), 18 px when the player chooses Large.
- Do not set pixel art in a pixel font. Text stays vector and crisp at every DPI.
- Number + unit: figure in display, unit in sans at 0.5 em, muted. Keep the existing `Stat` behaviour.
- Line length 60–70 characters for prose (`max-w-prose` or `max-w-4xl` for dense leads).

---

## 4. Space, shape, elevation

- **Spacing unit:** 4 px. Page gutter 16 px mobile / 32 px desktop. Section gap 24 px (`gap-6`), panel padding 16 px, dense band 12–14 px.
- **Radius:** 2 px controls, 3 px panels, 1 px meters/tokens. Nothing rounder than 4 px except avatars (2 px) and the hemicycle.
- **Borders over shadows.** Panels are separated by 1 px `--rule`. Shadow (`--shadow-lift`) is reserved for floating layers only: drawers, map dossier, decision rows on hover.
- **Texture:** a single fixed film grain at 3.5 % opacity over everything (`body::after`), never interactive, never on top of text at higher opacity.
- **Double rule** (`border-top` + 3 px offset shadow) marks document sections — the federal letterhead motif. Use at most twice per screen.
- **Gold hairline** marks a section label row. Do not stack gold rule + double rule in the same block.

---

## 5. Layout and responsive behaviour

- **Frame:** `100dvh`, never scrolls at page level; content scrolls inside `<main>`. The HUD is 44 px + a 6 px ribbon.
- **Content width:** 1152 px max (`max-w-6xl`), 16/32 px gutters.
- **Grid:** 12-col mental model; `lg:grid-cols-3` for map + dossier, `lg:grid-cols-5` for 3/2 splits, `md:grid-cols-2` for rosters.
- **Scene container:** full-bleed inside the frame, negative gutters (`-mx-4 sm:-mx-8`), height `min(68vh, 660px)` with `min-h-[420px]`; art uses `object-cover` and `object-[center_45%]` for mastheads.
- **Breakpoints in use:** Tailwind defaults (640/768/1024/1280). Required validation widths: 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844.
- **Below 640 px:** portrait columns hide; speaker strip becomes horizontally scrollable; hotspot tooltips must remain reachable by focus; tables scroll in `.scroll-x`, never the page.
- **Touch targets:** 44×44 CSS px minimum. The 40×32 office hotspot floor is a known exception to be corrected in Phase 2.

---

## 6. Component contracts

| Component | Contract | Do not |
|---|---|---|
| `Panel` | `panel` (raised card), `inset` (recessed well), `bare` (editorial) | Nest `panel` inside `panel` |
| `Button` | `primary` one per view; `outline` secondary; `ghost` tertiary; `danger` destructive | Use gold fill for a primary action |
| `PageHeader` | default = editorial masthead; `dense` = ministry band for data screens | Put two dense headers on one screen |
| `Meter` | 7 px track, ticked background, tone = gold/brick/moss/navy, value announced | Use colour alone to signal bad |
| `Stat` | figure + optional month delta + unit | Invert good direction per screen |
| `PartyFlag` | colour always from `COALITIONS`; invented heraldry only | Draw a real party logo |
| `kicker` / `kicker-gold` | uppercase micro-label | Use as a sentence or for long text |
| `stamp` | one per sheet, burgundy | Animate it |
| Tabs (`role="tablist"`) | selected = gold border + `paper-deep`; `aria-selected` required | Rely on underline only |

---

## 7. Motion

| Token | Value | Use |
|---|---|---|
| `cut` | 450 ms, ease-out | scene change black fade (`GameLayout`) |
| `enter` | 240 ms, ease-out, 5 px rise | page enter |
| `beat` | 300 ms, `cubic-bezier(.22,1,.36,1)` | dialogue/decision panel swap |
| `micro` | 120–150 ms | hover, border, colour |
| `meter` | 500 ms, ease-out | bar width only |
| `ambient` | 30 s, mirror-infinite | menu key-art drift only |

- `MotionConfig reducedMotion="user"` is set app-wide; `prefersReducedMotion()` guards custom loops.
- Under reduced motion: typewriter reveals instantly, transitions collapse to 0, ambient drift stops.
- Never animate parchment/paper textures, never parallax text, never bounce a button.

---

## 8. Pixel-art rules (presentation side)

- Always rasterise on a grid derived from the art's native size by an **integer divisor**; upscale with `image-rendering: pixelated`.
- Environment convention: `1440×n` source → `480×n/3` canvas → displayed at any size. New pixel plates are authored at `480×270` and displayed 3×.
- Character busts: 64×64, `pixelated` at ≥80 px; smooth below 80 px so the cast strip stays readable (existing `Avatar` behaviour, keep it).
- No CSS filters that blur pixel layers (`blur`, `drop-shadow` with large radius). Vignettes and scrims use gradients, not filters, so edges stay hard.
- Sepia warm grade (`.art-warm`) exists to unify vector art; once true pixel plates land, drop the filter for those plates (it dulls the palette) and keep it only for legacy vectors.

---

## 9. Accessibility contract

1. Body/metadata text ≥ 4.5:1, large text ≥ 3:1 — pairs pre-approved in §2.4.
2. Focus visible on everything, gold 2 px ring, never removed.
3. 44 px touch targets; office hotspots are the known open item.
4. Keyboard: full tab order, `Enter`/`Space` on map tokens and hotspots, `Escape` closes overlays, focus trapped in theatre/map, focus restored on close.
5. Reduced motion honoured everywhere; no content conveyed by motion.
6. Theatres are `role="dialog" aria-modal="true"` with an accessible name; scene text has a screen-reader copy alongside the typewriter.
7. Language: `lang` attributes follow the active locale; Malay strings live in the dictionaries.
8. Never encode a value only in colour (trend arrows carry sign and text; map tokens carry abbreviation and labels).

---

## 10. Migration map (shipped → canonical)

| Shipped token / literal | Replace with | Where |
|---|---|---|
| `--paper #F7F4EC` | `#E9DFC9` | `styles/index.css` |
| `--ink #14163A` | `#17202B` | `styles/index.css` |
| `--navy #1A1E6E` | `#263849` | `styles/index.css` |
| `--gold #FFCC00` | `#C69B54` | `styles/index.css` |
| `--gold-text #8A6D00` | `#7A5C22` | `styles/index.css` |
| `--brick #CC0001` | `#803F45` | `styles/index.css` |
| `--brick-text #A80000` | `#6E3339` | `styles/index.css` |
| `.theme-night` umber set | Midnight set (§2.3) | `styles/index.css` |
| `#1a1e6e` HUD / `#ffcc00` HUD / `#0a0806` floor | `var(--navy)`, `var(--gold)`, `var(--midnight)` | `layouts/GameLayout.tsx:161,165,182,188,207,232,255,270` |
| `#0f0c08`, `#120f0a`, `#0a0806` stage | Midnight family | `features/narrative/SceneView.tsx:122,135,184,214,263,296,325` |
| `#ece5d5` stage text | `var(--paper)` | `SceneView.tsx:157,230,274,307` |
| `#0a0e15` map theatre shell | `var(--midnight)` | `components/geo/MapTheatre.tsx:56` |
| `#d9b877` majority line | `var(--gold)` | `components/charts/ParliamentChart.tsx:124` |
| `rgb(182 154 91 / …)` skyline | `var(--gold)` at reduced alpha | `pages/MainMenu.tsx:25,54` |
| `#1d1f25`, `#5b564b` newsprint | `var(--ink)`, `var(--muted)` inside `.newspaper` | `components/game/NewspaperArticle.tsx` |
| `#e6cd8e`, `#c8442e`, `#2f4373` flag chips | Keep for **real flags**; no token mapping | `pages/Diplomacy.tsx` |

**Definition of done for the palette work:** `grep -r "#[0-9a-fA-F]\{6\}" src --include=*.tsx` returns only (a) in-world flag colours, (b) asset-internal SVG colours, (c) comments. Everything else is `var(--token)` or a Tailwind token class.

---

## 11. Copy and labelling rules

- Kickers are sentence case in the dictionary, uppercased by CSS.
- Buttons are verbs ("Open briefings", "End the month", "Seek counsel").
- Numbers always carry direction and comparison ("−0.4 % this month"), never a bare colour.
- Malaysian institutional vocabulary is correct and consistent: Dewan Rakyat, Menteri Besar, Premier (Sarawak), MA63, Putrajaya.
- Fiction label stays visible wherever fiction could be mistaken for fact (news sheet, primer, footer).
- Malay and English must match key-for-key; no partially translated screen.
