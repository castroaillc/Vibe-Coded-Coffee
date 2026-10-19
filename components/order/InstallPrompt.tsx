"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * "Add to Home Screen" card.
 * - Android / desktop Chrome & Edge: one tap opens the browser's install dialog.
 * - iPhone / iPad Safari: Apple doesn't allow a one-tap install, so we show the two steps.
 * - Already installed (opened from the home screen): hidden.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [mode, setMode] = useState<"hidden" | "button" | "ios" | "other">("hidden");
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("vcc-install-dismissed") === "1";
    } catch {}
    if (standalone || dismissed) return;

    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    setMode(isIOS ? "ios" : "other");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setMode("button");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setMode("hidden");
      setDeferred(null);
    } else {
      setShowSteps((v) => !v);
    }
  }

  function dismiss() {
    try {
      localStorage.setItem("vcc-install-dismissed", "1");
    } catch {}
    setMode("hidden");
  }

  return (
    <aside className="install" aria-label="Add to Home Screen">
      <div className="install__row">
        <img src="/brand/icon-192.png" alt="" width={44} height={44} className="install__icon" />
        <div className="install__text">
          <p className="install__title">Add Vibe Coded to your home screen</p>
          <p className="install__sub">Opens like an app, with your pass one tap away.</p>
        </div>
        <button type="button" className="app-btn app-btn--sm" onClick={install}>
          {mode === "button" ? "Add" : "How"}
        </button>
        <button type="button" className="install__close" onClick={dismiss} aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      {showSteps && mode === "ios" && (
        <ol className="install__steps">
          <li>Tap the <strong>Share</strong> button at the bottom of Safari.</li>
          <li>Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li>
        </ol>
      )}
      {showSteps && mode === "other" && (
        <ol className="install__steps">
          <li>Open your browser menu (⋮ or the share icon).</li>
          <li>Choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</li>
        </ol>
      )}
    </aside>
  );
}
