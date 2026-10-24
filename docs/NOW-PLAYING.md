# Now Playing in Recent Screenings

Active movie sessions appear before completed screenings in the existing four-card horizontal rail. Each card shows its poster, member display name/avatar, Playing/Paused/Buffering state, and the reported playback position in `HH:MM:SS`. Total duration and a progress bar are shown when a valid duration is available. Tautulli offsets/durations are milliseconds and are converted to whole seconds; playback position is not interpreted as recorded watch time.

## Visibility

Live movie sharing uses the current member's existing `screenings` permission and effective consent date. Ranking or aggregate permission alone never enables live sharing. Future, missing, withdrawn, inactive, and nonparticipating members are excluded. For live sessions, permission is evaluated when the stream is observed; the post-consent start-date rule still applies to historical completed screenings. TV/music/photo sessions are excluded.

The server fetches `get_activity` with the API key in a header and reduces it to an approved DTO. Public IDs are HMAC-derived. Browser responses contain only the approved movie title, local artwork paths, approved display name, playback state/position/duration, and a check timestamp. Raw session IDs, devices, IP addresses, Plex usernames behind friendly names, tokens, and upstream artwork URLs are not forwarded. There is no playback-control endpoint.

## Refresh and failure handling

The dedicated `/api/now-playing` endpoint returns private/no-store responses. Visible pages poll every 15 seconds; hidden pages pause polling and refresh on return. Requests do not overlap, time out after 10 seconds, and are aborted when the component is removed. Server-side activity data is cached for 10 seconds to share requests across visitors/artwork lookups. Depending on timing, a changed session can take roughly 25 seconds to be reflected. Consent is re-read on every endpoint and artwork request independently of the source cache.

The UI uses reported snapshots rather than advancing a guessed playback timer. Pausing/seeking therefore follow Tautulli's next report. Ended sessions leave the active list. Completed history and aggregate totals keep their existing page-refresh behavior and 60-second source cache; an active card never counts as a completed screening or directly changes totals. A failure clears active cards and shows a short unavailable message while preserving completed screenings. Activity failures do not invalidate historical analytics.

Artwork for active movies is authorized through the same current-consent checks as completed movie artwork. Custom hosted member photos support active-only eligible members too. The app cannot recall information already received by a browser, but future responses cease exposing withdrawn sessions and photos.

## Preview and deployment

Demo mode includes one explicitly marked fictional active movie for design review and does not poll a live source. Live mode requires the same existing Tautulli/member-consent configuration; no new key, consent-file format, port, or Docker mount is required. Keep the existing custom photo folder mount when updating. Tautulli's aggregate server stream count remains independent of which sessions may be publicly identified here.

Reference: [Tautulli get_activity](https://docs.tautulli.com/extending-tautulli/api-reference#get_activity).
