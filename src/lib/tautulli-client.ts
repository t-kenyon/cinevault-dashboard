// Internal transport. Import through the server-only data entry point in application code.
export type ConnectionSummary = {
  source: "demo" | "tautulli";
  status: "online" | "unavailable";
  movieCount: number | null;
  streamCount: number | null;
  checkedAt: string;
};

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function integer(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "string" && !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

export async function readTautulliSummary(baseUrl: string, apiKey: string, request: Fetcher = fetch): Promise<ConnectionSummary> {
  const result: ConnectionSummary = { source: "tautulli", status: "unavailable", movieCount: null, streamCount: null, checkedAt: new Date().toISOString() };
  try {
    const base = new URL(baseUrl);
    if (!["http:","https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash || !apiKey.trim()) return result;
    const endpoint = new URL(`${base.pathname.replace(/\/$/,"")}/api/v2`, base.origin);
    async function call(command: "get_server_identity" | "get_libraries" | "get_activity"): Promise<unknown> {
      const url = new URL(endpoint);
      url.searchParams.set("cmd", command);
      const response = await request(url.toString(), {
        headers: { "X-Api-Key": apiKey, Accept: "application/json" },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error("Service unavailable");
      // No raw upstream fields or error messages leave this module.
      const payload: unknown = await response.json();
      if (!record(payload) || !record(payload.response) || payload.response.result !== "success") throw new Error("Service unavailable");
      return payload.response.data;
    }
    const [identity, libraries, activity] = await Promise.allSettled([call("get_server_identity"), call("get_libraries"), call("get_activity")]);
    if (identity.status === "fulfilled") {
      const info = Array.isArray(identity.value) ? identity.value[0] : identity.value;
      if (record(info) && typeof info.version === "string" && info.version.length > 0) result.status = "online";
    }
    if (libraries.status === "fulfilled" && Array.isArray(libraries.value)) {
      let count = 0;
      let valid = true;
      for (const library of libraries.value) {
        if (!record(library)) { valid = false; break; }
        if (library.section_type !== "movie" || library.is_active === 0 || library.is_active === "0" || library.is_active === false) continue;
        const value = integer(library.count);
        if (value === null || !Number.isSafeInteger(count + value)) { valid = false; break; }
        count += value;
      }
      if (valid) result.movieCount = count;
    }
    // Only the server-wide count leaves this module; session details stay private.
    if (activity.status === "fulfilled" && record(activity.value)) {
      result.streamCount = integer(activity.value.stream_count);
    }
  } catch { /* Configuration and transport failures expose no credentials or upstream details. */ }
  return result;
}
