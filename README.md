# BrewCircle

India's marketplace and community for home specialty coffee brewers.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Supabase** — open-source Postgres, Row Level Security, phone OTP auth, storage-ready

We use Supabase (same pattern as [my-portfolio](https://github.com/SaiAnjan/newportolfio)) instead of Firebase: Postgres fits marketplace listings, profiles, and Coffee DNA; generous free tier; you can self-host if needed.

## Setup

1. Copy env file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Create a [Supabase](https://supabase.com) project (or reuse an existing one).

3. Run the schema in **SQL Editor**:

   `supabase/migrations/001_brewcircle_schema.sql`

4. Enable **Phone** auth: Authentication → Providers → Phone (Twilio/MessageBird per [Supabase docs](https://supabase.com/docs/guides/auth/phone-login)).

5. Add to `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

6. Dev server:

   ```bash
   npm run dev
   ```

Without Supabase env vars, the app uses local mock data (marketplace images from Unsplash).

## Routes

| Route | Purpose |
|-------|---------|
| `/` | **Marketplace home** (listings with photos) |
| `/marketplace/[id]` | Listing detail |
| `/login` | Mobile (+91) OTP signup |
| `/profile` | Profile + DNA (loads from DB when signed in) |
| `/discover` | Beans, brewers, sessions |
| `/onboarding` | Coffee DNA wizard |
| `/community`, `/sessions`, `/compare` | Community features |

## Database tables

- `profiles` — account, bio, flavor coverage, journey, marketplace reputation
- `coffee_dna` — methods, equipment, roasters, regions, etc.
- `marketplace_listings` — buy / sell / rent with `image_url`, price in paise

Auth users are created via phone OTP; a trigger seeds `profiles` + `coffee_dna` on signup.
