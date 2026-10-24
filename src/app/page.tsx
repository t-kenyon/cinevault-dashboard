import Image from "next/image";
import { CheckedTime } from "./checked-time";
import { memberAnalytics, nowPlayingAnalytics } from "@/lib/member-analytics";
import { connectionSummary, daysAgo, duration, leaderboard, mostWatched, movies, plays, recentActivity, summarize, viewers } from "@/lib/data";
import { RecentScreenings } from "./recent-screenings";
import { MemberRankings } from "./member-rankings";
import { ProjectorIcon } from "./projector-icon";
import { TopMovies } from "./top-movies";
export const dynamic = "force-dynamic";

export default async function Home() {
 const connection = await connectionSummary();
 const live = connection.source === "tautulli";
 const [analytics,active] = await Promise.all([memberAnalytics(),nowPlayingAnalytics()]);
 const demo = analytics.state === "demo";
 const unavailable = analytics.state === "unavailable";
 const totals = demo ? summarize(plays) : analytics;
 const ranking = demo ? leaderboard("all") : analytics.members;
 const popular = demo ? mostWatched() : analytics.popular;
 const screenings = demo ? recentActivity().map((play,i) => ({id:`demo-${i}`,title:movies.find(m=>m.id===play.movieId)?.title ?? "Movie",poster:movies.find(m=>m.id===play.movieId)?.poster,name:viewers.find(v=>v.id===play.viewerId)?.name ?? "Member",photo:undefined,date:play.date})) : analytics.recent;
 const initialNowPlaying = demo ? {state:"demo" as const,checkedAt:analytics.now,items:[{id:"demo-active",title:movies[1].title,poster:movies[1].poster,name:"Alex",state:"playing" as const,positionSeconds:2538,durationSeconds:movies[1].minutes*60}]} : {state:active.state,items:active.items,checkedAt:active.checkedAt};
 return <main id="main"><section className="hero"><div><h1 className="vault-logo"><Image src="/brand/cinevault-logo-final.png" alt="CineVault" width={2172} height={724} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 55vw, 650px" preload /></h1><p className="brand-tagline">Dedicated to the preservation of exceptional films.</p></div><aside className="server"><span className="eyebrow">SERVER STATUS</span><strong><i className={`dot ${connection.status === "online" ? "" : "dot-unavailable"}`} />{connection.status === "online" ? "Online" : "Unavailable"} {!live && <small>SIMULATED</small>}<ProjectorIcon online={connection.status === "online"} /></strong><div className="server-line"><span>Currently streaming</span><b>{connection.streamCount ?? "—"} <small>{connection.streamCount === null ? "unavailable" : `${connection.streamCount === 1 ? "stream" : "streams"}${live ? "" : " · demo"}`}</small></b></div><p>{live ? "Refresh to update" : "Fictional demo data · Oct 22, 2026, 12:00 UTC"}</p>{live && <p>Checked <CheckedTime value={connection.checkedAt} /></p>}</aside></section>
 <section className="stats overview-stats" aria-label="All-time aggregate statistics">{[["MOVIES", connection.movieCount === null ? "—" : connection.movieCount.toLocaleString("en-US"), live ? (connection.movieCount === null ? "library count unavailable" : "movies across active libraries") : "movies in the library"], ["TOTAL WATCH TIME", unavailable ? "—" : duration(totals.minutes), unavailable ? "viewing totals unavailable" : "watch time"], ["MOVIES WATCHED", unavailable ? "—" : String(totals.completed), unavailable ? "viewing totals unavailable" : "completed movie plays"]].map(([label,value,caption]) => <article key={label}><p className="eyebrow">{label}</p><strong>{value}</strong><p>{caption}</p></article>)}</section>
 <section className="panel recent-viewing"><div className="section-heading"><div><p className="eyebrow">FROM THE VAULT</p><h2>Recent Screenings</h2></div></div><RecentScreenings recent={screenings.map(play => ({...play,relativeDate:daysAgo(play.date,demo ? undefined : analytics.now)}))} initialNowPlaying={initialNowPlaying} demo={demo} unavailable={unavailable} /></section>
 <MemberRankings members={ranking} unavailable={unavailable} />
 <TopMovies movies={popular} demo={demo} unavailable={unavailable} /></main>;
}
