import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BrewCircle",
    short_name: "BrewCircle",
    description: "Enter café bill numbers, pay demo invoices, rate drinks, and build your Coffee DNA.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f2f2",
    theme_color: "#171717",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
