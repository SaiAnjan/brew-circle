import Link from "next/link";
import { DNAProfile } from "@/components/DNAProfile";
import { FlavorWheel } from "@/components/FlavorWheel";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { beans, flavorSuggestions } from "@/lib/data";
import { getCurrentUserProfile } from "@/lib/profile";
import { MapPin, Star } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();
  const userBeans = beans.filter((b) => user.dna.favoriteBeans.some((f) => b.name.includes(f.split(" ")[0]) || b.name === f));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber/20 text-2xl font-bold text-amber">
          {user.avatar}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-cream">{user.name}</h1>
          <p className="text-cream/60">@{user.handle}</p>
          <p className="mt-2 max-w-lg text-cream/80">{user.bio}</p>
          <p className="mt-2 flex items-center gap-1 text-sm text-cream/50">
            <MapPin className="h-4 w-4" />
            {user.location}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              <strong className="text-cream">{user.brewCount}</strong> brews
            </span>
            <span>
              <strong className="text-cream">{user.followerCount.toLocaleString()}</strong> followers
            </span>
            <Link href="/compare" className="text-amber hover:underline">
              Compare DNA →
            </Link>
            <Link href="/onboarding" className="text-cream/60 hover:text-cream">
              Edit DNA
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-cream/10 bg-roast p-4 text-center sm:w-48">
          <p className="text-xs text-cream/50">Marketplace rep</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-display text-2xl text-amber">
            <Star className="h-5 w-5 fill-current" />
            {user.marketplaceRep.rating}
          </p>
          <p className="text-xs text-cream/50">
            {user.marketplaceRep.sales} sales · {user.marketplaceRep.reviews} reviews
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Coffee DNA</h2>
          <DNAProfile dna={user.dna} />
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Flavor coverage</h2>
          <FlavorWheel coverage={user.flavorCoverage} suggestions={flavorSuggestions} />
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Coffee journey</h2>
          <JourneyTimeline milestones={user.journey} />
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Current beans</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(userBeans.length ? userBeans : beans.slice(0, 3)).map((bean) => (
              <div key={bean.id} className="rounded-2xl border border-cream/10 bg-roast p-4">
                <h3 className="font-medium text-cream">{bean.name}</h3>
                <p className="text-sm text-cream/60">
                  {bean.estate} · {bean.roaster}
                </p>
                <p className="mt-2 text-xs text-cream/50">
                  Brew: {bean.brewingRecommendations.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Community Q&A</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Questions asked" value={user.qaStats.questions} />
            <Stat label="Answers given" value={user.qaStats.answers} />
            <Stat label="Accepted answers" value={user.qaStats.accepted} />
          </div>
          <Link href="/community" className="mt-4 inline-block text-sm text-amber hover:underline">
            Browse community →
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-roast p-4 text-center">
      <p className="font-display text-3xl text-amber">{value}</p>
      <p className="text-sm text-cream/60">{label}</p>
    </div>
  );
}
