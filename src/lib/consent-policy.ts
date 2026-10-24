import { hostedMemberPhotoPath } from "./member-photo-policy.ts";

export type ConsentPermission = "rankings" | "screenings" | "aggregates";
export type MemberConsent = {
  userId: string;
  consentedAt: string;
  rankings: boolean;
  screenings: boolean;
  aggregates: boolean;
};
export type PublicIdentity = { name: string; photo?: string };

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function parseConsentConfig(value: unknown): MemberConsent[] {
  if (!object(value) || value.version !== 1 || !Array.isArray(value.members)) throw Error("Invalid consent configuration");
  const ids = new Set<string>();
  return value.members.map(member => {
    if (!object(member) || typeof member.userId !== "string" || !/^\d+$/.test(member.userId) || ids.has(member.userId)) throw Error("Invalid consent configuration");
    if (typeof member.consentedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(member.consentedAt) || !Number.isFinite(Date.parse(member.consentedAt))) throw Error("Invalid consent configuration");
    for (const permission of ["rankings","screenings","aggregates"]) {
      if (member[permission] !== undefined && typeof member[permission] !== "boolean") throw Error("Invalid consent configuration");
    }
    ids.add(member.userId);
    return {userId:member.userId,consentedAt:member.consentedAt,rankings:member.rankings === true,screenings:member.screenings === true,aggregates:member.aggregates === true};
  });
}

export function permits(member: MemberConsent | undefined, permission: ConsentPermission, now: string, screeningStartedAt?: string): boolean {
  if (!member || !member[permission]) return false;
  const time = Date.parse(now);
  const consent = Date.parse(member.consentedAt);
  if (!Number.isFinite(time) || !Number.isFinite(consent) || consent > time) return false;
  if (permission !== "screenings") return true;
  const start = Date.parse(screeningStartedAt ?? "");
  return Number.isFinite(start) && start >= consent && start >= time - 30 * 86400000 && start <= time;
}

// A valid Plex username remains required; owner-configured friendly names take precedence.
export function publicPlexIdentity(user: unknown, publicUrl?: string): PublicIdentity | undefined {
  if (!object(user) || typeof user.username !== "string") return;
  const username = user.username.trim();
  if (!username || username.length > 100 || /[@\u0000-\u001f\u007f]/.test(username)) return;
  const friendly = typeof user.friendly_name === "string" ? user.friendly_name.trim() : "";
  const name = friendly && friendly.length <= 100 && !/[@\u0000-\u001f\u007f]/.test(friendly) ? friendly : username;
  let photo: string | undefined;
  if (typeof user.thumb === "string") {
    try {
      const url = new URL(user.thumb);
      if (url.protocol === "https:" && ["plex.tv","www.plex.tv"].includes(url.hostname) && /^\/users\/[^/]+\/avatar\/?$/.test(url.pathname) && !url.hash && !url.username && !url.password && !url.port) {
        // Fetch the public avatar endpoint without forwarding cache parameters or tokens.
        url.search = "";
        photo = url.toString();
      }
    } catch { /* Unsupported images use initials. */ }
  }
  if (!photo && typeof user.thumb === "string") photo = hostedMemberPhotoPath(user.thumb, publicUrl);
  return {name, ...(photo ? {photo} : {})};
}
