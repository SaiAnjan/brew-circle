import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl text-cream">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-cream/60">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm text-amber hover:text-amber-light">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
