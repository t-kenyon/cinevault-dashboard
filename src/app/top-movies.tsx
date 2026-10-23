import { duration } from "@/lib/data";
import { MoviePoster } from "./poster";

type RankedMovie = { id: string; title: string; poster: string; count: number; minutes: number };
function MovieRow({ movie, rank }: { movie: RankedMovie; rank: number }) {
  return <li><span className="movie-rank">{rank}</span><MoviePoster src={movie.poster} title={movie.title} /><div className="movie-details"><strong>{movie.title}</strong><p>{duration(movie.minutes)} watched</p></div><div className="movie-play-count"><strong>{movie.count.toLocaleString("en-US")}</strong><span>{movie.count === 1 ? "play" : "plays"}</span></div></li>;
}
export function TopMovies({ movies }: { movies: RankedMovie[] }) {
  return <section className="panel top-movies"><div className="section-heading"><div><p className="eyebrow">CROWD FAVORITES</p><h2>Top Movies</h2></div><span className="muted">All time · Top 5</span></div>
    <ol className="popular-list">{movies.slice(0,5).map((movie,i) => <MovieRow key={movie.id} movie={movie} rank={i+1} />)}</ol>
    {movies.length > 5 && <details className="more-movies"><summary><span className="view-more">View more</span><span className="view-less">View less</span></summary><ol className="popular-list" start={6} aria-label="Remaining movie rankings">{movies.slice(5).map((movie,i) => <MovieRow key={movie.id} movie={movie} rank={i+6} />)}</ol></details>}
    <p className="note">Ranked by plays, then watch time · includes partial plays</p>
  </section>;
}
