import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap | The Craft Pallet",
  description:
    "Browse all important pages, product categories, and personalized handcrafted gifts available on The Craft Pallet.",
  alternates: {
    canonical: "https://craftpallet.com/sitemap",
  },
  openGraph: {
    title: "Sitemap | The Craft Pallet",
    description:
      "Browse all important pages, product categories, and personalized handcrafted gifts available on The Craft Pallet.",
    url: "https://craftpallet.com/sitemap",
    type: "website",
  },
};

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

interface SitemapItem {
  slug: string;
  name?: string;
}

interface SitemapResponse {
  data?: SitemapItem[];
}

async function getSitemapData() {
  let categories: SitemapItem[] = [];
  let products: SitemapItem[] = [];

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${apiUrl}/api/categories`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${apiUrl}/api/products?limit=100`, {
        next: { revalidate: 3600 },
      }),
    ]);

    if (categoriesRes.ok) {
      const data: SitemapResponse = await categoriesRes.json();
      categories = Array.isArray(data.data) ? data.data : [];
    }

    if (productsRes.ok) {
      const data: SitemapResponse = await productsRes.json();
      products = Array.isArray(data.data) ? data.data : [];
    }
  } catch (error) {
    console.error("Sitemap page error:", error);
  }

  return { categories, products };
}

export default async function SitemapPage() {
  const { categories, products } = await getSitemapData();

  return (
    <main className="sitemap-container">
      {/* Embedded Style Tag to handle perfect CSS transition, responsive grids and hover states */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sitemap-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }

        .sitemap-header {
          margin-bottom: 64px;
          border-bottom: 1px solid var(--border-soft);
          padding-bottom: 40px;
        }

        .sitemap-eyebrow {
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 12px;
          font-weight: 500;
        }

        .sitemap-title {
          font-family: var(--font-playfair), serif;
          font-size: 48px;
          line-height: 1.15;
          margin-bottom: 16px;
          color: var(--text-primary);
          font-weight: 400;
        }

        .sitemap-description {
          color: var(--text-tertiary);
          line-height: 1.7;
          max-width: 650px;
          font-size: 16px;
        }

        .sitemap-section {
          margin-bottom: 64px;
        }

        .sitemap-section-title {
          font-family: var(--font-playfair), serif;
          font-size: 24px;
          font-weight: 400;
          margin-bottom: 24px;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-soft);
          padding-bottom: 12px;
        }

        .sitemap-grid-links {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px 24px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sitemap-item-link {
          display: inline-flex;
          align-items: center;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 15px;
          line-height: 1.5;
          transition: all 0.25s ease;
          padding: 4px 0;
        }

        .sitemap-item-link:hover {
          color: var(--text-primary);
          transform: translateX(6px);
        }

        .sitemap-item-link::before {
          content: "•";
          color: var(--border-soft);
          margin-right: 10px;
          transition: color 0.25s ease;
        }

        .sitemap-item-link:hover::before {
          color: var(--text-primary);
        }

        .xml-section {
          background-color: var(--bg-secondary, #fafafa);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 32px;
          margin-top: 80px;
        }

        .xml-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .xml-link {
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 500;
          transition: opacity 0.2s ease;
        }

        .xml-link:hover {
          opacity: 0.75;
        }

        @media (max-width: 768px) {
          .sitemap-container {
            padding: 48px 20px 80px;
          }
          
          .sitemap-header {
            margin-bottom: 40px;
            padding-bottom: 24px;
          }

          .sitemap-title {
            font-size: 36px;
          }

          .sitemap-section {
            margin-bottom: 48px;
          }

          .sitemap-section-title {
            font-size: 20px;
            margin-bottom: 18px;
          }

          .sitemap-grid-links {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .xml-section {
            padding: 24px;
            margin-top: 56px;
          }
        }
      ` }} />

      {/* Header */}
      <header className="sitemap-header">
        <p className="sitemap-eyebrow">Explore</p>
        <h1 className="sitemap-title">Sitemap</h1>
        <p className="sitemap-description">
          Browse all important pages, product categories, and
          personalised gifts available on The Craft Pallet.
        </p>
      </header>

      {/* Main Pages */}
      <section className="sitemap-section">
        <h2 className="sitemap-section-title">Main Pages</h2>
        <ul className="sitemap-grid-links">
          <li>
            <Link href="/" className="sitemap-item-link">
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" className="sitemap-item-link">
              Products
            </Link>
          </li>
          <li>
            <Link href="/categories" className="sitemap-item-link">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/contact" className="sitemap-item-link">
              Contact
            </Link>
          </li>
          <li>
            <Link href="/track-order" className="sitemap-item-link">
              Track Order
            </Link>
          </li>
        </ul>
      </section>

      {/* Categories */}
      <section className="sitemap-section">
        <h2 className="sitemap-section-title">Categories</h2>
        {categories.length > 0 ? (
          <ul className="sitemap-grid-links">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="sitemap-item-link"
                >
                  {category.name || category.slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--text-tertiary)" }}>
            No categories available.
          </p>
        )}
      </section>

      {/* Products */}
      <section className="sitemap-section">
        <h2 className="sitemap-section-title">Products</h2>
        {products.length > 0 ? (
          <ul className="sitemap-grid-links">
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className="sitemap-item-link"
                >
                  {product.name || product.slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--text-tertiary)" }}>
            No products available.
          </p>
        )}
      </section>

      {/* Policies */}
      <section className="sitemap-section">
        <h2 className="sitemap-section-title">Policies</h2>
        <ul className="sitemap-grid-links">
          <li>
            <Link href="/privacy" className="sitemap-item-link">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="sitemap-item-link">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link href="/refund-policy" className="sitemap-item-link">
              Refund Policy
            </Link>
          </li>
          <li>
            <Link href="/shipping-policy" className="sitemap-item-link">
              Shipping Policy
            </Link>
          </li>
        </ul>
      </section>

      {/* XML Sitemap */}
      <section className="xml-section">
        <h2 className="xml-title">Search Engine Sitemap</h2>
        <p
          style={{
            color: "var(--text-tertiary)",
            lineHeight: 1.7,
            margin: 0,
            fontSize: "14px",
          }}
        >
          For search engines, you can access the XML sitemap here:{" "}
          <Link href="/sitemap.xml" className="xml-link">
            View XML Sitemap
          </Link>
        </p>
      </section>
    </main>
  );
}