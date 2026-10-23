import { publicPlexIdentity } from "./consent-policy.ts";

// Called only by the server artwork proxy, after checking current member consent.
export async function fetchPlexAvatar(source: string, fetcher: typeof fetch = fetch): Promise<Response> {
  const canonical = publicPlexIdentity({username: "Avatar", thumb: source})?.photo;
  if (!canonical) throw Error("Unsupported avatar");
  let url = new URL(canonical);
  const signal = AbortSignal.timeout(10000);
  for (let hop = 0; hop < 3; hop++) {
    // Never attach Tautulli/Plex credentials or follow redirects automatically.
    const response = await fetcher(url, {redirect: "manual", cache: "no-store", signal});
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location || hop === 2) throw Error("Unsupported avatar redirect");
    const next = new URL(location, url);
    if (next.protocol !== "https:" || next.hostname !== "assets.plex.tv" || next.port || next.username || next.password || next.hash) {
      throw Error("Unsupported avatar redirect");
    }
    url = next;
  }
  throw Error("Unsupported avatar redirect");
}
