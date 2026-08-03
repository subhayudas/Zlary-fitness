-- ============================================================================
-- Zlary Fitness — booking flow
-- ----------------------------------------------------------------------------
-- Run after 0001:
--   Supabase Dashboard → SQL Editor → paste → Run
--   or: supabase db push
--
-- The funnel used to be two things: an application form, then a third-party
-- calendar nobody on this side could see. It is now one flow that ends with a
-- booked slot, so a lead and its appointment are the same row.
--
-- Existing rows are left exactly as they are. The four questions the shorter
-- flow no longer asks simply become nullable — dropping the columns would throw
-- away answers already given.
-- ============================================================================

-- Questions the flow no longer asks ------------------------------------------
alter table public.coaching_applications
  alter column training_frequency drop not null,
  alter column motivation         drop not null,
  alter column support_needed     drop not null,
  alter column referral_source    drop not null;

-- The booked call --------------------------------------------------------------
alter table public.coaching_applications
  -- Instants, not wall-clock. The time zone below is for display and for the
  -- calendar event; it is never what decides when the call actually happens.
  add column if not exists slot_start          timestamptz,
  add column if not exists slot_end            timestamptz,
  add column if not exists booking_timezone    text,
  -- Google Calendar, when the integration is configured. Null is not a failure:
  -- the booking is confirmed by this row, not by the calendar.
  add column if not exists calendar_event_id   text,
  add column if not exists calendar_event_link text,
  -- Whether the applicant's invitation actually went out.
  add column if not exists invite_sent         boolean not null default false,
  -- Derived from the answers, stored so it can be sorted and filtered on.
  add column if not exists lead_quality        text;

-- Pipeline ---------------------------------------------------------------------
-- 'booked' already existed; 'cancelled' is new and is what frees a slot again.
alter table public.coaching_applications
  drop constraint if exists coaching_applications_status_check;

alter table public.coaching_applications
  add constraint coaching_applications_status_check
  check (status in (
    'new', 'reviewing', 'booked', 'accepted', 'declined', 'archived',
    'cancelled', 'completed', 'no_show'
  ));

alter table public.coaching_applications
  drop constraint if exists coaching_applications_lead_quality_check;

alter table public.coaching_applications
  add constraint coaching_applications_lead_quality_check
  check (lead_quality is null or lead_quality in ('hot', 'warm', 'cold'));

-- Idempotency ------------------------------------------------------------------
-- 0001 made this index partial (`where submission_id is not null`), which is
-- both unnecessary — Postgres already treats NULLs as distinct in a unique
-- index — and actively harmful: `ON CONFLICT (submission_id)` cannot infer a
-- partial index unless the predicate is repeated, so the retry-safe upsert the
-- booking route depends on would fail outright. Rebuilt without the predicate.
drop index if exists public.coaching_applications_submission_id_key;

create unique index coaching_applications_submission_id_key
  on public.coaching_applications (submission_id);

-- No two people in the same slot ----------------------------------------------
-- This is the real guard against a double booking, not the availability check in
-- the API: two requests can both read "free" before either has written. The
-- unique index makes the second insert fail, and the route turns that failure
-- into "someone just took that time" rather than a lost lead.
--
-- Cancelled and archived bookings are excluded, which is what releases the slot.
create unique index if not exists coaching_applications_slot_start_key
  on public.coaching_applications (slot_start)
  where slot_start is not null
    and status not in ('cancelled', 'archived', 'declined');

create index if not exists coaching_applications_slot_start_idx
  on public.coaching_applications (slot_start desc)
  where slot_start is not null;

create index if not exists coaching_applications_lead_quality_idx
  on public.coaching_applications (lead_quality)
  where lead_quality is not null;

comment on column public.coaching_applications.slot_start is
  'Start of the booked call, as an instant. Null for the applications taken before the booking flow existed.';
comment on column public.coaching_applications.lead_quality is
  'hot | warm | cold — derived from investment readiness and desired timeline. Tags the lead; never gates the booking.';
