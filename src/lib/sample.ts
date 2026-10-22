export type Period = "week" | "month" | "year" | "all";
export const periods: Record<Period, string> = { week: "This week", month: "This month", year: "This year", all: "All time" };
export const snapshot = "2026-10-22T12:00:00Z";
export const movies = [
  { id: "signal", title: "The Last Signal", year: 2026, minutes: 118, added: "2026-10-21", color: "signal" },
  { id: "orbit", title: "Beyond the Orbit", year: 2025, minutes: 142, added: "2026-10-19", color: "orbit" },
  { id: "summer", title: "An Endless Summer", year: 2026, minutes: 104, added: "2026-10-17", color: "summer" },
  { id: "midnight", title: "Midnight in Motion", year: 2024, minutes: 96, added: "2026-10-15", color: "midnight" },
];
export const viewers = [
  { id: "alex", name: "Alex", color: "#d8ad70", publicProfile: true, shareActivity: true },
  { id: "jordan", name: "Jordan", color: "#a3b7a4", publicProfile: true, shareActivity: true },
  { id: "riley", name: "Riley", color: "#b6a2cf", publicProfile: true, shareActivity: false },
  { id: "sam", name: "Sam", color: "#91b1d5", publicProfile: true, shareActivity: true },
  { id: "private", name: "Private demo viewer", color: "#aaa", publicProfile: false, shareActivity: false },
];
export type Play = { viewerId: string; movieId: string; date: string; watchedMinutes: number; completed: boolean };
export const plays: Play[] = Array.from({ length: 120 }, (_, i) => {
  const movie = movies[i % movies.length];
  return { viewerId: viewers[(i * 7 + Math.floor(i / 9)) % viewers.length].id, movieId: movie.id,
    date: new Date(Date.UTC(2026, 9, 22 - Math.floor(i * 2.6), 10 + i % 10)).toISOString(),
    watchedMinutes: i % 7 === 0 ? 35 : movie.minutes, completed: i % 7 !== 0 };
});
export function inPeriod(date: string, period: Period) {
  const starts = { week: "2026-10-19", month: "2026-10-01", year: "2026-01-01", all: "0001-01-01" };
  return date >= starts[period] && date <= snapshot;
}
export function duration(minutes: number) { return `${Math.floor(minutes / 60).toLocaleString("en-US")}h ${minutes % 60}m`; }
export function summarize(items: Play[]) { return { minutes: items.reduce((n, p) => n + p.watchedMinutes, 0), completed: items.filter(p => p.completed).length }; }
export function leaderboard(period: Period) {
  return viewers.filter(v => v.publicProfile).map(viewer => ({ ...viewer, ...summarize(plays.filter(p => p.viewerId === viewer.id && inPeriod(p.date, period))) })).sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name));
}
export function recentActivity() { return plays.filter(p => viewers.some(v => v.id === p.viewerId && v.publicProfile && v.shareActivity)).sort((a,b) => b.date.localeCompare(a.date)).slice(0,4); }
export function activity(items: Play[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.UTC(2026,9,16+i)).toISOString().slice(0,10);
    return { day, label: new Date(day + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }), minutes: summarize(items.filter(p => p.date.startsWith(day))).minutes };
  });
}
