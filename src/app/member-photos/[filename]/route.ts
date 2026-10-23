import { approvedHostedMemberPhoto } from "@/lib/member-analytics";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, {params}: {params: Promise<{filename: string}>}) {
  const {filename} = await params;
  return approvedHostedMemberPhoto(filename);
}
