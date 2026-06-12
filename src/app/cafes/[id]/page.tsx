import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { CafeOrderClient } from "@/components/CafeOrderClient";
import { getCafe, getCafeMenu } from "@/lib/cafes";

export default async function CafePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cafe, menuItems] = await Promise.all([getCafe(id), getCafeMenu(id)]);

  if (!cafe) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-16">
      <Link href="/cafes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Cafés
      </Link>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="h-48 bg-cover bg-center sm:h-64" style={{ backgroundImage: `url(${cafe.imageUrl})` }} />
        <div className="p-5">
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {cafe.address}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary">{cafe.name}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{cafe.vibe}</p>
          <p className="mt-4 rounded-2xl bg-primary/5 p-3 text-sm text-primary">{cafe.matchReason}</p>
        </div>
      </section>

      <div className="mt-6">
        <CafeOrderClient cafe={cafe} menuItems={menuItems} />
      </div>
    </div>
  );
}
