import { PAYMENT_LABELS, STATUS_LABELS } from "@/lib/admin/format";

export function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>;
}

export function PaymentBadge({ status }: { status: keyof typeof PAYMENT_LABELS }) {
  return <span className={`badge badge--${status}`}>{PAYMENT_LABELS[status]}</span>;
}

export const clientName = (c: { company: string; contactName: string }) => c.company || c.contactName || "Unnamed client";
