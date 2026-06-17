-- BrewCircle POS bill bridge columns for existing Phase 1 databases.
-- Run this after 008 if the café order tables already exist.

alter table public.coffee_orders add column if not exists invoice_number text;
alter table public.coffee_orders add column if not exists bill_total_paise integer not null default 0;
alter table public.coffee_orders add column if not exists payment_method text not null default 'demo_upi';
alter table public.coffee_orders add column if not exists payment_reference text;
alter table public.coffee_orders add column if not exists source text not null default 'menu_demo';

create index if not exists coffee_orders_invoice_number_idx on public.coffee_orders (invoice_number);
