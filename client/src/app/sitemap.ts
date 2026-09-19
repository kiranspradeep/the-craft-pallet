import type { MetadataRoute } from "next";

const siteUrl = "https://craftpallet.com";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

interface SimpleItem {
  slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─────────────────────────────────────────────
  // Static pages
  // ─────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/track-order`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // ─────────────────────────────────────────────
  // Categories
  // ─────────────────────────────────────────────
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const categoriesRes = await fetch(`${apiUrl}/api/categories`, {
      next: {
        revalidate: 3600,
      },
    });

    if (categoriesRes.ok) {
      const json = await categoriesRes.json();

      const categories: SimpleItem[] = Array.isArray(json.data)
        ? json.data
        : [];

      categoryRoutes = categories.map((category) => ({
        url: `${siteUrl}/categories/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap error (categories):", error);
  }

  // ─────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const productsRes = await fetch(
      `${apiUrl}/api/products?limit=100`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (productsRes.ok) {
      const json = await productsRes.json();

      const products: SimpleItem[] = Array.isArray(json.data)
        ? json.data
        : [];

      productRoutes = products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Sitemap error (products):", error);
  }

  // ─────────────────────────────────────────────
  // Final sitemap
  // ─────────────────────────────────────────────
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
  ];
}