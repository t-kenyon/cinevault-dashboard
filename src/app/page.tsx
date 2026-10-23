import Image from "next/image";
import { daysAgo, duration, leaderboard, mostWatched, movies, plays, recentActivity, summarize, viewers } from "@/lib/data";
import { MoviePoster } from "./poster";
import { RecentScroller } from "./recent-scroller";
import { MemberRankings } from "./member-rankings";
import { TopMovies } from "./top-movies";
export default function Home() {
 const totals = summarize(plays);
 const ranking = leaderboard("all");
 const popular = mostWatched();
 return <main id="main"><section className="hero"><div><h1 className="vault-logo"><Image src="/brand/cinevault-logo-final.png" alt="CineVault" width={2172} height={724} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 55vw, 650px" preload /></h1><p className="brand-tagline">Dedicated to the preservation of exceptional films.</p></div><aside className="server"><span className="eyebrow">SERVER STATUS</span><strong><i className="dot" />Online <small>SIMULATED</small></strong><div className="server-line"><span>Currently streaming</span><b>3 <small>streams</small></b></div><p>Fictional demo data · Oct 22, 2026, 12:00 UTC</p></aside></section>
 <section className="stats overview-stats" aria-label="All-time aggregate statistics">{[["MOVIES", "2,486", "movies in the library"], ["TOTAL WATCH TIME", duration(totals.minutes), "total watch time · all demo viewers"], ["MOVIES WATCHED", String(totals.completed), "completed movie plays"]].map(([label,value,caption]) => <article key={label}><p className="eyebrow">{label}</p><strong>{value}</strong><p>{caption}</p></article>)}</section>
 <section className="panel recent-viewing"><div className="section-heading"><div><p className="eyebrow">FROM THE VAULT</p><h2>Recent Screenings</h2></div></div><RecentScroller>{recentActivity().map((play,i) => {
   const movie = movies.find(m => m.id === play.movieId);
   return <li key={`${play.viewerId}-${play.date}-${i}`}><MoviePoster src={movie?.poster} title={movie?.title ?? "Movie"} large /><h3>{movie?.title}</h3><p>{viewers.find(v => v.id === play.viewerId)?.name} · Completed</p><p><time dateTime={play.date}>{daysAgo(play.date)}</time></p></li>;
 })}</RecentScroller><p className="note">Only demo members who share activity are shown.</p></section>
 <MemberRankings members={ranking} />
 <TopMovies movies={popular} /></main>;
}
