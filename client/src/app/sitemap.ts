import { MetadataRoute } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://craftpallet.com";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

interface SimpleItem {
  slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/products",
    "/categories",
    "/contact",
    "/track-order",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/shipping-policy",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categoriesRes = await fetch(`${apiUrl}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (categoriesRes.ok) {
      const json = await categoriesRes.json();
      const categories: SimpleItem[] = json.data || [];
      categoryRoutes = categories.map((cat) => ({
        url: `${siteUrl}/categories/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error("Sitemap error loading categories:", err);
  }

  try {
    const productsRes = await fetch(`${apiUrl}/api/products?limit=250`, {
      next: { revalidate: 3600 },
    });
    if (productsRes.ok) {
      const json = await productsRes.json();
      const products: SimpleItem[] = json.data || [];
      productRoutes = products.map((prod) => ({
        url: `${siteUrl}/products/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (err) {
    console.error("Sitemap error loading products:", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}