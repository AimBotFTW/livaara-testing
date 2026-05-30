import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.livaara.com"),
  title: {
    default: "LIVAARA — Lomaras™ Ayurvedic Scalp Oil | Crafted Through Generations",
    template: "%s | LIVAARA",
  },
  description:
    "Lomaras™ by LIVAARA — cold-infused over 7 days with Bhringraj, Amla, Neem, Brahmi & Methi. Rooted in 38 years of Vaidya-led Ayurvedic practice. 100ml amber glass. ₹599. Free shipping across India.",
  keywords: [
    "ayurvedic hair oil",
    "scalp oil india",
    "bhringraj oil",
    "hair growth oil",
    "ayurvedic scalp treatment",
    "lomaras oil",
    "livaara",
    "natural hair oil india",
  ],
  openGraph: {
    title: "LIVAARA — Crafted Through Generations",
    description:
      "An Ayurvedic scalp ritual born not in a lab, but in 38 years of living, healing practice. Bhringraj, Amla, Neem. ₹599.",
    type: "website",
    url: "https://www.livaara.com",
    siteName: "LIVAARA",
    images: [
      {
        url: "/images/lomaras-bottle.jpg",
        width: 1024,
        height: 1280,
        alt: "Lomaras™ Ayurvedic Scalp Oil by LIVAARA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIVAARA — Lomaras™ Ayurvedic Scalp Oil",
    description:
      "Cold-infused over seven days with Bhringraj, Amla & Neem. 38 years of Ayurvedic craft. ₹599.",
    images: ["/images/lomaras-bottle.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.livaara.com",
  },
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "LIVAARA",
              url: "https://www.livaara.com",
              logo: "https://www.livaara.com/images/lomaras-bottle.jpg",
              description:
                "Livaara crafts Ayurvedic hair and scalp rituals rooted in 38 years of Vaidya-led practice. Our flagship product, Lomaras™, is cold-infused over seven days with Bhringraj, Amla, Neem, Brahmi and Methi.",
              areaServed: "IN",
              inLanguage: "en-IN",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                areaServed: "IN",
                availableLanguage: ["English", "Hindi"],
              },
              sameAs: ["https://www.instagram.com/livaara__"],
            }),
          }}
        />

        {/* Microsoft Clarity (global) — App Router safe.
            Loaded after hydration to avoid SSR/hydration issues. */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
