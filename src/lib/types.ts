export type BrewMethod = "Espresso" | "V60" | "Aeropress" | "French Press" | "Moka Pot" | "Cold Brew";

export type CoffeePersona = "home_brewer" | "cafe_regular" | "casual_drinker" | "coffee_curious" | "coffee_enthusiast";

export type FlavorNote =
  | "Chocolate"
  | "Nutty"
  | "Caramel"
  | "Floral"
  | "Berry"
  | "Citrus"
  | "Tropical"
  | "Winey"
  | "Spicy";

export interface Bean {
  id: string;
  name: string;
  estate: string;
  region: string;
  roaster: string;
  roastLevel: string;
  processing: string;
  flavorNotes: FlavorNote[];
  brewingRecommendations: string[];
  trending?: boolean;
}

export interface CoffeeDNA {
  methods: BrewMethod[];
  equipment: string[];
  favoriteBeans: string[];
  favoriteRoasters: string[];
  roastPrefs: string[];
  processPrefs: string[];
  flavorPrefs: FlavorNote[];
  regions: string[];
  estates: string[];
  usualDrinks?: string[];
  cafeVisitReasons?: string[];
  cafeFrequency?: string;
  learningGoals?: string[];
  experienceLevel?: string;
}

export interface JourneyMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
}

export interface QAQuestion {
  id: string;
  title: string;
  body: string;
  author: string;
  avatar: string;
  tags: string[];
  upvotes: number;
  answers: QAAnswer[];
  acceptedAnswerId?: string;
}

export interface QAAnswer {
  id: string;
  body: string;
  author: string;
  avatar: string;
  upvotes: number;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  category: "buy" | "sell" | "rent";
  price: number;
  condition: string;
  seller: string;
  sellerRating: number;
  sellerReviews: number;
  location: string;
  dnaSummary: string;
  imageUrl?: string;
  gearCategory?: string;
  description?: string;
}

export interface CoffeeSession {
  id: string;
  title: string;
  type: string;
  host: string;
  hostRating: number;
  seats: number;
  seatsLeft: number;
  price: number;
  location: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  coffeePersona?: CoffeePersona | null;
  coffeePersonality?: string | null;
  tasteSummary?: string | null;
  brewCount: number;
  followerCount: number;
  dna: CoffeeDNA;
  flavorCoverage: Record<FlavorNote, number>;
  journey: JourneyMilestone[];
  qaStats: { questions: number; answers: number; accepted: number };
  marketplaceRep: { rating: number; sales: number; reviews: number };
}

export interface Brewer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  specialty: string;
  brewCount: number;
}

export interface Cafe {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  vibe: string;
  imageUrl: string;
  matchReason: string;
  qrCode: string;
}

export interface CafeMenuItem {
  id: string;
  cafeId: string;
  name: string;
  category: string;
  pricePaise: number;
  description: string;
  flavorNotes: FlavorNote[];
  attributes: string[];
  dnaSignals: string[];
  offer?: string;
}

export interface CafeBillItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPricePaise: number;
  flavorNotes: FlavorNote[];
  attributes: string[];
  dnaSignals: string[];
}

export interface CafeBill {
  invoiceNumber: string;
  cafeId: string;
  posProvider: string;
  tableLabel: string;
  serverName: string;
  issuedAtLabel: string;
  subtotalPaise: number;
  discountPaise: number;
  serviceChargePaise: number;
  taxPaise: number;
  totalPaise: number;
  items: CafeBillItem[];
}
