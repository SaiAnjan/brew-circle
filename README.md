# BrewCircle

India's marketplace and community for home specialty coffee brewers.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Supabase** — open-source Postgres, Row Level Security, marketplace/profile data
- **Firebase Auth** — phone OTP sign-in

We use Supabase for structured marketplace data because Postgres fits listings, profiles, and Coffee DNA well. Firebase handles phone OTP so BrewCircle does not need a separate Twilio or MessageBird setup for SMS during the MVP.

## Setup

1. Copy env file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Create a [Supabase](https://supabase.com) project (or reuse an existing one).

3. Run the schema in **SQL Editor**:

   `supabase/migrations/001_brewcircle_schema.sql`

4. Create or reuse a Firebase web app and enable **Phone** in Firebase Authentication → Sign-in method.

5. Add `localhost` and `brew-circle.vercel.app` in Firebase Authentication → Settings → Authorized domains.

6. Add to `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

7. Dev server:

   ```bash
   npm run dev
   ```

Without Supabase env vars, the app uses local mock data (marketplace images from Unsplash). Without Firebase env vars, phone login shows setup guidance.

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

Supabase profile writes are still schema-ready. Firebase Phone Auth currently signs users into the web app; deeper Firebase-to-Supabase profile syncing can be added when listing creation and account persistence are wired.
