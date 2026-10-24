import test from "node:test";
import assert from "node:assert/strict";
import { fetchPlexAvatar } from "../src/lib/plex-avatar.ts";

const source = "https://plex.tv/users/fictional/avatar";
test("avatar fetch strips initial query parameters and follows Plex assets without credentials", async () => {
  const requests = [];
  const result = await fetchPlexAvatar(source + "?c=123&X-Plex-Token=secret", async (url, options) => {
    requests.push({url: String(url), options});
    return requests.length === 1
      ? new Response(null, {status:302, headers:{location:"https://assets.plex.tv/avatars/fictional.png"}})
      : new Response("image", {headers:{"content-type":"image/png"}});
  });
  assert.equal(requests[0].url, source);
  assert.equal(requests[1].url, "https://assets.plex.tv/avatars/fictional.png");
  for (const {options} of requests) {
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers, undefined);
  }
  assert.equal(await result.text(), "image");
});
test("avatar redirects reject other hosts, local services, HTTP, credentials and ports before fetching", async () => {
  for (const location of ["http://assets.plex.tv/a.png", "https://assets.plex.tv.example.com/a.png", "http://192.168.0.99/a.png", "https://example.com/a.png", "https://secret@assets.plex.tv/a.png", "https://assets.plex.tv:8443/a.png", "https://assets.plex.tv/a.png#fragment"]) {
    let calls = 0;
    await assert.rejects(fetchPlexAvatar(source, async () => {
      calls++;
      return new Response(null, {status:302, headers:{location}});
    }));
    assert.equal(calls, 1);
  }
});
test("avatar redirects have a bounded hop count and require a location", async () => {
  let calls = 0;
  await assert.rejects(fetchPlexAvatar(source, async () => {
    calls++;
    return new Response(null, {status:302, headers:{location:"https://assets.plex.tv/loop"}});
  }));
  assert.equal(calls, 3);
  await assert.rejects(fetchPlexAvatar(source, async () => new Response(null, {status:302})));
});
test("invalid initial avatar URLs cannot trigger a request", async () => {
  let calls = 0;
  await assert.rejects(fetchPlexAvatar("https://example.com/users/fictional/avatar", async () => {
    calls++;
    return new Response("unexpected");
  }));
  assert.equal(calls, 0);
});
