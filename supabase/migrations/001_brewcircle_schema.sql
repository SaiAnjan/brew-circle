-- BrewCircle core schema (Supabase Postgres)
-- Run in Supabase SQL Editor or via CLI: supabase db push

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  name text,
  handle text unique,
  avatar_initials text default 'BC',
  bio text default '',
  location text default '',
  brew_count integer not null default 0,
  follower_count integer not null default 0,
  flavor_coverage jsonb not null default '{}'::jsonb,
  journey jsonb not null default '[]'::jsonb,
  qa_stats jsonb not null default '{"questions":0,"answers":0,"accepted":0}'::jsonb,
  marketplace_rep jsonb not null default '{"rating":0,"sales":0,"reviews":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coffee DNA (separate table for clarity / querying)
create table if not exists public.coffee_dna (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  methods text[] not null default '{}',
  equipment text[] not null default '{}',
  favorite_beans text[] not null default '{}',
  favorite_roasters text[] not null default '{}',
  roast_prefs text[] not null default '{}',
  process_prefs text[] not null default '{}',
  flavor_prefs text[] not null default '{}',
  regions text[] not null default '{}',
  estates text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Marketplace listings
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles (id) on delete set null,
  title text not null,
  listing_type text not null check (listing_type in ('buy', 'sell', 'rent')),
  gear_category text not null default 'Other',
  price_paise integer not null,
  condition text not null default '',
  location text not null default '',
  description text default '',
  image_url text not null,
  dna_summary text default '',
  status text not null default 'active' check (status in ('active', 'sold', 'rented', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_listings_status_idx on public.marketplace_listings (status);
create index if not exists marketplace_listings_seller_idx on public.marketplace_listings (seller_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone, name, handle, avatar_initials)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'name', 'Brewer'),
    coalesce(new.raw_user_meta_data->>'handle', 'brewer_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'avatar_initials', 'BC')
  );
  insert into public.coffee_dna (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists listings_updated_at on public.marketplace_listings;
create trigger listings_updated_at before update on public.marketplace_listings
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.coffee_dna enable row level security;
alter table public.marketplace_listings enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "DNA viewable by everyone"
  on public.coffee_dna for select using (true);

create policy "Users can update own DNA"
  on public.coffee_dna for update using (auth.uid() = user_id);

create policy "Listings viewable when active"
  on public.marketplace_listings for select
  using (status = 'active' or seller_id = auth.uid());

create policy "Sellers can insert listings"
  on public.marketplace_listings for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update own listings"
  on public.marketplace_listings for update
  using (auth.uid() = seller_id);

-- Seed demo listings (no seller_id — showcase until users post)
insert into public.marketplace_listings (
  title, listing_type, gear_category, price_paise, condition, location,
  description, image_url, dna_summary
) values
  (
    'Comandante C40 MK4 — barely used',
    'sell', 'Grinders', 1850000, 'Like new', 'Bangalore',
    'Purchased 3 months ago, ~20kg through it. Includes travel bag.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    'Pour-over · Light roasts · V60'
  ),
  (
    'Flair 58 + pressure gauge (rent/week)',
    'rent', 'Espresso', 250000, 'Excellent', 'Mumbai',
    'Weekly rental for dial-in sessions. Pickup Bandra.',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    'Espresso · Medium-dark · Dial-in friendly'
  ),
  (
    'Hario V60 02 ceramic + filters bundle',
    'sell', 'Brewers', 220000, 'Good', 'Chennai',
    'Ceramic dripper, 100 filters, no chips.',
    'https://images.unsplash.com/photo-1497935582991-80fd194ea0a3?w=800&q=80',
    'V60 · Naturals · Floral profiles'
  ),
  (
    'Blue Tokai Ratnagiri 250g (unopened)',
    'sell', 'Beans', 65000, 'Sealed', 'Bangalore, Indiranagar',
    'Roasted 2 weeks ago, well packed.',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    'Washed · Chikmagalur · V60'
  ),
  (
    'Fellow Stagg EKG 0.6L — wanted',
    'buy', 'Kettles', 1200000, 'Any working', 'Kochi',
    'Looking for Bangalore/Mumbai shipping ok.',
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    'Espresso · Medium roasts'
  ),
  (
    '1Zpresso JX-Pro hand grinder',
    'sell', 'Grinders', 980000, 'Very good', 'Hyderabad',
    'Upgraded to electric. All parts included.',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    'Espresso · Moka · Travel brewing'
  )
;
