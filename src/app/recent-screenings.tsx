import { movieTitle } from "@/lib/movie-metadata";
import { MemberAvatar } from "./member-avatar";
import { MoviePoster } from "./poster";
import { RecentScroller } from "./recent-scroller";

type Screening = {id:string; title:string; year?:number; poster?:string; name:string; photo?:string; date:string; relativeDate:string};
export function RecentScreenings({recent,demo,unavailable}: {recent:Screening[];demo:boolean;unavailable:boolean}) {
  return <>
    {recent.length > 0 && <RecentScroller demo={demo}>
      {recent.map(play => <li key={play.id}><MoviePoster src={play.poster} title={movieTitle(play.title,play.year)} large /><h3>{movieTitle(play.title,play.year)}</h3><p className="screening-member"><MemberAvatar name={play.name} src={play.photo} />{play.name} · Completed</p><p><time dateTime={play.date}>{play.relativeDate}</time></p></li>)}
    </RecentScroller>}
    {unavailable ? <p className="note">Recent screenings temporarily unavailable.</p> : !recent.length && <p className="note">No completed screenings to share yet.</p>}
  </>;
}
