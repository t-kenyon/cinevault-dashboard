import "server-only";
import { readTautulliSummary, type ConnectionSummary } from "./tautulli-client";

let cached: { expires: number; value: Promise<ConnectionSummary> } | undefined;

export async function connectionSummary(): Promise<ConnectionSummary> {
  if (process.env.CINEVAULT_DATA_MODE !== "tautulli") {
    return { source: "demo", status: "online", movieCount: 2486, streamCount: 3, checkedAt: "2026-10-22T12:00:00Z" };
  }
  if (!cached || cached.expires < Date.now()) {
    cached = { expires: Date.now() + 30_000, value: readTautulliSummary(process.env.TAUTULLI_URL ?? "", process.env.TAUTULLI_API_KEY ?? "") };
  }
  return cached.value;
}
