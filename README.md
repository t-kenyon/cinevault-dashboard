# CineVault Dashboard V1

A Next.js + TypeScript + Tailwind dashboard with a black, charcoal, silver, and gold identity, the supplied CineVault logo, and locally hosted Roboto. **All members, viewing history, server status, stream counts, and inventory totals are fictional demo data.** Classic-film titles and posters are visual samples, not evidence of actual library membership. Live integrations are opt-in runtime settings; default mode is fictional.

## Run locally

Use Node.js 22.18+ and pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. No credentials are required for the demo. Production: `pnpm build`, then `pnpm start`.

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. GitHub Actions runs these on pushes and pull requests.

## Current scope

- Simulated server status and current stream count.
- Centered overview totals: movies, total watch time, and completed movie plays.
- **FROM THE VAULT / Recent Screenings:** completed, consented playthroughs during the rolling 30 days; four posters at a time, horizontal navigation, and relative day labels.
- **THE FRONT ROW / Member Rankings:** all-time watch hours and completed movie counts. Five members initially; View all members expands the ranking when there are more than five participating members. Names do not link to profiles.
- **THE VAULT’S FINEST / Most Watched:** five films initially; View more expands the full ranking. Counts and watch-time totals include only completed screenings, ranked by count then watch time.
- Individual member profiles, TV episode summary, Recently Added, and activity charts are removed. No catalog, logins, requests, or admin notifications.

## Data definitions

The demo is frozen at October 22, 2026, 12:00 UTC. Relative days and the rolling 30-day interval use that snapshot. Member rankings and overview totals are all time. Overview/member watch time includes partial plays, while completed movie counts exclude them. Most Watched excludes partial plays from both counts and watch time. Counts represent play events, not unique titles. Real integrations will need an explicit source completion threshold and time-zone policy.

## Privacy and credentials

- `src/lib/data.ts` is the server-only data entry point. Keep future service clients behind it.
- `.env*` is ignored except the placeholder-only `.env.example`. Never use `NEXT_PUBLIC_` for credentials, private URLs, or viewing data.
- Only fictional member/history fixtures belong in this public repository. Never commit real usernames, IDs, histories, exports, logs, or screenshots.
- Sample `publicProfile` flags currently control participation in the public rankings; `shareActivity` separately controls inclusion in screenings. These illustrate permissions, not a durable consent system. Live personal analytics must stay disabled until explicit consent and withdrawal handling exist.
- Removed profile URLs return 404. Search indexing is discouraged but this is not access control.
- Public deployment is suitable for the fictional demo only until live-data visibility is reviewed.

## Assets

`public/brand/cinevault-logo-final.png` is the user-supplied logo. Roboto and its OFL license are in `src/app/fonts/`. Poster sources and attribution are in `public/posters/ATTRIBUTION.md`. Browser artwork requests stay local; the shared poster component has an unavailable-art fallback.

## Next integration phase

Tautulli is already running. Confirm the dashboard host and network reachability before configuring credentials. The first live increment should expose only approved server status and movie inventory totals, clearly distinguished from demo viewing analytics. Do not add member history, active title details, private artwork, or personal analytics in this step.

Tautulli supports `X-Api-Key` headers in version 2.18.0 and newer; prefer headers to query-string credentials. Store URL and key only in the target host’s ignored `.env.local` or deployment secret storage. Never paste keys into a public issue or PR. See the [official API reference](https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference).

Before enabling live mode, implement timeouts, validated/allowlisted responses, generic error messages, and an unavailable state rather than silently substituting demo numbers. Plex poster requests must be resolved server-side with credentials absent from browser URLs.

## Unraid deployment

KenyonVault can host the dashboard as a Docker container. The repository includes a multistage Dockerfile, loopback-default Compose configuration, and [Unraid deployment instructions](docs/UNRAID.md). Start in demo mode on the LAN. Docker is not available in the authoring environment, so the actual Linux image must still be built and verified on the target host.

## Live status and inventory via Tautulli

The first live adapter requests only `get_server_identity` (Plex reachability) and `get_libraries` (sum of active movie-library counts). It does not request users, history, sessions, or private artwork. Duplicate movies in separate libraries count once per library entry. Counts reflect Tautulli's stored library inventory; they can lag behind Plex until Tautulli updates.

Set `CINEVAULT_DATA_MODE=tautulli`, `TAUTULLI_URL`, and `TAUTULLI_API_KEY` at runtime to enable. Tautulli 2.18+ is required for header authentication. No browser receives these settings. Five-second request timeouts, rejected redirects, validation, and a 30-second in-process cache limit upstream traffic. Refresh the page to update; no automatic polling is enabled. Each replica maintains its own cache.

Failures show **Unavailable** / **—**, never a substituted demo count. A failed identity check does not prove Plex is offline, so the UI does not claim that it is. Live mode omits the simulated active-stream count. Watch-time totals, recent screenings, rankings, and Most Watched remain clearly marked fictional demo analytics until consent is implemented.

See [runtime setup](docs/TAUTULLI.md). No live credentials are included in the repository or container image.

## Consented live member analytics

Optional live member analytics use private, explicit Tautulli user-ID consent records with three independent permissions. Initial consent date: October 23, 2026, midnight Pacific, as approved by the owner. Plex usernames/avatars are public only for the permitted sections; emails are excluded. Recent screenings start after consent; rankings and aggregates can use opted-in historical plays. Future members default to excluded. [Enrollment, revocation, data definitions, and limits](docs/MEMBER-CONSENT.md).

Enable only with `CINEVAULT_MEMBER_ANALYTICS=1` and a private read-only `CINEVAULT_CONSENT_FILE` mount. Never put the consent file into the source checkout or public assets.
