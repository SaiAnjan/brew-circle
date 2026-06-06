import Link from "next/link";
import type { ReactNode } from "react";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center", className)}>
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Coffee className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 text-base font-medium text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-sm bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
