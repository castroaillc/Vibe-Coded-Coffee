"use client";

import { useEffect, useRef, useState } from "react";

/** Muted, looping background video with a pause control.
 *  Stays paused (poster only) for visitors who prefer reduced motion. */
export function LoopVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div className={`loop-video ${className ?? ""}`}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} />
      <button type="button" className="loop-video__toggle" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"}>
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8L10.4 6z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  );
}
