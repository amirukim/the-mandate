# Malaysia: The Mandate — agent notes

A browser-based political simulation (React + TypeScript + Vite). Narrative/data modules live in
`src/data/` and `src/engine/`; simulation logic is pure TypeScript and must stay engine-agnostic.
Always run `npx.cmd tsc --noEmit`, `npm.cmd test` (8/8) and `npm.cmd run build` after changes.
Game-dev skills for this project live in `.opencode/skills/` (router + curated set, from
gamedev-skills/awesome-gamedev-agent-skills, Apache-2.0 — see `.opencode/skills/LICENSE`/`NOTICE`).

## SkillDB (on-demand specialist skills)

When a task needs specialist knowledge beyond the installed project skills, search the SkillDB
catalog and load the matching skill:

- Search: `GET https://skilldb.dev/api/v1/skills?search=<topic>` — returns id, name, pack, category, lines
- Fetch: `GET https://skilldb.dev/api/v1/skills/<pack>%2F<skill>.md` — URL-encode the slash
- Catalog map for agents: https://skilldb.dev/llms.txt

The project skills in `.opencode/skills/` take priority; use SkillDB only to fill gaps
(domain expertise not covered above), and copy anything durable into project skills deliberately.
