import { releaseYear } from "./movie-metadata.ts";
import { permits, type MemberConsent } from "./consent-policy.ts";
import type { SafeUser } from "./analytics-policy.ts";

export type PlaybackState = "playing" | "paused" | "buffering";
export type PublicNowPlaying = {
  id: string; title: string; year?: number; poster: string; name: string; photo?: string;
  state: PlaybackState; positionSeconds: number; durationSeconds: number | null;
};
export type NowPlayingFeed = {state: "live" | "unavailable" | "demo"; items: PublicNowPlaying[]; checkedAt: string};
type SafeSession = {
  sessionKey: string; userId: string; movieId: string; title: string; year?: number;
  state: PlaybackState; positionSeconds: number; durationSeconds: number | null;
};
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
function integer(value: unknown): number | undefined {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+$/.test(value))) return;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : undefined;
}

export function safeNowPlaying(data: unknown, users: SafeUser[], consents: MemberConsent[], now: string): SafeSession[] {
  if (!object(data) || !Array.isArray(data.sessions) || data.sessions.length > 200) throw Error("Unavailable");
  const result: SafeSession[] = [];
  const seen = new Set<string>();
  for (const session of data.sessions) {
    if (!object(session) || session.media_type !== "movie") continue;
    const userId = integer(session.user_id), movieId = integer(session.rating_key), key = integer(session.session_key);
    if (userId === undefined || movieId === undefined || key === undefined) continue;
    if (!users.some(user => user.userId === String(userId))) continue;
    // Live sharing uses current screening permission; historical start-date rules stay unchanged.
    if (!permits(consents.find(consent => consent.userId === String(userId)), "screenings", now, now)) continue;
    if (!["playing", "paused", "buffering"].includes(String(session.state))) continue;
    if (typeof session.full_title !== "string" || !session.full_title.trim() || session.full_title.length > 500) continue;
    const position = integer(session.view_offset);
    const duration = integer(session.duration);
    if (position === undefined || (duration !== undefined && duration > 0 && position > duration)) continue;
    const unique = `${userId}:${key}`;
    if (seen.has(unique)) continue;
    seen.add(unique);
    result.push({
      sessionKey: String(key), userId: String(userId), movieId: String(movieId), title: session.full_title.trim(),
      ...(releaseYear(session.year) ? {year:releaseYear(session.year)} : {}),
      state: session.state as PlaybackState, positionSeconds: Math.floor(position / 1000),
      durationSeconds: duration && duration >= 1000 ? Math.floor(duration / 1000) : null,
    });
  }
  const priority = {playing: 0, buffering: 1, paused: 2};
  return result.sort((a,b) => priority[a.state] - priority[b.state]);
}

export function playbackTimestamp(seconds: number): string {
  const n = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${String(Math.floor(n / 3600)).padStart(2,"0")}:${String(Math.floor(n / 60) % 60).padStart(2,"0")}:${String(n % 60).padStart(2,"0")}`;
}
