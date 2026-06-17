import { BillPaymentClient } from "@/components/BillPaymentClient";
import { getCafes } from "@/lib/cafes";

export default async function BillPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [cafes, params] = await Promise.all([getCafes(), searchParams]);
  const bill =
    typeof params?.bill === "string"
      ? params.bill
      : typeof params?.billNumber === "string"
        ? params.billNumber
        : "";
  const cafe = typeof params?.cafe === "string" ? params.cafe : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-16">
      <BillPaymentClient cafes={cafes} initialBillNumber={bill} initialCafeId={cafe} />
    </div>
  );
}
