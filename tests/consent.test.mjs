import test from "node:test";
import assert from "node:assert/strict";
import { parseConsentConfig, permits, publicPlexIdentity } from "../src/lib/consent-policy.ts";
const date = "2026-10-23T07:00:00Z";
const now = "2026-10-23T08:00:00Z";
const member = {userId:"1",consentedAt:date,rankings:true,screenings:false,aggregates:false};
test("permissions default off and are independent",()=>{
 const [empty]=parseConsentConfig({version:1,members:[{userId:"1",consentedAt:date}]});
 for(const permission of ["rankings","screenings","aggregates"]) assert.equal(permits(empty,permission,now),false);
 assert.equal(permits(member,"rankings",now),true);
 assert.equal(permits(member,"screenings",now,date),false);
 assert.equal(permits(member,"aggregates",now),false);
 assert.equal(permits(undefined,"rankings",now),false);
});
test("screenings require post-consent start, rolling 30-day window, and no future timestamps",()=>{
 const allowed={...member,screenings:true};
 assert.equal(permits(allowed,"screenings",now,date),true);
 assert.equal(permits(allowed,"screenings",now,"2026-10-23T06:59:59Z"),false);
 assert.equal(permits(allowed,"screenings",now,"2026-10-24T07:00:00Z"),false);
 assert.equal(permits({...allowed,consentedAt:"2026-01-01T00:00:00Z"},"screenings",now,"2026-09-01T00:00:00Z"),false);
 assert.equal(permits({...member,consentedAt:"2027-01-01T00:00:00Z"},"rankings",now),false);
});
test("withdrawal denies previously authorized sections",()=>{
 assert.equal(permits({...member,rankings:false},"rankings",now),false);
 assert.equal(permits(undefined,"screenings",now,date),false);
});
test("duplicate IDs, invalid times, string flags, and wildcard grants fail closed",()=>{
 for(const members of [[member,member],[{...member,consentedAt:"today"}],[{...member,rankings:"yes"}],[{...member,userId:"*"}]]) assert.throws(()=>parseConsentConfig({version:1,members}));
});
test("public identity uses Plex username only and excludes email and private image URLs",()=>{
 assert.equal(publicPlexIdentity({email:"private@example.com",friendly_name:"Private"}),undefined);
 assert.equal(publicPlexIdentity({username:"private@example.com"}),undefined);
 assert.deepEqual(publicPlexIdentity({username:"MovieFriend",email:"private@example.com",thumb:"http://192.168.0.99/avatar?token=secret"}),{name:"MovieFriend"});
 assert.deepEqual(publicPlexIdentity({username:"MovieFriend",thumb:"https://plex.tv/users/fictional/avatar"}),{name:"MovieFriend",photo:"https://plex.tv/users/fictional/avatar"});
 assert.deepEqual(publicPlexIdentity({username:"MovieFriend",thumb:"https://plex.tv/users/fictional/avatar?X-Plex-Token=secret"}),{name:"MovieFriend"});
});
