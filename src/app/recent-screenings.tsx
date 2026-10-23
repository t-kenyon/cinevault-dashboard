"use client";

import { useEffect, useState } from "react";
import type { NowPlayingFeed } from "@/lib/now-playing-policy";
import { MemberAvatar } from "./member-avatar";
import { MoviePoster } from "./poster";
import { RecentScroller } from "./recent-scroller";

type Screening = {id:string; title:string; poster?:string; name:string; photo?:string; date:string; relativeDate:string};
export function RecentScreenings({recent,initialNowPlaying,demo,unavailable}: {recent:Screening[];initialNowPlaying:NowPlayingFeed;demo:boolean;unavailable:boolean}) {
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

  return <>
    <RecentScroller>
      {active.items.map(play => <li key={`live-${play.id}`} className="now-playing-card">
        <div className="screening-poster"><MoviePoster src={play.poster} title={play.title} large />
          <span className="now-playing-badge">{play.state === "paused" ? "Paused" : play.state === "buffering" ? "Buffering" : "Now Playing"}{demo ? " · Demo" : ""}</span>
        </div>
        {play.durationSeconds !== null && <progress className="playback-progress" value={play.positionSeconds} max={play.durationSeconds} aria-label={`Playback progress for ${play.title}`} />}
        <h3>{play.title}</h3>
        <p className="screening-member"><MemberAvatar name={play.name} src={play.photo} />{play.name}</p>
        {play.durationSeconds !== null && <p className="playback-remaining">{Math.ceil(Math.max(0,play.durationSeconds-play.positionSeconds)/60)} min remaining</p>}
      </li>)}
      {recent.map(play => <li key={play.id}><MoviePoster src={play.poster} title={play.title} large /><h3>{play.title}</h3><p className="screening-member"><MemberAvatar name={play.name} src={play.photo} />{play.name} · Completed</p><p><time dateTime={play.date}>{play.relativeDate}</time></p></li>)}
    </RecentScroller>
    {!demo && active.state === "unavailable" && <p className="note" role="status">Now Playing temporarily unavailable.</p>}
    {unavailable ? <p className="note">Recent screenings temporarily unavailable.</p> : !recent.length && !active.items.length && <p className="note">No completed screenings to share yet.</p>}
  </>;
}
