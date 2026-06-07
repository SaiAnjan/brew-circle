"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { BrewMethod, CoffeePersona, FlavorNote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

type StepId =
  | "persona"
  | "details"
  | "methods"
  | "equipment"
  | "favoriteBeans"
  | "favoriteRoasters"
  | "experience"
  | "flavors"
  | "regions"
  | "usualDrinks"
  | "cafeReasons"
  | "cafeFrequency"
  | "learningGoals";

type OnboardingStep = {
  id: StepId;
  title: string;
  subtitle: string;
};

type ContactVerification = {
  type: "email" | "phone";
  value: string;
  token: string;
};

const PERSONAS: { id: CoffeePersona; label: string; description: string }[] = [
  { id: "home_brewer", label: "Home Brewer", description: "I brew coffee at home regularly." },
  { id: "cafe_regular", label: "Café Regular", description: "I frequently visit cafés." },
  { id: "casual_drinker", label: "Casual Coffee Drinker", description: "I drink coffee occasionally." },
  { id: "coffee_curious", label: "Coffee Curious", description: "I want to learn more about coffee." },
  {
    id: "coffee_enthusiast",
    label: "Coffee Enthusiast",
    description: "I actively explore beans, brewing methods, and equipment.",
  },
];

const HOME_PERSONAS = new Set<CoffeePersona>(["home_brewer", "coffee_enthusiast"]);
const METHODS: BrewMethod[] = ["Espresso", "V60", "Aeropress", "French Press", "Moka Pot", "Cold Brew"];
const EQUIPMENT = [
  "Hario V60",
  "Kalita Wave",
  "Origami Dripper",
  "Chemex",
  "Aeropress",
  "French Press",
  "Moka Pot",
  "South Indian Filter",
  "Clever Dripper",
  "Cold Brew Maker",
  "Comandante C40",
  "Timemore C2/C3",
  "1Zpresso JX-Pro",
  "Baratza Encore",
  "Fellow Ode",
  "Fellow Opus",
  "Fellow Stagg EKG",
  "Hario Buono Kettle",
  "Coffee Scale",
  "Flair 58",
  "Wacaco Picopresso",
  "Breville Bambino",
  "Gaggia Classic Pro",
  "Milk Frother",
];
const FAVORITE_BEANS = [
  "Ratnagiri Estate",
  "Araku Selection",
  "Kerehaklu Honey",
  "Attikan Estate",
  "Silver Oak Blend",
  "Monsooned Malabar",
  "Riverdale Estate",
  "Kelagur Estate",
  "Sandalwood Estate",
  "I am still exploring",
];
const FAVORITE_ROASTERS = [
  "Blue Tokai",
  "Subko",
  "Third Wave Coffee",
  "ARAKU Coffee",
  "KC Roasters",
  "Naivo",
  "Maverick & Farmer",
  "Corridor Seven",
  "Marc's Coffee",
  "I am still exploring",
];
const EXPERIENCE_LEVELS = ["Just starting", "Beginner", "Intermediate", "Advanced", "I work in coffee"];
const FLAVORS: FlavorNote[] = ["Chocolate", "Nutty", "Caramel", "Floral", "Berry", "Citrus", "Tropical", "Winey", "Spicy"];
const REGIONS = ["Chikmagalur", "Coorg", "Araku Valley", "Sakleshpur", "Nilgiris", "Bababudangiri"];
const USUAL_DRINKS = [
  "Cappuccino",
  "Latte",
  "Flat White",
  "Mocha",
  "Americano",
  "Espresso",
  "Cold Brew",
  "Iced Coffee",
  "Frappé",
  "Hazelnut Coffee",
  "Caramel Coffee",
  "South Indian Filter Coffee",
  "Instant Coffee",
  "Milk Coffee",
  "Black Coffee",
  "Other",
];
const CAFE_REASONS = ["Work", "Meetings", "Studying", "Relaxation", "Socializing", "Coffee itself"];
const CAFE_FREQUENCY = ["Daily", "Weekly", "Monthly", "Occasionally"];
const LEARNING_GOALS = [
  "Find drinks I like",
  "Understand my taste",
  "Try better cafés",
  "Move beyond instant coffee",
  "Learn simple brewing",
  "Buy my first beans",
];

const DETAILS_STEP: OnboardingStep = {
  id: "details",
  title: "Set up your profile",
  subtitle: "Add your name, handle, phone number, and location",
};

const HOME_STEPS: OnboardingStep[] = [
  { id: "methods", title: "How do you brew?", subtitle: "Select your go-to brew methods" },
  { id: "equipment", title: "Your setup", subtitle: "What gear do you use at home?" },
  { id: "favoriteBeans", title: "Favorite beans", subtitle: "Pick beans or estates you like, even if you are still exploring" },
  { id: "favoriteRoasters", title: "Favorite roasters", subtitle: "Which roasters do you usually buy from?" },
  { id: "experience", title: "Experience level", subtitle: "Where are you in your brewing journey?" },
  { id: "flavors", title: "Flavor preferences", subtitle: "Which notes do you enjoy?" },
  { id: "regions", title: "Origin regions", subtitle: "Where do your favorite beans come from?" },
];

const CAFE_STEPS: OnboardingStep[] = [
  { id: "usualDrinks", title: "What do you usually order?", subtitle: "No jargon needed — pick the drinks you already enjoy" },
  { id: "cafeReasons", title: "Why do you visit cafés?", subtitle: "This helps BrewCircle understand your coffee rituals" },
  { id: "cafeFrequency", title: "How often do you visit cafés?", subtitle: "Choose the rhythm that feels closest" },
];

const CASUAL_STEPS: OnboardingStep[] = [
  { id: "usualDrinks", title: "What coffee do you usually drink?", subtitle: "Instant, filter, cold coffee — everything counts here" },
  { id: "cafeFrequency", title: "How often do you have coffee?", subtitle: "Choose the rhythm that feels closest" },
  { id: "learningGoals", title: "What would you like to discover?", subtitle: "We will keep this simple and welcoming" },
];

const SINGLE_SELECT_STEPS = new Set<StepId>(["experience", "cafeFrequency"]);
const REQUIRED_SELECTION_STEPS = new Set<StepId>(["persona", "methods", "equipment", "experience", "usualDrinks", "cafeFrequency"]);

const getSteps = (persona: CoffeePersona | null): OnboardingStep[] => {
  const personaStep: OnboardingStep = {
    id: "persona",
    title: "What best describes you?",
    subtitle: "BrewCircle adapts to how you already enjoy coffee",
  };
  if (!persona) return [personaStep];
  if (HOME_PERSONAS.has(persona)) return [personaStep, DETAILS_STEP, ...HOME_STEPS];
  if (persona === "cafe_regular") return [personaStep, DETAILS_STEP, ...CAFE_STEPS];
  return [personaStep, DETAILS_STEP, ...CASUAL_STEPS];
};

const inferFlavorPrefs = (drinks: string[]): FlavorNote[] => {
  const prefs = new Set<FlavorNote>();
  if (drinks.some((drink) => ["Mocha", "Hazelnut Coffee", "Caramel Coffee", "Frappé"].includes(drink))) {
    prefs.add("Chocolate");
    prefs.add("Caramel");
  }
  if (drinks.some((drink) => ["Cappuccino", "Latte", "Flat White", "Milk Coffee", "South Indian Filter Coffee"].includes(drink))) {
    prefs.add("Nutty");
    prefs.add("Caramel");
  }
  if (drinks.some((drink) => ["Cold Brew", "Iced Coffee"].includes(drink))) {
    prefs.add("Citrus");
  }
  return prefs.size ? [...prefs] : ["Chocolate", "Caramel"];
};

const getCoffeePersonality = (persona: CoffeePersona, selected: Record<string, string[]>) => {
  const drinks = selected.usualDrinks ?? [];
  const reasons = selected.cafeReasons ?? [];
  const sweetDrinks = ["Mocha", "Hazelnut Coffee", "Caramel Coffee", "Frappé"];

  if (HOME_PERSONAS.has(persona)) return persona === "coffee_enthusiast" ? "Coffee Adventurer" : "Flavor Explorer";
  if (reasons.some((reason) => ["Work", "Meetings", "Studying"].includes(reason))) return "Productivity Sipper";
  if (reasons.includes("Socializing")) return "Café Hopper";
  if (drinks.some((drink) => sweetDrinks.includes(drink))) return "Dessert Lover";
  if (persona === "coffee_curious") return "Coffee Adventurer";
  return "Comfort Drinker";
};

const getTasteSummary = (persona: CoffeePersona, selected: Record<string, string[]>) => {
  if (HOME_PERSONAS.has(persona)) {
    const flavors = selected.flavors?.length ? selected.flavors.join(", ") : "balanced";
    return `You are building a home-brewing profile around ${flavors.toLowerCase()} coffees. BrewCircle can use this to suggest beans, gear, and people with similar taste.`;
  }

  const drinks = selected.usualDrinks ?? [];
  const milkBased = drinks.some((drink) => ["Cappuccino", "Latte", "Flat White", "Milk Coffee"].includes(drink));
  const sweet = drinks.some((drink) => ["Mocha", "Hazelnut Coffee", "Caramel Coffee", "Frappé"].includes(drink));
  const cold = drinks.some((drink) => ["Cold Brew", "Iced Coffee"].includes(drink));
  const simple = [];
  if (sweet) simple.push("sweet and dessert-like coffees");
  if (milkBased) simple.push("milk-based drinks");
  if (cold) simple.push("cold, refreshing coffees");
  if (!simple.length) simple.push("comforting everyday coffee");
  return `You seem to enjoy ${simple.join(", ")}. BrewCircle will translate that into simple recommendations without asking you to learn coffee jargon first.`;
};

const isMissingColumnError = (error: { code?: string; message?: string } | null) =>
  Boolean(error && (error.code === "42703" || error.message?.toLowerCase().includes("column")));

const normalizeEmail = (raw: string) => raw.trim().toLowerCase();

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [persona, setPersona] = useState<CoffeePersona | null>(null);
  const [contactVerification, setContactVerification] = useState<ContactVerification | null>(null);
  const [details, setDetails] = useState({
    name: "",
    handle: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [selected, setSelected] = useState<Record<string, string[]>>({
    methods: ["V60", "Aeropress"],
    equipment: ["Comandante C40", "Hario V60"],
    favoriteBeans: [],
    favoriteRoasters: [],
    experience: ["Intermediate"],
    flavors: ["Berry", "Floral", "Winey"],
    regions: ["Chikmagalur", "Araku Valley"],
    usualDrinks: [],
    cafeReasons: [],
    cafeFrequency: [],
    learningGoals: [],
  });

  useEffect(() => {
    const loadExistingProfile = async () => {
      const supabase = createClientIfConfigured();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, handle, email, phone, location, bio")
        .eq("id", user.id)
        .single();

      setDetails((prev) => ({
        name: prev.name || profile?.name || "",
        handle: prev.handle || profile?.handle || "",
        email: prev.email || user.email || profile?.email || "",
        phone: prev.phone || user.phone || profile?.phone || "",
        location: prev.location || profile?.location || "",
        bio: prev.bio || profile?.bio || "",
      }));
    };

    loadExistingProfile();
  }, []);

  const steps = useMemo(() => getSteps(persona), [persona]);
  const current = steps[Math.min(step, steps.length - 1)];
  const options: Partial<Record<StepId, string[]>> = {
    methods: METHODS,
    equipment: EQUIPMENT,
    favoriteBeans: FAVORITE_BEANS,
    favoriteRoasters: FAVORITE_ROASTERS,
    experience: EXPERIENCE_LEVELS,
    flavors: FLAVORS,
    regions: REGIONS,
    usualDrinks: USUAL_DRINKS,
    cafeReasons: CAFE_REASONS,
    cafeFrequency: CAFE_FREQUENCY,
    learningGoals: LEARNING_GOALS,
  };

  const choosePersona = (value: CoffeePersona) => {
    setPersona(value);
    setSelected((prev) => ({ ...prev, persona: [value] }));
  };

  const toggle = (key: StepId, item: string) => {
    setSelected((prev) => {
      if (SINGLE_SELECT_STEPS.has(key)) return { ...prev, [key]: [item] };

      const list = prev[key] ?? [];
      return {
        ...prev,
        [key]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
      };
    });
  };

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (raw.startsWith("+")) return raw;
    return `+91${digits}`;
  };

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "BC";

  const canContinue =
    !REQUIRED_SELECTION_STEPS.has(current.id) || (current.id === "persona" ? Boolean(persona) : Boolean(selected[current.id]?.length));

  const saveOnboarding = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (!persona) {
        setMessage("Choose what best describes you before saving.");
        return;
      }

      const name = details.name.trim() || "Brewer";
      const handle = details.handle.trim().replace(/^@/, "") || `brewer_${user.id.slice(0, 8)}`;
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email, phone")
        .eq("id", user.id)
        .single();
      const email = normalizeEmail(details.email) || user.email || existingProfile?.email || "";
      const phone = formatPhone(details.phone) || user.phone || existingProfile?.phone || "";
      const authEmail = normalizeEmail(user.email ?? "");
      const authPhone = formatPhone(user.phone ?? "");

      if (email && email !== authEmail) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
        setContactVerification({ type: "email", value: email, token: "" });
        setMessage(`Enter the OTP sent to ${email} to link this email to your BrewCircle account.`);
        return;
      }

      if (phone && phone !== authPhone) {
        const { error } = await supabase.auth.updateUser({ phone });
        if (error) throw error;
        setContactVerification({ type: "phone", value: phone, token: "" });
        setMessage(`Enter the OTP sent to ${phone} to link this phone number to your BrewCircle account.`);
        return;
      }

      const coffeePersonality = getCoffeePersonality(persona, selected);
      const tasteSummary = getTasteSummary(persona, selected);
      const baseProfilePatch = {
        name,
        handle,
        email: email || null,
        phone: phone || null,
        location: details.location.trim(),
        bio: details.bio.trim(),
        avatar_initials: getInitials(name),
      };
      const profilePatch = {
        ...baseProfilePatch,
        coffee_persona: persona,
        coffee_personality: coffeePersonality,
        taste_summary: tasteSummary,
      };
      const profileResult = await supabase
        .from("profiles")
        .update(profilePatch)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();
      if (profileResult.error) {
        if (!isMissingColumnError(profileResult.error)) throw profileResult.error;
        const fallbackProfileResult = await supabase
          .from("profiles")
          .update(baseProfilePatch)
          .eq("id", user.id)
          .select("id")
          .maybeSingle();
        if (fallbackProfileResult.error) throw fallbackProfileResult.error;
        if (!fallbackProfileResult.data) {
          const fallbackProfileInsertResult = await supabase
            .from("profiles")
            .insert({ id: user.id, ...baseProfilePatch });
          if (fallbackProfileInsertResult.error) throw fallbackProfileInsertResult.error;
        }
      } else if (!profileResult.data) {
        const profileInsertResult = await supabase
          .from("profiles")
          .insert({ id: user.id, ...profilePatch });
        if (profileInsertResult.error) {
          if (!isMissingColumnError(profileInsertResult.error)) throw profileInsertResult.error;
          const fallbackProfileInsertResult = await supabase
            .from("profiles")
            .insert({ id: user.id, ...baseProfilePatch });
          if (fallbackProfileInsertResult.error) throw fallbackProfileInsertResult.error;
        }
      }

      const isHomePath = HOME_PERSONAS.has(persona);
      const inferredFlavorPrefs = inferFlavorPrefs(selected.usualDrinks ?? []);
      const legacyDnaPatch = {
        methods: isHomePath ? selected.methods ?? [] : [persona === "cafe_regular" ? "Café visits" : "Everyday coffee"],
        equipment: isHomePath ? selected.equipment ?? [] : selected.usualDrinks ?? [],
        favorite_beans: isHomePath ? selected.favoriteBeans ?? [] : [],
        favorite_roasters: isHomePath ? selected.favoriteRoasters ?? [] : [],
        flavor_prefs: isHomePath ? selected.flavors ?? [] : inferredFlavorPrefs,
        regions: isHomePath ? selected.regions ?? [] : selected.cafeReasons?.length ? selected.cafeReasons : ["Coffee discovery"],
      };
      const dnaPatch = {
        ...legacyDnaPatch,
        usual_drinks: selected.usualDrinks ?? [],
        cafe_visit_reasons: selected.cafeReasons ?? [],
        cafe_frequency: selected.cafeFrequency?.[0] ?? "",
        learning_goals: selected.learningGoals ?? [],
        experience_level: isHomePath ? selected.experience?.[0] ?? "" : "Discovery",
      };
      const dnaResult = await supabase
        .from("coffee_dna")
        .update(dnaPatch)
        .eq("user_id", user.id)
        .select("user_id")
        .maybeSingle();
      if (dnaResult.error) {
        if (!isMissingColumnError(dnaResult.error)) throw dnaResult.error;
        const fallbackDnaResult = await supabase
          .from("coffee_dna")
          .update(legacyDnaPatch)
          .eq("user_id", user.id)
          .select("user_id")
          .maybeSingle();
        if (fallbackDnaResult.error) throw fallbackDnaResult.error;
        if (!fallbackDnaResult.data) {
          const fallbackDnaInsertResult = await supabase
            .from("coffee_dna")
            .insert({ user_id: user.id, ...legacyDnaPatch });
          if (fallbackDnaInsertResult.error) throw fallbackDnaInsertResult.error;
        }
      } else if (!dnaResult.data) {
        const dnaInsertResult = await supabase
          .from("coffee_dna")
          .insert({ user_id: user.id, ...dnaPatch });
        if (dnaInsertResult.error) {
          if (!isMissingColumnError(dnaInsertResult.error)) throw dnaInsertResult.error;
          const fallbackDnaInsertResult = await supabase
            .from("coffee_dna")
            .insert({ user_id: user.id, ...legacyDnaPatch });
          if (fallbackDnaInsertResult.error) throw fallbackDnaInsertResult.error;
        }
      }

      router.push("/profile");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  };

  const verifyContact = async () => {
    if (!contactVerification) return;

    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const token = contactVerification.token.trim();
      if (!token) {
        setMessage("Enter the OTP to verify this contact method.");
        return;
      }

      const { error } =
        contactVerification.type === "email"
          ? await supabase.auth.verifyOtp({
              email: contactVerification.value,
              token,
              type: "email_change",
            })
          : await supabase.auth.verifyOtp({
              phone: contactVerification.value,
              token,
              type: "phone_change",
            });

      if (error) throw error;

      setContactVerification(null);
      setMessage(`${contactVerification.type === "email" ? "Email" : "Phone number"} linked. Finishing your profile...`);
      await saveOnboarding();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify contact method.");
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === steps.length - 1;
  const isDetailsStep = current.id === "details";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-accent">
          Step {step + 1} of {steps.length}
        </p>
        <h1 className="mt-1 font-display text-3xl text-foreground">{current.title}</h1>
        <p className="text-muted">{current.subtitle}</p>
        <div className="mt-4 flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
      </div>

      {current.id === "persona" ? (
        <div className="grid gap-3">
          {PERSONAS.map((item) => {
            const active = persona === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => choosePersona(item.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  active
                    ? "border-primary bg-primary text-background shadow-sm"
                    : "border-primary/20 bg-card text-foreground hover:border-primary",
                )}
              >
                <span className="block text-base font-semibold">{item.label}</span>
                <span className={cn("mt-1 block text-sm", active ? "text-background/75" : "text-muted")}>{item.description}</span>
              </button>
            );
          })}
        </div>
      ) : isDetailsStep ? (
        <div className="grid gap-4">
          <label className="block text-sm font-medium">
            Name
            <input
              type="text"
              value={details.name}
              onChange={(e) => setDetails((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ananya Rao"
              className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Handle
            <input
              type="text"
              value={details.handle}
              onChange={(e) => setDetails((prev) => ({ ...prev, handle: e.target.value }))}
              placeholder="ananya_pourover"
              className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              value={details.email}
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, email: e.target.value }));
                setContactVerification(null);
              }}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Phone number
            <input
              type="tel"
              value={details.phone}
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, phone: e.target.value }));
                setContactVerification(null);
              }}
              placeholder="98765 43210"
              className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Location
            <input
              type="text"
              value={details.location}
              onChange={(e) => setDetails((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Bangalore, Karnataka"
              className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Bio
            <textarea
              value={details.bio}
              onChange={(e) => setDetails((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Coffee drinker discovering what I enjoy."
              rows={3}
              className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(options[current.id] ?? []).map((item) => {
            const active = (selected[current.id] ?? []).includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(current.id, item)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  active
                    ? "border-primary bg-primary text-background shadow-sm"
                    : "border-primary/30 bg-transparent text-foreground hover:border-primary hover:bg-primary/5",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {contactVerification && (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-card p-4">
          <p className="text-sm font-medium text-accent">
            Verify {contactVerification.type === "email" ? "email" : "phone number"}
          </p>
          <p className="mt-1 text-sm text-muted">
            We sent an OTP to {contactVerification.value}. Verify it so both login methods point to the same profile.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={contactVerification.token}
              onChange={(event) =>
                setContactVerification((prev) =>
                  prev ? { ...prev, token: event.target.value.replace(/\s/g, "") } : prev,
                )
              }
              placeholder="Enter OTP"
              className="flex-1 rounded-sm border border-border bg-background px-3 py-2.5 text-sm tracking-[0.25em] text-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              disabled={saving || !contactVerification.token.trim()}
              onClick={verifyContact}
              className="rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
            >
              {saving ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      )}

      {persona && current.id !== "persona" && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-accent">Preview: Your coffee discovery profile</p>
          <p className="mt-2 text-sm text-muted">{getTasteSummary(persona, selected)}</p>
          <p className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
            ☕ {getCoffeePersonality(persona, selected)}
          </p>
        </div>
      )}

      {message && <p className="mt-6 text-sm text-accent">{message}</p>}

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((currentStep) => currentStep - 1)}
          className="rounded-full px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-30"
        >
          Back
        </button>
        {isLast ? (
          <button
            type="button"
            disabled={saving || !canContinue || Boolean(contactVerification)}
            onClick={saveOnboarding}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-background disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : "Save profile"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((currentStep) => Math.min(currentStep + 1, steps.length - 1))}
            className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-background disabled:opacity-40"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
