export type DbProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  handle: string | null;
  avatar_initials: string | null;
  bio: string | null;
  location: string | null;
  coffee_persona: string | null;
  coffee_personality: string | null;
  taste_summary: string | null;
  brew_count: number;
  follower_count: number;
  flavor_coverage: Record<string, number>;
  journey: unknown[];
  qa_stats: { questions: number; answers: number; accepted: number };
  marketplace_rep: { rating: number; sales: number; reviews: number };
};

export type DbCoffeeDna = {
  user_id: string;
  methods: string[];
  equipment: string[];
  favorite_beans: string[];
  favorite_roasters: string[];
  roast_prefs: string[];
  process_prefs: string[];
  flavor_prefs: string[];
  regions: string[];
  estates: string[];
  usual_drinks: string[];
  cafe_visit_reasons: string[];
  cafe_frequency: string;
  learning_goals: string[];
  experience_level: string;
};

export type DbMarketplaceListing = {
  id: string;
  seller_id: string | null;
  title: string;
  listing_type: "buy" | "sell" | "rent";
  gear_category: string;
  price_paise: number;
  condition: string;
  location: string;
  description: string | null;
  image_url: string;
  dna_summary: string | null;
  status: string;
  created_at: string;
  profiles?: Pick<DbProfile, "handle" | "name" | "avatar_initials" | "marketplace_rep"> | null;
};
