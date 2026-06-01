import type {
  Bean,
  Brewer,
  CoffeeSession,
  FlavorNote,
  MarketplaceListing,
  QAQuestion,
  UserProfile,
} from "./types";

export const currentUser: UserProfile = {
  id: "u1",
  name: "Ananya Rao",
  handle: "ananya_pourover",
  avatar: "AR",
  bio: "Home barista from Bangalore. Chasing clarity in South Indian naturals.",
  location: "Bangalore, Karnataka",
  brewCount: 342,
  followerCount: 1284,
  dna: {
    methods: ["V60", "Aeropress", "Espresso"],
    equipment: ["Fellow Stagg EKG", "Comandante C40", "Flair 58", "Hario V60"],
    favoriteBeans: ["Ratnagiri SLN9", "Araku Selection"],
    favoriteRoasters: ["Blue Tokai", "Subko", "ARAKU Coffee"],
    roastPrefs: ["Light-Medium", "Medium"],
    processPrefs: ["Washed", "Honey", "Natural"],
    flavorPrefs: ["Berry", "Floral", "Citrus", "Winey"],
    regions: ["Chikmagalur", "Araku Valley", "Coorg"],
    estates: ["Ratnagiri Estate", "Kerehaklu Estate", "Kelagur Estate"],
  },
  flavorCoverage: {
    Chocolate: 72,
    Nutty: 58,
    Caramel: 45,
    Floral: 88,
    Berry: 91,
    Citrus: 76,
    Tropical: 34,
    Winey: 82,
    Spicy: 28,
  },
  journey: [
    {
      id: "j1",
      date: "Mar 2024",
      title: "First specialty bag",
      description: "Bought Ratnagiri from Blue Tokai — changed everything.",
      icon: "bean",
    },
    {
      id: "j2",
      date: "Jun 2024",
      title: "Dialled in V60",
      description: "Consistent 1:16 pours with Comandante at 22 clicks.",
      icon: "pour",
    },
    {
      id: "j3",
      date: "Nov 2024",
      title: "Espresso at home",
      description: "Flair 58 + pressure profiling for honey naturals.",
      icon: "espresso",
    },
    {
      id: "j4",
      date: "Feb 2025",
      title: "Hosted cupping",
      description: "6-person Araku vertical at Third Wave Roasters.",
      icon: "cup",
    },
    {
      id: "j5",
      date: "May 2025",
      title: "50 beans logged",
      description: "Half-century of Indian specialty on BrewCircle.",
      icon: "trophy",
    },
  ],
  qaStats: { questions: 12, answers: 47, accepted: 31 },
  marketplaceRep: { rating: 4.9, sales: 8, reviews: 14 },
};

export const compareUser: UserProfile = {
  id: "u2",
  name: "Rohan Mehta",
  handle: "rohan_espresso",
  avatar: "RM",
  bio: "Mumbai-based espresso nerd. Medium-dark and moka pot enthusiast.",
  location: "Mumbai, Maharashtra",
  brewCount: 891,
  followerCount: 2103,
  dna: {
    methods: ["Espresso", "Moka Pot", "French Press"],
    equipment: ["Breville Bambino", "1Zpresso JX-Pro", "Moka Pot"],
    favoriteBeans: ["Monsooned Malabar AA", "Kerehaklu Honey"],
    favoriteRoasters: ["Blue Tokai", "Third Wave Coffee"],
    roastPrefs: ["Medium", "Medium-Dark"],
    processPrefs: ["Washed", "Honey", "Monsooned"],
    flavorPrefs: ["Chocolate", "Nutty", "Spicy", "Caramel"],
    regions: ["Malabar Coast", "Coorg", "Chikmagalur"],
    estates: ["Kelagur Estate", "Kerehaklu Estate"],
  },
  flavorCoverage: {
    Chocolate: 91,
    Nutty: 85,
    Caramel: 78,
    Floral: 32,
    Berry: 28,
    Citrus: 41,
    Tropical: 22,
    Winey: 35,
    Spicy: 62,
  },
  journey: [],
  qaStats: { questions: 8, answers: 62, accepted: 24 },
  marketplaceRep: { rating: 4.7, sales: 11, reviews: 22 },
};

export const beans: Bean[] = [
  {
    id: "b1",
    name: "Ratnagiri SLN9",
    estate: "Ratnagiri Estate",
    region: "Chikmagalur, Karnataka",
    roaster: "Blue Tokai",
    roastLevel: "Medium",
    processing: "Washed",
    flavorNotes: ["Chocolate", "Nutty", "Citrus"],
    brewingRecommendations: ["V60 1:16", "Aeropress inverted", "Espresso 1:2"],
    trending: true,
  },
  {
    id: "b2",
    name: "Araku Selection",
    estate: "Araku Valley Co-op",
    region: "Araku Valley, Andhra Pradesh",
    roaster: "ARAKU Coffee",
    roastLevel: "Light-Medium",
    processing: "Natural",
    flavorNotes: ["Berry", "Winey", "Floral"],
    brewingRecommendations: ["V60 1:15", "Cupping standard", "Cold brew 18h"],
    trending: true,
  },
  {
    id: "b3",
    name: "Kerehaklu Honey",
    estate: "Kerehaklu Estate",
    region: "Coorg, Karnataka",
    roaster: "Subko",
    roastLevel: "Medium",
    processing: "Honey",
    flavorNotes: ["Caramel", "Floral", "Spicy"],
    brewingRecommendations: ["Espresso 18g", "Moka pot", "French press"],
    trending: true,
  },
  {
    id: "b4",
    name: "Kelagur Estate",
    estate: "Kelagur Estate",
    region: "Chikmagalur, Karnataka",
    roaster: "Third Wave Coffee",
    roastLevel: "Light",
    processing: "Washed",
    flavorNotes: ["Citrus", "Floral", "Tropical"],
    brewingRecommendations: ["V60 94°C", "Aeropress fine grind"],
  },
  {
    id: "b5",
    name: "Salawara Natural",
    estate: "Salawara Estate",
    region: "Sakleshpur, Karnataka",
    roaster: "Marc's Coffee",
    roastLevel: "Light-Medium",
    processing: "Natural",
    flavorNotes: ["Berry", "Winey", "Tropical"],
    brewingRecommendations: ["V60 1:14.5", "Flash brew"],
  },
  {
    id: "b6",
    name: "Monsooned Malabar AA",
    estate: "Multiple estates",
    region: "Malabar Coast, Kerala",
    roaster: "Blue Tokai",
    roastLevel: "Medium-Dark",
    processing: "Monsooned",
    flavorNotes: ["Nutty", "Chocolate", "Spicy"],
    brewingRecommendations: ["Espresso ristretto", "Moka pot", "South Indian filter"],
  },
];

export const topBrewers: Brewer[] = [
  { id: "br1", name: "Priya Nair", handle: "priya_v60", avatar: "PN", specialty: "Pour-over clarity", brewCount: 891 },
  { id: "br2", name: "Vikram Singh", handle: "vikram_dialin", avatar: "VS", specialty: "Espresso dialing", brewCount: 1204 },
  { id: "br3", name: "Meera Krishnan", handle: "meera_coldbrew", avatar: "MK", specialty: "Cold brew & naturals", brewCount: 654 },
  { id: "br4", name: "Arjun Patel", handle: "arjun_aeropress", avatar: "AP", specialty: "Aeropress recipes", brewCount: 432 },
];

export const communityFavorites = [
  { beanId: "b2", loves: 2847, reviews: 412 },
  { beanId: "b1", loves: 2651, reviews: 389 },
  { beanId: "b3", loves: 1983, reviews: 276 },
];

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: "m1",
    title: "Comandante C40 MK4 — barely used",
    category: "sell",
    price: 18500,
    condition: "Like new",
    seller: "ananya_pourover",
    sellerRating: 4.9,
    sellerReviews: 14,
    location: "Bangalore",
    dnaSummary: "Pour-over · Light roasts · V60",
  },
  {
    id: "m2",
    title: "Flair 58 + pressure gauge (rent/week)",
    category: "rent",
    price: 2500,
    condition: "Excellent",
    seller: "vikram_dialin",
    sellerRating: 4.8,
    sellerReviews: 31,
    location: "Mumbai",
    dnaSummary: "Espresso · Medium-dark · Dial-in friendly",
  },
  {
    id: "m3",
    title: "Hario V60 02 ceramic + filters bundle",
    category: "sell",
    price: 2200,
    condition: "Good",
    seller: "meera_coldbrew",
    sellerRating: 5.0,
    sellerReviews: 8,
    location: "Chennai",
    dnaSummary: "V60 · Naturals · Floral profiles",
  },
  {
    id: "m4",
    title: "1Zpresso JX-Pro — buying",
    category: "buy",
    price: 12000,
    condition: "Any working",
    seller: "rohan_espresso",
    sellerRating: 4.7,
    sellerReviews: 22,
    location: "Mumbai",
    dnaSummary: "Espresso · Moka · Budget grinder hunt",
  },
];

export const sessions: CoffeeSession[] = [
  {
    id: "s1",
    title: "Araku Natural Cupping Workshop",
    type: "Tasting",
    host: "Priya Nair",
    hostRating: 4.9,
    seats: 12,
    seatsLeft: 3,
    price: 899,
    location: "Indiranagar, Bangalore",
    date: "Jun 8, 2025",
  },
  {
    id: "s2",
    title: "Espresso Dial-In Masterclass",
    type: "Workshop",
    host: "Vikram Singh",
    hostRating: 4.8,
    seats: 8,
    seatsLeft: 2,
    price: 1499,
    location: "Bandra, Mumbai",
    date: "Jun 14, 2025",
  },
  {
    id: "s3",
    title: "Home Roasting 101 (sample roast)",
    type: "Workshop",
    host: "Meera Krishnan",
    hostRating: 5.0,
    seats: 10,
    seatsLeft: 6,
    price: 1199,
    location: "Adyar, Chennai",
    date: "Jun 21, 2025",
  },
  {
    id: "s4",
    title: "Chikmagalur Estate Visit & Brew",
    type: "Experience",
    host: "Blue Tokai Community",
    hostRating: 4.9,
    seats: 20,
    seatsLeft: 5,
    price: 3499,
    location: "Chikmagalur, Karnataka",
    date: "Jul 5, 2025",
  },
];

export const qaQuestions: QAQuestion[] = [
  {
    id: "q1",
    title: "Best grind size for Ratnagiri on V60?",
    body: "Just got my first bag of Ratnagiri SLN9. Using Comandante at 22 clicks — still a bit bitter. Bangalore water, 94°C.",
    author: "newbie_brew",
    avatar: "NB",
    tags: ["V60", "Grind", "Chikmagalur"],
    upvotes: 42,
    acceptedAnswerId: "a1",
    answers: [
      {
        id: "a1",
        body: "Try 24 clicks for washed Chikmagalur. 45s bloom, gentle spiral pour. Ratnagiri loves clarity.",
        author: "ananya_pourover",
        avatar: "AR",
        upvotes: 38,
      },
      {
        id: "a2",
        body: "Also check water — Bangalore tap can skew acidic. Third Wave recipe helps.",
        author: "vikram_dialin",
        avatar: "VS",
        upvotes: 12,
      },
    ],
  },
  {
    id: "q2",
    title: "Aeropress inverted vs standard for Indian naturals?",
    body: "Salawara natural tastes flat standard. Worth inverting?",
    author: "meera_coldbrew",
    avatar: "MK",
    tags: ["Aeropress", "Natural", "Sakleshpur"],
    upvotes: 28,
    answers: [
      {
        id: "a3",
        body: "Inverted gives more body. 18g, 1:12, 2min steep. Tropical notes pop on naturals.",
        author: "priya_v60",
        avatar: "PN",
        upvotes: 19,
      },
    ],
  },
  {
    id: "q3",
    title: "Flair 58 pressure profiling for honey processed?",
    body: "Kerehaklu Honey — channeling at 9 bar flat. Any profiles?",
    author: "arjun_aeropress",
    avatar: "AP",
    tags: ["Espresso", "Honey", "Flair 58"],
    upvotes: 35,
    acceptedAnswerId: "a4",
    answers: [
      {
        id: "a4",
        body: "Ramp 3→6→9 bar over 30s. 5s preinfusion at 3 bar. Caramel without bitterness.",
        author: "ananya_pourover",
        avatar: "AR",
        upvotes: 41,
      },
    ],
  },
];

export const flavorSuggestions: { flavor: FlavorNote; bean: string; reason: string }[] = [
  { flavor: "Tropical", bean: "Salawara Natural", reason: "Your coverage is low — this natural unlocks tropical notes." },
  { flavor: "Spicy", bean: "Monsooned Malabar AA", reason: "Expand your wheel with Malabar spice and body." },
];

export function computeCompatibility(a: UserProfile, b: UserProfile): {
  matchPercent: number;
  shared: string[];
  differences: string[];
} {
  const shared: string[] = [];
  const differences: string[] = [];

  const sharedMethods = a.dna.methods.filter((m) => b.dna.methods.includes(m));
  if (sharedMethods.length) shared.push(`Methods: ${sharedMethods.join(", ")}`);

  const sharedRoasters = a.dna.favoriteRoasters.filter((r) => b.dna.favoriteRoasters.includes(r));
  if (sharedRoasters.length) shared.push(`Roasters: ${sharedRoasters.join(", ")}`);

  const sharedFlavors = a.dna.flavorPrefs.filter((f) => b.dna.flavorPrefs.includes(f));
  if (sharedFlavors.length) shared.push(`Flavors: ${sharedFlavors.join(", ")}`);

  const sharedRegions = a.dna.regions.filter((r) => b.dna.regions.includes(r));
  if (sharedRegions.length) shared.push(`Regions: ${sharedRegions.join(", ")}`);

  const onlyA = a.dna.flavorPrefs.filter((f) => !b.dna.flavorPrefs.includes(f));
  const onlyB = b.dna.flavorPrefs.filter((f) => !a.dna.flavorPrefs.includes(f));
  if (onlyA.length) differences.push(`${a.name} prefers: ${onlyA.join(", ")}`);
  if (onlyB.length) differences.push(`${b.name} prefers: ${onlyB.join(", ")}`);

  const methodScore = (sharedMethods.length / Math.max(a.dna.methods.length, 1)) * 25;
  const roasterScore = (sharedRoasters.length / Math.max(a.dna.favoriteRoasters.length, 1)) * 25;
  const flavorScore = (sharedFlavors.length / Math.max(a.dna.flavorPrefs.length, 1)) * 30;
  const regionScore = (sharedRegions.length / Math.max(a.dna.regions.length, 1)) * 20;
  const matchPercent = Math.min(97, Math.max(38, Math.round(methodScore + roasterScore + flavorScore + regionScore + 15)));

  return { matchPercent, shared, differences };
}

export const onboardingSteps = [
  { id: "methods", title: "How do you brew?", subtitle: "Select your go-to brew methods" },
  { id: "equipment", title: "Your setup", subtitle: "What gear do you use at home?" },
  { id: "flavors", title: "Flavor preferences", subtitle: "Which notes do you chase?" },
  { id: "regions", title: "Origin regions", subtitle: "Where do your favorite beans come from?" },
];
