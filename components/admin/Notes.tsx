import { addNote, deleteNote } from "@/app/admin/actions";
import { formatStamp } from "@/lib/admin/format";
import type { NoteRow } from "@/lib/admin/data";

/** CRM activity log for a client (and optionally one of their events). */
export function Notes({ clientId, eventId, notes, title = "Notes" }: { clientId: string; eventId: string | null; notes: NoteRow[]; title?: string }) {
  return (
    <section className="card">
      <h2>{title} <small>calls, emails, follow-ups</small></h2>
      <form action={addNote.bind(null, clientId, eventId)} className="note-form">
        <textarea name="text" placeholder="Add a note…" aria-label="New note" required />
        <button className="b">Add</button>
      </form>
      <div className="notes">
        {notes.map((n) => (
          <div key={n.id} className="note">
            <p>{n.text}</p>
            <div className="note__meta">
              <span>{formatStamp(n.createdAt)}</span>
              <form action={deleteNote.bind(null, n.id)}><button className="b b--link" style={{ fontSize: 12 }}>Delete</button></form>
            </div>
          </div>
        ))}
        {!notes.length && <p className="empty">No notes yet.</p>}
      </div>
    </section>
  );
}
