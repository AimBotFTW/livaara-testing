import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/product/lomaras-ayurvedic-scalp-oil",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
