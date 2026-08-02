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
  const query = new URLSearchParams({
    limit: "24",
    ...params,
  }).toString();

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

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Hero */}
      <section
        style={{
          padding: "80px 0 40px",
          backgroundColor: "var(--bg)",
        }}
      >
        <div className="tcp-container text-center">
          <p className="tcp-eyebrow">Shop</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: "16px",
            }}
          >
            Our{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              Collection
            </em>
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Handcrafted keepsakes and personalised gifts designed to turn every
            memory into a treasure.
          </p>
        </div>
      </section>

      {/* Filters + Products */}
      <section style={{ padding: "40px 0 120px" }}>
        <div className="tcp-container">
          <ProductFilters
            categories={categories}
            currentCategory={resolved["category"] || ""}
            currentSearch={resolved["search"] || ""}
          />

          <div
            style={{
              marginTop: "32px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            Showing {products.length} of {total} products
          </div>

          {products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                borderRadius: "24px",
                border: "1px solid var(--border-soft)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "999px",
                  backgroundColor: "var(--brand-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: "var(--brand)",
                }}
              >
                <Package size={24} strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                No products found
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "32px",
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