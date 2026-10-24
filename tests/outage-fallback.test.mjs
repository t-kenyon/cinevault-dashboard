import test from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "../infrastructure/cloudflare/worker.mjs";
const document = (path="/",headers={}) => new Request(`https://cinevault-dashboard.com${path}`,{headers:{accept:"text/html",...headers}});

test("healthy, redirect and ordinary 4xx responses pass through unchanged",async()=>{
 for (const status of [200,302,401,404,429]) {
  const original=new Response("original",{status,headers:{"X-Test":"kept"}});
  assert.equal(await handleRequest(document(),async()=>original),original);
 }
});
test("origin and tunnel failures receive a self-contained uncached 503 page",async()=>{
 for (const status of [500,502,503,504,530]) {
  const response=await handleRequest(document(),async()=>new Response("upstream error",{status}));
  assert.equal(response.status,503);
  assert.equal(response.headers.get("Cache-Control"),"no-store, max-age=0");
  assert.equal(response.headers.get("Retry-After"),"60");
  assert.match(response.headers.get("Content-Security-Policy"),/img-src data:/);
  const html=await response.text();
  assert.match(html,/Server offline/);
  assert.match(html,/<img[^>]+src="data:image\/jpeg;base64,/);
  assert.doesNotMatch(html,/(?:src|href)="https?:/);
 }
 const failed=await handleRequest(document(),async()=>{throw Error("private upstream detail");});
 assert.doesNotMatch(await failed.text(),/private upstream/);
});
test("API, assets, React streams and prefetches never receive an HTML page",async()=>{
 const requests=[document("/api/now-playing"),document("/_next/static/main.js"),document("/",{rsc:"1"}),document("/",{"next-router-prefetch":"1"}),new Request("https://cinevault-dashboard.com/",{headers:{accept:"application/json"}})];
 for (const request of requests) {
  const original=new Response("original failure",{status:502});
  assert.equal(await handleRequest(request,async()=>original),original);
  const response=await handleRequest(request,async()=>{throw Error();});
  assert.equal(response.status,503);
  assert.match(response.headers.get("Content-Type"),/text\/plain/);
 }
});
test("timeout falls back, HEAD has no body, and recovery returns to origin",async()=>{
 const timeout=await handleRequest(document(),(_request,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener("abort",()=>reject(Error("timeout")),{once:true})),5);
 assert.equal(timeout.status,503);
 const head=await handleRequest(new Request("https://cinevault-dashboard.com/",{method:"HEAD",headers:{accept:"text/html"}}),async()=>new Response(null,{status:502}));
 assert.equal(await head.text(),"");
 const recovered=await handleRequest(document(),async()=>new Response("online"));
 assert.equal(await recovered.text(),"online");
});
