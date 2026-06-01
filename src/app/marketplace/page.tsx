import { MarketplaceCard } from "@/components/MarketplaceCard";
import { marketplaceListings } from "@/lib/data";

export default function MarketplacePage() {
  const categories = ["all", "sell", "buy", "rent"] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-cream">Marketplace</h1>
      <p className="mt-2 text-cream/60">
        Buy, sell, and rent gear. Every listing shows seller Coffee DNA and reputation.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-cream/15 px-3 py-1 text-xs capitalize text-cream/70"
          >
            {cat === "all" ? "All listings" : cat}
          </span>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {marketplaceListings.map((listing) => (
          <MarketplaceCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
