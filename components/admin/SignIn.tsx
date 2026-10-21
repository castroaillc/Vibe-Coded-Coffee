"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/** Email → 6-digit code, the same sign-in as the members' app. Only ADMIN_EMAILS get past /admin. */
export function SignIn({ denied }: { denied: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(denied ? "That account isn't an admin. Sign in with an admin email." : "");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    if (denied) await authClient.signOut();
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" });
    setBusy(false);
    if (err) return setError(err.message ?? "Couldn't send the code.");
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await authClient.signIn.emailOtp({ email: email.trim(), otp: code.trim() });
    setBusy(false);
    if (err) return setError(err.message ?? "That code didn't work.");
    router.replace("/admin");
    router.refresh();
  }

  return step === "email" ? (
    <form onSubmit={sendCode}>
      <label className="f">
        <span>Email</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button className="b" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
      {error && <p className="msg msg--bad">{error}</p>}
    </form>
  ) : (
    <form onSubmit={verify}>
      <label className="f">
        <span>Code sent to {email}</span>
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} />
      </label>
      <button className="b" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
      <button type="button" className="b b--link" onClick={() => setStep("email")}>Use a different email</button>
      {error && <p className="msg msg--bad">{error}</p>}
    </form>
  );
}
