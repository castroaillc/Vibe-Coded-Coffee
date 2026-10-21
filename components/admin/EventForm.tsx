import { eventTypes } from "@/lib/site";
import { fromCents, PAYMENT_LABELS, STATUS_LABELS } from "@/lib/admin/format";
import type { EventRow } from "@/lib/admin/data";
import { clientName } from "./bits";

type Picker = { id: string; company: string; contactName: string }[];

/** Create or edit a catering event. Plain form posting to a server action. */
export function EventForm({
  action,
  event,
  clients,
  defaultClientId,
  submitLabel,
}: {
  action: (f: FormData) => Promise<void>;
  event?: EventRow;
  clients?: Picker;
  defaultClientId?: string;
  submitLabel: string;
}) {
  const e = event;
  return (
    <form action={action} className="form">
      {clients && (
        <>
          <p className="form__label">Client</p>
          <label className="f f--wide">
            <span>Existing client</span>
            <select name="clientId" defaultValue={defaultClientId ?? ""}>
              <option value="">New client (fill in below)</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{clientName(c)}{c.company && c.contactName ? ` · ${c.contactName}` : ""}</option>)}
            </select>
          </label>
          <label className="f"><span>Company</span><input name="company" autoComplete="organization" /></label>
          <label className="f"><span>Contact name</span><input name="contactName" autoComplete="name" /></label>
          <label className="f"><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
          <label className="f"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
          <p className="form__label">Event</p>
        </>
      )}
      <label className="f f--wide"><span>Title</span><input name="title" defaultValue={e?.title} placeholder="e.g. Spring hackathon · Acme AI" /></label>
      <label className="f">
        <span>Type</span>
        <select name="eventType" defaultValue={e?.eventType ?? ""}>
          <option value="">—</option>
          {[...new Set([...eventTypes, ...(e?.eventType ? [e.eventType] : [])])].map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="f">
        <span>Status</span>
        <select name="status" defaultValue={e?.status ?? "lead"}>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="f"><span>Date</span><input name="date" type="date" required defaultValue={e?.date} /></label>
      <label className="f"><span>Start time</span><input name="startTime" type="time" defaultValue={e?.startTime} /></label>
      <label className="f"><span>Guests</span><input name="headcount" type="number" min={0} inputMode="numeric" defaultValue={e?.headcount || ""} /></label>
      <label className="f"><span>Venue or address</span><input name="location" defaultValue={e?.location} /></label>
      <p className="form__label">Money</p>
      <label className="f"><span>Quote ($)</span><input name="quote" inputMode="decimal" defaultValue={fromCents(e?.quoteCents ?? 0)} placeholder="0.00" /></label>
      <label className="f"><span>Paid so far ($)</span><input name="paid" inputMode="decimal" defaultValue={fromCents(e?.paidCents ?? 0)} placeholder="0.00" /></label>
      <label className="f">
        <span>Payment</span>
        <select name="paymentStatus" defaultValue={e?.paymentStatus ?? "unpaid"}>
          {Object.entries(PAYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="f f--wide"><span>Details</span><textarea name="notes" defaultValue={e?.notes} placeholder="Setup time, parking, who to ask for on site…" /></label>
      <div className="form__actions"><button className="b">{submitLabel}</button></div>
    </form>
  );
}
