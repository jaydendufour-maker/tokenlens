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
