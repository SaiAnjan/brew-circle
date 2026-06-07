-- Merge legacy profile rows into the currently authenticated user by auth email/phone.
-- This fixes email-first / phone-first testing where Supabase Auth created separate users.

create or replace function public.claim_current_user_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_uid uuid := auth.uid();
  current_email text;
  current_phone text;
  source_profile public.profiles%rowtype;
begin
  if current_uid is null then
    raise exception 'Not authenticated';
  end if;

  select email, phone
    into current_email, current_phone
  from auth.users
  where id = current_uid;

  insert into public.profiles (id, email, phone, name, handle, avatar_initials)
  values (
    current_uid,
    current_email,
    current_phone,
    'Brewer',
    'brewer_' || substr(current_uid::text, 1, 8),
    'BC'
  )
  on conflict (id) do nothing;

  insert into public.coffee_dna (user_id)
  values (current_uid)
  on conflict (user_id) do nothing;

  select *
    into source_profile
  from public.profiles
  where id <> current_uid
    and (
      (current_email is not null and email = current_email)
      or (current_phone is not null and phone = current_phone)
    )
  order by updated_at desc nulls last
  limit 1;

  if source_profile.id is not null then
    update public.profiles
    set email = null
    where id <> current_uid
      and current_email is not null
      and email = current_email;

    update public.profiles
    set phone = null
    where id <> current_uid
      and current_phone is not null
      and phone = current_phone;

    if source_profile.handle is not null and source_profile.handle <> '' then
      update public.profiles
      set handle = handle || '_merged_' || substr(id::text, 1, 4)
      where id = source_profile.id;
    end if;

    update public.profiles
    set
      email = coalesce(current_email, email),
      phone = coalesce(current_phone, phone),
      name = coalesce(nullif(source_profile.name, ''), nullif(name, ''), 'Brewer'),
      handle = coalesce(nullif(source_profile.handle, ''), handle),
      avatar_initials = coalesce(nullif(source_profile.avatar_initials, ''), avatar_initials, 'BC'),
      bio = coalesce(source_profile.bio, bio, ''),
      location = coalesce(source_profile.location, location, ''),
      coffee_persona = coalesce(source_profile.coffee_persona, coffee_persona),
      coffee_personality = coalesce(source_profile.coffee_personality, coffee_personality),
      taste_summary = coalesce(source_profile.taste_summary, taste_summary),
      brew_count = greatest(coalesce(brew_count, 0), coalesce(source_profile.brew_count, 0)),
      follower_count = greatest(coalesce(follower_count, 0), coalesce(source_profile.follower_count, 0)),
      flavor_coverage = case
        when source_profile.flavor_coverage is not null and source_profile.flavor_coverage <> '{}'::jsonb
          then source_profile.flavor_coverage
        else flavor_coverage
      end,
      journey = case
        when source_profile.journey is not null and source_profile.journey <> '[]'::jsonb
          then source_profile.journey
        else journey
      end,
      qa_stats = coalesce(source_profile.qa_stats, qa_stats),
      marketplace_rep = coalesce(source_profile.marketplace_rep, marketplace_rep)
    where id = current_uid;

    insert into public.coffee_dna (
      user_id,
      methods,
      equipment,
      favorite_beans,
      favorite_roasters,
      roast_prefs,
      process_prefs,
      flavor_prefs,
      regions,
      estates,
      usual_drinks,
      cafe_visit_reasons,
      cafe_frequency,
      learning_goals,
      experience_level
    )
    select
      current_uid,
      methods,
      equipment,
      favorite_beans,
      favorite_roasters,
      roast_prefs,
      process_prefs,
      flavor_prefs,
      regions,
      estates,
      usual_drinks,
      cafe_visit_reasons,
      cafe_frequency,
      learning_goals,
      experience_level
    from public.coffee_dna
    where user_id = source_profile.id
    on conflict (user_id) do update set
      methods = excluded.methods,
      equipment = excluded.equipment,
      favorite_beans = excluded.favorite_beans,
      favorite_roasters = excluded.favorite_roasters,
      roast_prefs = excluded.roast_prefs,
      process_prefs = excluded.process_prefs,
      flavor_prefs = excluded.flavor_prefs,
      regions = excluded.regions,
      estates = excluded.estates,
      usual_drinks = excluded.usual_drinks,
      cafe_visit_reasons = excluded.cafe_visit_reasons,
      cafe_frequency = excluded.cafe_frequency,
      learning_goals = excluded.learning_goals,
      experience_level = excluded.experience_level;

    delete from public.profiles
    where id = source_profile.id;
  end if;

  update public.profiles
  set
    email = coalesce(current_email, email),
    phone = coalesce(current_phone, phone)
  where id = current_uid;
end;
$$;

grant execute on function public.claim_current_user_profile() to authenticated;
