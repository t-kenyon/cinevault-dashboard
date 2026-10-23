import Image from "next/image";
import { memberAnalytics } from "@/lib/member-analytics";
import { MemberAvatar } from "./member-avatar";
import { connectionSummary, daysAgo, duration, leaderboard, mostWatched, movies, plays, recentActivity, summarize, viewers } from "@/lib/data";
import { MoviePoster } from "./poster";
import { RecentScroller } from "./recent-scroller";
import { MemberRankings } from "./member-rankings";
import { TopMovies } from "./top-movies";
export const dynamic = "force-dynamic";

export default async function Home() {
 const connection = await connectionSummary();
 const live = connection.source === "tautulli";
 const analytics = await memberAnalytics();
 const demo = analytics.state === "demo";
 const unavailable = analytics.state === "unavailable";
 const totals = demo ? summarize(plays) : analytics;
 const ranking = demo ? leaderboard("all") : analytics.members;
 const popular = demo ? mostWatched() : analytics.popular;
 const screenings = demo ? recentActivity().map((play,i) => ({id:`demo-${i}`,title:movies.find(m=>m.id===play.movieId)?.title ?? "Movie",poster:movies.find(m=>m.id===play.movieId)?.poster,name:viewers.find(v=>v.id===play.viewerId)?.name ?? "Member",photo:undefined,date:play.date})) : analytics.recent;
 return <main id="main"><section className="hero"><div><h1 className="vault-logo"><Image src="/brand/cinevault-logo-final.png" alt="CineVault" width={2172} height={724} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 55vw, 650px" preload /></h1><p className="brand-tagline">Dedicated to the preservation of exceptional films.</p></div><aside className="server"><span className="eyebrow">SERVER STATUS</span><strong><i className={`dot ${connection.status === "online" ? "" : "dot-unavailable"}`} />{connection.status === "online" ? "Online" : "Unavailable"} <small>{live ? "TAUTULLI" : "SIMULATED"}</small></strong><div className="server-line"><span>Currently streaming</span><b>{connection.streamCount ?? "—"} <small>{connection.streamCount === null ? "unavailable" : `${connection.streamCount === 1 ? "stream" : "streams"}${live ? "" : " · demo"}`}</small></b></div><p>{live ? "Plex status via Tautulli · Refresh to update" : "Fictional demo data · Oct 22, 2026, 12:00 UTC"}</p>{live && <p>Checked <time dateTime={connection.checkedAt}>{new Date(connection.checkedAt).toLocaleTimeString("en-US", {timeZone:"UTC",hour:"2-digit",minute:"2-digit"})} UTC</time></p>}</aside></section>
 <section className="stats overview-stats" aria-label="All-time aggregate statistics">{[["MOVIES", connection.movieCount === null ? "—" : connection.movieCount.toLocaleString("en-US"), live ? (connection.movieCount === null ? "library count unavailable" : "movies across active libraries · Tautulli") : "movies in the library · demo"], ["TOTAL WATCH TIME", unavailable ? "—" : duration(totals.minutes), demo ? "sample watch time · demo members" : unavailable ? "viewing totals unavailable" : "watch time · opted-in members"], ["MOVIES WATCHED", unavailable ? "—" : String(totals.completed), demo ? "sample completed plays · demo" : unavailable ? "viewing totals unavailable" : "completed plays · opted-in members"]].map(([label,value,caption]) => <article key={label}><p className="eyebrow">{label}</p><strong>{value}</strong><p>{caption}</p></article>)}</section>
 <p className="demo-analytics-note">{demo ? "Viewing analytics below use fictional demo data. Live member history is not connected." : unavailable ? "Member analytics are temporarily unavailable. No demo data is substituted." : "Member analytics include only recorded opt-ins. Recent Screenings start from each member’s consent date."}</p>
 <section className="panel recent-viewing"><div className="section-heading"><div><p className="eyebrow">FROM THE VAULT</p><h2>Recent Screenings</h2></div></div><RecentScroller demo={demo}>{screenings.map(play => <li key={play.id}><MoviePoster src={play.poster} title={play.title} large /><h3>{play.title}</h3><p className="screening-member"><MemberAvatar name={play.name} src={play.photo} />{play.name} · Completed</p><p><time dateTime={play.date}>{daysAgo(play.date,demo ? undefined : analytics.now)}</time></p></li>)}</RecentScroller>{!screenings.length && <p className="note">{unavailable ? "Recent screenings temporarily unavailable." : "No completed screenings to share yet."}</p>}<p className="note">{demo ? "Only demo members who share activity are shown." : "Completed screenings shared after consent · Last 30 days"}</p></section>
 <MemberRankings members={ranking} demo={demo} unavailable={unavailable} />
 <TopMovies movies={popular} demo={demo} unavailable={unavailable} /></main>;
}
