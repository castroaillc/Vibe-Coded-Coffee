import { Pos } from "@/components/admin/Pos";
import { requireAdmin } from "@/lib/admin/auth";
import { listProducts, salesSince, startOfShopDay, upcomingBooked } from "@/lib/admin/data";
import { today } from "@/lib/admin/format";

export const metadata = { title: "POS" };

export default async function PosPage() {
  await requireAdmin();
  const ymd = today();
  const [products, sales, events] = await Promise.all([listProducts(), salesSince(startOfShopDay(ymd)), upcomingBooked(ymd)]);
  return (
    <Pos
      products={products}
      sales={sales.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
      events={events}
      todayYmd={ymd}
    />
  );
}
