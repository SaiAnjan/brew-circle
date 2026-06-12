-- BrewCircle Phase 1 café order + rating loop.
-- QR/menu/payment is mocked in-app, but these tables store real drink history and DNA signals.

create table if not exists public.cafes (
  id text primary key,
  name text not null,
  area text not null default '',
  city text not null default '',
  address text not null default '',
  vibe text not null default '',
  image_url text not null default '',
  match_reason text not null default '',
  qr_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cafe_menu_items (
  id text primary key,
  cafe_id text not null references public.cafes (id) on delete cascade,
  name text not null,
  category text not null default 'Coffee',
  price_paise integer not null default 0,
  description text not null default '',
  flavor_notes text[] not null default '{}',
  attributes text[] not null default '{}',
  dna_signals text[] not null default '{}',
  offer text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coffee_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cafe_id text not null references public.cafes (id) on delete cascade,
  menu_item_id text references public.cafe_menu_items (id) on delete set null,
  drink_name text not null,
  price_paise integer not null default 0,
  payment_status text not null default 'paid_mock',
  dna_signals text[] not null default '{}',
  rating text check (rating is null or rating in ('loved', 'good', 'okay', 'not_for_me')),
  created_at timestamptz not null default now()
);

create table if not exists public.drink_ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.coffee_orders (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  cafe_id text not null references public.cafes (id) on delete cascade,
  menu_item_id text references public.cafe_menu_items (id) on delete set null,
  rating text not null check (rating in ('loved', 'good', 'okay', 'not_for_me')),
  notes text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists cafe_menu_items_cafe_idx on public.cafe_menu_items (cafe_id);
create index if not exists coffee_orders_user_created_idx on public.coffee_orders (user_id, created_at desc);
create index if not exists drink_ratings_user_created_idx on public.drink_ratings (user_id, created_at desc);

drop trigger if exists cafes_updated_at on public.cafes;
create trigger cafes_updated_at before update on public.cafes
  for each row execute procedure public.set_updated_at();

drop trigger if exists cafe_menu_items_updated_at on public.cafe_menu_items;
create trigger cafe_menu_items_updated_at before update on public.cafe_menu_items
  for each row execute procedure public.set_updated_at();

alter table public.cafes enable row level security;
alter table public.cafe_menu_items enable row level security;
alter table public.coffee_orders enable row level security;
alter table public.drink_ratings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cafes' and policyname = 'Cafes are viewable by everyone') then
    create policy "Cafes are viewable by everyone"
      on public.cafes for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cafe_menu_items' and policyname = 'Cafe menus are viewable by everyone') then
    create policy "Cafe menus are viewable by everyone"
      on public.cafe_menu_items for select using (active = true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'coffee_orders' and policyname = 'Users can view own coffee orders') then
    create policy "Users can view own coffee orders"
      on public.coffee_orders for select using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'coffee_orders' and policyname = 'Users can insert own coffee orders') then
    create policy "Users can insert own coffee orders"
      on public.coffee_orders for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'coffee_orders' and policyname = 'Users can update own coffee orders') then
    create policy "Users can update own coffee orders"
      on public.coffee_orders for update using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'drink_ratings' and policyname = 'Users can view own drink ratings') then
    create policy "Users can view own drink ratings"
      on public.drink_ratings for select using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'drink_ratings' and policyname = 'Users can insert own drink ratings') then
    create policy "Users can insert own drink ratings"
      on public.drink_ratings for insert with check (auth.uid() = user_id);
  end if;
end $$;

insert into public.cafes (id, name, area, city, address, vibe, image_url, match_reason, qr_code)
values
  (
    'humming-tree-cafe',
    'Humming Tree Coffee',
    'Indiranagar',
    'Bangalore',
    '12th Main, Indiranagar, Bangalore',
    'Work-friendly café with bright cold brews and milk-based comfort drinks.',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
    'Strong fit for café regulars, remote workers, and cold coffee drinkers.',
    'BC-HUMMING-001'
  ),
  (
    'third-wave-bandra',
    'Third Wave Bandra',
    'Bandra',
    'Mumbai',
    'Pali Hill, Bandra West, Mumbai',
    'Social café for meetings, espresso drinks, and dessert-like coffees.',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80',
    'Good for people who repeatedly order cappuccinos, mochas, and iced drinks.',
    'BC-BANDRA-002'
  )
on conflict (id) do update set
  name = excluded.name,
  area = excluded.area,
  city = excluded.city,
  address = excluded.address,
  vibe = excluded.vibe,
  image_url = excluded.image_url,
  match_reason = excluded.match_reason,
  qr_code = excluded.qr_code;

insert into public.cafe_menu_items (id, cafe_id, name, category, price_paise, description, flavor_notes, attributes, dna_signals, offer)
values
  ('cranberry-nitro-cold-brew', 'humming-tree-cafe', 'Cranberry Nitro Cold Brew', 'Cold coffee', 26000, 'Nitro cold brew with cranberry brightness and a soft, creamy texture.', array['Berry','Citrus'], array['Cold','Fruity','Refreshing','Low sweetness'], array['cold coffee','fruit-forward','bright acidity','nitro texture'], 'Like this? Unlock a 10-cup cranberry nitro pack valid for 30 days.'),
  ('comfort-cappuccino', 'humming-tree-cafe', 'Comfort Cappuccino', 'Milk coffee', 19000, 'Classic cappuccino with chocolate-forward espresso and steamed milk.', array['Chocolate','Nutty'], array['Milk-based','Comforting','Chocolatey'], array['milk-based','comfort drink','chocolate-forward'], null),
  ('filter-cloud', 'humming-tree-cafe', 'Filter Cloud', 'Indian coffee', 17000, 'South Indian filter-style milk coffee, served airy and sweet.', array['Caramel','Nutty'], array['Sweet','Milk-based','Familiar'], array['filter coffee','sweet comfort','milk-based'], null),
  ('bandra-mocha', 'third-wave-bandra', 'Bandra Mocha', 'Milk coffee', 24000, 'Chocolate-forward mocha for dessert coffee drinkers.', array['Chocolate','Caramel'], array['Sweet','Dessert-like','Milk-based'], array['dessert coffee','chocolate-forward','milk-based'], 'Dessert Lover match: café can target you with mocha bundles.'),
  ('iced-americano-spark', 'third-wave-bandra', 'Iced Americano Spark', 'Cold coffee', 18000, 'Light, chilled black coffee with citrus lift.', array['Citrus','Floral'], array['Cold','Black coffee','Light'], array['black coffee','cold coffee','citrus lift'], null)
on conflict (id) do update set
  cafe_id = excluded.cafe_id,
  name = excluded.name,
  category = excluded.category,
  price_paise = excluded.price_paise,
  description = excluded.description,
  flavor_notes = excluded.flavor_notes,
  attributes = excluded.attributes,
  dna_signals = excluded.dna_signals,
  offer = excluded.offer,
  active = true;
