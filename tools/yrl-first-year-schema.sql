-- ============================================================
--  Your First Year — progress tracking
--  Project: wdvolamasztetwpitbwg ("thedanielcope-byte's Project"),
--  the project yrl-auth.js authenticates against.
--
--  ALREADY APPLIED 2026-07-22 via migration `yrl_first_year_progress`.
--  Kept here as the source of record. Safe to re-run.
-- ============================================================

-- ── Enrollment: one row per agent, drives the "suggested pace" indicator ──
create table if not exists public.yrl_first_year_enrollment (
    user_id     uuid primary key references auth.users (id) on delete cascade,
    started_on  date        not null default current_date,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ── Progress: one row per agent per lesson ──
create table if not exists public.yrl_first_year_progress (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid  not null references auth.users (id) on delete cascade,
    lesson_id    text  not null,                       -- e.g. 'm01l1'
    completed_at timestamptz,                          -- null = not complete
    actions      jsonb not null default '[]'::jsonb,   -- array of ints: indexes of ticked action items
    quiz_score   int,                                  -- number answered correctly
    quiz_total   int,
    notes        text  not null default '',
    updated_at   timestamptz not null default now(),
    unique (user_id, lesson_id)
);

create index if not exists yrl_fy_progress_user_idx
    on public.yrl_first_year_progress (user_id);

-- ── keep updated_at honest ──
create or replace function public.yrl_fy_touch()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists yrl_fy_progress_touch on public.yrl_first_year_progress;
create trigger yrl_fy_progress_touch
    before update on public.yrl_first_year_progress
    for each row execute function public.yrl_fy_touch();

drop trigger if exists yrl_fy_enrollment_touch on public.yrl_first_year_enrollment;
create trigger yrl_fy_enrollment_touch
    before update on public.yrl_first_year_enrollment
    for each row execute function public.yrl_fy_touch();

-- ============================================================
--  Row Level Security — an agent sees and edits only their own rows
-- ============================================================
alter table public.yrl_first_year_enrollment enable row level security;
alter table public.yrl_first_year_progress   enable row level security;

drop policy if exists "own enrollment" on public.yrl_first_year_enrollment;
create policy "own enrollment"
    on public.yrl_first_year_enrollment
    for all
    using      (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "own progress" on public.yrl_first_year_progress;
create policy "own progress"
    on public.yrl_first_year_progress
    for all
    using      (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ============================================================
--  OPTIONAL — broker visibility into agent progress.
--  Not enabled, because it needs a source of truth for "who is a broker."
--  If you have (or add) a profiles table with a role column, uncomment:
--
--  create policy "brokers read all progress"
--      on public.yrl_first_year_progress
--      for select
--      using (exists (
--          select 1 from public.profiles p
--          where p.id = auth.uid() and p.role in ('broker', 'admin')
--      ));
-- ============================================================
