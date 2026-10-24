import test from "node:test";
import assert from "node:assert/strict";
import { safeUsers, normalizePlay, calculateAnalytics } from "../src/lib/analytics-policy.ts";
const now="2026-10-23T12:00:00Z";
const consent={userId:"1",consentedAt:"2026-10-23T00:00:00-07:00",rankings:true,screenings:true,aggregates:true};
const users=[{userId:"1",name:"Consented"},{userId:"2",name:"Private"}];
const play=(id,userId,started,completed=true)=>({id,userId,movieId:"10",title:"Sample",started,stopped:new Date(Date.parse(started)+3600000).toISOString(),seconds:3600,completed});
test("each section follows its own permission, historical rankings/aggregates do not expose pre-consent screenings",()=>{
 const history=[play("1","1","2026-10-22T00:00:00Z"),play("2","1","2026-10-23T08:00:00Z"),play("3","2","2026-10-23T08:00:00Z")];
 const result=calculateAnalytics(users,history,[consent],now);
 assert.equal(result.members.length,1);assert.equal(result.members[0].minutes,120);
 assert.equal(result.recent.length,1);assert.equal(result.recent[0].id,"2");
 assert.equal(result.completed,2);assert.equal(result.popular[0].count,2);
 const rankingsOnly=calculateAnalytics(users,history,[{...consent,screenings:false,aggregates:false}],now);
 assert.equal(rankingsOnly.members.length,1);assert.equal(rankingsOnly.minutes,0);assert.equal(rankingsOnly.recent.length,0);assert.equal(rankingsOnly.popular.length,0);
 const withdrawn=calculateAnalytics(users,history,[],now);
 assert.equal(withdrawn.members.length,0);assert.equal(withdrawn.completed,0);assert.equal(withdrawn.recent.length,0);
});
test("partial plays count watch time but never recent screenings or Most Watched",()=>{
 const result=calculateAnalytics(users,[play("1","1","2026-10-23T08:00:00Z",false)],[consent],now);
 assert.equal(result.minutes,60);assert.equal(result.completed,0);assert.equal(result.recent.length,0);assert.equal(result.popular.length,0);
});
test("normalization drops unrequested users and personal upstream fields",()=>{
 const row={row_id:1,user_id:1,media_type:"movie",rating_key:10,full_title:"Sample",started:1792742400,stopped:1792746000,play_duration:3500,watched_status:1,email:"private@example.com",ip_address:"private-address"};
 const safe=normalizePlay(row,"1");assert.ok(safe);assert.equal(safe.completed,true);assert.ok(!JSON.stringify(safe).includes("private"));
 assert.equal(normalizePlay(row,"2"),undefined);assert.equal(normalizePlay({...row,play_duration:-2},"1"),undefined);
 assert.equal(normalizePlay({...row,watched_status:.5},"1").completed,false);
});
test("user selection requires consent, activity, and non-email Plex username",()=>{
 const result=safeUsers([{user_id:1,username:"Consented",is_active:1,email:"private@example.com"},{user_id:2,username:"Private",is_active:1},{user_id:3,username:"email@example.com",is_active:1}],[consent,{...consent,userId:"3"}]);
 assert.deepEqual(result,[{userId:"1",name:"Consented"}]);
});
