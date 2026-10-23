import test from "node:test";
import assert from "node:assert/strict";
import { daysAgo, leaderboard, recentActivity, inPeriod, summarize, duration, plays, viewers, activity } from "../src/lib/sample.ts";
test("leaderboard honors period boundaries and excludes private members", () => {
  for (const period of ["week", "month", "year", "all"]) {
    const rows = leaderboard(period);
    assert.ok(rows.every(v => v.id !== "private"));
    assert.ok(rows.every((v,i) => i === 0 || rows[i-1].minutes >= v.minutes));
    for (const v of rows) assert.deepEqual({minutes:v.minutes,completed:v.completed}, summarize(plays.filter(p => p.viewerId === v.id && inPeriod(p.date,period))));
  }
  assert.equal(inPeriod("2026-10-18T23:59:59Z", "week"), false);
  assert.equal(inPeriod("2026-10-19T00:00:00Z", "week"), true);
  assert.equal(inPeriod("2026-10-23T00:00:00Z", "all"), false);
});
test("activity requires both public profile and activity consent", () => {
 assert.ok(recentActivity().length > 0);
 assert.ok(recentActivity().every(p => viewers.some(v => v.id === p.viewerId && v.publicProfile && v.shareActivity)));
});
test("partial plays add time without counting as completed movies", () => {
 assert.deepEqual(summarize([{ watchedMinutes:35, completed:false }, { watchedMinutes:118, completed:true }]), {minutes:153,completed:1});
 assert.equal(duration(153), "2h 33m");
 assert.equal(activity([]).length,7);
 assert.ok(activity([]).every(p => p.minutes === 0));
});

test("recent activity includes all completed, consented plays in the rolling 30 days", () => {
 const asOf = "2026-10-22T12:00:00Z";
 const start = Date.parse(asOf) - 30*24*60*60*1000;
 const expected = plays.filter(p => p.completed && Date.parse(p.date) >= start && Date.parse(p.date) <= Date.parse(asOf) && viewers.some(v => v.id === p.viewerId && v.publicProfile && v.shareActivity)).sort((a,b) => b.date.localeCompare(a.date));
 assert.deepEqual(recentActivity(),expected);
 assert.ok(recentActivity().length > 4);
 const base = { viewerId:"alex", movieId:"general", completed:true, watchedMinutes:78 };
 const dates = ["2026-09-22T11:59:59Z", "2026-09-22T12:00:00Z", asOf, "2026-10-22T12:00:01Z"];
 assert.deepEqual(recentActivity(dates.map(date => ({ ...base, date })),asOf).map(p => p.date),[asOf,dates[1]]);
});

test("relative play labels handle today, singular, and plural days", () => {
 assert.equal(daysAgo("2026-10-22T10:00:00Z"), "Today");
 assert.equal(daysAgo("2026-10-21T12:00:00Z"), "1 day ago");
 assert.equal(daysAgo("2026-10-15T12:00:00Z"), "7 days ago");
});
