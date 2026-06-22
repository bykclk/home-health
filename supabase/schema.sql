-- Home Health — Supabase schema
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Sets up tables, row-level security scoped to households, helper RPCs for
-- creating/joining a household by invite code, a new-user trigger, and the
-- realtime publication.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  initial      text not null default '',
  color        text not null default '#4a754c',
  created_at   timestamptz not null default now()
);

create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'member' check (role in ('owner', 'member')),
  color        text not null default '#4a754c',
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  label        text not null,
  position     int not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  room_id       uuid not null references public.rooms (id) on delete cascade,
  title         text not null,
  repeat_mode   text not null check (repeat_mode in ('interval', 'fixed')),
  interval_days int check (interval_days > 0),
  fixed_weekday int check (fixed_weekday between 0 and 6),
  created_at    timestamptz not null default now()
);

create table if not exists public.task_assignees (
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (task_id, user_id)
);

create table if not exists public.completions (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  user_id      uuid references auth.users (id) on delete set null,
  completed_at timestamptz not null default now()
);

create index if not exists idx_rooms_household on public.rooms (household_id);
create index if not exists idx_tasks_household on public.tasks (household_id);
create index if not exists idx_tasks_room on public.tasks (room_id);
create index if not exists idx_completions_task on public.completions (task_id);
create index if not exists idx_completions_household on public.completions (household_id);

-- ---------------------------------------------------------------------------
-- Membership helper (SECURITY DEFINER avoids RLS recursion)
-- ---------------------------------------------------------------------------

create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.rooms             enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_assignees    enable row level security;
alter table public.completions       enable row level security;

-- profiles: yourself, plus anyone who shares a household with you
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or exists (
    select 1
    from public.household_members m1
    join public.household_members m2 on m1.household_id = m2.household_id
    where m1.user_id = auth.uid() and m2.user_id = public.profiles.id
  )
);
drop policy if exists profiles_upsert on public.profiles;
create policy profiles_upsert on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (id = auth.uid());

-- households: members can read; mutations go through RPCs / owner
drop policy if exists households_select on public.households;
create policy households_select on public.households for select using (public.is_household_member(id));
drop policy if exists households_update on public.households;
create policy households_update on public.households for update using (
  exists (
    select 1 from public.household_members
    where household_id = households.id and user_id = auth.uid() and role = 'owner'
  )
);

-- household_members: members can read; you can remove your own membership
drop policy if exists members_select on public.household_members;
create policy members_select on public.household_members for select using (public.is_household_member(household_id));
drop policy if exists members_delete on public.household_members;
create policy members_delete on public.household_members for delete using (user_id = auth.uid());

-- rooms / tasks: full access within your households
drop policy if exists rooms_all on public.rooms;
create policy rooms_all on public.rooms for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- task_assignees: gated through the parent task's household
drop policy if exists assignees_all on public.task_assignees;
create policy assignees_all on public.task_assignees for all
  using (
    exists (select 1 from public.tasks t where t.id = task_id and public.is_household_member(t.household_id))
  )
  with check (
    exists (select 1 from public.tasks t where t.id = task_id and public.is_household_member(t.household_id))
  );

-- completions: read/insert/delete within your households
drop policy if exists completions_select on public.completions;
create policy completions_select on public.completions for select using (public.is_household_member(household_id));
drop policy if exists completions_insert on public.completions;
create policy completions_insert on public.completions for insert with check (
  public.is_household_member(household_id) and user_id = auth.uid()
);
drop policy if exists completions_delete on public.completions;
create policy completions_delete on public.completions for delete using (public.is_household_member(household_id));

-- ---------------------------------------------------------------------------
-- RPCs: create / join a household (SECURITY DEFINER so the invite-code check
-- and the owner/member insert are enforced server-side)
-- ---------------------------------------------------------------------------

create or replace function public.create_household(p_name text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code  text;
  v_house public.households;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- short, alphanumeric invite code
  loop
    v_code := upper(substr(regexp_replace(encode(gen_random_bytes(12), 'base64'), '[^A-Za-z0-9]', '', 'g'), 1, 6));
    exit when length(v_code) = 6
      and not exists (select 1 from public.households where invite_code = v_code);
  end loop;

  insert into public.households (name, invite_code, created_by)
  values (coalesce(nullif(trim(p_name), ''), 'Home'), v_code, auth.uid())
  returning * into v_house;

  insert into public.household_members (household_id, user_id, role)
  values (v_house.id, auth.uid(), 'owner');

  return v_house;
end;
$$;

create or replace function public.join_household(p_code text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  v_house public.households;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_house from public.households
  where invite_code = upper(trim(p_code));

  if v_house.id is null then
    raise exception 'invalid invite code';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (v_house.id, auth.uid(), 'member')
  on conflict (household_id, user_id) do nothing;

  return v_house;
end;
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1),
    ''
  );
  insert into public.profiles (id, display_name, initial)
  values (new.id, v_name, upper(substr(coalesce(nullif(v_name, ''), 'H'), 1, 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_assignees;
alter publication supabase_realtime add table public.completions;
alter publication supabase_realtime add table public.household_members;
