import Link from "next/link";
import { DNAProfile } from "@/components/DNAProfile";
import { EmptyState } from "@/components/EmptyState";
import { FlavorWheel } from "@/components/FlavorWheel";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { beans, flavorSuggestions } from "@/lib/data";
import { getCurrentUserProfile } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";
import { Bean, Calendar, MapPin, MessageCircle, Star } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/login");

  const userBeans = beans.filter((b) => user.dna.favoriteBeans.some((f) => b.name.includes(f.split(" ")[0]) || b.name === f));
  const isDiscoveryProfile =
    user.coffeePersona === "cafe_regular" || user.coffeePersona === "casual_drinker" || user.coffeePersona === "coffee_curious";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
          {user.avatar}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-foreground">{user.name}</h1>
          <p className="text-muted">@{user.handle}</p>
          <p className="mt-2 max-w-lg text-muted">{user.bio}</p>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            {user.location}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              <strong className="text-foreground">{user.brewCount}</strong> brews
            </span>
            <span>
              <strong className="text-foreground">{user.followerCount.toLocaleString()}</strong> followers
            </span>
            <Link href="/compare" className="text-accent hover:underline">
              Compare DNA →
            </Link>
            <Link href="/onboarding" className="text-muted hover:text-foreground">
              Edit profile
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center sm:w-48">
          <p className="text-xs text-muted">Marketplace rep</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-display text-2xl text-accent">
            <Star className="h-5 w-5 fill-current" />
            {user.marketplaceRep.rating}
          </p>
          <p className="text-xs text-muted">
            {user.marketplaceRep.sales} sales · {user.marketplaceRep.reviews} reviews
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-12">
        {isDiscoveryProfile && (
          <section>
            <h2 className="mb-4 font-display text-xl text-foreground">Coffee Discovery Profile</h2>
            <DiscoveryProfileCard user={user} />
          </section>
        )}

        <section>
          <h2 className="mb-4 font-display text-xl text-foreground">Coffee DNA</h2>
          <DNAProfile dna={user.dna} />
        </section>

        {!isDiscoveryProfile && (
          <section>
            <h2 className="mb-4 font-display text-xl text-foreground">Flavor coverage</h2>
            <FlavorWheel coverage={user.flavorCoverage} suggestions={flavorSuggestions} />
          </section>
        )}

        <section>
          <h2 className="mb-4 font-display text-xl text-foreground">Coffee journey</h2>
          {user.journey.length ? (
            <JourneyTimeline milestones={user.journey} />
          ) : (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No coffee journey yet"
              description="BrewCircle will build this timeline as you log brews, join sessions, ask questions, and interact with the marketplace."
              actionHref="/discover"
              actionLabel="Explore coffee"
            />
          )}
        </section>

        {!isDiscoveryProfile && (
          <section>
            <h2 className="mb-4 font-display text-xl text-foreground">Current beans</h2>
            {userBeans.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userBeans.map((bean) => (
                  <div key={bean.id} className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="font-medium text-foreground">{bean.name}</h3>
                    <p className="text-sm text-muted">
                      {bean.estate} · {bean.roaster}
                    </p>
                    <p className="mt-2 text-xs text-muted">Brew: {bean.brewingRecommendations.join(" · ")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bean className="h-5 w-5" />}
                title="No beans added yet"
                description="Explore coffees in Discover. Bean logging will live here when brew tracking is added."
                actionHref="/discover"
                actionLabel="Discover beans"
              />
            )}
          </section>
        )}

        <section>
          <h2 className="mb-4 font-display text-xl text-foreground">Community Q&A</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Questions asked" value={user.qaStats.questions} />
            <Stat label="Answers given" value={user.qaStats.answers} />
            <Stat label="Accepted answers" value={user.qaStats.accepted} />
          </div>
          <Link href="/community" className="mt-4 inline-block text-sm text-accent hover:underline">
            Browse community →
          </Link>
          {user.qaStats.questions + user.qaStats.answers + user.qaStats.accepted === 0 && (
            <EmptyState
              className="mt-4"
              icon={<MessageCircle className="h-5 w-5" />}
              title="No community activity yet"
              description="Your questions, answers, and accepted answers will appear here once you start using the community."
              actionHref="/community"
              actionLabel="Visit community"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function DiscoveryProfileCard({ user }: { user: UserProfile }) {
  const discoveryGroups = [
    { label: "Usually drinks", items: user.dna.usualDrinks ?? [] },
    { label: "Café rhythm", items: user.dna.cafeFrequency ? [user.dna.cafeFrequency] : [] },
    { label: "Café use", items: user.dna.cafeVisitReasons ?? [] },
    { label: "Wants to discover", items: user.dna.learningGoals ?? [] },
  ];
  const hasDiscoverySignals = discoveryGroups.some((group) => group.items.length > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-foreground">
        ☕ {user.coffeePersonality ?? "Comfort Drinker"}
      </p>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        {user.tasteSummary ?? "BrewCircle is learning what you enjoy from the coffee choices you already make."}
      </p>
      {hasDiscoverySignals ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {discoveryGroups.map((group) => (
            <DiscoveryGroup key={group.label} label={group.label} items={group.items} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5 border-border/70 bg-background/60"
          title="No discovery signals yet"
          description="Pick the drinks and café habits you already know. BrewCircle will translate that into a simple taste profile."
          actionHref="/onboarding"
          actionLabel="Update preferences"
        />
      )}
    </div>
  );
}

function DiscoveryGroup({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="font-display text-3xl text-accent">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
