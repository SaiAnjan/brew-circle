"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, QrCode, Star } from "lucide-react";
import { createClientIfConfigured } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import type { Cafe, CafeMenuItem, FlavorNote } from "@/lib/types";
import { cn } from "@/lib/utils";

type RatingValue = "loved" | "good" | "okay" | "not_for_me";

type LoggedOrder = {
  id: string;
  item: CafeMenuItem;
  storedIn: "supabase" | "local";
};

const ratingOptions: { value: RatingValue; label: string; description: string }[] = [
  { value: "loved", label: "😍 Loved it", description: "Use this to find more like it." },
  { value: "good", label: "🙂 Good", description: "A safe recommendation direction." },
  { value: "okay", label: "😐 Okay", description: "Keep it in history, but do not over-index." },
  { value: "not_for_me", label: "😕 Not for me", description: "Reduce similar recommendations." },
];

function formatPrice(pricePaise: number) {
  return `₹${Math.round(pricePaise / 100)}`;
}

function getLocalOrders() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("brewcircle:cafe-orders") ?? "[]") as unknown[];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: Record<string, unknown>) {
  const orders = getLocalOrders();
  window.localStorage.setItem("brewcircle:cafe-orders", JSON.stringify([order, ...orders].slice(0, 20)));
}

function getUpdatedSignals(current: string[] | null | undefined, nextSignals: string[]) {
  return Array.from(new Set([...(current ?? []), ...nextSignals])).slice(0, 20);
}

export function CafeOrderClient({ cafe, menuItems }: { cafe: Cafe; menuItems: CafeMenuItem[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [loggedOrder, setLoggedOrder] = useState<LoggedOrder | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))], [menuItems]);
  const filteredItems = selectedCategory === "All" ? menuItems : menuItems.filter((item) => item.category === selectedCategory);

  const addSignalsToDna = async (item: CafeMenuItem, rating: RatingValue) => {
    if (rating === "not_for_me") return;

    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: dna } = await supabase
      .from("coffee_dna")
      .select("usual_drinks, flavor_prefs")
      .eq("user_id", user.id)
      .maybeSingle();

    await supabase
      .from("coffee_dna")
      .update({
        usual_drinks: getUpdatedSignals(dna?.usual_drinks as string[] | null, [item.name]),
        flavor_prefs: getUpdatedSignals(dna?.flavor_prefs as string[] | null, item.flavorNotes) as FlavorNote[],
      })
      .eq("user_id", user.id);
  };

  const logOrder = async (item: CafeMenuItem) => {
    setLoadingItemId(item.id);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        const localId = `local_${Date.now()}`;
        saveLocalOrder({ id: localId, cafeId: cafe.id, itemId: item.id, drinkName: item.name, createdAt: new Date().toISOString() });
        setLoggedOrder({ id: localId, item, storedIn: "local" });
        showToast({ title: "Drink logged locally", description: "Supabase is not configured, so this pilot order is stored on this device.", variant: "warning" });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({ title: "Sign in required", description: "Sign in before paying so BrewCircle can attach this drink to your Coffee DNA.", variant: "warning" });
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("coffee_orders")
        .insert({
          user_id: user.id,
          cafe_id: cafe.id,
          menu_item_id: item.id,
          drink_name: item.name,
          price_paise: item.pricePaise,
          payment_status: "paid_mock",
          dna_signals: item.dnaSignals,
        })
        .select("id")
        .maybeSingle();

      if (error || !data) {
        const localId = `local_${Date.now()}`;
        saveLocalOrder({ id: localId, cafeId: cafe.id, itemId: item.id, drinkName: item.name, createdAt: new Date().toISOString() });
        setLoggedOrder({ id: localId, item, storedIn: "local" });
        showToast({ title: "Pilot order saved locally", description: "Run the café SQL migration to store this in Supabase.", variant: "warning" });
        return;
      }

      setLoggedOrder({ id: data.id as string, item, storedIn: "supabase" });
      showToast({ title: "Paid and logged", description: `${item.name} was added to your coffee journey.`, variant: "success" });
    } finally {
      setLoadingItemId(null);
    }
  };

  const rateDrink = async (rating: RatingValue) => {
    if (!loggedOrder) return;

    setRatingOrderId(loggedOrder.id);

    try {
      if (loggedOrder.storedIn === "local") {
        saveLocalOrder({ id: loggedOrder.id, rating, ratedAt: new Date().toISOString() });
        showToast({ title: "Rating saved locally", description: "Your pilot DNA signal is stored on this device.", variant: "success" });
        return;
      }

      const supabase = createClientIfConfigured();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("drink_ratings").insert({
        order_id: loggedOrder.id,
        user_id: user.id,
        cafe_id: cafe.id,
        menu_item_id: loggedOrder.item.id,
        rating,
        tags: loggedOrder.item.dnaSignals,
      });

      await supabase.from("coffee_orders").update({ rating }).eq("id", loggedOrder.id).eq("user_id", user.id);
      await addSignalsToDna(loggedOrder.item, rating);

      showToast({
        title: "Coffee DNA updated",
        description: rating === "not_for_me" ? "We will avoid over-recommending similar drinks." : "We will use this to recommend better drinks and café offers.",
        variant: "success",
      });
    } finally {
      setRatingOrderId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">QR pilot code</p>
            <p className="mt-1 font-mono text-sm text-primary">{cafe.qrCode}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              In the café, this page opens from a QR near the counter. Payment is mocked for Phase 1; the important loop is drink → rating → Coffee DNA.
            </p>
          </div>
        </div>
      </section>

      {loggedOrder && (
        <section className="rounded-3xl border border-accent/30 bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">{loggedOrder.item.name} added to your journey</p>
              <p className="mt-1 text-sm text-muted">
                Rate it now or later. Your answer teaches BrewCircle what to recommend next.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={ratingOrderId === loggedOrder.id}
                    onClick={() => rateDrink(option.value)}
                    className="rounded-2xl border border-border bg-background p-3 text-left text-sm transition hover:border-primary disabled:opacity-50"
                  >
                    <span className="block font-medium text-primary">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
                selectedCategory === category
                  ? "border-primary bg-primary text-background"
                  : "border-border bg-card text-muted",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{item.category}</p>
                  <h2 className="mt-1 text-lg font-semibold text-primary">{item.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
                <p className="text-lg font-semibold text-primary">{formatPrice(item.pricePaise)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...item.attributes, ...item.flavorNotes].map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              {item.offer && (
                <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 p-3 text-sm text-accent">
                  <Heart className="mr-1 inline h-4 w-4" />
                  {item.offer}
                </div>
              )}

              <button
                type="button"
                disabled={loadingItemId === item.id}
                onClick={() => logOrder(item)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-background disabled:opacity-50"
              >
                <Star className="h-4 w-4" />
                {loadingItemId === item.id ? "Logging..." : "Pay through BrewCircle"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
