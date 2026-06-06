import type { MarketplaceListing } from "@/lib/types";
import type { DbMarketplaceListing } from "@/lib/database.types";
import { marketplaceListings as mockListings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

const LISTING_IMAGES: Record<string, string> = {
  m1: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
  m2: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
  m3: "https://images.unsplash.com/photo-1497935582991-80fd194ea0a3?w=800&q=80",
  m4: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
};

export function dbListingToCard(row: DbMarketplaceListing): MarketplaceListing {
  const rep = row.profiles?.marketplace_rep ?? { rating: 4.8, sales: 0, reviews: 0 };
  return {
    id: row.id,
    title: row.title,
    category: row.listing_type,
    price: Math.round(row.price_paise / 100),
    condition: row.condition,
    seller: row.profiles?.handle ?? "brewcircle",
    sellerRating: rep.rating ?? 4.8,
    sellerReviews: rep.reviews ?? 0,
    location: row.location,
    dnaSummary: row.dna_summary ?? "",
    imageUrl: row.image_url || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    gearCategory: row.gear_category,
    description: row.description ?? undefined,
  };
}

export function mockListingWithImages(listing: MarketplaceListing): MarketplaceListing {
  return {
    ...listing,
    imageUrl: listing.imageUrl ?? LISTING_IMAGES[listing.id] ?? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  };
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  const supabase = await createClient();
  if (!supabase) {
    return mockListings.map(mockListingWithImages);
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(
      `
      *,
      profiles:seller_id ( handle, name, avatar_initials, marketplace_rep )
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return mockListings.map(mockListingWithImages);
  }

  if (!data?.length) return [];

  return (data as DbMarketplaceListing[]).map(dbListingToCard);
}
