import { MarketplaceCard } from "@/components/MarketplaceCard";
import { getMarketplaceListings } from "@/lib/marketplace";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listings = await getMarketplaceListings();
  const listing = listings.find((l) => l.id === id);

  if (!listing) notFound();

  const related = listings.filter((l) => l.id !== id).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-muted hover:text-primary">
        ← Marketplace
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-border">
          <Image
            src={listing.imageUrl ?? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"}
            alt={listing.title}
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{listing.gearCategory}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">{listing.title}</h1>
          <p className="text-2xl font-semibold">{formatINR(listing.price)}</p>
          <p className="text-sm text-muted">Condition: {listing.condition}</p>
          {listing.description && <p className="text-sm leading-relaxed text-foreground/80">{listing.description}</p>}
          <p className="card-surface rounded-md p-3 text-sm">Seller DNA: {listing.dnaSummary}</p>
          <div className="flex items-center gap-2 text-sm">
            <span>@{listing.seller}</span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {listing.sellerRating} ({listing.sellerReviews} reviews)
            </span>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Sign in to contact seller
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-base font-semibold text-primary">More listings</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((l) => (
              <MarketplaceCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
