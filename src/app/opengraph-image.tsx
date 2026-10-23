import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "CineVault metallic gold and silver logo on a dark background";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/cinevault-logo-final.png"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#080808" }}>
      {/* The original logo is embedded locally so generation needs no external service. */}
      <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={1000} height={1000 / 3} style={{ objectFit: "contain" }} />
    </div>,
    size,
  );
}
