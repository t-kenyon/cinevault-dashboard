export function releaseYear(value: unknown): number | undefined {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d{4}$/.test(value))) return;
  const year = Number(value);
  return Number.isInteger(year) && year >= 1800 && year <= 2999 ? year : undefined;
}

export function movieTitle(title: string, year?: number): string {
  const validYear = releaseYear(year);
  return validYear && !title.trimEnd().endsWith(`(${validYear})`) ? `${title} (${validYear})` : title;
}
