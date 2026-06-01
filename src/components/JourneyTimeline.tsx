import type { JourneyMilestone } from "@/lib/types";
import { Bean, Calendar, ShoppingBag, Users, Droplets } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  bean: <Bean className="h-4 w-4" />,
  pour: <Droplets className="h-4 w-4" />,
  community: <Users className="h-4 w-4" />,
  session: <Calendar className="h-4 w-4" />,
  market: <ShoppingBag className="h-4 w-4" />,
};

export function JourneyTimeline({ milestones }: { milestones: JourneyMilestone[] }) {
  return (
    <ol className="relative space-y-0 border-l border-cream/10 pl-6">
      {milestones.map((m, i) => (
        <li key={m.id} className="relative pb-8 last:pb-0">
          <span className="absolute -left-[1.65rem] flex h-7 w-7 items-center justify-center rounded-full border border-amber/30 bg-roast text-amber">
            {icons[m.icon] ?? <Bean className="h-4 w-4" />}
          </span>
          <time className="text-xs font-medium text-amber">{m.date}</time>
          <h4 className="mt-0.5 font-medium text-cream">{m.title}</h4>
          <p className="mt-1 text-sm text-cream/60">{m.description}</p>
          {i < milestones.length - 1 && (
            <span className="absolute -left-px top-7 h-[calc(100%-1.75rem)] w-px bg-gradient-to-b from-amber/30 to-transparent" />
          )}
        </li>
      ))}
    </ol>
  );
}
