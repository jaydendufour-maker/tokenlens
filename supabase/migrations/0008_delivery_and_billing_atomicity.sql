-- Alerts need a real delivery channel. Payment logging and plan grants must be
-- atomic so a transient profile update failure can safely be retried.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'alerts_delivery_channel') then
    alter table public.budget_alerts
      add constraint alerts_delivery_channel
      check (webhook_url is not null or notify_email is not null) not valid;
  end if;
end $$;

create or replace function public.grant_pro_from_payment(
  p_user_id uuid,
  p_provider text,
  p_external_id text,
  p_status text,
  p_amount_usd numeric default null,
  p_until timestamptz default null,
  p_add_months integer default 0
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
  current_until timestamptz;
  target_until timestamptz := p_until;
begin
  if p_provider not in ('nowpayments', 'lemonsqueezy', 'paddle') then
    raise exception 'invalid payment provider';
  end if;
  if p_add_months < 0 or p_add_months > 24 then
    raise exception 'invalid extension';
  end if;

  insert into public.payments(user_id, provider, external_id, status, amount_usd)
  values (p_user_id, p_provider, p_external_id, p_status, p_amount_usd)
  on conflict (provider, external_id) do nothing
  returning id into inserted_id;
  if inserted_id is null then return 'duplicate'; end if;

  if p_add_months > 0 then
    select plan_expires_at into current_until
      from public.profiles where id = p_user_id for update;
    target_until := greatest(coalesce(current_until, now()), now())
      + make_interval(months => p_add_months);
  end if;

  update public.profiles
    set plan = 'pro', plan_expires_at = target_until
    where id = p_user_id;
  if not found then raise exception 'profile not found'; end if;
  return 'ok';
end;
$$;

revoke all on function public.grant_pro_from_payment(uuid,text,text,text,numeric,timestamptz,integer)
  from public, anon, authenticated;
grant execute on function public.grant_pro_from_payment(uuid,text,text,text,numeric,timestamptz,integer)
  to service_role;
