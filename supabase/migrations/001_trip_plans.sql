create extension if not exists pgcrypto;

create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  anon_session_id text not null,
  title text not null,
  start_date date not null,
  end_date date not null,
  travelers_count integer not null check (travelers_count > 0),
  budget numeric(12, 2) not null default 0,
  base_destination_id text not null,
  interests jsonb not null default '[]'::jsonb,
  travel_style text not null default 'balanced',
  transport_mode text not null default 'public_transport',
  notes text not null default '',
  plan_json jsonb not null,
  ai_model text,
  ai_source text not null default 'gemini',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trip_plans_anon_session_id_idx on public.trip_plans (anon_session_id);
create index if not exists trip_plans_created_at_idx on public.trip_plans (created_at desc);

alter table public.trip_plans enable row level security;

create policy "anon can create trip plans"
  on public.trip_plans
  for insert
  to anon
  with check (anon_session_id <> '');

create policy "anon can read trip plans by id"
  on public.trip_plans
  for select
  to anon
  using (true);

