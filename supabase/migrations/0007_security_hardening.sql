-- Defense-in-depth constraints. The app validates these too; DB constraints
-- prevent authenticated clients from bypassing Server Actions through REST.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_name_length') then
    alter table public.projects add constraint projects_name_length check (char_length(name) between 1 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'alerts_name_length') then
    alter table public.budget_alerts add constraint alerts_name_length check (char_length(name) between 1 and 100);
    alter table public.budget_alerts add constraint alerts_tag_key check (tag_key in ('project','customer','feature','team'));
    alter table public.budget_alerts add constraint alerts_tag_value_length check (tag_value is null or char_length(tag_value) <= 256);
    alter table public.budget_alerts add constraint alerts_period check (period in ('day','month'));
    alter table public.budget_alerts add constraint alerts_threshold check (threshold_usd > 0 and threshold_usd <= 1000000000);
    alter table public.budget_alerts add constraint alerts_webhook_https check (webhook_url is null or webhook_url ~ '^https://');
    alter table public.budget_alerts add constraint alerts_email_length check (notify_email is null or char_length(notify_email) <= 320);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'usage_provider_length') then
    alter table public.usage_events add constraint usage_provider_length check (char_length(provider) between 1 and 64);
    alter table public.usage_events add constraint usage_model_length check (char_length(model) between 1 and 160);
    alter table public.usage_events add constraint usage_tokens_range check (input_tokens between 0 and 2147483647 and output_tokens between 0 and 2147483647);
    alter table public.usage_events add constraint usage_cost_range check (cost_usd between 0 and 1000000);
    alter table public.usage_events add constraint usage_latency_range check (latency_ms is null or latency_ms between 0 and 86400000);
    alter table public.usage_events add constraint usage_tags_object check (jsonb_typeof(tags) = 'object' and pg_column_size(tags) <= 16384);
  end if;
end $$;
