function Reel({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <g className="projector-reel">
      <circle r="11" fill="#191919" stroke="currentColor" strokeWidth="1.8" />
      <circle r="2" fill="currentColor" />
      <g fill="currentColor" opacity=".65">
        <circle cy="-6" r="2.2" /><circle cx="6" r="2.2" />
        <circle cy="6" r="2.2" /><circle cx="-6" r="2.2" />
      </g>
    </g>
  </g>;
}

export function ProjectorIcon({ online }: { online: boolean }) {
  return <svg className={`server-projector ${online ? "projector-online" : "projector-offline"}`} viewBox="0 0 112 66" aria-hidden="true" focusable="false">
    <path className="projector-beam" d="M64 33 108 17v45L64 47Z" fill="currentColor" />
    <Reel x={25} y={18} /><Reel x={50} y={18} />
    <rect x="14" y="29" width="43" height="24" rx="4" fill="#191919" stroke="currentColor" strokeWidth="1.8" />
    <path d="m57 35 8-4v20l-8-4M24 53l-4 7m25-7 4 7M14 61h42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 37h14m-14 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    <path className="projector-lens" d="M65 34v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
