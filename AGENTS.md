# Malaysia: The Mandate — agent notes

A browser-based political simulation (React + TypeScript + Vite). Narrative/data modules live in
`src/data/` and `src/engine/`; simulation logic is pure TypeScript and must stay engine-agnostic.
Always run `npx.cmd tsc --noEmit`, `npm.cmd test` (22/22) and `npm.cmd run build` after changes.
Game-dev skills for this project live in `.opencode/skills/` (router + curated set, from
gamedev-skills/awesome-gamedev-agent-skills, Apache-2.0 — see `.opencode/skills/LICENSE`/`NOTICE`).

## Gates (v2)

- `npx.cmd tsc --noEmit` — typecheck
- `npm.cmd test` — 22 engine self-checks (effects, playthrough, save migration + v2 slices,
  dialogue graphs, EN/MS parity, policy/parliament/budget/cabinet, graph content + scheduler)
- `npm.cmd run check:assets` — manifest integrity (269 assets)
- `npm.cmd run build` — includes check:assets

## v2 art builders (all reproducible)

- `npm run build:plate` — office/menu plates (`scripts/build-pixel-plate.mjs`)
- `npm run build:app-icons` — 16 pixel app icons
- `npm run build:sprites` — character sprites via `scripts/build-sprites.ts` (tsx)
- `npm run build:office-overlays` — 34 office overlay PNGs
- `npm run build:map-plate` — 2160x1152 smooth terrain plate from Natural Earth geometry
  (`scripts/build-map-plate.ts`); state polygons extracted by `scripts/extract-states.mjs`
  (admin-1 10m, public domain, decision D-11)

## v2 structure notes

- `src/engine/dialogue.ts` — node-graph dialogue runner; legacy events adapt via
  `dialogue-legacy.ts`; graph events (Phase 8) register through `src/data/dialogue` +
  `src/engine/graph-events.ts`; the desk queue merges both via the scheduler in `narrative.ts`.
- v2 save = SAVE_VERSION 2 with optional slices (avatar/policy/parliament/cabinetState/budget);
  migration in `src/engine/save-migrate.ts`, all engines default-on-read with `??`.
- New content is bilingual inline (`LText {en, ms}` in `src/data/lt.ts`); UI chrome strings go
  through the `src/i18n` key maps whose EN/MS parity is a self-check.
- The iPad shell is full-bleed on every viewport (no bezel device mock-up).

## SkillDB (on-demand specialist skills)

When a task needs specialist knowledge beyond the installed project skills, search the SkillDB
catalog and load the matching skill:

- Search: `GET https://skilldb.dev/api/v1/skills?search=<topic>` — returns id, name, pack, category, lines
- Fetch: `GET https://skilldb.dev/api/v1/skills/<pack>%2F<skill>.md` — URL-encode the slash
- Catalog map for agents: https://skilldb.dev/llms.txt

The project skills in `.opencode/skills/` take priority; use SkillDB only to fill gaps
(domain expertise not covered above), and copy anything durable into project skills deliberately.
