import type { CoffeeSession } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Calendar, MapPin, Star, Users } from "lucide-react";

export function SessionCard({ session }: { session: CoffeeSession }) {
  return (
    <article className="card-hover rounded-2xl border border-cream/10 bg-roast p-4">
      <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs text-cream/70">{session.type}</span>
      <h3 className="mt-2 font-display text-lg text-cream">{session.title}</h3>
      <p className="mt-1 text-sm text-cream/60">
        Host: {session.host}{" "}
        <span className="inline-flex items-center gap-0.5 text-amber">
          <Star className="h-3 w-3 fill-current" />
          {session.hostRating}
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-cream/50">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {session.date}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {session.location}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {session.seatsLeft} seats left
        </span>
      </div>
      <p className="mt-3 font-display text-xl text-amber">{formatINR(session.price)}</p>
    </article>
  );
}
