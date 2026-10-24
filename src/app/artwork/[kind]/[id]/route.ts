import { approvedArtwork } from "@/lib/member-analytics";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{kind:string;id:string}>}) {
 const {kind,id}=await params;
 if(!["member","movie"].includes(kind) || !/^[a-f0-9]{32}$/.test(id))return new Response(null,{status:404,headers:{"Cache-Control":"private, no-store"}});
 return approvedArtwork(kind,id);
}
