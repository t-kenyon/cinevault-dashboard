import "server-only";
import { createHmac } from "node:crypto";
import { readMemberConsents } from "./consent";
import { permits } from "./consent-policy";
import { fetchPlexAvatar } from "./plex-avatar";
import { memberPhotoFilename } from "./member-photo-policy";
import { memberPhotoNotFound, readHostedMemberPhoto } from "./hosted-member-photo";
import { safeUsers, normalizePlay, calculateAnalytics, type SafePlay } from "./analytics-policy";

export type PublicMember = {id:string;name:string;color:string;minutes:number;completed:number;photo?:string};
export type PublicFilm = {id:string;title:string;poster:string;count:number;minutes:number};
export type PublicScreening = {id:string;title:string;poster:string;name:string;photo?:string;date:string};
type Asset = {kind:"member";url:string} | {kind:"movie";ratingKey:string};
export type MemberAnalytics = {state:"live"|"unavailable"|"demo";members:PublicMember[];recent:PublicScreening[];popular:PublicFilm[];minutes:number;completed:number;now:string;assets:Map<string,Asset>};
const cache=new Map<string,{expires:number;value:Promise<unknown>}>();
async function api(command: "get_users"|"get_history", parameters: Record<string,string> = {}):Promise<unknown> {
  const base=new URL(process.env.TAUTULLI_URL ?? "");
  if (!["http:","https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash || !process.env.TAUTULLI_API_KEY?.trim()) throw Error("Unavailable");
  const url=new URL(`${base.pathname.replace(/\/$/,"")}/api/v2`,base.origin);
  url.searchParams.set("cmd",command);
  for(const [key,value] of Object.entries(parameters))url.searchParams.set(key,value);
  // Hash cache keys so the API key is never retained in URLs or keys.
  const key=createHmac("sha256",process.env.TAUTULLI_API_KEY).update(url.toString()).digest("hex");
  const old=cache.get(key);if(old && old.expires>Date.now())return old.value;
  if(cache.size>=1000)cache.clear();
  const value=(async()=>{
    const response=await fetch(url,{headers:{"X-Api-Key":process.env.TAUTULLI_API_KEY!,Accept:"application/json"},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error("Unavailable");
    const payload=await response.json();
    if(payload?.response?.result!=="success")throw Error("Unavailable");
    return payload.response.data;
  })();
  cache.set(key,{expires:Date.now()+60000,value});
  try{return await value;}catch{cache.delete(key);throw Error("Unavailable");}
}
function assetId(kind:string,id:string):string {
  return createHmac("sha256",process.env.TAUTULLI_API_KEY!).update(`${kind}:${id}`).digest("hex").slice(0,32);
}
async function history(userId:string,after?:string):Promise<SafePlay[]> {
  const result:SafePlay[]=[];const seen=new Set<string>();let total:number|undefined;
  for(let page=0;page<50;page++) {
    const payload=await api("get_history",{user_id:userId,media_type:"movie",grouping:"0",include_activity:"0",order_column:"date",order_dir:"desc",start:String(page*100),length:"100",...(after?{after}:{})});
    if(!payload || typeof payload!=="object")throw Error("Unavailable");
    const data=payload as Record<string,unknown>;
    if(!Array.isArray(data.data))throw Error("Unavailable");
    const count=Number(data.recordsFiltered);
    if(!Number.isSafeInteger(count) || count<0 || count>5000 || (total!==undefined && count!==total))throw Error("Unavailable");
    total=count;
    for(const row of data.data) {
      const play=normalizePlay(row,userId);
      // Unexpected or malformed rows must not silently produce plausible all-time totals.
      if(!play || seen.has(play.id))throw Error("Unavailable");
      seen.add(play.id);result.push(play);
    }
    if(result.length===total)return result;
    if(data.data.length<100 || result.length>total)throw Error("Unavailable");
  }
  throw Error("Unavailable");
}
export async function memberAnalytics():Promise<MemberAnalytics> {
  const now=new Date().toISOString();
  const empty:MemberAnalytics={state:"demo",members:[],recent:[],popular:[],minutes:0,completed:0,now,assets:new Map()};
  if(process.env.CINEVAULT_DATA_MODE!=="tautulli" || process.env.CINEVAULT_MEMBER_ANALYTICS!=="1")return empty;
  try {
    // Never cache the consent file; removal immediately removes future public contributions.
    const consents=(await readMemberConsents()).filter(c=>(["rankings","screenings","aggregates"] as const).some(p=>permits(c,p,now,p==="screenings"?now:undefined)));
    if(consents.length>200)throw Error("Unavailable");
    if(!consents.length)return {...empty,state:"live"};
    const users=safeUsers(await api("get_users"),consents,process.env.CINEVAULT_PUBLIC_URL);
    const plays:SafePlay[]=[];
    // Batches limit concurrent history requests to three members.
    for(let i=0;i<users.length;i+=3){
      const batches=await Promise.all(users.slice(i,i+3).map(user=>{
        const consent=consents.find(c=>c.userId===user.userId)!;
        const screeningOnly=!consent.rankings && !consent.aggregates;
        const after=screeningOnly?new Date(Math.max(Date.parse(consent.consentedAt),Date.parse(now)-30*86400000)).toISOString().slice(0,10):undefined;
        return history(user.userId,after);
      }));plays.push(...batches.flat());
    }
    const result=calculateAnalytics(users,plays,consents,now);
    const assets=new Map<string,Asset>();
    function photo(userId:string){
      const user=users.find(u=>u.userId===userId);if(!user?.photo)return;
      const id=assetId("member",userId);assets.set(id,{kind:"member",url:user.photo});return `/artwork/member/${id}`;
    }
    function poster(movieId:string){const id=assetId("movie",movieId);assets.set(id,{kind:"movie",ratingKey:movieId});return `/artwork/movie/${id}`;}
    const members=result.members.map(user=>({id:assetId("public-member",user.userId),name:user.name,color:"#c0c0c0",minutes:user.minutes,completed:user.completed,photo:photo(user.userId)}));
    const recent=result.recent.map(play=>({id:assetId("play",`${play.userId}:${play.id}`),title:play.title,poster:poster(play.movieId),name:users.find(u=>u.userId===play.userId)!.name,photo:photo(play.userId),date:play.stopped}));
    const popular=result.popular.map(movie=>({id:assetId("public-film",movie.movieId),title:movie.title,poster:poster(movie.movieId),count:movie.count,minutes:movie.minutes}));
    return {state:"live",members,recent,popular,minutes:result.minutes,completed:result.completed,now,assets};
  } catch{return {...empty,state:"unavailable"};}
}
export async function approvedArtwork(kind:string,id:string):Promise<Response> {
  const analytics=await memberAnalytics();
  const asset=analytics.state==="live" ? analytics.assets.get(id) : undefined;
  const headers={"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"};
  if(!asset || asset.kind!==kind)return new Response(null,{status:404,headers});
  if(asset.kind==="member" && memberPhotoFilename(asset.url))return readHostedMemberPhoto(asset.url);
  try {
    let url:URL;let requestHeaders:Record<string,string>={};
    if(asset.kind==="member")url=new URL(asset.url);
    else {
      const base=new URL(process.env.TAUTULLI_URL!);
      url=new URL(`${base.pathname.replace(/\/$/,"")}/api/v2`,base.origin);
      url.searchParams.set("cmd","pms_image_proxy");url.searchParams.set("rating_key",asset.ratingKey);
      url.searchParams.set("width","400");url.searchParams.set("height","600");url.searchParams.set("fallback","poster");
      requestHeaders={"X-Api-Key":process.env.TAUTULLI_API_KEY!};
    }
    const response=asset.kind==="member"
      ? await fetchPlexAvatar(asset.url)
      : await fetch(url,{headers:requestHeaders,redirect:"error",cache:"no-store",signal:AbortSignal.timeout(10000)});
    const type=response.headers.get("content-type")?.split(";")[0];
    if(!response.ok || !["image/jpeg","image/png","image/webp"].includes(type ?? ""))throw Error();
    // Bound in-memory image size. Reject before buffering oversized responses.
    const reader=response.body?.getReader();if(!reader)throw Error();
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>5_000_000){await reader.cancel();throw Error();}chunks.push(value);}
    return new Response(Buffer.concat(chunks),{headers:{...headers,"Content-Type":type!}});
  } catch{return new Response(null,{status:404,headers});}
}

export async function approvedHostedMemberPhoto(filename: string): Promise<Response> {
  const path = `/member-photos/${filename}`;
  if (!memberPhotoFilename(path)) return memberPhotoNotFound();
  const analytics = await memberAnalytics();
  if (analytics.state !== "live" || ![...analytics.assets.values()].some(asset => asset.kind === "member" && asset.url === path)) {
    return memberPhotoNotFound();
  }
  return readHostedMemberPhoto(path);
}
