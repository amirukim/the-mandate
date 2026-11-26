# Art Bible — Malaysia: The Mandate

**Status:** Phase 1 deliverable. Canonical for every asset produced from Phase 2 onward.
**Scope:** pixel environments, character sprites, portraits, props, maps, UI ornaments. Documents, statistics and long-form copy stay typographic (see `DESIGN_SYSTEM.md`).

---

## 1. Style statement

**Modern HD pixel art: a Malaysian federal institution, remembered in 16-bit-ish detail.**

The camera is fixed, the room is lit, the player is standing in it. Pixels are placed deliberately, not sampled from a photograph or shrunk from a vector. Detail is high for a pixel scene — furniture seams, carpet weave, the fold of a flag — but the grid is never finer than 1 logical pixel per 3 screen pixels at 1440-wide display.

Two registers coexist:

- **The world** — rooms, streets, maps, characters — is pixel art, warm and slightly worn. This is where the game lives.
- **The document** — briefings, ledgers, newspapers, dossiers — is crisp typography on paper. This is how the state records what happened.

Never pixelate text. Never typeset a room.

---

## 2. What "HD pixel art" means here (and what the current pipeline is not)

Today the game downsamples vector SVGs: `src/data/pixelate.ts` draws the illustration at full size, then samples it to a ⅓ grid with smoothing off. The edges are hard, but the result is a *reduced vector*, not authored pixel work — no limited palette, no hand-placed highlights, no dithering, and fine detail collapses unpredictably.

Authoring spec from Phase 2:

| Asset class | Canvas (native) | Display | Scale | Notes |
|---|---|---|---|---|
| Environment plate | **480 × 270** | up to 1440 × 810 | ×3 | 16:9; letterbox-free, `object-cover` |
| Wide environment (hub) | **480 × 253** | 1440 × 760 | ×3 | matches the existing hub hotspot coordinate space |
| Theatre backdrop | **480 × 140** | full width | ×3 | panoramic band, safe crop top/bottom |
| Menu key art | **480 × 200** | full bleed | ×3 | source ratio 1440 × 600 |
| Character bust | **64 × 64** | 32–280 px | ×1–4 | pixelated at ≥80 px only |
| Character sprite | **48 × 64** | 144–192 px | ×3 | full body, feet on a 3 px shadow |
| Prop / icon | **24 × 24** or **32 × 32** | 24–64 px | ×1–2 | one per hotspot where possible |
| Map plate | **400 × 213** | 1200 × 640 | ×3 | current map raster; keep |
| Flag (real) | any | any | — | vectors allowed: a flag is a flag |

Hard rules:

1. **Integer scaling only.** 3× is the default; 2× and 4× are allowed; 1.5× is not.
2. **`image-rendering: pixelated`** on every upscaled layer.
3. **No anti-aliasing** inside pixel layers. Edges are hard; curves are stepped.
4. **One pixel = one authored cell.** Do not draw at 1440 and "let the rasteriser decide".
5. Gradients are allowed only as *banded* steps (2–4 flat tones), never as smooth CSS-style ramps. The current SVGs use 15–32 gradient/opacity constructs each; new plates replace those with flat ramps.

---

## 3. Palette discipline

World palette is derived from the Design System's canonical six, split into flat ramps. Each material gets 2–4 tones (shadow / base / light / highlight).

| Material | Ramp |
|---|---|
| Wall (paper) | `#D8CCB2` → `#E9DFC9` → `#F3EBD9` |
| Wall (midnight) | `#1B2532` → `#263849` → `#33495E` |
| Walnut desk | `#3A2A1E` → `#5A4331` → `#7A5C43` |
| Brass / gold | `#7A5C22` → `#C69B54` → `#E8C786` |
| Carpet (civic) | `#2C4256` → `#263849` → `#1B2A39` |
| Paper / documents | `#EFE6D2` → `#E9DFC9` → `#F7F0E0` |
| Glass / window daylight | `#BFD7EA` → `#DCEBF5` → `#F5FAFD` |
| Foliage (tropical) | `#2F4A35` → `#4E6B46` → `#7C9A62` |
| Monsoon sky | `#4A5560` → `#6C7A85` → `#93A0A8` |
| Skin | per character triple (§6), plus one highlight |
| Real flag | `#CC0001`, `#FFFFFF`, `#1A1E6E`, `#FFCC00` — **only on the flag itself** |

Rules:

- A single scene uses **one dominant hue family** plus one accent. The PM office is paper/walnut with canton-navy carpet and a red folder stack. The chamber is walnut/brass. The flood is grey-green.
- Gold is a *metal and a rule*, not a light source. Do not wash scenes in gold.
- Burgundy appears as leather, folders, stamps, warning lights — never as a wall.
- Maximum ~24 distinct colours per plate; reuse the ramps.

---

## 4. Light, depth and composition

### Lighting

- **Key light from the left**, slightly above eye level — inherited from the portrait engine (every bust has a left rim light at x≈21).
- **Two-step shading minimum**: a lit plane and a shadow plane. Highlights are a third, used sparingly.
- **No glow filters.** Lamp pools are painted as concentric stepped ellipses.
- **Scenes ship in one lighting state**; day/night variants are optional extras. The office hub is daylight (window at centre-left); the theatre backdrops are lamp-lit dusk.

### Depth

Three planes, always:

1. **Back wall / skyline** — lowest contrast, coolest.
2. **Furniture / mid-ground** — the hotspot plane; highest local contrast.
3. **Foreground edge** — a desk corner, a chair back, a railing. Dark, cropped, never interactive.

Eye level sits at 52–58 % of the plate height; the horizon on exterior plates at 45–55 %. Rooms are drawn in a flat-on / slight three-quarter view — no isometric grids, no perspective vanishing points, no fisheye.

### Composition for play

- **Leave the lower-right ~38 % calm.** Decision panels, dossiers and dialogue boxes anchor there.
- Keep hotspot objects **separated by at least 8 native pixels** so focus rings do not collide.
- Every interactive object must be identifiable at 480 × 270 without a label. If it needs a label to be read, redraw it larger.
- No object may be hidden behind the HUD (top 44 px + 6 px ribbon) or the bottom floor bar.

---

## 5. Environment briefs

Existing plates are listed as the starting point; each brief states what Phase 2–6 must produce.

### 5.1 Prime Minister's Office — hub (Mode A) — *Phase 2*

- **Existing:** `public/art/scene-hub.svg` (1440×760) — daylight Jalur office, window, desk, flag, folders, map.
- **Target:** a 480×253 authored plate with the same furniture logic and hotspot anchors (see `ASSET_MANIFEST.md` §5 for the rectangle set).
- **Must read:** walnut desk with red briefing folders; telephone; wall map of the federation; the Jalur standard on its pole; window with Putrajaya skyline; clock (end month); visitor chairs; a side table with the day's newspapers.
- **Mood:** morning, clean, slightly too tidy. Light from the window; warm wood; one red accent (folders) and one blue accent (carpet).
- **Storytelling props:** a framed MA63 memorandum, a stack of unread files, a single wilting orchid, the flag furled when stability is low (variant).

### 5.2 Cabinet Room (Mode A) — *Phase 6*

- Long oval table, 12 chairs, microphones, water carafes, a crest-less panelled wall (no invented coat of arms), tall windows with blinds half-drawn.
- Composition: table recedes from lower-left to centre; the PM's chair back is foreground right and cropped.
- Hotspots: the seat of each cabinet figure; the agenda folder; the door.

### 5.3 Meeting Room (Mode A) — *Phase 6*

- Smaller, harder room: whiteboard with a half-erased fiscal chart, two flags, a wall clock, a sideboard with a kettle.
- Used for coalition and diplomatic one-to-ones; cooler than the office, warmer than the ops room.

### 5.4 Press Room (Mode A / new route, needs approval) — *Phase 6*

- Podium with the government wordmark (invented, not the real crest), microphone cluster, curtain backdrop in deep navy, press chairs from behind, camera flashes as stepped white clusters.
- Hotspots: podium (hold a press conference), the wire machine, the door.

### 5.5 Dewan Rakyat chamber (Mode B/C) — *Phase 5*

- Green carpet, dark wood benches, the Speaker's chair, the mace on the table, government and opposition banks.
- **Never draw real members.** Seats read as empty or as anonymous silhouettes; named characters appear only as sprites in the foreground when a scene requires it.
- Parliament page masthead crops to the upper chamber band; keep faces out of the crop.

### 5.6 Treasury briefing room — *Phase 5*

- Ledger-green walls, brass lamps, a long table with brown folders, a chart board with a stepped deficit line.
- Mood: institutional, unglamorous, precise.

### 5.7 Crisis operations room — *Phase 6*

- Dark, screens, map table with sea-lane markers, a wall clock, blinds shut. Light is screen-blue plus one warm desk lamp.
- This is the only interior allowed to be genuinely dark in the Paper scheme; it is lit *by its content*.

### 5.8 Kelantan flood / monsoon — *Phase 6*

- Exterior dusk, rain as stepped diagonal clusters, a kampung house on stilts, floodwater with reflected lamp light, a relief truck, sandbags.
- Palette: grey-green water, warm lamp, one high-vis orange accent (relief vest).
- Respect: no disaster spectacle, no bodies, no real victims.

### 5.9 Putrajaya skyline (menu) — *Phase 4*

- Existing `menu-putrajaya.svg` at 1440×600. Target 480×200 plate: bridge, ministry blocks, the dome, the boulevard, dusk gradient in 3 bands.
- Serves as ambient key art with a slow 30 s drift; must hold up with a 40 % paper scrim over it.

### 5.10 Federation map (Mode C) — *Phase 5*

- Real geography is non-negotiable (`geo-paths.ts`, Natural Earth 1:50m).
- Style: paper atlas — sea in flat blue bands, neighbours in pale grey, Malaysia in cream with a deep-navy coastline, state tokens as pixel squares, sea labels in wide-tracked sans.
- Improve on current state: state **fill** on hover/selection (shape-level highlight), not just token growth; keep real coastline geometry.

---

## 6. Character bible

Ten fictional officeholders (`src/data/characters.ts`). **No character may resemble a real Malaysian politician.** Costume is generic federal formalwear: suits, batik-accented shirts, songkok/kopiah where the character's own spec already uses one. No real party symbols, no state honours, no crests.

| ID | Name / role | Age read | Build | Attire (shipped bust spec) | Hair / head | Distinguishing |
|---|---|---|---|---|---|---|
| `chiefOfStaff` | Sarah Tan — Principal Private Secretary | 40s | slim | charcoal suit, ivory shirt, dark-gold tie | black bob | calm, direct gaze; soft mouth |
| `finance` | Tan Sri Azlan Mahmud — Finance | 60s | solid | graphite suit, steel shirt, burgundy tie | grey, receding | glasses; set mouth |
| `economicAdviser` | Dr. Kavitha Rao — Economic Adviser | 40s | slim | deep-green suit, gold shirt | black, tied back | glasses, bindi, earrings |
| `nationalSecurity` | Dato' Faridah Yusof — National Security | 50s | upright | charcoal suit | dark hijab | older; set mouth; no jewellery |
| `foreign` | Datuk Lim Wei Sheng — Foreign Affairs | 50s | slim | navy-blue suit, ivory shirt, midnight tie | dark side-part, greying | glasses; firm |
| `home` | Datuk Seri Norliza Ahmad — Home Affairs | 50s | solid | charcoal suit | burgundy hijab | firm; minimal |
| `borneoMinister` | Datuk Seri Peter Mojuntin — Sabah Affairs | 50s | broad | open dark-green jacket, pale shirt | dark curls | firm; open collar |
| `gpsPremier` | Datuk Patinggi Jonathan Lingga — Premier of Sarawak | 60s | tall | olive-charcoal suit, ivory shirt | grey combed back | glasses; patient |
| `bnChair` | Tan Sri Raja Nordin — BN Chairman | 60s | heavy | midnight mandarin suit, gold trim | white | songkok, grey moustache |
| `oppositionLeader` | Dato' Iskandar Rahman — Opposition Leader | 50s | lean | slate mandarin suit | dark short | white kopiah, dark beard |

### Expression states (v3: six states, gated)

Drawn as face + body-language swaps on the same body — brows, eyes, mouth AND shoulders/head/hands move together:

1. `neutral` — the default reading.
2. `concerned` — inner brows up, head tilted toward the file, mouth flat.
3. `pleased` — brows lifted, chin up, shoulders relaxed, mouth corners up.
4. `stern` — brows pressed, eyes narrowed to the iris, shoulders squared.
5. `weary` — heavy lids, head dipped, shoulders dropped.
6. `surprised` — brows high, eyes wide, mouth open, shoulders lifted.

Automated gate (self-checks): every non-neutral expression must differ from neutral by **>= 3% of
non-transparent pixels** per character. Never cartoonish; the game is a drama, not a comedy.

### Sprite proportions (v3: 64 × 96, layered paper-doll)

- **64 × 96** full body (D-16), displayed at integer scale >= 3x with `image-rendering: pixelated`.
- Body types (D-19) per the section 6 table — slim, average, broad, tall, heavy, plus the
  older-stoop variant — each with its own shoulder width, waist, leg length and head volume, so
  silhouettes separate in solid black. Automated gate: pairwise IoU < 0.8 across body classes,
  < 0.9 within a class (same-class characters differ by stance, height, hair, headwear).
- Resting stances: `stand`, `clasp`, `hip`, `cross` — assigned per character in the spec.
- Idle: 2 frames (1 px arm shift). Blink: every 4–7 s, randomised, never synchronised.
- Walk: 4 frames, integer offsets, no motion blur.
- Culture dress (D-20) is drawn accurately: the tudung/hijab is a draped scarf (covers hair,
  frames the face, neck/chest layer, fold lines, pin — `cape` and `long` variants), the songkok
  is a flat-topped oval cap with a gold band, the kopiah a white knit cap with ribs. Never
  caricatured; never reduced to a hair shape.
- Wardrobe kinds (D-20): `suit`, `open` (batik/jacket), `mandarin`, `baju` (baju Melayu with
  button placket and folded sampin sash), `sherwani` (full placket, stand collar, hem edging).
- Props (D-17): `folder`, `phone`, `tablet`, `cane` carried in the stand pose at hand level.
- Sprites are transparent PNG. Signed by `scripts/build-sprites.ts`; reviewed via
  `npm run contact:sheet` (`public/art/qa/contact-sheet-*.png`).

### Portrait chain stays intact

`Avatar` resolution order must be preserved: raster drop-in → 64×64 authored bust → generic figure. New sprite work must not break the drop-in convention (`public/portraits/<id>.webp|png|jpg`).

---

## 7. Interface ornament (world-facing, not chrome)

- **Party standards** (`PartyFlag`): invented heraldry, 32×22 field, colour from `COALITIONS`; keep the emblem logic exactly.
- **Real flags** (diplomacy chips): simplified but recognisable; no emblem detail beyond a crescent/stars.
- **Stamps, seals, folder tabs:** pixel motifs only when they sit on a pixel surface; otherwise typographic (`.stamp`).
- **Icons:** Lucide at 13–18 px for chrome. If a world object needs an icon (phone, ledger, clock), draw it as a prop, not as an icon font.

---

## 8. Documents, newspapers, charts

- These are **not pixel art.** Fraunces + Public Sans, real rules, real tables.
- Newsprint (`NewspaperArticle`, `News`): paper-cream sheet, black double rule, nameplate in display serif, body 14–16 px.
- Charts: flat series colours from the palette (gold = approval, navy = coalition, burgundy = pressure, moss = growth). Thin 1–1.5 px lines, no area gradients, no glow, no 3D.
- Hemicycle: one dot per seat, party colour, majority line in gold. Already correct — keep the arithmetic.

---

## 9. Export and file rules

- Environment source: `.aseprite`/`.piskel` (or a reproducible script) **plus** the shipped `.png`.
- Shipped PNGs are 1× native (480×270 etc.), never pre-upscaled.
- Naming: `env-<id>.png`, `sprite-<characterId>-<state>.png`, `bust-<characterId>.png`, `prop-<id>.png`, `map-<id>.png`.
- No spaces, no capitals in file names, no version suffixes (`-v2`) — the manifest carries versions.
- Transparency only where a sprite is composited; environment plates are opaque.
- Colour profile: sRGB, no embedded ICC, no alpha in environment plates.
- Every file is registered in `src/data/asset-manifest.ts` (schema in `ASSET_MANIFEST.md`).

---

## 10. AI-generated art policy

Permitted, with conditions:

1. Generated against this bible (palette, grid, proportions, lighting).
2. **Never** a likeness of a real person; never a real party logo or the real national crest.
3. Post-processed to the exact pixel grid — generated smooth art is not shipped as-is.
4. Provenance recorded in the manifest (`source: "ai"`, model, prompt id, licence note).
5. Human review for hands, text, flags and faces before commit.
6. Generation is optional: every screen must ship with authored/vector art if generation is unavailable. (It currently is unavailable in this environment — `Invalid credential` — so no screen may depend on generated raster art.)

---

## 11. QA checklist (per asset)

- [ ] Correct native canvas and integer scale; no resampling blur.
- [ ] Palette drawn from the ramps; ≤24 colours per plate.
- [ ] Key light from the left; at least two shading planes.
- [ ] Reads at 480×270 without a label; hotspots separated by ≥8 px.
- [ ] Lower-right calm zone left clear.
- [ ] Text, if any, is not pixelated (or is intentionally a prop with no readable copy).
- [ ] No real person, party logo, crest or copied game asset.
- [ ] Transparent edges clean (no halo), sprite feet aligned.
- [ ] Registered in the manifest with a stable ID.
- [ ] Screenshot at 1440×900 and 390×844 reviewed before merge.

---

## 12. Do / don't

**Do**

- Draw fewer, better objects. A room with seven readable things beats a room with twenty smudges.
- Use negative space for UI.
- Let the flag be the flag.
- Keep the building slightly shabby: this is a working government, not a palace.

**Don't**

- Don't shrink a vector and call it pixel art.
- Don't use gradients, bloom, glassmorphism or neon.
- Don't draw a real politician, real party symbol or the real federal crest.
- Don't isometric-ise the rooms; the game is flat-on, like a stage.
- Don't put a fifth colour family into a scene to solve a contrast problem — solve it with value.
