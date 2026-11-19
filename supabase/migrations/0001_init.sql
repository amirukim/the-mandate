-- Malaysia: The Mandate · cloud schema
-- Apply with: supabase db push  (or run in the Supabase SQL editor)
-- The client uses the anon key only. Row Level Security scopes every row.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Player',
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot int not null check (slot between 1 and 3),
  name text not null default 'Campaign',
  state jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  row_version bigint not null default 1,
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);

create index if not exists campaigns_user_idx on public.campaigns (user_id, slot);

-- Row Level Security: users touch only their own rows.
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;

drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile upsert" on public.profiles;
drop policy if exists "own campaigns select" on public.campaigns;
drop policy if exists "own campaigns insert" on public.campaigns;
drop policy if exists "own campaigns update" on public.campaigns;
drop policy if exists "own campaigns delete" on public.campaigns;

create policy "own profile select" on public.profiles
  for select using (auth.uid () = id);

create policy "own profile upsert" on public.profiles
  for insert with check (auth.uid () = id);

create policy "own campaigns select" on public.campaigns
  for select using (auth.uid () = user_id);

create policy "own campaigns insert" on public.campaigns
  for insert with check (auth.uid () = user_id);

create policy "own campaigns update" on public.campaigns
  for update using (auth.uid () = user_id)
  with check (auth.uid () = user_id);

create policy "own campaigns delete" on public.campaigns
  for delete using (auth.uid () = user_id);

-- Keep updated_at honest on save overwrites.
create or replace function public.touch_updated_at ()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now ();
  return new;
end;
$$;

drop trigger if exists campaigns_touch on public.campaigns;
create trigger campaigns_touch
  before update on public.campaigns
  for each row
  execute function public.touch_updated_at ();

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user ()
  returns trigger
  language plpgsql
  security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce (new.raw_user_meta_data ->> 'name', 'Player'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user ();
