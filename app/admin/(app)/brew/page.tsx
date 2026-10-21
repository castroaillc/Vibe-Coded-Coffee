import { BrewPlanner } from "@/components/admin/BrewPlanner";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Brew planner" };

export default async function BrewPage({ searchParams }: { searchParams: Promise<{ cups?: string }> }) {
  await requireAdmin();
  const cups = Number((await searchParams).cups);
  return <BrewPlanner initialCups={Number.isFinite(cups) && cups > 0 ? cups : 50} />;
}
