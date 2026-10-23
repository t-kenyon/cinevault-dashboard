import test from "node:test";
import assert from "node:assert/strict";
import { safeNowPlaying, playbackTimestamp } from "../src/lib/now-playing-policy.ts";

const now="2026-10-23T12:00:00Z";
const consent={userId:"1",consentedAt:"2026-10-23T07:00:00Z",rankings:false,screenings:true,aggregates:false};
const users=[{userId:"1",name:"Friend"},{userId:"2",name:"Private"}];
const session={user_id:"1",session_key:"8",rating_key:"10",full_title:"Sample Movie",media_type:"movie",state:"playing",view_offset:"2538000",duration:"6780000"};
test("active movies require current screening permission independent of rankings and aggregates",()=>{
 const [play]=safeNowPlaying({sessions:[session]},users,[consent],now);
 assert.equal(play.positionSeconds,2538);
 assert.equal(play.durationSeconds,6780);
 for (const consents of [[],[{...consent,screenings:false}],[{...consent,consentedAt:"2026-10-24T07:00:00Z"}]]) {
  assert.deepEqual(safeNowPlaying({sessions:[session]},users,consents,now),[]);
 }
 assert.deepEqual(safeNowPlaying({sessions:[{...session,user_id:"2"}]},users,[consent],now),[]);
 assert.deepEqual(safeNowPlaying({sessions:[session]},[],[consent],now),[]);
});
test("playing, paused and buffering movies retain their state; TV and stopped sessions are excluded",()=>{
 const sessions=[{...session,state:"paused"},{...session,session_key:9,state:"buffering"},{...session,session_key:10},{...session,session_key:11,media_type:"episode"},{...session,session_key:12,state:"stopped"}];
 assert.deepEqual(safeNowPlaying({sessions},users,[consent],now).map(p=>p.state),["playing","buffering","paused"]);
});
test("malformed positions, IDs and duplicate sessions never become plausible progress",()=>{
 for (const update of [{view_offset:-1},{view_offset:null},{view_offset:"bad"},{view_offset:Infinity},{view_offset:6780001},{session_key:"secret"},{rating_key:"/private/path"},{full_title:""}]) {
  assert.deepEqual(safeNowPlaying({sessions:[{...session,...update}]},users,[consent],now),[]);
 }
 assert.equal(safeNowPlaying({sessions:[session,session]},users,[consent],now).length,1);
 assert.equal(safeNowPlaying({sessions:[{...session,view_offset:0,duration:undefined}]},users,[consent],now)[0].positionSeconds,0);
 assert.equal(safeNowPlaying({sessions:[{...session,duration:undefined}]},users,[consent],now)[0].durationSeconds,null);
 assert.throws(()=>safeNowPlaying({unexpected:[]},users,[consent],now));
});
test("session normalization discards private upstream metadata",()=>{
 const [play]=safeNowPlaying({sessions:[{...session,username:"private-username",email:"private-email",ip_address:"private-ip",player:"private-device",session_id:"private-session-id",token:"private-token"}]},users,[consent],now);
 assert.ok(!JSON.stringify(play).includes("private"));
 assert.deepEqual(Object.keys(play).sort(),["durationSeconds","movieId","positionSeconds","sessionKey","state","title","userId"]);
});
test("playback timestamps keep seconds and support films longer than an hour",()=>{
 assert.equal(playbackTimestamp(0),"00:00:00");
 assert.equal(playbackTimestamp(2538),"00:42:18");
 assert.equal(playbackTimestamp(7440),"02:04:00");
 assert.equal(playbackTimestamp(360005),"100:00:05");
});
