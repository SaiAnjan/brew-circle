import type { Bean } from "@/lib/types";
import { MapPin } from "lucide-react";

export function BeanCard({ bean, meta }: { bean: Bean; meta?: string }) {
  return (
    <article className="card-surface rounded-md p-4">
      {bean.trending && (
        <span className="mb-2 inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Trending
        </span>
      )}
      <h3 className="text-sm font-medium text-foreground">{bean.name}</h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <MapPin className="h-3 w-3" />
        {bean.estate} · {bean.region.split(",")[0]}
      </p>
      <p className="mt-2 text-sm text-foreground/75">
        {bean.roaster} · {bean.roastLevel} · {bean.processing}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {bean.flavorNotes.map((note) => (
          <span key={note} className="rounded-sm border border-border px-2 py-0.5 text-xs">
            {note}
          </span>
        ))}
      </div>
      {meta && <p className="mt-3 text-xs text-muted">{meta}</p>}
    </article>
  );
}
