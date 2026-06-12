import type { Cafe, CafeMenuItem, FlavorNote } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type DbCafe = {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  vibe: string;
  image_url: string;
  match_reason: string;
  qr_code: string;
};

type DbCafeMenuItem = {
  id: string;
  cafe_id: string;
  name: string;
  category: string;
  price_paise: number;
  description: string;
  flavor_notes: string[];
  attributes: string[];
  dna_signals: string[];
  offer: string | null;
};

export const pilotCafes: Cafe[] = [
  {
    id: "humming-tree-cafe",
    name: "Humming Tree Coffee",
    area: "Indiranagar",
    city: "Bangalore",
    address: "12th Main, Indiranagar, Bangalore",
    vibe: "Work-friendly café with bright cold brews and milk-based comfort drinks.",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
    matchReason: "Strong fit for café regulars, remote workers, and cold coffee drinkers.",
    qrCode: "BC-HUMMING-001",
  },
  {
    id: "third-wave-bandra",
    name: "Third Wave Bandra",
    area: "Bandra",
    city: "Mumbai",
    address: "Pali Hill, Bandra West, Mumbai",
    vibe: "Social café for meetings, espresso drinks, and dessert-like coffees.",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
    matchReason: "Good for people who repeatedly order cappuccinos, mochas, and iced drinks.",
    qrCode: "BC-BANDRA-002",
  },
];

export const pilotMenuItems: CafeMenuItem[] = [
  {
    id: "cranberry-nitro-cold-brew",
    cafeId: "humming-tree-cafe",
    name: "Cranberry Nitro Cold Brew",
    category: "Cold coffee",
    pricePaise: 26000,
    description: "Nitro cold brew with cranberry brightness and a soft, creamy texture.",
    flavorNotes: ["Berry", "Citrus"],
    attributes: ["Cold", "Fruity", "Refreshing", "Low sweetness"],
    dnaSignals: ["cold coffee", "fruit-forward", "bright acidity", "nitro texture"],
    offer: "Like this? Unlock a 10-cup cranberry nitro pack valid for 30 days.",
  },
  {
    id: "comfort-cappuccino",
    cafeId: "humming-tree-cafe",
    name: "Comfort Cappuccino",
    category: "Milk coffee",
    pricePaise: 19000,
    description: "Classic cappuccino with chocolate-forward espresso and steamed milk.",
    flavorNotes: ["Chocolate", "Nutty"],
    attributes: ["Milk-based", "Comforting", "Chocolatey"],
    dnaSignals: ["milk-based", "comfort drink", "chocolate-forward"],
  },
  {
    id: "filter-cloud",
    cafeId: "humming-tree-cafe",
    name: "Filter Cloud",
    category: "Indian coffee",
    pricePaise: 17000,
    description: "South Indian filter-style milk coffee, served airy and sweet.",
    flavorNotes: ["Caramel", "Nutty"],
    attributes: ["Sweet", "Milk-based", "Familiar"],
    dnaSignals: ["filter coffee", "sweet comfort", "milk-based"],
  },
  {
    id: "bandra-mocha",
    cafeId: "third-wave-bandra",
    name: "Bandra Mocha",
    category: "Milk coffee",
    pricePaise: 24000,
    description: "Chocolate-forward mocha for dessert coffee drinkers.",
    flavorNotes: ["Chocolate", "Caramel"],
    attributes: ["Sweet", "Dessert-like", "Milk-based"],
    dnaSignals: ["dessert coffee", "chocolate-forward", "milk-based"],
    offer: "Dessert Lover match: café can target you with mocha bundles.",
  },
  {
    id: "iced-americano-spark",
    cafeId: "third-wave-bandra",
    name: "Iced Americano Spark",
    category: "Cold coffee",
    pricePaise: 18000,
    description: "Light, chilled black coffee with citrus lift.",
    flavorNotes: ["Citrus", "Floral"],
    attributes: ["Cold", "Black coffee", "Light"],
    dnaSignals: ["black coffee", "cold coffee", "citrus lift"],
  },
];

function cafeFromDb(row: DbCafe): Cafe {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    city: row.city,
    address: row.address,
    vibe: row.vibe,
    imageUrl: row.image_url,
    matchReason: row.match_reason,
    qrCode: row.qr_code,
  };
}

function menuItemFromDb(row: DbCafeMenuItem): CafeMenuItem {
  return {
    id: row.id,
    cafeId: row.cafe_id,
    name: row.name,
    category: row.category,
    pricePaise: row.price_paise,
    description: row.description,
    flavorNotes: row.flavor_notes as FlavorNote[],
    attributes: row.attributes,
    dnaSignals: row.dna_signals,
    offer: row.offer ?? undefined,
  };
}

export async function getCafes(): Promise<Cafe[]> {
  const supabase = await createClient();
  if (!supabase) return pilotCafes;

  const { data, error } = await supabase.from("cafes").select("*").order("name");
  if (error || !data?.length) return pilotCafes;

  return (data as DbCafe[]).map(cafeFromDb);
}

export async function getCafe(cafeId: string): Promise<Cafe | null> {
  const cafes = await getCafes();
  return cafes.find((cafe) => cafe.id === cafeId) ?? null;
}

export async function getCafeMenu(cafeId: string): Promise<CafeMenuItem[]> {
  const supabase = await createClient();
  if (!supabase) return pilotMenuItems.filter((item) => item.cafeId === cafeId);

  const { data, error } = await supabase
    .from("cafe_menu_items")
    .select("*")
    .eq("cafe_id", cafeId)
    .order("category")
    .order("name");

  if (error || !data?.length) return pilotMenuItems.filter((item) => item.cafeId === cafeId);

  return (data as DbCafeMenuItem[]).map(menuItemFromDb);
}
