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
