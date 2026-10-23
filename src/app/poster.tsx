"use client";

import Image from "next/image";
import { useState } from "react";

/** Receives public artwork URLs only. Plex tokens and private URLs stay on the server. */
export function MoviePoster({ src, title, large = false }: { src?: string; title: string; large?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return <div className={large ? "movie-poster movie-poster-large" : "movie-poster"}>
    {src && failedSrc !== src ? <Image src={src} alt={`${title} poster`} fill sizes={large ? "(max-width: 640px) 44vw, 280px" : "64px"} onError={() => setFailedSrc(src)} /> : <span className="poster-fallback" role="img" aria-label={`${title}: poster unavailable`}>CV<span>Poster unavailable</span></span>}
  </div>;
}
