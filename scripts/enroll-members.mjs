// Run privately on KenyonVault. Output goes to a private file, never into Git.
const consentedAt = process.argv[2];
if (!consentedAt || !Number.isFinite(Date.parse(consentedAt)) || Date.parse(consentedAt) > Date.now()) {
  console.error("Provide a valid consent timestamp that is not in the future."); process.exit(1);
}
try {
  const base = new URL(process.env.TAUTULLI_URL);
  if (!["http:","https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw Error();
  const url = new URL(`${base.pathname.replace(/\/$/,"")}/api/v2`,base.origin); url.searchParams.set("cmd","get_users");
  if (!process.env.TAUTULLI_API_KEY?.trim()) throw Error();
  const response = await fetch(url,{headers:{"X-Api-Key":process.env.TAUTULLI_API_KEY},redirect:"error",signal:AbortSignal.timeout(10000)});
  const result = await response.json();
  if (!response.ok || result?.response?.result !== "success" || !Array.isArray(result.response.data)) throw Error();
  const members = result.response.data.filter(u => (u.is_active === 1 || u.is_active === "1" || u.is_active === true) && /^\d+$/.test(String(u.user_id)) && typeof u.username === "string" && u.username.trim() && !u.username.includes("@")).map(u => ({userId:String(u.user_id),consentedAt,rankings:true,screenings:true,aggregates:true}));
  if (!members.length || new Set(members.map(m=>m.userId)).size !== members.length) throw Error();
  process.stdout.write(JSON.stringify({version:1,members},null,2)+"\n");
  console.error(`Enrolled ${members.length} current active members. Future members remain excluded.`);
} catch { console.error("Enrollment failed; no consent records were produced. Check configuration and API access."); process.exit(1); }
