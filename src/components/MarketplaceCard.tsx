import type { MarketplaceListing } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";

const categoryLabels = { buy: "Wanted", sell: "For sale", rent: "Rent" };

export function MarketplaceCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <article className="card-hover rounded-2xl border border-cream/10 bg-roast p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            listing.category === "sell"
              ? "bg-green-500/20 text-green-400"
              : listing.category === "rent"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-amber/20 text-amber"
          }`}
        >
          {categoryLabels[listing.category]}
        </span>
        <p className="font-display text-lg text-amber">{formatINR(listing.price)}</p>
      </div>
      <h3 className="mt-2 font-medium text-cream">{listing.title}</h3>
      <p className="mt-1 text-xs text-cream/50">{listing.condition}</p>
      <p className="mt-2 rounded-lg bg-espresso/80 px-2 py-1.5 text-xs text-cream/70">
        Seller DNA: {listing.dnaSummary}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-cream/50">
        <span>@{listing.seller}</span>
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber text-amber" />
          {listing.sellerRating} ({listing.sellerReviews})
        </span>
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-cream/40">
        <MapPin className="h-3 w-3" />
        {listing.location}
      </p>
    </article>
  );
}
