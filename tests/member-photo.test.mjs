import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, symlink, truncate, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { memberPhotoFilename, hostedMemberPhotoPath } from "../src/lib/member-photo-policy.ts";
import { readHostedMemberPhoto } from "../src/lib/hosted-member-photo.ts";
import { publicPlexIdentity } from "../src/lib/consent-policy.ts";
import { safeUsers, calculateAnalytics } from "../src/lib/analytics-policy.ts";

const origin = "https://dashboard.example";
const photo = "/member-photos/cinema-friend.png";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS+8AAAAASUVORK5CYII=", "base64");
test("custom photos use only the configured HTTPS origin and simple raster filenames",()=>{
 assert.equal(hostedMemberPhotoPath(origin + photo, origin),photo);
 assert.equal(memberPhotoFilename(photo),"cinema-friend.png");
 for (const source of ["http://dashboard.example"+photo, "https://other.example"+photo, "https://secret@dashboard.example"+photo, origin+photo+"?token=secret", origin+photo+"#fragment", origin+"/member-photos/../secret.png", origin+"/member-photos/nested/photo.png", origin+"/member-photos/%2fsecret.png", origin+"/member-photos/file.svg", origin+"/artwork/member/123"]) {
  assert.equal(hostedMemberPhotoPath(source, origin),undefined);
 }
 assert.equal(hostedMemberPhotoPath(origin + photo),undefined);
 assert.equal(hostedMemberPhotoPath(origin + photo, origin+"/nested"),undefined);
 assert.deepEqual(publicPlexIdentity({username:"MovieFriend",friendly_name:"Friend",thumb:origin+photo},origin),{name:"Friend",photo});
});
test("name and photo changes preserve user-ID consent and withdrawal",()=>{
 const consent={userId:"1",consentedAt:"2026-10-23T07:00:00Z",rankings:true,screenings:false,aggregates:false};
 const upstream=[{user_id:1,username:"MovieFriend",friendly_name:"New Name",thumb:origin+photo,is_active:1},{user_id:2,username:"Other",friendly_name:"Private",thumb:origin+photo,is_active:1}];
 const users=safeUsers(upstream,[consent],origin);
 assert.deepEqual(users,[{userId:"1",name:"New Name",photo}]);
 assert.equal(calculateAnalytics(users,[],[consent],"2026-10-23T08:00:00Z").members[0].name,"New Name");
 assert.deepEqual(safeUsers(upstream,[],origin),[]);
 assert.deepEqual(calculateAnalytics(users,[],[{...consent,rankings:false}],"2026-10-23T08:00:00Z").members,[]);
});
test("hosted photos validate image bytes and return no-store responses",async()=>{
 const directory=await mkdtemp(join(tmpdir(),"cinevault-photos-"));
 try {
  await writeFile(join(directory,"cinema-friend.png"),png);
  const response=await readHostedMemberPhoto(photo,directory);
  assert.equal(response.status,200);
  assert.equal(response.headers.get("Content-Type"),"image/png");
  assert.ok(response.headers.get("Cache-Control").includes("no-store"));
  assert.equal(response.headers.get("X-Content-Type-Options"),"nosniff");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),png);
  await writeFile(join(directory,"not-an-image.png"),"<svg>private</svg>");
  assert.equal((await readHostedMemberPhoto("/member-photos/not-an-image.png",directory)).status,404);
  assert.equal((await readHostedMemberPhoto("/member-photos/missing.png",directory)).status,404);
 } finally { await rm(directory,{recursive:true,force:true}); }
});
test("hosted photo reads reject traversal, symlinks, oversized files and absent mounts",async()=>{
 const directory=await mkdtemp(join(tmpdir(),"cinevault-photos-"));
 try {
  await writeFile(join(directory,"original.png"),png);
  await symlink(join(directory,"original.png"),join(directory,"linked.png"));
  await writeFile(join(directory,"large.png"),png);
  await truncate(join(directory,"large.png"),5_000_001);
  for (const path of ["/member-photos/../original.png", "/member-photos/linked.png", "/member-photos/large.png"]) {
   assert.equal((await readHostedMemberPhoto(path,directory)).status,404);
  }
  assert.equal((await readHostedMemberPhoto(photo,"")).status,404);
  assert.equal((await readHostedMemberPhoto(photo,"relative/path")).status,404);
 } finally { await rm(directory,{recursive:true,force:true}); }
});
