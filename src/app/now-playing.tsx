"use client";

import { useEffect, useState } from "react";
import type { NowPlayingFeed } from "@/lib/now-playing-policy";
import { movieTitle } from "@/lib/movie-metadata";
import { MemberAvatar } from "./member-avatar";
import { MoviePoster } from "./poster";

export function NowPlaying({initialNowPlaying,demo}: {initialNowPlaying:NowPlayingFeed;demo:boolean}) {
  const [active,setActive] = useState(initialNowPlaying);
  useEffect(() => {
    if (demo) return;
    let disposed = false, pending = false;
    let controller: AbortController | undefined;
    async function refresh() {
      if (disposed || pending || document.hidden) return;
      pending = true;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(),10000);
      try {
        const response = await fetch("/api/now-playing",{cache:"no-store",signal:controller.signal});
        if (!response.ok) throw Error();
        const feed: NowPlayingFeed = await response.json();
        if (!["live","unavailable"].includes(feed.state) || !Array.isArray(feed.items)) throw Error();
        if (!disposed) setActive(feed.state === "live" ? feed : {...feed,items:[]});
      } catch {
        if (!disposed) setActive(previous => ({...previous,state:"unavailable",items:[]}));
      } finally {
        window.clearTimeout(timeout);
        pending = false;
      }
    }
    const timer = window.setInterval(refresh,15000);
    document.addEventListener("visibilitychange",refresh);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange",refresh);
    };
  },[demo]);

  return <section className="panel now-playing" aria-labelledby="now-playing-title">
    <div className="section-heading"><div><p className="eyebrow">ON THE SCREEN</p><h2 id="now-playing-title">Now Playing</h2></div></div>
    {active.items.length > 0 && <ul className="now-playing-list" aria-label="Currently watching">
      {active.items.map(play => <li key={`live-${play.id}`} className="now-playing-card">
        <div className="now-playing-art">
          <MoviePoster src={play.poster} title={movieTitle(play.title,play.year)} large />
          {play.durationSeconds !== null && <progress className="playback-progress" value={play.positionSeconds} max={play.durationSeconds} aria-label={`Playback progress for ${play.title}`} />}
        </div>
        <div className="now-playing-details">
          <span className="now-playing-badge">{play.state === "paused" ? "Paused" : play.state === "buffering" ? "Buffering" : "Now Playing"}{demo ? " · Demo" : ""}</span>
          <h3>{movieTitle(play.title,play.year)}</h3>
          <p className="screening-member"><MemberAvatar name={play.name} src={play.photo} />{play.name}</p>
        </div>
      </li>)}
    </ul>}
    {active.state === "unavailable" ? <p className="note" role="status">Now Playing temporarily unavailable.</p> : !active.items.length && <p className="note">No movies playing right now.</p>}
  </section>;
}
