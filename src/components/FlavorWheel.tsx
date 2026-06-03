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
  Chocolate: "#5c3d2e",
  Nutty: "#6b5344",
  Caramel: "#a67c52",
  Floral: "#9b7eb8",
  Berry: "#8b3a62",
  Citrus: "#d4a017",
  Tropical: "#2d8a6e",
  Winey: "#722f37",
  Spicy: "#c45c26",
};

function getCoverageValue(coverage: Record<FlavorNote, number>, flavor: FlavorNote) {
  const value = coverage[flavor];
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function formatPoint(value: number) {
  return Number(value.toFixed(3));
}

export function FlavorWheel({
  coverage,
  suggestions,
}: {
  coverage: Record<FlavorNote, number>;
  suggestions?: { flavor: FlavorNote; bean: string; reason: string }[];
}) {
  const safeCoverage = FLAVORS.reduce(
    (acc, flavor) => ({
      ...acc,
      [flavor]: getCoverageValue(coverage, flavor),
    }),
    {} as Record<FlavorNote, number>,
  );
  const avg = Math.round(
    FLAVORS.reduce((sum, flavor) => sum + safeCoverage[flavor], 0) / FLAVORS.length,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-48 w-48 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            {FLAVORS.map((flavor, i) => {
              const coverageValue = safeCoverage[flavor];
              const pct = coverageValue / 100;
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
              const d = `M ${formatPoint(x1)} ${formatPoint(y1)} A ${r} ${r} 0 ${large} 1 ${formatPoint(x2)} ${formatPoint(y2)} L ${formatPoint(ix2)} ${formatPoint(iy2)} A ${formatPoint(innerR)} ${formatPoint(innerR)} 0 ${large} 0 ${formatPoint(ix1)} ${formatPoint(iy1)} Z`;
              return (
                <path
                  key={flavor}
                  d={d}
                  fill={FLAVOR_COLORS[flavor]}
                  opacity={Number((0.4 + pct * 0.6).toFixed(3))}
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
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FLAVOR_COLORS[flavor] }} />
                <span className="text-xs font-medium text-cream">{flavor}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream/10">
                <div
                  className={cn("h-full rounded-full")}
                  style={{ width: `${safeCoverage[flavor]}%`, backgroundColor: FLAVOR_COLORS[flavor] }}
                />
              </div>
              <span className="mt-1 text-xs text-cream/50">{safeCoverage[flavor]}%</span>
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
