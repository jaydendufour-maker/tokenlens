-- TokenLens — initial schema
-- projects: één per app/service die kosten tracked
-- usage_events: elke LLM-call met kosten + attributie-tags
-- budget_alerts: drempels per tag die een webhook/email triggeren

create extension if not exists pgcrypto;

-- ── projects ────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  api_key_hash  text not null unique,           -- sha256(api_key), nooit de key zelf
  api_key_prefix text not null,                 -- bv. "tk_live_a1b2" voor weergave
  created_at    timestamptz not null default now()
);
create index if not exists projects_owner_idx on public.projects (owner_id);

-- ── usage_events ────────────────────────────────────────────────────────────
create table if not exists public.usage_events (
  id            bigint generated always as identity primary key,
  project_id    uuid not null references public.projects(id) on delete cascade,
  ts            timestamptz not null default now(),
  provider      text not null,
  model         text not null,
  input_tokens  integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd      numeric(14,8) not null default 0,
  latency_ms    integer,
  -- attributie: top-level kolommen voor snelle aggregatie, rest in tags
  customer      text,
  feature       text,
  team          text,
  tags          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists usage_events_proj_ts_idx   on public.usage_events (project_id, ts desc);
create index if not exists usage_events_proj_cust_idx on public.usage_events (project_id, customer);
create index if not exists usage_events_proj_feat_idx on public.usage_events (project_id, feature);
create index if not exists usage_events_proj_team_idx on public.usage_events (project_id, team);

-- ── budget_alerts ───────────────────────────────────────────────────────────
create table if not exists public.budget_alerts (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  name             text not null,
  tag_key          text not null default 'project',  -- 'project'|'customer'|'feature'|'team'
  tag_value        text,                              -- null = hele project
  period           text not null default 'month',     -- 'day'|'month'
  threshold_usd    numeric(14,2) not null,
  webhook_url      text,
  notify_email     text,
  last_triggered_at timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists budget_alerts_proj_idx on public.budget_alerts (project_id);

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Ingest schrijft via service_role (bypass RLS). Users lezen alleen eigen data.
alter table public.projects      enable row level security;
alter table public.usage_events  enable row level security;
alter table public.budget_alerts enable row level security;

drop policy if exists "owner manages projects" on public.projects;
create policy "owner manages projects" on public.projects
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owner reads events" on public.usage_events;
create policy "owner reads events" on public.usage_events
  for select using (
    exists (select 1 from public.projects p
            where p.id = usage_events.project_id and p.owner_id = auth.uid())
  );

drop policy if exists "owner manages alerts" on public.budget_alerts;
create policy "owner manages alerts" on public.budget_alerts
  for all using (
    exists (select 1 from public.projects p
            where p.id = budget_alerts.project_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p
            where p.id = budget_alerts.project_id and p.owner_id = auth.uid())
  );
