-- BrewCircle persona onboarding + beginner-friendly coffee discovery profile

alter table public.profiles add column if not exists coffee_persona text;
alter table public.profiles add column if not exists coffee_personality text not null default 'Flavor Explorer';
alter table public.profiles add column if not exists taste_summary text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_coffee_persona_check'
  ) then
    alter table public.profiles
      add constraint profiles_coffee_persona_check
      check (
        coffee_persona is null
        or coffee_persona in (
          'home_brewer',
          'cafe_regular',
          'casual_drinker',
          'coffee_curious',
          'coffee_enthusiast'
        )
      );
  end if;
end $$;

alter table public.coffee_dna add column if not exists usual_drinks text[] not null default '{}';
alter table public.coffee_dna add column if not exists cafe_visit_reasons text[] not null default '{}';
alter table public.coffee_dna add column if not exists cafe_frequency text not null default '';
alter table public.coffee_dna add column if not exists learning_goals text[] not null default '{}';
alter table public.coffee_dna add column if not exists experience_level text not null default '';

create index if not exists profiles_coffee_persona_idx on public.profiles (coffee_persona);
