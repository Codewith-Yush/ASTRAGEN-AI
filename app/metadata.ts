// app/metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astragen AI",
  description: "AI Content Generator",
  icons: {
    icon: [
      { url: "/favicon.ico" }, // Fallback
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
