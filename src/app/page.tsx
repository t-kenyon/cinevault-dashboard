import Link from "next/link";
import { daysAgo, duration, leaderboard, movies, plays, recentActivity, summarize, viewers } from "@/lib/data";
import { MoviePoster } from "./poster";
import { RecentScroller } from "./recent-scroller";
import { TopMovies } from "./top-movies";
export default function Home() {
 const totals = summarize(plays);
 const ranking = leaderboard("all");
 const popular = movies.map(m => ({ ...m, count: plays.filter(p => p.movieId === m.id).length, minutes: summarize(plays.filter(p => p.movieId === m.id)).minutes })).sort((a,b) => b.count - a.count || b.minutes - a.minutes);
 return <main id="main"><section className="hero"><div><p className="eyebrow">THE PRIVATE COLLECTION</p><h1 className="vault-title">CINE<span>VAULT</span></h1><p className="brand-tagline">Dedicated to the preservation<br className="tagline-break" /> of exceptional films.</p></div><aside className="server"><span className="eyebrow">SERVER STATUS</span><strong><i className="dot" />Online <small>SIMULATED</small></strong><div className="server-line"><span>Currently streaming</span><b>3 <small>streams</small></b></div><p>Fictional demo data · Oct 22, 2026, 12:00 UTC</p></aside></section>
 <section className="stats" aria-label="All-time aggregate statistics">{[["MOVIES", "2,486", "movies in the library"], ["TV EPISODES", "8,214", "TV episodes · 10,842 content hours"], ["TOTAL WATCH TIME", duration(totals.minutes), "total watch time · all demo viewers"], ["MOVIES WATCHED", String(totals.completed), "completed movie plays"]].map(([label,value,caption]) => <article key={label}><p className="eyebrow">{label}</p><strong>{value}</strong><p>{caption}</p></article>)}</section>
 <div className="leaderboard-overview"><section className="panel leaderboard" id="leaderboard"><div className="section-heading"><div><h2>Viewer Leaderboard</h2></div><span className="muted">All time · Participating viewers</span></div><div className="table-wrap"><table><caption className="sr-only">Watch-time leaderboard: All time</caption><thead><tr><th>Rank / viewer</th><th>Completed movies</th><th>Watch time</th></tr></thead><tbody>{ranking.map((v,i) => <tr key={v.id}><td><span className="rank">0{i+1}</span><Link href={`/viewer/${v.id}`}><span className="avatar" style={{ background: v.color }}>{v.name[0]}</span>{v.name} <span className="arrow">↗</span></Link></td><td>{v.completed}</td><td className="watch-time">{duration(v.minutes)}</td></tr>)}</tbody></table></div><p className="note">Fictional members. Real viewers will appear only with permission.</p></section></div>
 <section className="panel recent-viewing"><div className="section-heading"><div><p className="eyebrow">JUST ONE MORE MOVIE</p><h2>Recent Activity</h2></div></div><RecentScroller>{recentActivity().map((play,i) => {
   const movie = movies.find(m => m.id === play.movieId);
   return <li key={`${play.viewerId}-${play.date}-${i}`}><MoviePoster src={movie?.poster} title={movie?.title ?? "Movie"} large /><h3>{movie?.title}</h3><p>{viewers.find(v => v.id === play.viewerId)?.name} · Completed</p><p><time dateTime={play.date}>{daysAgo(play.date)}</time></p></li>;
 })}</RecentScroller><p className="note">Only demo members who share activity are shown.</p></section>
 <TopMovies movies={popular} /></main>;
}
