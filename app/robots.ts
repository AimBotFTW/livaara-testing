import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/order-success"],
      },
    ],
    sitemap: "https://www.livaara.com/sitemap.xml",
  };
}
