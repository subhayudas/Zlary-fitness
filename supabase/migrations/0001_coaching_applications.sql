-- ============================================================================
-- Zlary Fitness — coaching applications
-- ----------------------------------------------------------------------------
-- Run this once against the project:
--   Supabase Dashboard → SQL Editor → paste → Run
--   or: supabase db push
--
-- Security model: the table is protected by RLS with NO policies, so the
-- anonymous and authenticated keys can read and write nothing at all. The API
-- route writes with the service-role key, which bypasses RLS and never leaves
-- the server. Reading is done from the Supabase dashboard.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.coaching_applications (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Contact -----------------------------------------------------------------
  full_name            text        not null,
  email                text        not null,
  phone                text        not null,
  instagram_username   text,
  preferred_language   text        not null,

  -- Goal --------------------------------------------------------------------
  primary_goal         text        not null,
  training_level       text        not null,
  training_frequency   text        not null,
  desired_timeline     text        not null,
  biggest_obstacle     text        not null,

  -- Fit ---------------------------------------------------------------------
  motivation           text        not null,
  support_needed       text        not null,
  investment_readiness text        not null,
  referral_source      text        not null,

  -- Consent -----------------------------------------------------------------
  -- Explicit, opt-in only. Defaults to false so a missing value can never be
  -- read as consent.
  marketing_consent    boolean     not null default false,

  -- Attribution -------------------------------------------------------------
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,
  utm_content          text,
  utm_term             text,
  referrer             text,

  -- Pipeline ----------------------------------------------------------------
  status               text        not null default 'new',

  -- Idempotency key generated once per browser form session. Unique so a
  -- retried submission updates its row instead of creating a duplicate.
  submission_id        text,

  constraint coaching_applications_status_check
    check (status in ('new', 'reviewing', 'booked', 'accepted', 'declined', 'archived')),
  constraint coaching_applications_email_check
    check (position('@' in email) > 1)
);

create unique index if not exists coaching_applications_submission_id_key
  on public.coaching_applications (submission_id)
  where submission_id is not null;

create index if not exists coaching_applications_created_at_idx
  on public.coaching_applications (created_at desc);

create index if not exists coaching_applications_status_idx
  on public.coaching_applications (status);

-- Keep updated_at honest ------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists coaching_applications_set_updated_at
  on public.coaching_applications;

create trigger coaching_applications_set_updated_at
  before update on public.coaching_applications
  for each row execute function public.set_updated_at();

-- Row level security ----------------------------------------------------------
-- Enabled with no policies: every client-side key is denied. Only the
-- service-role key (server-side, in the API route) can touch this table.
alter table public.coaching_applications enable row level security;

revoke all on public.coaching_applications from anon, authenticated;

comment on table public.coaching_applications is
  'Coaching applications submitted from the Zlary Fitness website. Contains personal data: access is restricted to the service role. No health data is collected.';
