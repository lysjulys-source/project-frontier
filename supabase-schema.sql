create extension if not exists pgcrypto;

create table if not exists public.frontier_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Julie',
  xp jsonb not null default '{"engineering":0,"science":0,"exploration":0,"community":0,"creativity":0,"vitality":0}'::jsonb,
  streak integer not null default 0 check (streak >= 0),
  last_report_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.frontier_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_group text not null check (quest_group in ('arcs','side','legendary')),
  category text not null,
  text text not null check (char_length(text) between 1 and 500),
  done boolean not null default false,
  awarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.frontier_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_date date not null,
  category text not null,
  text text not null check (char_length(text) between 1 and 500),
  xp integer not null default 0 check (xp >= 0),
  done boolean not null default false,
  awarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.frontier_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location text,
  status text,
  report text not null check (char_length(report) between 1 and 10000),
  victory text,
  obstacle text,
  tomorrow text,
  created_at timestamptz not null default now()
);

alter table public.frontier_profiles enable row level security;
alter table public.frontier_quests enable row level security;
alter table public.frontier_missions enable row level security;
alter table public.frontier_logs enable row level security;

drop policy if exists profiles_select_own on public.frontier_profiles;
create policy profiles_select_own on public.frontier_profiles for select using (auth.uid() = user_id);
drop policy if exists profiles_insert_own on public.frontier_profiles;
create policy profiles_insert_own on public.frontier_profiles for insert with check (auth.uid() = user_id);
drop policy if exists profiles_update_own on public.frontier_profiles;
create policy profiles_update_own on public.frontier_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists quests_all_own on public.frontier_quests;
create policy quests_all_own on public.frontier_quests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists missions_all_own on public.frontier_missions;
create policy missions_all_own on public.frontier_missions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists logs_all_own on public.frontier_logs;
create policy logs_all_own on public.frontier_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
