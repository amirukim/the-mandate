-- Seed: nothing is required for the game to run.
-- The world (characters, events, states) lives in the frontend bundle, not the DB.
-- This file exists to keep `supabase db reset` usable during development.

insert into public.profiles (id, display_name)
values ('00000000-0000-0000-0000-000000000000', 'Seed Player')
on conflict (id) do nothing;
