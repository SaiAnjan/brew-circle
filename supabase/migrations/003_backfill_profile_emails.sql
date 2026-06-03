-- Backfill profile emails for accounts created before profiles.email existed.

update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id
  and public.profiles.email is null
  and auth.users.email is not null;
