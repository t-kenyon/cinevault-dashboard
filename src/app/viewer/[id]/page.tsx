import Link from "next/link";
import { notFound } from "next/navigation";
import { activity, duration, plays, summarize, viewers } from "@/lib/data";
import { ActivityChart } from "../../chart";
export default async function Viewer({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const viewer = viewers.find(v => v.id === id && v.publicProfile);
 if (!viewer) notFound();
 const history = plays.filter(p => p.viewerId === id);
 const totals = summarize(history);
 return <main id="main"><Link href="/" className="back">← Back to the viewing room</Link><section className="viewer-hero"><p className="eyebrow">FICTIONAL MEMBER PROFILE</p><h1>{viewer.name}’s<br /><em>viewing room.</em></h1><p className="intro">A little time at the movies. All statistics below are sample data.</p></section><section className="stats profile-stats">{[[duration(totals.minutes), "All-time watch time"], [String(totals.completed), "Completed movies"], [String(history.length), "Total movie plays"]].map(([value,label]) => <article key={label}><p className="eyebrow">{label}</p><strong>{value}</strong></article>)}</section><section className="panel"><p className="eyebrow">VIEWING TRENDS</p><h2>A week in the life</h2><ActivityChart points={activity(history)} /><p className="note">Oct 16–22, 2026 · UTC · minutes watched per day</p></section><p className="note">Public profiles and sharing recent activity are separate permissions. Real profiles remain disabled until consent is recorded.</p></main>;
}
