-- BrewCircle email OTP signup + onboarding profile updates
-- Run this after 001_brewcircle_schema.sql on existing Supabase projects.

alter table public.profiles add column if not exists email text;
create unique index if not exists profiles_email_key on public.profiles (email) where email is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, name, handle, avatar_initials)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'name', 'Brewer'),
    coalesce(new.raw_user_meta_data->>'handle', 'brewer_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'avatar_initials', 'BC')
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone;

  insert into public.coffee_dna (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
