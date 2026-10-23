import test from "node:test";
import assert from "node:assert/strict";
import { formatCheckedTime } from "../src/lib/checked-time.ts";

test("Pacific fallback follows daylight saving rather than fixing the offset to PST", () => {
  assert.equal(formatCheckedTime("2026-10-23T19:03:00Z"), "12:03 PM PDT");
  assert.equal(formatCheckedTime("2026-12-23T19:03:00Z"), "11:03 AM PST");
});
test("visitor time zones format the same instant with the appropriate zone label", () => {
  assert.equal(formatCheckedTime("2026-10-23T19:03:00Z", "America/New_York"), "03:03 PM EDT");
  assert.equal(formatCheckedTime("2026-10-23T19:03:00Z", "UTC"), "07:03 PM UTC");
});
test("invalid time zones fall back to Pacific and invalid timestamps remain explicit", () => {
  assert.equal(formatCheckedTime("2026-10-23T19:03:00Z", "Unknown/Zone"), "12:03 PM PDT");
  assert.equal(formatCheckedTime("invalid"), "Time unavailable");
});
