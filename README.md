# CineVault Dashboard V1

A cinematic, responsive analytics dashboard built with Next.js App Router, TypeScript, and Tailwind CSS. **All viewers, viewing history, server status, stream counts, and library totals are fictional demo data. Real classic-film titles and poster artwork are used as visual samples, not as evidence of actual library membership.** No live Plex or Tautulli requests are made.

## Run locally

Use Node.js 22.18+ and pnpm 11.25.0 (see packageManager).

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. No environment variables are required. For production: `pnpm build` then `pnpm start`.

Validation: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. GitHub Actions runs these checks on pushes and pull requests.

## V1 features

1. Simulated online server status.
2. Simulated current active-stream count.
3. Movie count, TV episode count, and available content hours (illustrative inventory totals).
4. Aggregate watch hours and minutes, computed from demo plays.
5. Completed movie plays, excluding partial plays.
6. Watch-time leaderboard for participating demo viewers.
7. All-time leaderboard only; time toggles have been removed. Legacy period query parameters have no effect.
8. `/viewer/[id]` public demo profiles with totals and viewing trends; unknown or private IDs return 404.
9. All fully completed playthroughs in the rolling 30 days ending at the demo snapshot, from separately opted-in demo viewers. A horizontal rail displays four movies at a time, with arrows, touch/trackpad scrolling, and keyboard access. Partial plays and future records are excluded.
10. Top five movies ranked by plays (including partial plays), then watch time; View more reveals the remaining ranking, and View less collapses it.
11. Recently Added has been removed by design revision. Recent viewing now uses a horizontal poster rail showing four movies at a time.
12. Viewer profiles retain a seven-day activity chart. The weekly chart has been removed from the homepage.

## Data definitions

The demo is frozen at October 22, 2026, 12:00 UTC. This week begins Monday October 19; month and year use UTC calendar boundaries. The leaderboard, other totals, and profiles are all time. Viewer profile charts cover October 16–22. Watch time includes partial plays; completed movies counts completed play events, not unique titles. TV playback is not represented in the sample history. Inventory and current streams are illustrative independent fixtures. There is no polling or live status. Update `src/lib/sample.ts` to change fixtures; calculations use those same records.

## Privacy and future integrations

- `src/lib/data.ts` is the server-only data entry point. Keep future Plex/Tautulli clients and credentials behind it; never import them into client components.
- `.env*` is ignored except the placeholder-only `.env.example`. Never use `NEXT_PUBLIC_` for tokens, private service URLs, or personal viewing data. No credentials are required or supplied in V1.
- The public repository must contain fictional fixtures only. Never commit real usernames, IDs, history, exports, screenshots, logs, or credentials.
- Do not wire live data into these public routes without explicit consent for public profiles and separately for recent viewing activity. The sample permission flags illustrate separate choices; they are not a real consent store. Production requires durable consent records, withdrawal handling, and reviewed aggregate disclosure rules, including small-group privacy.
- Private or unknown viewer IDs have the same unavailable response. Search indexing is discouraged through metadata, but this is not access control.
- No live integration, catalog, login, request system, or admin notifications are included. Public deployment is suitable for this fictional demo only.

## Review increments

The initial commit establishes project tooling; the following implementation adds fixtures, analytics, privacy filtering, routes, styling, tests, and CI. Future work can introduce server adapters and consent storage in separate reviewed changes.

## Poster art

Sample poster files and source links are in `public/posters/ATTRIBUTION.md`. Every movie appearance uses the shared `MoviePoster` component, with an unavailable-art fallback. No third-party poster requests are made by the browser.

Plex artwork is not connected: no local Plex URL/token or movie metadata mapping has been supplied. When connecting, resolve each approved movie's Plex thumbnail on the server and expose a same-origin artwork URL. Keep `X-Plex-Token` in server-side request headers; never include it in rendered image URLs or responses. Only approved movie IDs should be addressable, and public artwork disclosure should be reviewed with the live-data consent policy.
