# Independent outage page

Prepared locally; not deployed or enabled in Cloudflare.

KenyonVault hosts both Plex and the dashboard. A page served by that machine cannot help when the machine, power or home internet is down. The prepared Worker runs on Cloudflare instead:

Visitor → Cloudflare Worker → existing Tunnel → dashboard on KenyonVault.

Healthy requests pass through unchanged. A failed home-page request (HTTP 5xx, network error, or an 8-second response-header timeout) receives a self-contained CineVault intermission page with HTTP 503 and a Try again link. No images, fonts, scripts, keys, member records or other files are fetched from KenyonVault to render this page. It is not a cached copy of member activity. It cannot protect against Cloudflare itself being down or a visitor's own internet connection failing. It does not detect Plex-only failure when the dashboard remains reachable, or failure partway through an already-streaming response.

## Enable when ready

1. Create a Worker named `cinevault-fallback` in Cloudflare Workers & Pages. Paste `infrastructure/cloudflare/worker.mjs` as its module entrypoint and deploy it.
2. In that Worker's Settings → Domains & Routes → Add → Route, select the `cinevault-dashboard.com` zone and use `cinevault-dashboard.com/*`.
3. Keep the existing proxied Tunnel CNAME record. Use a **Route**, not a Worker Custom Domain, so the Tunnel remains the origin. No port forwards or API keys are needed.
4. Test normal page loading, artwork, live playback and the member list. During a planned test, stop only `cinevault-dashboard` on Unraid, reload the public home page, confirm the intermission page, then start the container and refresh again. No need to stop Plex or the Tunnel.
5. Remove the Worker Route to roll back immediately. The original Tunnel route continues to serve the dashboard.

The included `wrangler.jsonc` is an alternative deployment configuration for the official Wrangler CLI. Run deployment from its `infrastructure/cloudflare` directory after authenticating to the correct Cloudflare account. Inspect plan limits and route failure behavior before enabling it; it adds a Worker invocation to every matching request. No Cloudflare configuration was changed as part of preparing these files.

The HTML fallback is restricted to normal GET/HEAD home-page navigation. APIs, artwork, scripts and Next.js React requests retain their response types and are never replaced by an HTML page. Responses are not cached, and refresh goes back to the origin so recovery is visible immediately.

Sources: [Cloudflare Worker Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/) and [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
