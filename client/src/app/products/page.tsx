// app/products/page.tsx

import { apiGet, apiGetList } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  thumbnail: { url: string; altText: string | null } | null;
  pricingConfig: {
    strategy: string;
    unitPrice: string | null;
    incrementPrice: string | null;
    incrementQuantity: number | null;
    baseUnitPrice: string | null;
    tiers: {
      quantity: number;
      price: string;
      label: string | null;
      isSpecialOffer: boolean;
    }[];
  } | null;
  variants: { id: string; name: string; price: string }[];
}

async function getData(params: Record<string, string>) {
  const query = new URLSearchParams({ limit: "24", ...params }).toString();
  try {
    const [categoriesRes, productsRes] = await Promise.allSettled([
      apiGet<Category[]>("/api/categories"),
      apiGetList<Product>(`/api/products?${query}`),
    ]);

    const categories =
      categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)
        ? categoriesRes.value
        : [];

    const products =
      productsRes.status === "fulfilled" ? productsRes.value.data : [];

    const total =
      productsRes.status === "fulfilled" ? productsRes.value.meta.total : 0;

    return { categories, products, total };
  } catch {
    return { categories: [], products: [], total: 0 };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const filterParams: Record<string, string> = {};
  if (resolved["category"]) filterParams["category"] = resolved["category"];
  if (resolved["search"]) filterParams["search"] = resolved["search"];
  if (resolved["featured"]) filterParams["featured"] = resolved["featured"];

  const { categories, products, total } = await getData(filterParams);

  const isFiltered = !!(resolved["category"] || resolved["search"]);

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <section style={{ padding: "72px 0 48px" }}>
        <div className="tcp-container">
          <p className="tcp-eyebrow">Shop</p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(30px, 5vw, 50px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}
            >
              Our{" "}
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--brand)",
                  fontWeight: 500,
                }}
              >
                Collection
              </em>
            </h1>

            <p
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                maxWidth: "400px",
                lineHeight: 1.7,
              }}
            >
              Handcrafted keepsakes and personalised gifts designed to turn
              every memory into a treasure.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="tcp-container"
        style={{
          borderTop: "1px solid var(--border-soft)",
          marginBottom: "40px",
        }}
      />

      {/* Filters + Products */}
      <section style={{ paddingBottom: "120px" }}>
        <div className="tcp-container">
          {/* Filters */}
          <ProductFilters
            categories={categories}
            currentCategory={resolved["category"] || ""}
            currentSearch={resolved["search"] || ""}
          />

          {/* Result count */}
          <div
            style={{
              marginTop: "28px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                letterSpacing: "0.02em",
              }}
            >
              {isFiltered
                ? `${total} result${total !== 1 ? "s" : ""} found`
                : `${total} product${total !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Empty state */}
          {products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-card)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-card)",
                  backgroundColor: "var(--brand-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: "var(--brand)",
                }}
              >
                <Package size={22} strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                No products found
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            /* Product grid */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "40px 28px",
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}