import type { MarketplaceListing } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categoryLabels = { buy: "Wanted", sell: "For sale", rent: "Rent" };

export function MarketplaceCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <Link href={`/marketplace/${listing.id}`} className="group block">
      <article className="card-surface overflow-hidden rounded-md">
        <div className="relative aspect-[4/3] w-full bg-border">
          <Image
            src={listing.imageUrl ?? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <span
            className={`absolute left-2 top-2 rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              listing.category === "sell"
                ? "bg-foreground text-background"
                : listing.category === "rent"
                  ? "bg-primary/80 text-background"
                  : "bg-accent/90 text-background"
            }`}
          >
            {categoryLabels[listing.category]}
          </span>
        </div>
        <div className="space-y-2 p-3">
          {listing.gearCategory && (
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{listing.gearCategory}</p>
          )}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{listing.title}</h3>
          <p className="text-base font-semibold tracking-tight text-primary">{formatINR(listing.price)}</p>
          <p className="text-xs text-muted">{listing.condition}</p>
          <p className="rounded-sm bg-background px-2 py-1.5 text-xs text-foreground/75">
            Seller DNA: {listing.dnaSummary}
          </p>
          <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted">
            <span>@{listing.seller}</span>
            <span className="flex items-center gap-1 text-foreground/80">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {listing.sellerRating} ({listing.sellerReviews})
            </span>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.location}
          </p>
        </div>
      </article>
    </Link>
  );
}
