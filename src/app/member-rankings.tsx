"use client";

import { useState } from "react";

type Member = { id: string; name: string; color: string; minutes: number; completed: number };
function watchTime(minutes: number) { return `${Math.floor(minutes / 60).toLocaleString("en-US")}h ${minutes % 60}m`; }
export function MemberRankings({ members }: { members: Member[] }) {
 const [expanded, setExpanded] = useState(false);
 const visible = expanded ? members : members.slice(0,5);
 return <div className="leaderboard-overview"><section className="panel leaderboard" id="leaderboard"><div className="section-heading"><div><p className="eyebrow">THE FRONT ROW</p><h2>Member Rankings</h2></div><span className="muted">All time · {members.length} participating members</span></div><div className="table-wrap"><table id="member-rankings-table"><caption className="sr-only">Member watch-time rankings: All time</caption><thead><tr><th scope="col">Rank / member</th><th scope="col">Completed movies</th><th scope="col">Watch time</th></tr></thead><tbody>{visible.map((member,i) => <tr key={member.id}><td><span className="rank">{String(i+1).padStart(2,"0")}</span><span className="member-name"><span className="avatar" style={{ background: member.color }} aria-hidden="true">{member.name[0]}</span>{member.name}</span></td><td>{member.completed}</td><td className="watch-time">{watchTime(member.minutes)}</td></tr>)}</tbody></table></div>{members.length > 5 && <button className="member-toggle" type="button" aria-expanded={expanded} aria-controls="member-rankings-table" onClick={() => setExpanded(!expanded)}>{expanded ? "Show top 5" : "View all members"}</button>}<p className="note">Fictional members. Real members will appear only with permission.</p></section></div>;
}
