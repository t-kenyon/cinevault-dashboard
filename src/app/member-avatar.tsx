"use client";
import Image from "next/image";
import { useState } from "react";
export function MemberAvatar({name,src,color="#c0c0c0"}:{name:string;src?:string;color?:string}) {
 const [failed,setFailed]=useState<string>();
 return <span className="avatar" style={{background:color}} aria-hidden="true">{src && failed!==src ? <Image src={src} width={30} height={30} alt="" unoptimized onError={()=>setFailed(src)} /> : name[0]}</span>;
}
