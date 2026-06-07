-- Explicit onboarding completion marker.
-- The app also falls back to persona/DNA data for rows created before this migration.

alter table public.profiles
add column if not exists onboarding_completed_at timestamptz;

update public.profiles
set onboarding_completed_at = coalesce(onboarding_completed_at, updated_at, now())
where onboarding_completed_at is null
  and (
    coffee_persona is not null
    or name is not null and name <> '' and name <> 'Brewer'
  );

create index if not exists profiles_onboarding_completed_idx
on public.profiles (onboarding_completed_at)
where onboarding_completed_at is not null;
