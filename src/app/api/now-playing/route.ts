import { nowPlayingAnalytics } from "@/lib/member-analytics";

export const dynamic = "force-dynamic";
export async function GET() {
  const {state,items,checkedAt} = await nowPlayingAnalytics();
  return Response.json({state,items,checkedAt}, {headers:{"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
