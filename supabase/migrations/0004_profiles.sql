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
