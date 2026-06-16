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
