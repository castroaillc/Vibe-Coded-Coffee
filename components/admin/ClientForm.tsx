import type { ClientRow } from "@/lib/admin/data";

export function ClientForm({ action, client, submitLabel }: { action: (f: FormData) => Promise<void>; client?: ClientRow; submitLabel: string }) {
  return (
    <form action={action} className="form">
      <label className="f"><span>Company</span><input name="company" autoComplete="organization" defaultValue={client?.company} /></label>
      <label className="f"><span>Contact name</span><input name="contactName" autoComplete="name" defaultValue={client?.contactName} /></label>
      <label className="f"><span>Email</span><input name="email" type="email" autoComplete="email" defaultValue={client?.email} /></label>
      <label className="f"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" defaultValue={client?.phone} /></label>
      <label className="f f--wide"><span>About this client</span><textarea name="notes" defaultValue={client?.notes} placeholder="How they found you, preferences, billing contact…" /></label>
      <div className="form__actions"><button className="b">{submitLabel}</button></div>
    </form>
  );
}
