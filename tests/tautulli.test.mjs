import test from "node:test";
import assert from "node:assert/strict";
import { readTautulliSummary } from "../src/lib/tautulli-client.ts";

const json = data => Response.json({response:{result:"success",data}});
test("Tautulli exposes only status, movie count and stream count, authenticating in headers", async () => {
 const requests=[];
 const result=await readTautulliSummary("http://example.invalid/tautulli/","test-secret",async (url,init)=>{
  requests.push({url,init});
  const command=new URL(url).searchParams.get("cmd");
  if(command === "get_server_identity") return json({version:"1.0",machine_identifier:"private-id"});
  if(command === "get_activity") return json({stream_count:"2",sessions:[{username:"private-user",ip_address:"private-ip",full_title:"private-title",token:"private-token"}]});
  return json([
   {section_type:"movie",count:"12",is_active:1,section_name:"private name"},
   {section_type:"movie",count:8,is_active:"1"},
   {section_type:"movie",count:100,is_active:0},
   {section_type:"show",count:50,is_active:1},
  ]);
 });
 assert.equal(result.status,"online"); assert.equal(result.movieCount,20); assert.equal(result.streamCount,2);
 assert.deepEqual(Object.keys(result).sort(),["checkedAt","movieCount","source","status","streamCount"]);
 assert.equal(requests.length,3);
 for(const {url,init} of requests){
  assert.ok(url.startsWith("http://example.invalid/tautulli/api/v2?cmd="));
  assert.ok(!url.includes("test-secret"));
  assert.equal(init.headers["X-Api-Key"],"test-secret");
  assert.equal(init.redirect,"error"); assert.equal(init.cache,"no-store");
  assert.ok(["get_server_identity","get_libraries","get_activity"].includes(new URL(url).searchParams.get("cmd")));
 }
 assert.ok(!JSON.stringify(result).includes("private"));
});
test("upstream auth failures, network failures, and invalid payloads return unavailable without demo fallback", async () => {
 for(const request of [async()=>new Response("private secret",{status:401}),async()=>{throw Error("private token")},async()=>json({unexpected:true}),async()=>Response.json({response:{result:"error",message:"private"}})]){
  const result=await readTautulliSummary("http://example.invalid","secret",request);
  assert.equal(result.source,"tautulli");assert.equal(result.status,"unavailable");assert.equal(result.movieCount,null);
  assert.equal(result.streamCount,null);
  assert.ok(!JSON.stringify(result).includes("secret"));
 }
});
test("stream counts distinguish zero from missing or malformed values", async () => {
 for (const [value,expected] of [[0,0],["0",0],[3,3],["3",3],[null,null],[undefined,null],["bad",null],["",null],[-1,null],[1.5,null],[true,null],[Number.MAX_SAFE_INTEGER+1,null]]) {
  const result=await readTautulliSummary("http://example.invalid","secret",async url=>{
   const cmd=new URL(url).searchParams.get("cmd");
   return json(cmd==="get_activity" ? {stream_count:value} : cmd==="get_server_identity" ? {version:"1"} : [{section_type:"movie",count:12}]);
  });
  assert.equal(result.streamCount,expected);
  assert.equal(result.status,"online");
  assert.equal(result.movieCount,12);
 }
});
test("an activity failure leaves healthy status and library counts available", async () => {
 const result=await readTautulliSummary("http://example.invalid","secret",async url=>{
  const cmd=new URL(url).searchParams.get("cmd");
  if(cmd==="get_activity") throw Error("private upstream error");
  return json(cmd==="get_server_identity" ? {version:"1"} : [{section_type:"movie",count:12}]);
 });
 assert.equal(result.status,"online");
 assert.equal(result.movieCount,12);
 assert.equal(result.streamCount,null);
 assert.ok(!JSON.stringify(result).includes("private"));
});
test("invalid library counts do not become plausible zeroes; successful fields remain independent", async () => {
 const result=await readTautulliSummary("http://example.invalid","secret",async url=>new URL(url).searchParams.get("cmd")==="get_server_identity" ? json([{version:"1"}]) : json([{section_type:"movie",count:"bad"}]));
 assert.equal(result.status,"online");assert.equal(result.movieCount,null);
});
test("invalid configuration makes no requests", async () => {
 let calls=0;const request=async()=>{calls++;return json([])};
 for(const [url,key] of [["","key"],["file:///tmp/test","key"],["http://user:password@example.invalid","key"],["http://example.invalid?apikey=secret","key"],["http://example.invalid",""]]){
  const result=await readTautulliSummary(url,key,request);assert.equal(result.movieCount,null);
 }
 assert.equal(calls,0);
});
