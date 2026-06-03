# BrewCircle

India's marketplace and community for home specialty coffee brewers.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Supabase** — open-source Postgres, Row Level Security, marketplace/profile data, email magic-link sign-in

We use Supabase for structured marketplace data and email magic-link auth because Postgres fits listings, profiles, and Coffee DNA well. Phone number is collected during onboarding after email verification.

## Setup

1. Copy env file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Create a [Supabase](https://supabase.com) project (or reuse an existing one).

3. Run the schema in **SQL Editor**:

   `supabase/migrations/001_brewcircle_schema.sql`

   If you already ran the first migration before email signup, run:

   `supabase/migrations/002_email_signup_onboarding.sql`

   If accounts existed before `profiles.email` was added, also run:

   `supabase/migrations/003_backfill_profile_emails.sql`

4. In Supabase Authentication → Providers, ensure **Email** is enabled.

5. Add to `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

6. Dev server:

   ```bash
   npm run dev
   ```

Without Supabase env vars, the app uses local mock data (marketplace images from Unsplash) and login shows setup guidance.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | **Marketplace home** (listings with photos) |
| `/marketplace/[id]` | Listing detail |
| `/login` | Existing-user email sign-in |
| `/signup` | New-user account creation |
| `/profile` | Profile + DNA (loads from DB when signed in) |
| `/discover` | Beans, brewers, sessions |
| `/onboarding` | Coffee DNA wizard |
| `/community`, `/sessions`, `/compare` | Community features |

## Database tables

- `profiles` — account, bio, flavor coverage, journey, marketplace reputation
- `coffee_dna` — methods, equipment, roasters, regions, etc.
- `marketplace_listings` — buy / sell / rent with `image_url`, price in paise

Supabase Auth creates users by email magic link. The signup trigger seeds `profiles` + `coffee_dna`; onboarding then saves name, handle, phone number, location, bio, and Coffee DNA.
