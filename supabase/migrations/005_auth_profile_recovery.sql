-- Allow the app to recover missing profile/DNA rows for authenticated users.
-- This protects sign-in after legacy auth changes or failed trigger inserts.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
      on public.profiles for insert
      with check (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'coffee_dna'
      and policyname = 'Users can insert own DNA'
  ) then
    create policy "Users can insert own DNA"
      on public.coffee_dna for insert
      with check (auth.uid() = user_id);
  end if;
end $$;
