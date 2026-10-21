"use client";

import { useActionState } from "react";
import { adminSignIn } from "@/app/admin/actions";

/** One shared password (ADMIN_PASSWORD) gets into /admin. */
export function SignIn() {
  const [error, action, busy] = useActionState(adminSignIn, "");

  return (
    <form action={action}>
      <label className="f">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      <button className="b" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
      {error && <p className="msg msg--bad">{error}</p>}
    </form>
  );
}
