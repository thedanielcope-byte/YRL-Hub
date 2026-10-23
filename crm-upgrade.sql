-- ═══════════════════════════════════════════════════════════════════════
-- YRL Agent CRM upgrade  ·  run once in the YRL Supabase SQL editor
-- Project: wdvolamasztetwpitbwg  (Dashboard → SQL Editor → paste → Run)
-- Adds Buyer/Seller pipeline + deal tracking to agent_contacts, plus
-- follow-up tasks and an activity log. Everything is per-agent private
-- via RLS (owner_id = auth.uid()). Safe to re-run (idempotent).
-- ═══════════════════════════════════════════════════════════════════════

-- 1) Deal / pipeline fields on the existing contacts table ---------------
alter table public.agent_contacts
  add column if not exists pipeline_side  text,      -- 'buyer' | 'seller' | null
  add column if not exists stage          text,      -- stage name within that side's pipeline
  add column if not exists deal_value     numeric,   -- estimated sale price / deal size
  add column if not exists est_commission numeric,   -- estimated commission $
  add column if not exists expected_close date;

-- 2) Follow-up tasks -----------------------------------------------------
create table if not exists public.agent_contact_tasks (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid(),
  contact_id  uuid references public.agent_contacts(id) on delete cascade,
  title       text not null,
  due_date    date,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists agent_contact_tasks_owner_idx   on public.agent_contact_tasks(owner_id);
create index if not exists agent_contact_tasks_contact_idx on public.agent_contact_tasks(contact_id);
create index if not exists agent_contact_tasks_due_idx     on public.agent_contact_tasks(due_date);

alter table public.agent_contact_tasks enable row level security;
drop policy if exists "tasks own all" on public.agent_contact_tasks;
create policy "tasks own all" on public.agent_contact_tasks
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- 3) Activity log (calls / texts / emails / notes / meetings) ------------
create table if not exists public.agent_contact_activities (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid(),
  contact_id  uuid references public.agent_contacts(id) on delete cascade,
  kind        text not null default 'note',   -- call | text | email | note | meeting
  body        text,
  created_at  timestamptz not null default now()
);
create index if not exists agent_contact_activities_owner_idx   on public.agent_contact_activities(owner_id);
create index if not exists agent_contact_activities_contact_idx on public.agent_contact_activities(contact_id);
create index if not exists agent_contact_activities_created_idx on public.agent_contact_activities(created_at desc);

alter table public.agent_contact_activities enable row level security;
drop policy if exists "activities own all" on public.agent_contact_activities;
create policy "activities own all" on public.agent_contact_activities
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
