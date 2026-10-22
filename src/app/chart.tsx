import { duration } from "@/lib/data";
export function ActivityChart({ points }: { points: { day: string; label: string; minutes: number }[] }) {
 const max = Math.max(1, ...points.map(p => p.minutes));
 return <div className="chart" role="img" aria-label={points.map(p => `${p.day}: ${duration(p.minutes)}`).join("; ")}>{points.map(p => <div className="bar-column" key={p.day}><span className="bar-value">{duration(p.minutes)}</span><div className="bar-track"><div className="bar" style={{ height: `${p.minutes / max * 100}%` }} /></div><span>{p.label}</span></div>)}</div>;
}
