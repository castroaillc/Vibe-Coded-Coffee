"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Order } from "@/lib/app-data";
import type { AppStateResponse } from "@/lib/server/app";

export type AppData = AppStateResponse;

/** Talks to the API routes in app/api/app/*. Every write returns the fresh app state. */
export function useAppState() {
  const session = authClient.useSession();
  const userId = session.data?.user.id ?? null;
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/app/state", { cache: "no-store" });
      setData(res.ok ? await res.json() : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) void load();
    else setData(null);
  }, [userId, load]);

  async function call(url: string, method: "POST" | "DELETE", body?: unknown): Promise<boolean> {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { error?: string }).error ?? "Something went wrong. Please try again.");
        return false;
      }
      setData(json as AppData);
      return true;
    } catch {
      setError("You're offline. Try again when you're connected.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    session,
    data,
    loading: session.isPending || (Boolean(userId) && loading && !data),
    busy,
    error,
    clearError: () => setError(""),
    reload: load,
    saveProfile: (name: string, phone: string) => call("/api/app/profile", "POST", { name, phone }),
    queue: (order: Order) => call("/api/app/orders", "POST", { order }),
    cancelQueued: () => call("/api/app/orders", "DELETE"),
    saveFavorite: (name: string, order: Order) => call("/api/app/favorites", "POST", { name, order }),
    removeFavorite: (id: string) => call(`/api/app/favorites/${encodeURIComponent(id)}`, "DELETE"),
    toggleRsvp: (eventId: string) => call(`/api/app/events/${encodeURIComponent(eventId)}/rsvp`, "POST"),
    /** Stripe Checkout with the 30-day free trial; returns to the pass. */
    startMembership: async () => {
      setBusy(true);
      setError("");
      const { error: err } = await authClient.subscription.upgrade({
        plan: "membership",
        successUrl: `${window.location.origin}/order#pass`,
        cancelUrl: `${window.location.origin}/order`,
      });
      if (err) {
        setError(err.message ?? "Couldn't open checkout. Please try again.");
        setBusy(false);
      }
    },
    signOut: async () => {
      await authClient.signOut();
      setData(null);
    },
  };
}
