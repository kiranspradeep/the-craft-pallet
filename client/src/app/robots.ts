import { MetadataRoute } from "next";

const siteUrl = "https://craftpallet.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/checkout/",
        "/order-confirmation/",
        "/api/",
        "*?order=*",  // Block search query params tracking
        "*?phone=*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}