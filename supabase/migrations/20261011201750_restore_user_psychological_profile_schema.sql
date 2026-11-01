-- Restore the private per-user tables used by psychologicalProfile.ts.
-- The feature stores sensitive reflections/derived emotion signals, so rows are
-- strictly isolated to the authenticated owner and never readable by anon.

create table if not exists public.user_psychological_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dominant_emotion text,
  mood_history text[] not null default '{}'::text[],
  traits jsonb not null default '{}'::jsonb,
  last_updated timestamptz not null default now()
);

alter table public.user_psychological_profiles enable row level security;
revoke all on table public.user_psychological_profiles from anon, authenticated;
grant select, insert, update, delete on table public.user_psychological_profiles to authenticated;

drop policy if exists user_psychological_profiles_select_own on public.user_psychological_profiles;
create policy user_psychological_profiles_select_own
  on public.user_psychological_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists user_psychological_profiles_insert_own on public.user_psychological_profiles;
create policy user_psychological_profiles_insert_own
  on public.user_psychological_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists user_psychological_profiles_update_own on public.user_psychological_profiles;
create policy user_psychological_profiles_update_own
  on public.user_psychological_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists user_psychological_profiles_delete_own on public.user_psychological_profiles;
create policy user_psychological_profiles_delete_own
  on public.user_psychological_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.user_emotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emotion_type text not null,
  score numeric not null default 0,
  context_text text,
  source_feature text not null,
  created_at timestamptz not null default now()
);

alter table public.user_emotions enable row level security;
revoke all on table public.user_emotions from anon, authenticated;
grant select, insert on table public.user_emotions to authenticated;

drop policy if exists user_emotions_select_own on public.user_emotions;
create policy user_emotions_select_own
  on public.user_emotions for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists user_emotions_insert_own on public.user_emotions;
create policy user_emotions_insert_own
  on public.user_emotions for insert to authenticated
  with check ((select auth.uid()) = user_id);
