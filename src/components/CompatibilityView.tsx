import type { UserProfile } from "@/lib/types";
import { computeCompatibility } from "@/lib/data";
import { Heart, X } from "lucide-react";

export function CompatibilityView({ userA, userB }: { userA: UserProfile; userB: UserProfile }) {
  const { matchPercent, shared, differences } = computeCompatibility(userA, userB);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <ProfileBubble user={userA} />
        <div className="flex flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber/40 bg-gradient-to-br from-amber/20 to-roast">
            <span className="font-display text-3xl text-amber">{matchPercent}%</span>
          </div>
          <p className="mt-2 text-sm text-cream/60">brew compatibility</p>
        </div>
        <ProfileBubble user={userB} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-green-400">
            <Heart className="h-4 w-4" />
            Shared
          </h4>
          <ul className="mt-2 space-y-1.5">
            {shared.map((s) => (
              <li key={s} className="text-sm text-cream/80">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-cream/10 bg-roast p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-cream/60">
            <X className="h-4 w-4" />
            Differences
          </h4>
          <ul className="mt-2 space-y-1.5">
            {differences.map((d) => (
              <li key={d} className="text-sm text-cream/70">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProfileBubble({ user }: { user: UserProfile }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber/20 text-lg font-bold text-amber">
        {user.avatar}
      </div>
      <p className="mt-2 font-medium text-cream">{user.name}</p>
      <p className="text-xs text-cream/50">@{user.handle}</p>
    </div>
  );
}
