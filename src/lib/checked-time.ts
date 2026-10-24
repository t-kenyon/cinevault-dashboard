export const PACIFIC_TIME_ZONE = "America/Los_Angeles";

export function formatCheckedTime(value: string, timeZone = PACIFIC_TIME_ZONE): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Time unavailable";
  const options: Intl.DateTimeFormatOptions = {
    timeZone, hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  };
  try {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {...options, timeZone: PACIFIC_TIME_ZONE}).format(date);
  }
}
