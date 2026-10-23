# Live member analytics and private consent

The owner confirmed that current members consented to three independent public uses, including member display names and profile photos. Display names use the owner-configured Tautulli Friendly Name when valid, with the Plex username as fallback. Consent date for the initial enrollment is **October 23, 2026, 00:00 Pacific** (`2026-10-23T00:00:00-07:00`). This approval does not enroll future members automatically.

## Permissions

- `rankings`: all recorded movie watch time and completed movie counts, with the member display name/avatar.
- `screenings`: only completed movies started on/after consent, within the rolling 30 days, with username/avatar. Movies started before consent do not appear even if completed afterward.
- `aggregates`: contributions to total movie watch time, completed-play total, and Most Watched. Most Watched uses completed plays only, including historical completed plays when aggregate permission is enabled.

Completed means Tautulli's `watched_status=1`; the configured Tautulli watched threshold determines this designation. History is requested with movie-only filtering, grouping off, and current activity excluded. Actual recorded playback seconds are used; paused time is not inferred from movie runtime. Ranking/overview watch time includes partial recorded movie plays, but screening lists and Most Watched exclude them.

## Private configuration

Set `CINEVAULT_MEMBER_ANALYTICS=1` separately from `CINEVAULT_DATA_MODE=tautulli`. Mount a private file read-only at `/run/cinevault/consent.json`, and set `CINEVAULT_CONSENT_FILE` to that path. Store the host file outside the source checkout, e.g. `/mnt/user/appdata/cinevault-dashboard/private/consent.json`.

Schema example (synthetic ID, all permissions default off):

```json
{"version":1,"members":[{"userId":"123","consentedAt":"2026-10-23T00:00:00-07:00","rankings":false,"screenings":false,"aggregates":false}]}
```

Only explicit numeric Tautulli user IDs are accepted. No wildcards. Missing/invalid files deny everyone. Duplicate IDs and invalid dates/permission types invalidate the file. Future consent dates are inactive until reached. No passwords, Plex tokens, email addresses, or consent evidence are needed in this file. Evidence stays with the owner.

## Initial enrollment on Unraid

The image includes `/app/scripts/enroll-members.mjs`. Run it only for this owner-approved initial enrollment. It reads the existing server-side API key, fetches current active Tautulli users, and emits explicit records granting all three permissions. It excludes email-like usernames and never emits the API key or emails. Future new users remain absent. Do not rerun it over a file containing withdrawals.

On the host, create the private directory with mode 700. Run the script in the new image with the existing `--env-file`, redirect stdout to a temporary file, and only rename it to `consent.json` if the script exits successfully. Use `chmod 600` and ownership UID/GID `1001:1001` so the non-root app can read the bind-mounted file. Directory ownership may remain root because the individual file is bind-mounted, not the parent directory.

## Withdrawal and edits

The consent file is read for every public page/artwork request. Set the corresponding flag to false or remove the member's record. For read-only single-file Docker mounts, edit the host file in place: an atomic replacement can leave an existing bind mount referencing the old inode. Alternatively recreate the container after replacing the file. Do not print or paste the entire file publicly.

Consent changes re-filter history already cached in memory. Page responses and artwork use no-store caching. The app cannot retract screenshots or copies made by previous visitors. Future responses stop including withdrawn contributions.

## Public data boundary

The owner-configured Tautulli Friendly Name is preferred, with the Plex username as fallback. Names must be nonempty, no more than 100 characters, and contain no control characters or @ sign. A valid non-email Plex username remains required; email fields are never used. Avatar source URLs are restricted to approved HTTPS Plex avatar paths with no embedded credentials. Query parameters are stripped before fetching, so cache parameters do not hide valid avatars and tokens are never forwarded. Custom photo URLs may also point to the configured public dashboard origin under /member-photos/; those files are read from a separate runtime mount, never fetched from arbitrary external hosts. Unsupported/missing images use initials. See [custom photo hosting](MEMBER-PHOTOS.md). Artwork is delivered through same-origin routes with opaque HMAC-derived IDs. Movie artwork uses the server-side Tautulli image proxy. Unknown/unapproved asset IDs return 404. Avatar redirects are checked manually and may only lead to HTTPS assets.plex.tv, with at most two redirects and no authentication headers. Poster redirects and non-raster content are rejected, and images are capped at 5 MB. Artwork bypasses Next image optimization caches so withdrawal is checked on each future request.

History is paginated per approved member, with three concurrent members, 10-second request timeouts, and a 60-second in-memory source cache. Consent itself is not cached. A member's history is capped at 5,000 rows; more than that, malformed/duplicate rows, changing pagination totals, or incomplete pages produce an Unavailable state rather than incomplete all-time totals. Only users permitted for a section contribute to that section. Screenings-only users are requested with a date bound as well as being filtered locally. No raw upstream response is sent to clients. No personal data or live consent file is stored in Git or the image.

The first host verification should confirm usernames/counts privately on the LAN, empty post-consent screenings when appropriate, avatars/fallbacks, then the public site. Newly enabled personal analytics should never fall back to demo numbers when unavailable.
