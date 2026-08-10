// app/products/[slug]/page.tsx

import { apiGet } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductDetail from "@/components/products/ProductDetail";
import ProductCard from "@/components/ui/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const product = await apiGet<any>(`/api/products/${slug}`);
    return {
      title: product.metaTitle || `${product.name} — The Craft Pallet`,
      description: product.metaDescription || product.shortDescription,
      keywords: product.metaKeywords,
    };
  } catch {
    return { title: "Product Not Found — The Craft Pallet" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product: any;
  try {
    product = await apiGet<any>(`/api/products/${slug}`);
  } catch {
    notFound();
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        paddingTop: "28px",
        paddingBottom: "120px",
      }}
    >
      {/* Breadcrumb */}
      <div className="tcp-container" style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            flexWrap: "wrap",
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
            href="/products"
            style={{ transition: "color 200ms ease" }}
            className="hover:text-[var(--text-primary)]"
          >
            Products
          </Link>
          <ChevronRight size={13} strokeWidth={1.75} />
          <Link
            href={`/categories/${product.category.slug}`}
            style={{ transition: "color 200ms ease" }}
            className="hover:text-[var(--text-primary)]"
          >
            {product.category.name}
          </Link>
          <ChevronRight size={13} strokeWidth={1.75} />
          <span
            style={{
              color: "var(--text-primary)",
              fontWeight: 500,
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </span>
        </div>
      </div>

      {/* Product detail */}
      <ProductDetail product={product} />

      {/* Related products */}
      {product.relatedProducts?.length > 0 && (
        <section
          style={{
            marginTop: "96px",
            paddingTop: "64px",
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          <div className="tcp-container">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "24px",
                marginBottom: "48px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p className="tcp-eyebrow">You May Also Like</p>
                <h2 className="tcp-heading">Related Products</h2>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "40px 28px",
              }}
            >
              {product.relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}