import { MarketplaceCard } from "@/components/MarketplaceCard";
import { EmptyState } from "@/components/EmptyState";
import { getMarketplaceListings } from "@/lib/marketplace";
import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const filters = ["All", "For sale", "Wanted", "Rent", "Grinders", "Beans", "Espresso"] as const;

export default async function MarketplaceHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const code = typeof params?.code === "string" ? params.code : null;
  if (code) {
    const next = typeof params?.next === "string" ? params.next : "/profile";
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
  }

  const listings = await getMarketplaceListings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">India · Home brewers</p>
        <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Marketplace
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-foreground/75">
          Buy, sell, and rent grinders, brewers, kettles, and beans — with seller Coffee DNA so you know who you&apos;re
          buying from.
        </p>
        <form className="flex max-w-lg gap-2 pt-2" action="/" method="get">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              placeholder="Search gear, beans, city…"
              className="w-full rounded-sm border border-primary/20 bg-card py-2.5 pl-10 pr-3 text-sm placeholder:text-muted focus:border-primary/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <span
              key={f}
              className="cursor-default rounded-sm border border-primary/15 px-2.5 py-1 text-xs text-foreground/70"
            >
              {f}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1 text-sm">
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create your BrewCircle profile →
          </Link>
          <Link href="/login" className="text-muted hover:text-primary">
            Sign in
          </Link>
          <Link href="/discover" className="text-muted hover:text-primary">
            Beans & community
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <MarketplaceCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <EmptyState
          className="mt-4"
          icon={<ShoppingBag className="h-5 w-5" />}
          title="No marketplace listings yet"
          description="Listings will appear here once brewers start posting gear, beans, or rental offers."
          actionHref="/signup"
          actionLabel="Create your profile"
        />
      )}
    </div>
  );
}
