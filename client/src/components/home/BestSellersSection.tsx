import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

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

export default function BestSellersSection({
  products = [],
}: {
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section
      className="tcp-section"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="tcp-container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "56px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="tcp-eyebrow">Most Loved</p>
            <h2 className="tcp-heading">Best Sellers</h2>
          </div>
          <Link href="/products" className="btn-ghost">
            View All Products
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        {/* Product Grid */}
        <style>{`
  @media (max-width: 640px) {
    .best-sellers-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 24px 14px !important;
    }
  }
`}</style>

<div
  className="best-sellers-grid"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "40px 28px",
  }}
>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div
          style={{
            marginTop: "48px",
            textAlign: "center",
            display: "none",
          }}
          className="mobile-cta"
        >
          <Link href="/products" className="btn-secondary">
            View All Products
          </Link>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-cta { display: block !important; }
          }
        `}</style>
      </div>
    </section>
  );
}