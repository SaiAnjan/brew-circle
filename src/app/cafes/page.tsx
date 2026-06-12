import Link from "next/link";
import { Coffee, MapPin, QrCode } from "lucide-react";
import { getCafes } from "@/lib/cafes";

export default async function CafesPage() {
  const cafes = await getCafes();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Phase 1 mobile pilot</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary">Café QR experience</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          This is the first mobile-web loop: scan a café QR, choose a drink, mock-pay, rate it, and let BrewCircle update Coffee DNA signals.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link href="/scan" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 font-medium text-background">
            <QrCode className="h-4 w-4" />
            Open scanner concept
          </Link>
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 font-medium text-primary">
            <Coffee className="h-4 w-4" />
            View Coffee DNA
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {cafes.map((cafe) => (
          <Link key={cafe.id} href={`/cafes/${cafe.id}`} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${cafe.imageUrl})` }} />
            <div className="p-5">
              <p className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {cafe.area}, {cafe.city}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-primary">{cafe.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{cafe.vibe}</p>
              <p className="mt-4 rounded-2xl bg-primary/5 p-3 text-sm text-primary">{cafe.matchReason}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
