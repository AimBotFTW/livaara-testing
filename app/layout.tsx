import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIVAARA — Lomaras Ayurvedic Scalp Oil | Crafted Through Generations",
  description:
    "Premium Ayurvedic scalp ritual. Cold-infused over seven days with Bhringraj, Amla & Neem. 38 years of Vaidya-led practice. ₹599.",
  openGraph: {
    title: "LIVAARA — Crafted Through Generations",
    description:
      "An Ayurvedic scalp ritual born not in a lab, but in 38 years of living, healing practice.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-NBTSBFJ2NE"} />
      </body>
    </html>
  );
}
