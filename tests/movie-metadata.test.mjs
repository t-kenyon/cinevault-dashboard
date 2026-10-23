import test from "node:test";
import assert from "node:assert/strict";
import { releaseYear, movieTitle } from "../src/lib/movie-metadata.ts";
import { normalizePlay, calculateAnalytics } from "../src/lib/analytics-policy.ts";
import { safeNowPlaying } from "../src/lib/now-playing-policy.ts";

test("release years accept metadata numbers and strings without inventing missing years",()=>{
 for (const value of [1963,"1963"]) assert.equal(releaseYear(value),1963);
 for (const value of [undefined,null,"",0,1963.5,"1963 extra"," 1963 ","unknown",9999]) assert.equal(releaseYear(value),undefined);
 assert.equal(movieTitle("Charade",1963),"Charade (1963)");
 assert.equal(movieTitle("Charade (1963)",1963),"Charade (1963)");
 assert.equal(movieTitle("Charade"),"Charade");
});
test("release years survive both live sessions and completed movie aggregation",()=>{
 const now="2026-10-23T12:00:00Z";
 const users=[{userId:"1",name:"Member"}];
 const consents=[{userId:"1",consentedAt:"2026-10-23T07:00:00Z",rankings:true,screenings:true,aggregates:true}];
 const [session]=safeNowPlaying({sessions:[{user_id:1,session_key:1,rating_key:10,full_title:"Charade",year:"1963",media_type:"movie",state:"playing",view_offset:1000,duration:2000}]},users,consents,now);
 assert.equal(session.year,1963);
 const play=normalizePlay({user_id:1,row_id:1,rating_key:10,full_title:"Charade",year:"1963",media_type:"movie",started:1792742400,stopped:1792746000,play_duration:3600,watched_status:1},"1");
 assert.equal(play.year,1963);
 const result=calculateAnalytics(users,[play],consents,now);
 assert.equal(result.recent[0].year,1963);
 assert.equal(result.popular[0].year,1963);
});
