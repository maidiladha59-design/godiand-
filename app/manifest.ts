import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Godiand — Ojek, antar, makan di Banda Aceh",
    short_name: "Godiand",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F1F7FB",
    theme_color: "#0A78B5",
    lang: "id",
    categories: ["travel", "food", "shopping"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
