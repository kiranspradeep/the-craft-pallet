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
      productsRes.status === "fulfilled" ? productsRes.value.meta.total : 0;

    return {
      category: categoryRes.value,
      products,
      total,
    };
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
      <div className="tcp-container" style={{ paddingTop: "32px" }}>
        <div
          className="flex items-center"
          style={{ gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}
        >
          <Link href="/" className="hover:text-[var(--brand)]">Home</Link>
          <ChevronRight size={14} strokeWidth={1.75} />
          <Link href="/categories" className="hover:text-[var(--brand)]">Categories</Link>
          <ChevronRight size={14} strokeWidth={1.75} />
          <span style={{ color: "var(--text-primary)" }}>{data.category.name}</span>
        </div>
      </div>

      {/* Header */}
      <section style={{ padding: "40px 0", textAlign: "center" }}>
        <div className="tcp-container">
          <p className="tcp-eyebrow">Collection</p>
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
            {data.category.name}
          </h1>
          {data.category.description && (
            <p
              style={{
                fontSize: "16px",
                color: "var(--text-secondary)",
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              {data.category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products */}
      <section style={{ padding: "40px 0 120px" }}>
        <div className="tcp-container">
          {data.products.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              No products in this category yet.
            </p>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "32px",
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