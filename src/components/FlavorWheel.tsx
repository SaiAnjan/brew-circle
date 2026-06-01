"use client";

import type { FlavorNote } from "@/lib/types";
import { cn } from "@/lib/utils";

const FLAVORS: FlavorNote[] = [
  "Chocolate",
  "Nutty",
  "Caramel",
  "Floral",
  "Berry",
  "Citrus",
  "Tropical",
  "Winey",
  "Spicy",
];

const FLAVOR_COLORS: Record<FlavorNote, string> = {
  Chocolate: "bg-[#5c3d2e]",
  Nutty: "bg-[#6b5344]",
  Caramel: "bg-[#a67c52]",
  Floral: "bg-[#9b7eb8]",
  Berry: "bg-[#8b3a62]",
  Citrus: "bg-[#d4a017]",
  Tropical: "bg-[#2d8a6e]",
  Winey: "bg-[#722f37]",
  Spicy: "bg-[#c45c26]",
};

export function FlavorWheel({
  coverage,
  suggestions,
}: {
  coverage: Record<FlavorNote, number>;
  suggestions?: { flavor: FlavorNote; bean: string; reason: string }[];
}) {
  const avg = Math.round(
    FLAVORS.reduce((sum, f) => sum + coverage[f], 0) / FLAVORS.length,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-48 w-48 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            {FLAVORS.map((flavor, i) => {
              const pct = coverage[flavor] / 100;
              const angle = (360 / FLAVORS.length) * i;
              const nextAngle = (360 / FLAVORS.length) * (i + 1);
              const r = 70;
              const cx = 100;
              const cy = 100;
              const start = (angle * Math.PI) / 180;
              const end = (nextAngle * Math.PI) / 180;
              const x1 = cx + r * Math.cos(start);
              const y1 = cy + r * Math.sin(start);
              const x2 = cx + r * Math.cos(end);
              const y2 = cy + r * Math.sin(end);
              const innerR = r * (1 - pct * 0.85);
              const ix1 = cx + innerR * Math.cos(start);
              const iy1 = cy + innerR * Math.sin(start);
              const ix2 = cx + innerR * Math.cos(end);
              const iy2 = cy + innerR * Math.sin(end);
              const large = nextAngle - angle > 180 ? 1 : 0;
              const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
              return (
                <path
                  key={flavor}
                  d={d}
                  className={cn(FLAVOR_COLORS[flavor], "opacity-90")}
                  opacity={0.4 + pct * 0.6}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl text-cream">{avg}%</span>
            <span className="text-xs text-cream/50">coverage</span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          {FLAVORS.map((flavor) => (
            <div key={flavor} className="rounded-xl border border-cream/10 bg-espresso/50 p-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", FLAVOR_COLORS[flavor])} />
                <span className="text-xs font-medium text-cream">{flavor}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream/10">
                <div
                  className={cn("h-full rounded-full", FLAVOR_COLORS[flavor])}
                  style={{ width: `${coverage[flavor]}%` }}
                />
              </div>
              <span className="mt-1 text-xs text-cream/50">{coverage[flavor]}%</span>
            </div>
          ))}
        </div>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="rounded-2xl border border-amber/20 bg-amber/5 p-4">
          <p className="text-sm font-medium text-amber">Expand your palate</p>
          <ul className="mt-2 space-y-2">
            {suggestions.map((s) => (
              <li key={s.flavor} className="text-sm text-cream/80">
                <span className="text-cream">{s.flavor}</span> → try{" "}
                <span className="text-amber">{s.bean}</span>
                <span className="block text-xs text-cream/50">{s.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
