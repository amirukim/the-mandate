# Malaysia: The Mandate

A browser-based political simulation of governing Malaysia. November 2026: a hung
parliament, a unity government, and a hundred days to prove the mandate. Every
officeholder, election result and statistic in the game is fictional; the
institutions, Constitution and political geography are real. The Settings screen
labels each element of the primer as Real or Fiction.

## Stack

React 19, TypeScript (strict), Vite, Tailwind CSS 4, Zustand, Framer Motion,
Recharts, Supabase (optional), Netlify-ready.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine self-checks (playthrough, bounds, save roundtrip)
npm run build      # typecheck + production build
```

No Supabase project is needed to play: accounts and saves work fully offline in
local mode.

## Optional cloud setup

1. Create a free Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (tables + RLS).
3. Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Only the anon key goes in env. The service-role key must never be placed in the
frontend. Without these values the app hides cloud features and stays playable.

Cloud features: registration, login, three cloud save slots per account with
optimistic concurrency (`row_version`), push/pull across devices, conflict
warning with explicit overwrite.

## Save system

- Autosave (slot 0) after every decision and month end, in `localStorage`.
- Three manual slots with load, overwrite, delete, export/import as JSON files.
- Save schema version (`SAVE_VERSION = 1`); `migrateSave()` is the hook for
  future migrations.
- Cloud rows store the full `GameState` snapshot in a JSONB column.

## Architecture

```
src/
  engine/        simulation, economy/politics/social drift, effects, narrative
  data/          characters, coalitions, states, events (chapter 1 + recurring)
  stores/        zustand stores (game, auth, ui)
  services/      supabase client, save service, auth service
  components/    ui primitives, charts, news wire
  features/      narrative scene view
  pages/         one file per screen (17 screens)
  types/         GameState, event definitions
```

The turn loop: briefings are queued per month (`selectEventsForTurn`), decisions
apply immediate effects and schedule delayed ones, and `advanceMonth` runs the
simulation step, applies due consequences, and generates the monthly report.

## Design system

"The Federal Document": cream paper, deep navy ink, muted gold, brick red for
danger; Fraunces for display serif, Public Sans for interface. Light and dark
themes both ship and are contrast-checked. Motion is limited to short fades and
respects `prefers-reduced-motion`.

## Deployment (Netlify free)

Connect the repo; `netlify.toml` builds with `npm run build` and publishes
`dist` with the SPA redirect already configured. Set the two env vars in the
Netlify UI if cloud features are wanted.
