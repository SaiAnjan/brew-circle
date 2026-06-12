import Link from "next/link";
import { Camera, QrCode } from "lucide-react";
import { getCafes } from "@/lib/cafes";

export default async function ScanPage() {
  const cafes = await getCafes();

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Camera className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">Phase 1 scanner concept</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary">Scan a café QR</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          For the first pilot, QR codes open a café URL directly. Camera scanning can be added after the café/payment loop is validated.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        {cafes.map((cafe) => (
          <Link key={cafe.id} href={`/cafes/${cafe.id}`} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-primary">{cafe.name}</p>
              <p className="text-xs text-muted">{cafe.qrCode}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
