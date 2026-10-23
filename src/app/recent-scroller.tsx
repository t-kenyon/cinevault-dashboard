"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function RecentScroller({ children, demo = true, hasNowPlaying = false }: { children: ReactNode; demo?: boolean; hasNowPlaying?: boolean }) {
  const rail = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  function updateEdges() {
    const el = rail.current;
    if (el) setEdges({ start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);
  function move(direction: number) {
    const el = rail.current;
    if (!el) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (el.clientWidth + gap), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <><div className="recent-controls"><span>{hasNowPlaying ? "Now playing · Completed in the last 30 days" : "Last 30 days · Completed playthroughs"}{demo ? " · Demo" : ""}</span><div><button type="button" aria-label="Previous four screenings" aria-controls="recent-movie-rail" disabled={edges.start} onClick={() => move(-1)}>←</button><button type="button" aria-label="Next four screenings" aria-controls="recent-movie-rail" disabled={edges.end} onClick={() => move(1)}>→</button></div></div><ul ref={rail} id="recent-movie-rail" className="recent-grid recent-rail" aria-label="Now playing and completed screenings in the past 30 days" tabIndex={0} onScroll={updateEdges}>{children}</ul></>;
}
