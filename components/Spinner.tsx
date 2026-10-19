"use client";

import { useEffect, useState } from "react";

const FRAMES = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];

/** Terminal-style spinner that cycles through the menu's verbs.
 *  Holds still on the first verb for visitors who prefer reduced motion. */
export function Spinner({ verbs }: { verbs: string[] }) {
  const [frame, setFrame] = useState(4);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glyph = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 120);
    const word = setInterval(() => setIndex((i) => (i + 1) % verbs.length), 2200);
    return () => {
      clearInterval(glyph);
      clearInterval(word);
    };
  }, [verbs.length]);

  return (
    <p className="spinner" aria-hidden="true">
      <span className="spinner__glyph">{FRAMES[frame]}</span>
      <span key={index} className="spinner__verb">{verbs[index]}…</span>
    </p>
  );
}
