"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Check, CreditCard, FileText, Loader2, Percent, ReceiptText, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { demoCafeBills, formatPrice, hasExactDemoBill, resolveDemoBill } from "@/lib/bills";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { Cafe, CafeBill, CafeBillItem, FlavorNote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type RatingValue = "loved" | "good" | "okay" | "not_for_me";
type PaymentMethod = "upi" | "card" | "wallet";

type PaidBillState = {
  storedIn: "supabase" | "local";
  orderIdsByItemId: Record<string, string>;
  paymentReference: string;
};

const paymentMethods: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "upi", label: "UPI", description: "Fastest for café checkout demos." },
  { value: "card", label: "Card", description: "Credit/debit card simulation." },
  { value: "wallet", label: "Wallet", description: "BrewCircle wallet mock." },
];

const ratingOptions: { value: RatingValue; label: string }[] = [
  { value: "loved", label: "😍 Loved it" },
  { value: "good", label: "🙂 Good" },
  { value: "okay", label: "😐 Okay" },
  { value: "not_for_me", label: "😕 Not for me" },
];

function getLocalBills() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("brewcircle:pos-bills") ?? "[]") as unknown[];
  } catch {
    return [];
  }
}

function saveLocalBill(payload: Record<string, unknown>) {
  const bills = getLocalBills();
  window.localStorage.setItem("brewcircle:pos-bills", JSON.stringify([payload, ...bills].slice(0, 20)));
}

function getUpdatedSignals(current: string[] | null | undefined, nextSignals: string[]) {
  return Array.from(new Set([...(current ?? []), ...nextSignals])).slice(0, 30);
}

function getLineTotal(item: CafeBillItem) {
  return item.quantity * item.unitPricePaise;
}

function getBillFlavorNotes(bill: CafeBill) {
  return Array.from(new Set(bill.items.flatMap((item) => item.flavorNotes))) as FlavorNote[];
}

function getBillDrinkNames(bill: CafeBill) {
  return Array.from(new Set(bill.items.map((item) => item.name)));
}

export function BillPaymentClient({
  cafes,
  initialBillNumber = "",
  initialCafeId,
}: {
  cafes: Cafe[];
  initialBillNumber?: string;
  initialCafeId?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [billNumber, setBillNumber] = useState(initialBillNumber);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("upi");
  const [isPaying, setIsPaying] = useState(false);
  const [ratingItemId, setRatingItemId] = useState<string | null>(null);
  const [paidBill, setPaidBill] = useState<PaidBillState | null>(null);
  const activeBill = initialBillNumber ? resolveDemoBill(initialBillNumber, initialCafeId) : null;
  const lookupWasSynthetic = Boolean(initialBillNumber) && !hasExactDemoBill(initialBillNumber);

  const suggestedBills = useMemo(() => {
    const cafeBills = initialCafeId ? demoCafeBills.filter((bill) => bill.cafeId === initialCafeId) : demoCafeBills;
    return cafeBills.length ? cafeBills : demoCafeBills;
  }, [initialCafeId]);

  const activeCafe = activeBill ? cafes.find((cafe) => cafe.id === activeBill.cafeId) : null;

  const addBillSignalsToDna = async (bill: CafeBill) => {
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

    await supabase.from("coffee_dna").upsert(
      {
        user_id: user.id,
        usual_drinks: getUpdatedSignals(dna?.usual_drinks as string[] | null, getBillDrinkNames(bill)),
        flavor_prefs: getUpdatedSignals(dna?.flavor_prefs as string[] | null, getBillFlavorNotes(bill)) as FlavorNote[],
      },
      { onConflict: "user_id" },
    );
  };

  const payBill = async () => {
    if (!activeBill) return;

    setIsPaying(true);
    const paymentReference = `BCPAY-${Date.now()}`;

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        saveLocalBill({ bill: activeBill, paymentMethod: selectedPaymentMethod, paymentReference, paidAt: new Date().toISOString() });
        setPaidBill({ storedIn: "local", orderIdsByItemId: {}, paymentReference });
        showToast({ title: "Demo payment complete", description: "Saved locally because Supabase is not configured.", variant: "warning" });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({ title: "Sign in required", description: "Sign in before paying so this bill can update your Coffee DNA.", variant: "warning" });
        const returnTo = `/bill?bill=${encodeURIComponent(activeBill.invoiceNumber)}${initialCafeId ? `&cafe=${encodeURIComponent(initialCafeId)}` : ""}`;
        router.push(`/login?next=${encodeURIComponent(returnTo)}`);
        return;
      }

      const orderRows = activeBill.items.map((item) => ({
        user_id: user.id,
        cafe_id: activeBill.cafeId,
        menu_item_id: item.menuItemId ?? null,
        drink_name: item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name,
        price_paise: getLineTotal(item),
        payment_status: "paid_mock",
        dna_signals: item.dnaSignals,
        invoice_number: activeBill.invoiceNumber,
        bill_total_paise: activeBill.totalPaise,
        payment_method: selectedPaymentMethod,
        payment_reference: paymentReference,
        source: "pos_bill_demo",
      }));

      const { data, error } = await supabase.from("coffee_orders").insert(orderRows).select("id, drink_name");

      if (error || !data) {
        saveLocalBill({ bill: activeBill, paymentMethod: selectedPaymentMethod, paymentReference, paidAt: new Date().toISOString() });
        setPaidBill({ storedIn: "local", orderIdsByItemId: {}, paymentReference });
        showToast({
          title: "Demo payment complete",
          description: "Run the bill migration to persist invoice payments in Supabase.",
          variant: "warning",
        });
        return;
      }

      const orderIdsByItemId = activeBill.items.reduce<Record<string, string>>((accumulator, item, index) => {
        const order = data[index] as { id?: string } | undefined;
        if (order?.id) accumulator[item.id] = order.id;
        return accumulator;
      }, {});

      await addBillSignalsToDna(activeBill);
      setPaidBill({ storedIn: "supabase", orderIdsByItemId, paymentReference });
      showToast({
        title: "Payment successful",
        description: "This POS bill is now part of your Coffee DNA.",
        variant: "success",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const rateDrink = async (item: CafeBillItem, rating: RatingValue) => {
    if (!activeBill || !paidBill) return;

    setRatingItemId(item.id);
    try {
      if (paidBill.storedIn === "local") {
        saveLocalBill({ invoiceNumber: activeBill.invoiceNumber, itemId: item.id, rating, ratedAt: new Date().toISOString() });
        showToast({ title: "Rating saved locally", description: "The rating is stored on this device for the demo.", variant: "success" });
        return;
      }

      const supabase = createClientIfConfigured();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const orderId = paidBill.orderIdsByItemId[item.id];
      await supabase.from("drink_ratings").insert({
        order_id: orderId ?? null,
        user_id: user.id,
        cafe_id: activeBill.cafeId,
        menu_item_id: item.menuItemId ?? null,
        rating,
        tags: item.dnaSignals,
      });

      if (orderId) {
        await supabase.from("coffee_orders").update({ rating }).eq("id", orderId).eq("user_id", user.id);
      }

      showToast({
        title: "Rating added",
        description: rating === "not_for_me" ? "BrewCircle will avoid over-recommending similar drinks." : "BrewCircle will use this to refine recommendations.",
        variant: "success",
      });
    } finally {
      setRatingItemId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">POS bill bridge</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary">Enter your café bill number</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The café still bills at the POS. BrewCircle uses the invoice number to fetch the drinks, run a demo payment, and build Coffee DNA.
          </p>
        </div>

        <form className="space-y-3" action="/bill" method="get">
          {initialCafeId && <input type="hidden" name="cafe" value={initialCafeId} />}
          <label className="block text-sm font-medium text-primary" htmlFor="bill-number">
            Bill or invoice number
          </label>
          <div className="flex gap-2">
            <input
              id="bill-number"
              name="bill"
              value={billNumber}
              onChange={(event) => setBillNumber(event.target.value)}
              placeholder="Try HT-4281 or TW-1902"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-background">
              Load
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {suggestedBills.map((bill) => (
            <Link
              key={bill.invoiceNumber}
              href={`/bill?bill=${encodeURIComponent(bill.invoiceNumber)}${initialCafeId ? `&cafe=${encodeURIComponent(initialCafeId)}` : ""}`}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-primary"
            >
              {bill.invoiceNumber}
            </Link>
          ))}
        </div>

        <div className="rounded-3xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-background p-3 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Testing behavior</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Any random bill number works in this prototype. Known numbers load exact demo bills; unknown numbers map to a realistic sample invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-background p-3 shadow-sm">
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card">
          <div className="border-b border-border bg-primary p-5 text-background">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-70">BrewCircle Pay</p>
                <h2 className="mt-2 text-xl font-semibold">Bill payment</h2>
                <p className="mt-1 text-sm opacity-80">Demo checkout for café user testing</p>
              </div>
              <div className="rounded-2xl bg-background/10 p-3">
                <ReceiptText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {!activeBill ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <ReceiptText className="h-6 w-6" />
              </div>
              <p className="mt-4 font-medium text-primary">Load a bill to preview checkout</p>
              <p className="mt-2 text-sm text-muted">Enter a POS bill number or tap one of the demo bills.</p>
            </div>
          ) : (
            <div className="space-y-5 p-5">
              {lookupWasSynthetic && (
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-3 text-sm text-accent">
                  Demo invoice generated for <span className="font-semibold">{activeBill.invoiceNumber}</span>.
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{activeBill.posProvider}</p>
                  <h3 className="mt-1 text-lg font-semibold text-primary">{activeCafe?.name ?? "Demo café"}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {activeBill.tableLabel} · Served by {activeBill.serverName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-primary">{activeBill.invoiceNumber}</p>
                  <p className="mt-1 text-xs text-muted">{activeBill.issuedAtLabel}</p>
                </div>
              </div>

              <div className="space-y-3">
                {activeBill.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-primary">{item.name}</p>
                        <p className="mt-1 text-xs text-muted">
                          {item.quantity} × {formatPrice(item.unitPricePaise)}
                        </p>
                      </div>
                      <p className="font-medium text-primary">{formatPrice(getLineTotal(item))}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[...item.attributes, ...item.flavorNotes].map((tag) => (
                        <span key={tag} className="rounded-full border border-border bg-card px-2 py-1 text-[11px] text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-2xl border border-border bg-background p-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(activeBill.subtotalPaise)}</span>
                </div>
                {activeBill.discountPaise > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Partner offer</span>
                    <span>-{formatPrice(activeBill.discountPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Service charge</span>
                  <span>{formatPrice(activeBill.serviceChargePaise)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Taxes</span>
                  <span>{formatPrice(activeBill.taxPaise)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-semibold text-primary">
                    <span>To pay</span>
                    <span>{formatPrice(activeBill.totalPaise)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                <div className="flex items-start gap-3">
                  <Percent className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-primary">Personalized café offer</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      If this becomes a repeated preference, cafés can offer curated bundles like 10 cold brews valid for 30 days.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-primary">Payment method</p>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                        selectedPaymentMethod === method.value ? "border-primary bg-primary/5" : "border-border bg-background",
                      )}
                    >
                      <div className="rounded-xl bg-card p-2 text-primary">
                        {method.value === "upi" ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">{method.label}</p>
                        <p className="text-xs text-muted">{method.description}</p>
                      </div>
                      {selectedPaymentMethod === method.value && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isPaying}
                onClick={payBill}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background disabled:opacity-60"
              >
                {isPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {paidBill ? "Payment completed" : `Pay ${formatPrice(activeBill.totalPaise)}`}
              </button>

              {paidBill && (
                <div className="space-y-4 rounded-3xl border border-accent/30 bg-accent/5 p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-primary">Coffee DNA updated</p>
                      <p className="mt-1 text-sm text-muted">
                        Ref: {paidBill.paymentReference}. Rate each drink to make recommendations sharper.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {activeBill.items.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <p className="text-sm font-medium text-primary">{item.name}</p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {ratingOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              disabled={ratingItemId === item.id}
                              onClick={() => rateDrink(item, option.value)}
                              className="rounded-xl border border-border bg-background px-2 py-2 text-xs font-medium text-primary disabled:opacity-60"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
