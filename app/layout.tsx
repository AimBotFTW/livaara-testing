import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

import { getHeroProduct } from "@/lib/products";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heroProduct = await getHeroProduct();

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
        <Providers
          initialHeroProduct={{
            id: heroProduct.id,
            name: heroProduct.name,
            price: heroProduct.price,
          }}
        >
          {children}
          <Footer />
        </Providers>

        {/* Microsoft Clarity (global) — App Router safe.
            Loaded after hydration to avoid SSR/hydration issues. */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wmz0vqajbe");
          `}
        </Script>

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-NBTSBFJ2NE"} />
      </body>
    </html>
  );
}
