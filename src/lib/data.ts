import type {
  Bean,
  Brewer,
  CoffeeDNA,
  CoffeeSession,
  FlavorNote,
  JourneyMilestone,
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
      title: "V60 breakthrough",
      description: "Hit 1:16 ratio with TDS sweet spot on Chikmagalur washed.",
      icon: "pour",
    },
    {
      id: "j3",
      date: "Sep 2024",
      title: "Joined BrewCircle",
      description: "Connected with 40+ brewers in Bangalore.",
      icon: "community",
    },
    {
      id: "j4",
      date: "Jan 2025",
      title: "Hosted cupping",
      description: "Led 8-person Araku natural tasting at home.",
      icon: "session",
    },
    {
      id: "j5",
      date: "May 2025",
      title: "Marketplace seller",
      description: "Sold Comandante to a fellow brewer — 5★ rating.",
      icon: "market",
    },
  ],
  qaStats: { questions: 12, answers: 47, accepted: 18 },
  marketplaceRep: { rating: 4.9, sales: 6, reviews: 14 },
};

export const compareUser: UserProfile = {
  id: "u2",
  name: "Rohan Mehta",
  handle: "rohan_espresso",
  avatar: "RM",
  bio: "Espresso nerd. Mumbai. Always dialing in.",
  location: "Mumbai, Maharashtra",
  brewCount: 518,
  followerCount: 2103,
  dna: {
    methods: ["Espresso", "Moka Pot", "Aeropress"],
    equipment: ["Breville Bambino", "1Zpresso JX-Pro", "Aeropress"],
    favoriteBeans: ["Kerehaklu Honey", "Monsooned Malabar"],
    favoriteRoasters: ["Subko", "Third Wave Coffee", "Blue Tokai"],
    roastPrefs: ["Medium", "Medium-Dark"],
    processPrefs: ["Honey", "Monsooned", "Washed"],
    flavorPrefs: ["Chocolate", "Nutty", "Caramel", "Spicy"],
    regions: ["Coorg", "Chikmagalur", "Sakleshpur"],
    estates: ["Kerehaklu Estate", "Salawara Estate"],
  },
  flavorCoverage: {
    Chocolate: 94,
    Nutty: 89,
    Caramel: 78,
    Floral: 42,
    Berry: 35,
    Citrus: 48,
    Tropical: 22,
    Winey: 55,
    Spicy: 71,
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
    upvotes: 47,
    acceptedAnswerId: "a1",
    answers: [
      {
        id: "a1",
        body: "Try 24–26 clicks on Comandante for washed medium. Drop temp to 92°C if still bitter. 1:16, 2:45 total brew.",
        author: "ananya_pourover",
        avatar: "AR",
        upvotes: 89,
      },
      {
        id: "a2",
        body: "Also check your pour rate — slow center pours help with SLN9 clarity.",
        author: "priya_v60",
        avatar: "PN",
        upvotes: 34,
      },
    ],
  },
  {
    id: "q2",
    title: "Aeropress recipe for Araku natural?",
    body: "Want to highlight berry notes without over-extraction. Inverted or standard?",
    author: "berry_hunter",
    avatar: "BH",
    tags: ["Aeropress", "Natural", "Araku"],
    upvotes: 62,
    answers: [
      {
        id: "a3",
        body: "Inverted, 14g fine-medium, 80°C, 1:45 steep, gentle press. Araku naturals love lower temp.",
        author: "meera_coldbrew",
        avatar: "MK",
        upvotes: 71,
      },
    ],
  },
  {
    id: "q3",
    title: "Flair 58 pressure profiling for Kerehaklu honey?",
    body: "18g in, getting sour shots at 9 bar constant. Should I pre-infuse longer?",
    author: "rohan_espresso",
    avatar: "RM",
    tags: ["Espresso", "Honey", "Flair"],
    upvotes: 38,
    acceptedAnswerId: "a4",
    answers: [
      {
        id: "a4",
        body: "8 bar with 8s pre-infuse, then ramp to 9. Honey processed needs slightly longer ratio — aim 1:2.2.",
        author: "vikram_dialin",
        avatar: "VS",
        upvotes: 52,
      },
    ],
  },
];

export const flavorSuggestions: { flavor: FlavorNote; bean: string; reason: string }[] = [
  { flavor: "Tropical", bean: "Kelagur Estate", reason: "Only 34% explored — citrus-forward Coorg washed" },
  { flavor: "Spicy", bean: "Kerehaklu Honey", reason: "Complements your winey naturals at 28% coverage" },
];

export const onboardingSteps = [
  { id: "methods", title: "How do you brew?", subtitle: "Select all that apply" },
  { id: "equipment", title: "Your setup", subtitle: "Gear on your counter" },
  { id: "flavors", title: "Flavor DNA", subtitle: "What notes make you smile?" },
  { id: "regions", title: "Indian origins", subtitle: "Regions & estates you love" },
];

export function computeCompatibility(a: UserProfile, b: UserProfile): {
  matchPercent: number;
  shared: string[];
  differences: string[];
} {
  const sharedMethods = a.dna.methods.filter((m) => b.dna.methods.includes(m));
  const sharedRoasters = a.dna.favoriteRoasters.filter((r) => b.dna.favoriteRoasters.includes(r));
  const sharedRegions = a.dna.regions.filter((r) => b.dna.regions.includes(r));
  const sharedFlavors = a.dna.flavorPrefs.filter((f) => b.dna.flavorPrefs.includes(f));

  const score =
    sharedMethods.length * 12 +
    sharedRoasters.length * 15 +
    sharedRegions.length * 10 +
    sharedFlavors.length * 8 +
    (a.dna.processPrefs.some((p) => b.dna.processPrefs.includes(p)) ? 10 : 0);

  const matchPercent = Math.min(98, Math.max(42, score + 18));

  const shared = [
    ...sharedMethods.map((m) => `Both brew ${m}`),
    ...sharedRoasters.map((r) => `Love ${r}`),
    ...sharedRegions.map((r) => `Explore ${r}`),
    ...sharedFlavors.map((f) => `Prefer ${f} notes`),
  ];

  const diffMethods = b.dna.methods.filter((m) => !a.dna.methods.includes(m));
  const diffFlavors = b.dna.flavorPrefs.filter((f) => !a.dna.flavorPrefs.includes(f));

  const differences = [
    ...diffMethods.map((m) => `Rohan favors ${m}`),
    ...diffFlavors.slice(0, 2).map((f) => `Different taste: ${f}`),
    a.dna.roastPrefs[0] !== b.dna.roastPrefs[0]
      ? `Roast prefs: ${a.dna.roastPrefs[0]} vs ${b.dna.roastPrefs[0]}`
      : "",
  ].filter(Boolean);

  return { matchPercent, shared, differences };
}
