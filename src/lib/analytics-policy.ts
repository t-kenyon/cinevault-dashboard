import { releaseYear } from "./movie-metadata.ts";
import { permits, publicPlexIdentity, type MemberConsent } from "./consent-policy.ts";

export type SafePlay = { id: string; userId: string; movieId: string; title: string; year?: number; started: string; stopped: string; seconds: number; completed: boolean };
export type SafeUser = { userId: string; name: string; photo?: string };
const obj = (v: unknown): v is Record<string,unknown> => !!v && typeof v === "object" && !Array.isArray(v);
function count(v: unknown): number | undefined {
  if (typeof v !== "number" && typeof v !== "string") return;
  if (typeof v === "string" && !/^\d+$/.test(v)) return;
  const n=Number(v); return Number.isSafeInteger(n) && n>=0 ? n : undefined;
}
export function safeUsers(data: unknown, consents: MemberConsent[], publicUrl?: string): SafeUser[] {
  if (!Array.isArray(data)) throw Error("Unavailable");
  const result: SafeUser[]=[];
  for (const user of data) {
    if (!obj(user) || !consents.some(c=>c.userId === String(user.user_id))) continue;
    if (![1,"1",true].includes(user.is_active as never)) continue;
    const identity=publicPlexIdentity(user, publicUrl);
    if (identity) result.push({userId:String(user.user_id),...identity});
  }
  return result;
}
export function normalizePlay(value: unknown, expectedUser: string): SafePlay | undefined {
  if (!obj(value) || String(value.user_id) !== expectedUser || value.media_type !== "movie") return;
  const start=count(value.started),stop=count(value.stopped),seconds=count(value.play_duration ?? value.duration);
  if (start === undefined || stop === undefined || seconds === undefined || !stop || stop<start || seconds>stop-start) return;
  if (!/^\d+$/.test(String(value.rating_key)) || !/^\d+$/.test(String(value.row_id)) || typeof value.full_title !== "string" || !value.full_title.trim() || value.full_title.length>500) return;
  return {id:String(value.row_id),userId:expectedUser,movieId:String(value.rating_key),title:value.full_title,...(releaseYear(value.year) ? {year:releaseYear(value.year)} : {}),started:new Date(start*1000).toISOString(),stopped:new Date(stop*1000).toISOString(),seconds,completed:value.watched_status===1 || value.watched_status==="1"};
}
export function calculateAnalytics(users: SafeUser[], plays: SafePlay[], consents: MemberConsent[], now: string) {
  const members=users.filter(u=>permits(consents.find(c=>c.userId===u.userId),"rankings",now)).map(u=>{
    const history=plays.filter(p=>p.userId===u.userId && p.stopped<=now);
    return {...u,minutes:Math.floor(history.reduce((n,p)=>n+p.seconds,0)/60),completed:history.filter(p=>p.completed).length};
  }).sort((a,b)=>b.minutes-a.minutes || a.name.localeCompare(b.name));
  const recent=plays.filter(p=>p.completed && p.stopped<=now && users.some(u=>u.userId===p.userId) && permits(consents.find(c=>c.userId===p.userId),"screenings",now,p.started)).sort((a,b)=>b.stopped.localeCompare(a.stopped));
  const included=plays.filter(p=>p.stopped<=now && users.some(u=>u.userId===p.userId) && permits(consents.find(c=>c.userId===p.userId),"aggregates",now));
  const filmMap=new Map<string,{movieId:string;title:string;year?:number;count:number;seconds:number}>();
  for(const play of included.filter(p=>p.completed)) {
    const film=filmMap.get(play.movieId) ?? {movieId:play.movieId,title:play.title,count:0,seconds:0};
    if (play.year && !film.year) film.year=play.year;
    film.count++;film.seconds+=play.seconds;filmMap.set(play.movieId,film);
  }
  return {members,recent,minutes:Math.floor(included.reduce((n,p)=>n+p.seconds,0)/60),completed:included.filter(p=>p.completed).length,popular:[...filmMap.values()].map(m=>({...m,minutes:Math.floor(m.seconds/60)})).sort((a,b)=>b.count-a.count || b.seconds-a.seconds || a.title.localeCompare(b.title))};
}
