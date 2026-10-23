import Image from "next/image";
import { connectionSummary, daysAgo, duration, leaderboard, mostWatched, movies, plays, recentActivity, summarize, viewers } from "@/lib/data";
import { MoviePoster } from "./poster";
import { RecentScroller } from "./recent-scroller";
import { MemberRankings } from "./member-rankings";
import { TopMovies } from "./top-movies";
export const dynamic = "force-dynamic";

export default async function Home() {
 const connection = await connectionSummary();
 const live = connection.source === "tautulli";
 const totals = summarize(plays);
 const ranking = leaderboard("all");
 const popular = mostWatched();
 return <main id="main"><section className="hero"><div><h1 className="vault-logo"><Image src="/brand/cinevault-logo-final.png" alt="CineVault" width={2172} height={724} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 55vw, 650px" preload /></h1><p className="brand-tagline">Dedicated to the preservation of exceptional films.</p></div><aside className="server"><span className="eyebrow">SERVER STATUS</span><strong><i className={`dot ${connection.status === "online" ? "" : "dot-unavailable"}`} />{connection.status === "online" ? "Online" : "Unavailable"} <small>{live ? "TAUTULLI" : "SIMULATED"}</small></strong>{!live && <div className="server-line"><span>Currently streaming</span><b>3 <small>streams · demo</small></b></div>}<p>{live ? "Plex status via Tautulli · Refresh to update" : "Fictional demo data · Oct 22, 2026, 12:00 UTC"}</p>{live && <p>Checked <time dateTime={connection.checkedAt}>{new Date(connection.checkedAt).toLocaleTimeString("en-US", {timeZone:"UTC",hour:"2-digit",minute:"2-digit"})} UTC</time></p>}</aside></section>
 <section className="stats overview-stats" aria-label="All-time aggregate statistics">{[["MOVIES", connection.movieCount === null ? "—" : connection.movieCount.toLocaleString("en-US"), live ? (connection.movieCount === null ? "library count unavailable" : "movies across active libraries · Tautulli") : "movies in the library · demo"], ["TOTAL WATCH TIME", duration(totals.minutes), "sample watch time · demo members"], ["MOVIES WATCHED", String(totals.completed), "sample completed plays · demo"]].map(([label,value,caption]) => <article key={label}><p className="eyebrow">{label}</p><strong>{value}</strong><p>{caption}</p></article>)}</section>
 <p className="demo-analytics-note">Viewing analytics below use fictional demo data. Live member history is not connected.</p>
 <section className="panel recent-viewing"><div className="section-heading"><div><p className="eyebrow">FROM THE VAULT</p><h2>Recent Screenings</h2></div></div><RecentScroller>{recentActivity().map((play,i) => {
   const movie = movies.find(m => m.id === play.movieId);
   return <li key={`${play.viewerId}-${play.date}-${i}`}><MoviePoster src={movie?.poster} title={movie?.title ?? "Movie"} large /><h3>{movie?.title}</h3><p>{viewers.find(v => v.id === play.viewerId)?.name} · Completed</p><p><time dateTime={play.date}>{daysAgo(play.date)}</time></p></li>;
 })}</RecentScroller><p className="note">Only demo members who share activity are shown.</p></section>
 <MemberRankings members={ranking} />
 <TopMovies movies={popular} /></main>;
}
