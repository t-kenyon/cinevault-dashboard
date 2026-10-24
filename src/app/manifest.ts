import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CineVault",
    short_name: "CineVault",
    description: "Dedicated to the preservation of exceptional films.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icons/cinevault-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/cinevault-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
