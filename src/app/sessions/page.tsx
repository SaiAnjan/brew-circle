import { EmptyState } from "@/components/EmptyState";
import { SessionCard } from "@/components/SessionCard";
import { sessions } from "@/lib/data";
import { Calendar } from "lucide-react";

export default function SessionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-cream">Coffee sessions</h1>
      <p className="mt-2 text-cream/60">
        Workshops, tastings, and estate experiences — like Airbnb Experiences for coffee.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Workshop", "Tasting", "Experience"].map((type) => (
          <span key={type} className="rounded-full border border-cream/15 px-3 py-1 text-xs text-cream/70">
            {type}
          </span>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
      {sessions.length === 0 && (
        <EmptyState
          className="mt-8"
          icon={<Calendar className="h-5 w-5" />}
          title="No sessions scheduled"
          description="Coffee workshops, tastings, and café experiences will show here when hosts publish them."
          actionHref="/discover"
          actionLabel="Back to discover"
        />
      )}
    </div>
  );
}
