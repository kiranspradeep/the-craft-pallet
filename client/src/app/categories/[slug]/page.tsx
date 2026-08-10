import { apiGet, apiGetList } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  try {
    const [categoryRes, productsRes] = await Promise.allSettled([
      apiGet<any>(`/api/categories/${slug}`),
      apiGetList<any>(`/api/products?category=${slug}&limit=48`),
    ]);

    if (categoryRes.status !== "fulfilled") return null;

    const products =
      productsRes.status === "fulfilled" ? productsRes.value.data : [];

    const total =
      productsRes.status === "fulfilled"
        ? productsRes.value.meta.total
        : 0;

    return { category: categoryRes.value, products, total };
  } catch {
    return null;
  }
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) notFound();

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Breadcrumb */}
      <div
        className="tcp-container"
        style={{ paddingTop: "28px", paddingBottom: "0" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
          }}
        >
          <Link
            href="/"
            style={{ transition: "color 200ms ease" }}
            className="hover:text-[var(--text-primary)]"
          >
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.75} />
          <Link
            href="/categories"
            style={{ transition: "color 200ms ease" }}
            className="hover:text-[var(--text-primary)]"
          >
            Collections
          </Link>
          <ChevronRight size={13} strokeWidth={1.75} />
          <span style={{ color: "var(--text-primary)" }}>
            {data.category.name}
          </span>
        </div>
      </div>

      {/* Header */}
      <section style={{ padding: "40px 0 56px" }}>
        <div className="tcp-container">
          <p className="tcp-eyebrow">Collection</p>
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
              {data.category.name}
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "var(--text-tertiary)",
                letterSpacing: "0.02em",
              }}
            >
              {data.total} product{data.total !== 1 ? "s" : ""}
            </p>
          </div>

          {data.category.description && (
            <p
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                maxWidth: "560px",
                lineHeight: 1.75,
                marginTop: "16px",
              }}
            >
              {data.category.description}
            </p>
          )}
        </div>
      </section>

      {/* Divider */}
      <div
        className="tcp-container"
        style={{
          borderTop: "1px solid var(--border-soft)",
          marginBottom: "56px",
        }}
      />

      {/* Products */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="tcp-container">
          {data.products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-card)",
                backgroundColor: "var(--surface)",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                No products in this collection yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "40px 28px",
              }}
            >
              {data.products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}