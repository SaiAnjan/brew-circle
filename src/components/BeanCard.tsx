import type { Bean } from "@/lib/types";
import { MapPin } from "lucide-react";

export function BeanCard({ bean, meta }: { bean: Bean; meta?: string }) {
  return (
    <article className="card-hover group rounded-2xl border border-cream/10 bg-roast p-4">
      {bean.trending && (
        <span className="mb-2 inline-block rounded-full bg-amber/20 px-2 py-0.5 text-xs font-medium text-amber">
          Trending
        </span>
      )}
      <h3 className="font-display text-lg text-cream group-hover:text-amber">{bean.name}</h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-cream/50">
        <MapPin className="h-3 w-3" />
        {bean.estate} · {bean.region.split(",")[0]}
      </p>
      <p className="mt-2 text-sm text-cream/70">
        {bean.roaster} · {bean.roastLevel} · {bean.processing}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {bean.flavorNotes.map((note) => (
          <span key={note} className="rounded-full bg-cream/5 px-2 py-0.5 text-xs text-cream/80">
            {note}
          </span>
        ))}
      </div>
      {meta && <p className="mt-3 text-xs text-amber/80">{meta}</p>}
    </article>
  );
}
