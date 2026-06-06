import Link from "next/link";
import { BeanCard } from "@/components/BeanCard";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { SessionCard } from "@/components/SessionCard";
import { beans, communityFavorites, currentUser, sessions, topBrewers } from "@/lib/data";
import { Bean, Calendar, Compass, Users } from "lucide-react";

export default function DiscoverPage() {
  const trending = beans.filter((b) => b.trending);
  const recommendations = beans.filter((b) =>
    currentUser.dna.flavorPrefs.some((f) => b.flavorNotes.includes(f)),
  );
  const favoriteBeans = communityFavorites.flatMap((fav) => {
    const bean = beans.find((b) => b.id === fav.beanId);
    return bean ? [{ ...fav, bean }] : [];
  });

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Discover</h1>
        <p className="mt-1 text-sm text-muted">
          Beans, brewers, sessions —{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to marketplace
          </Link>
        </p>
      </div>

      <section>
        <SectionHeader title="Trending coffees" subtitle="What India is brewing this week" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((bean) => (
            <BeanCard key={bean.id} bean={bean} />
          ))}
        </div>
        {trending.length === 0 && (
          <EmptyState
            className="mt-4"
            icon={<Compass className="h-5 w-5" />}
            title="No trending coffees yet"
            description="Trending coffees will appear once the community starts logging what they brew and love."
          />
        )}
      </section>

      <section>
        <SectionHeader title="Community favorites" subtitle="Most loved on BrewCircle" />
        <div className="grid gap-4 sm:grid-cols-3">
          {favoriteBeans.map((fav) => (
            <BeanCard
              key={fav.beanId}
              bean={fav.bean}
              meta={`${fav.loves.toLocaleString()} loves · ${fav.reviews} reviews`}
            />
          ))}
        </div>
        {favoriteBeans.length === 0 && (
          <EmptyState
            className="mt-4"
            icon={<Bean className="h-5 w-5" />}
            title="No community favorites yet"
            description="Beans with strong community response will appear here after users start reviewing coffees."
          />
        )}
      </section>

      <section>
        <SectionHeader title="Top brewers" subtitle="Profiles worth following" href="/profile" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topBrewers.map((brewer) => (
            <div key={brewer.id} className="card-surface flex items-center gap-3 rounded-md p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-sm font-bold text-primary">
                {brewer.avatar}
              </div>
              <div>
                <p className="text-sm font-medium">{brewer.name}</p>
                <p className="text-xs text-muted">@{brewer.handle}</p>
                <p className="text-xs text-foreground/70">{brewer.specialty}</p>
              </div>
            </div>
          ))}
        </div>
        {topBrewers.length === 0 && (
          <EmptyState
            className="mt-4"
            icon={<Users className="h-5 w-5" />}
            title="No brewers to follow yet"
            description="Interesting profiles will appear here once more users complete onboarding."
            actionHref="/signup"
            actionLabel="Create your profile"
          />
        )}
      </section>

      <section>
        <SectionHeader title="Coffee sessions" subtitle="Workshops & tastings" href="/sessions" />
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.slice(0, 4).map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
        {sessions.length === 0 && (
          <EmptyState
            className="mt-4"
            icon={<Calendar className="h-5 w-5" />}
            title="No sessions yet"
            description="Workshops and tastings will appear here when hosts publish upcoming experiences."
            actionHref="/sessions"
            actionLabel="View sessions"
          />
        )}
      </section>

      <section>
        <SectionHeader title="For your palate" subtitle="Based on your Coffee DNA" />
        <div className="grid gap-4 sm:grid-cols-3">
          {recommendations.map((bean) => (
            <BeanCard key={bean.id} bean={bean} meta="Recommended for you" />
          ))}
        </div>
        {recommendations.length === 0 && (
          <EmptyState
            className="mt-4"
            icon={<Bean className="h-5 w-5" />}
            title="No personal recommendations yet"
            description="Complete onboarding so BrewCircle can understand your palate and suggest coffees to try."
            actionHref="/onboarding"
            actionLabel="Complete onboarding"
          />
        )}
      </section>
    </div>
  );
}
