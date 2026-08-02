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
    <div style={{ backgroundColor: "var(--bg)", padding: "40px 0 120px" }}>
      {/* Breadcrumb */}
      <div className="tcp-container" style={{ marginBottom: "32px" }}>
        <div
          className="flex items-center"
          style={{
            gap: "8px",
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          <Link href="/" className="hover:text-[var(--brand)]">
            Home
          </Link>
          <ChevronRight size={14} strokeWidth={1.75} />
          <Link href="/products" className="hover:text-[var(--brand)]">
            Products
          </Link>
          <ChevronRight size={14} strokeWidth={1.75} />
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-[var(--brand)]"
          >
            {product.category.name}
          </Link>
          <ChevronRight size={14} strokeWidth={1.75} />
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </div>
      </div>

      {/* Product detail */}
      <ProductDetail product={product} />

      {/* Related */}
      {product.relatedProducts?.length > 0 && (
        <section style={{ marginTop: "100px" }}>
          <div className="tcp-container">
            <div style={{ marginBottom: "40px" }}>
              <p className="tcp-eyebrow">You May Also Like</p>
              <h2 className="tcp-heading">Related Products</h2>
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "24px",
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