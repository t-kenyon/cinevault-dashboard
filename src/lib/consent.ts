import "server-only";
import { readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { parseConsentConfig, type MemberConsent } from "./consent-policy";

// Read on each request: changing or withdrawing consent must not wait for a history cache.
export async function readMemberConsents(): Promise<MemberConsent[]> {
  const path = process.env.CINEVAULT_CONSENT_FILE;
  if (!path || !isAbsolute(path)) return [];
  try {
    const content = await readFile(path,"utf8");
    if (Buffer.byteLength(content) > 1_000_000) return [];
    return parseConsentConfig(JSON.parse(content));
  } catch { return []; }
}
