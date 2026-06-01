import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { BeanCard } from "@/components/BeanCard";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SessionCard } from "@/components/SessionCard";
import {
  beans,
  communityFavorites,
  currentUser,
  marketplaceListings,
  sessions,
  topBrewers,
} from "@/lib/data";

export default function HomePage() {
  const trending = beans.filter((b) => b.trending);
  const recommendations = beans.filter((b) =>
    currentUser.dna.flavorPrefs.some((f) => b.flavorNotes.includes(f)),
  );

  return (
    <div className="gradient-hero">
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 text-center sm:pt-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs text-amber">
          <Sparkles className="h-3.5 w-3.5" />
          India&apos;s home coffee community
        </p>
        <h1 className="font-display text-4xl text-cream sm:text-5xl md:text-6xl">
          Brew. Share. Discover.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-cream/70">
          Your Coffee DNA, flavor journey, marketplace, and sessions — built for Indian specialty
          home brewers.
        </p>
        <form className="mx-auto mt-8 flex max-w-lg gap-2" action="/community">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
            <input
              type="search"
              name="q"
              placeholder="Search beans, gear, brewers, questions..."
              className="w-full rounded-full border border-cream/15 bg-roast/80 py-3 pl-10 pr-4 text-sm text-cream placeholder:text-cream/40 focus:border-amber/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-amber px-5 py-3 text-sm font-medium text-espresso hover:bg-amber-light"
          >
            Search
          </button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/onboarding" className="text-sm text-amber hover:underline">
            Build your Coffee DNA →
          </Link>
          <Link href="/profile" className="text-sm text-cream/60 hover:text-cream">
            View profile
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 pb-16">
        <section>
          <SectionHeader title="Trending coffees" subtitle="What India is brewing this week" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((bean) => (
              <BeanCard key={bean.id} bean={bean} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Community favorites" subtitle="Most loved on BrewCircle" />
          <div className="grid gap-4 sm:grid-cols-3">
            {communityFavorites.map((fav) => {
              const bean = beans.find((b) => b.id === fav.beanId)!;
              return (
                <BeanCard
                  key={fav.beanId}
                  bean={bean}
                  meta={`${fav.loves.toLocaleString()} loves · ${fav.reviews} reviews`}
                />
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeader title="Top brewers" subtitle="Profiles worth following" href="/profile" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topBrewers.map((brewer) => (
              <div
                key={brewer.id}
                className="card-hover flex items-center gap-3 rounded-2xl border border-cream/10 bg-roast p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/20 text-sm font-bold text-amber">
                  {brewer.avatar}
                </div>
                <div>
                  <p className="font-medium text-cream">{brewer.name}</p>
                  <p className="text-xs text-cream/50">@{brewer.handle}</p>
                  <p className="text-xs text-amber/80">{brewer.specialty}</p>
                  <p className="text-xs text-cream/40">{brewer.brewCount} brews logged</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Marketplace" subtitle="Buy, sell, rent gear" href="/marketplace" />
          <div className="grid gap-4 sm:grid-cols-2">
            {marketplaceListings.slice(0, 4).map((listing) => (
              <MarketplaceCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Coffee sessions" subtitle="Workshops & tastings near you" href="/sessions" />
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.slice(0, 4).map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="For your palate" subtitle="Based on your Coffee DNA" />
          <div className="grid gap-4 sm:grid-cols-3">
            {recommendations.map((bean) => (
              <BeanCard key={bean.id} bean={bean} meta="Recommended for you" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
