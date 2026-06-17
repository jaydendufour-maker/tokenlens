-- TokenLens — VOLLEDIG schema (alle migraties 0001-0005 in volgorde).
-- Plak dit in de Supabase SQL Editor en run het in één keer.
-- Idempotent (create if not exists / create or replace).


-- ============================================================
-- migrations/0001_init.sql
-- ============================================================

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

-- ============================================================
-- migrations/0002_aggregations.sql
-- ============================================================

-- Aggregatie-RPCs voor het dashboard. SECURITY INVOKER → RLS geldt (user ziet eigen data).

create or replace function public.cost_summary(p_project uuid, p_since timestamptz)
returns table(total_cost numeric, total_events bigint, total_tokens bigint)
language sql stable as $$
  select coalesce(sum(cost_usd),0)::numeric,
         count(*)::bigint,
         coalesce(sum(input_tokens + output_tokens),0)::bigint
  from public.usage_events
  where project_id = p_project and ts >= p_since;
$$;

create or replace function public.cost_timeseries(p_project uuid, p_since timestamptz)
returns table(day date, cost numeric, events bigint)
language sql stable as $$
  select date_trunc('day', ts)::date, sum(cost_usd)::numeric, count(*)::bigint
  from public.usage_events
  where project_id = p_project and ts >= p_since
  group by 1 order by 1;
$$;

create or replace function public.cost_by_dimension(p_project uuid, p_since timestamptz, p_dim text)
returns table(label text, cost numeric, events bigint)
language plpgsql stable as $$
begin
  if p_dim not in ('customer','feature','team','model') then
    raise exception 'invalid dimension %', p_dim;
  end if;
  return query execute format($q$
    select coalesce(%I::text, '(none)') as label,
           sum(cost_usd)::numeric as cost,
           count(*)::bigint as events
    from public.usage_events
    where project_id = $1 and ts >= $2
    group by 1 order by 2 desc limit 20
  $q$, p_dim) using p_project, p_since;
end;
$$;

grant execute on function public.cost_summary(uuid, timestamptz)            to authenticated;
grant execute on function public.cost_timeseries(uuid, timestamptz)         to authenticated;
grant execute on function public.cost_by_dimension(uuid, timestamptz, text) to authenticated;

-- ============================================================
-- migrations/0003_alert_spend.sql
-- ============================================================

-- Huidige spend voor een alert-scope sinds p_since.
-- SECURITY INVOKER (default) → RLS geldt: authenticated ziet alleen eigen project,
-- de cron draait als service_role en bypasst RLS sowieso.

create or replace function public.alert_current_spend(
  p_project uuid,
  p_tag_key text,
  p_tag_value text,
  p_since timestamptz
) returns numeric
language plpgsql stable as $$
declare
  v numeric;
begin
  if p_tag_key = 'project' or p_tag_value is null then
    select coalesce(sum(cost_usd), 0) into v
    from public.usage_events
    where project_id = p_project and ts >= p_since;
  elsif p_tag_key = 'customer' then
    select coalesce(sum(cost_usd), 0) into v
    from public.usage_events
    where project_id = p_project and ts >= p_since and customer = p_tag_value;
  elsif p_tag_key = 'feature' then
    select coalesce(sum(cost_usd), 0) into v
    from public.usage_events
    where project_id = p_project and ts >= p_since and feature = p_tag_value;
  elsif p_tag_key = 'team' then
    select coalesce(sum(cost_usd), 0) into v
    from public.usage_events
    where project_id = p_project and ts >= p_since and team = p_tag_value;
  else
    raise exception 'invalid tag_key %', p_tag_key;
  end if;
  return coalesce(v, 0);
end;
$$;

grant execute on function public.alert_current_spend(uuid, text, text, timestamptz)
  to authenticated, service_role;

-- ============================================================
-- migrations/0004_profiles.sql
-- ============================================================

-- Account-plan ('free' | 'pro'). Bepaalt wat zichtbaar is in het dashboard.
-- Users kunnen hun eigen plan NIET wijzigen (geen insert/update-policy) —
-- pro zetten gebeurt via service_role (later: Paddle-webhook).

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  plan       text not null default 'free',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (id = auth.uid());

-- Maak automatisch een profiel aan bij signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bestaande users (vóór de trigger) ook een profiel geven.
insert into public.profiles (id)
select id from auth.users on conflict do nothing;

-- ============================================================
-- migrations/0005_payments.sql
-- ============================================================

-- Betaal-laag: plan-vervaldatum + idempotente betaal-log.
-- Webhooks (service_role) schrijven hier; users lezen alleen hun eigen betalingen.

alter table public.profiles
  add column if not exists plan_expires_at timestamptz;

create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  provider    text not null,              -- 'nowpayments' | 'paddle' | 'lemonsqueezy'
  external_id text not null,              -- provider payment/event id (idempotentie)
  status      text not null,
  amount_usd  numeric(14,2),
  created_at  timestamptz not null default now(),
  unique (provider, external_id)
);
create index if not exists payments_user_idx on public.payments (user_id);

alter table public.payments enable row level security;

drop policy if exists "own payments read" on public.payments;
create policy "own payments read" on public.payments
  for select using (user_id = auth.uid());
-- inserts/updates uitsluitend via service_role (webhooks) — die bypasst RLS.

-- ===== 0006_date_range.sql =====
-- Datum-filter: geef de dashboard-RPC's een optionele bovengrens p_until.
-- null => now(). Maakt zowel presets (7/30/90/365d) als custom ranges + export mogelijk.
-- We droppen de oude 2-arg-signaturen en herdefiniëren met trailing default,
-- zodat bestaande named calls (p_project, p_since) blijven werken via de default.

drop function if exists public.cost_summary(uuid, timestamptz);
drop function if exists public.cost_timeseries(uuid, timestamptz);
drop function if exists public.cost_by_dimension(uuid, timestamptz, text);

create or replace function public.cost_summary(
  p_project uuid,
  p_since timestamptz,
  p_until timestamptz default null
)
returns table(total_cost numeric, total_events bigint, total_tokens bigint)
language sql stable as $$
  select coalesce(sum(cost_usd),0)::numeric,
         count(*)::bigint,
         coalesce(sum(input_tokens + output_tokens),0)::bigint
  from public.usage_events
  where project_id = p_project
    and ts >= p_since
    and ts < coalesce(p_until, now());
$$;

create or replace function public.cost_timeseries(
  p_project uuid,
  p_since timestamptz,
  p_until timestamptz default null
)
returns table(day date, cost numeric, events bigint)
language sql stable as $$
  select date_trunc('day', ts)::date, sum(cost_usd)::numeric, count(*)::bigint
  from public.usage_events
  where project_id = p_project
    and ts >= p_since
    and ts < coalesce(p_until, now())
  group by 1 order by 1;
$$;

create or replace function public.cost_by_dimension(
  p_project uuid,
  p_since timestamptz,
  p_dim text,
  p_until timestamptz default null
)
returns table(label text, cost numeric, events bigint)
language plpgsql stable as $$
begin
  if p_dim not in ('customer','feature','team','model') then
    raise exception 'invalid dimension %', p_dim;
  end if;
  return query execute format($q$
    select coalesce(%I::text, '(none)') as label,
           sum(cost_usd)::numeric as cost,
           count(*)::bigint as events
    from public.usage_events
    where project_id = $1 and ts >= $2 and ts < coalesce($3, now())
    group by 1 order by 2 desc limit 20
  $q$, p_dim) using p_project, p_since, p_until;
end;
$$;

grant execute on function public.cost_summary(uuid, timestamptz, timestamptz)            to authenticated;
grant execute on function public.cost_timeseries(uuid, timestamptz, timestamptz)         to authenticated;
grant execute on function public.cost_by_dimension(uuid, timestamptz, text, timestamptz) to authenticated;
