import type { CafeBill } from "@/lib/types";

export const demoCafeBills: CafeBill[] = [
  {
    invoiceNumber: "HT-4281",
    cafeId: "humming-tree-cafe",
    posProvider: "Demo POS",
    tableLabel: "Table 7",
    serverName: "Aarav",
    issuedAtLabel: "Today · 11:42 AM",
    subtotalPaise: 45000,
    discountPaise: 0,
    serviceChargePaise: 2250,
    taxPaise: 2250,
    totalPaise: 49500,
    items: [
      {
        id: "ht-4281-cranberry-nitro",
        menuItemId: "cranberry-nitro-cold-brew",
        name: "Cranberry Nitro Cold Brew",
        quantity: 1,
        unitPricePaise: 26000,
        flavorNotes: ["Berry", "Citrus"],
        attributes: ["Cold", "Fruity", "Refreshing", "Low sweetness"],
        dnaSignals: ["cold coffee", "fruit-forward", "bright acidity", "nitro texture"],
      },
      {
        id: "ht-4281-comfort-cappuccino",
        menuItemId: "comfort-cappuccino",
        name: "Comfort Cappuccino",
        quantity: 1,
        unitPricePaise: 19000,
        flavorNotes: ["Chocolate", "Nutty"],
        attributes: ["Milk-based", "Comforting", "Chocolatey"],
        dnaSignals: ["milk-based", "comfort drink", "chocolate-forward"],
      },
    ],
  },
  {
    invoiceNumber: "TW-1902",
    cafeId: "third-wave-bandra",
    posProvider: "Demo POS",
    tableLabel: "Counter bill",
    serverName: "Mira",
    issuedAtLabel: "Today · 4:18 PM",
    subtotalPaise: 66000,
    discountPaise: 6000,
    serviceChargePaise: 3000,
    taxPaise: 3300,
    totalPaise: 66300,
    items: [
      {
        id: "tw-1902-bandra-mocha",
        menuItemId: "bandra-mocha",
        name: "Bandra Mocha",
        quantity: 2,
        unitPricePaise: 24000,
        flavorNotes: ["Chocolate", "Caramel"],
        attributes: ["Sweet", "Dessert-like", "Milk-based"],
        dnaSignals: ["dessert coffee", "chocolate-forward", "milk-based"],
      },
      {
        id: "tw-1902-iced-americano",
        menuItemId: "iced-americano-spark",
        name: "Iced Americano Spark",
        quantity: 1,
        unitPricePaise: 18000,
        flavorNotes: ["Citrus", "Floral"],
        attributes: ["Cold", "Black coffee", "Light"],
        dnaSignals: ["black coffee", "cold coffee", "citrus lift"],
      },
    ],
  },
];

export function formatPrice(pricePaise: number) {
  return `₹${Math.round(pricePaise / 100)}`;
}

export function normalizeBillNumber(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "-");
}

export function hasExactDemoBill(input: string) {
  const invoiceNumber = normalizeBillNumber(input);
  return demoCafeBills.some((bill) => bill.invoiceNumber === invoiceNumber);
}

export function resolveDemoBill(input: string, preferredCafeId?: string) {
  const invoiceNumber = normalizeBillNumber(input);
  const matchingBill = demoCafeBills.find((bill) => bill.invoiceNumber === invoiceNumber);
  if (matchingBill) return matchingBill;

  const preferredBill = preferredCafeId ? demoCafeBills.find((bill) => bill.cafeId === preferredCafeId) : null;
  const fallbackBill = preferredBill ?? demoCafeBills[0];
  const syntheticInvoiceNumber = invoiceNumber || fallbackBill.invoiceNumber;

  return {
    ...fallbackBill,
    invoiceNumber: syntheticInvoiceNumber,
  };
}
