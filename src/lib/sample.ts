export type Period = "week" | "month" | "year" | "all";
export const periods: Record<Period, string> = { week: "This week", month: "This month", year: "This year", all: "All time" };
export const snapshot = "2026-10-22T12:00:00Z";
// Real film titles and posters for visual demonstration; no real library or viewing data.
export const movies = [
  { id: "general", title: "The General", year: 1926, minutes: 78, added: "2026-10-21", poster: "/posters/general.png" },
  { id: "charade", title: "Charade", year: 1963, minutes: 113, added: "2026-10-19", poster: "/posters/charade.jpg" },
  { id: "house", title: "House on Haunted Hill", year: 1959, minutes: 75, added: "2026-10-17", poster: "/posters/house.jpg" },
  { id: "night", title: "Night of the Living Dead", year: 1968, minutes: 96, added: "2026-10-15", poster: "/posters/night.jpg" },
  { id: "friday", title: "His Girl Friday", year: 1940, minutes: 92, added: "2026-10-13", poster: "/posters/friday.jpg" },
  { id: "phantom", title: "The Phantom of the Opera", year: 1925, minutes: 93, added: "2026-10-11", poster: "/posters/phantom.jpg" },
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
export function recentActivity(items: Play[] = plays, asOf = snapshot) {
  const end = Date.parse(asOf);
  const start = end - 30 * 24 * 60 * 60 * 1000;
  return items.filter(p => {
    const date = Date.parse(p.date);
    return p.completed && date >= start && date <= end && viewers.some(v => v.id === p.viewerId && v.publicProfile && v.shareActivity);
  }).sort((a,b) => b.date.localeCompare(a.date));
}

export function activity(items: Play[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.UTC(2026,9,16+i)).toISOString().slice(0,10);
    return { day, label: new Date(day + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }), minutes: summarize(items.filter(p => p.date.startsWith(day))).minutes };
  });
}

export function daysAgo(date: string, asOf = snapshot) {
  const days = Math.max(0, Math.floor((Date.parse(asOf) - Date.parse(date)) / 86_400_000));
  return days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
}
