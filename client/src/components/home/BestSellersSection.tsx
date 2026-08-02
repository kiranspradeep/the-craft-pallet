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
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between"
          style={{ marginBottom: "64px", gap: "24px" }}
        >
          <div>
            <p className="tcp-eyebrow">Most Loved</p>
            <h2 className="tcp-heading">Best Sellers</h2>
          </div>
          <Link href="/products" className="btn-ghost hidden md:inline-flex">
            View All Products
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link href="/products" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}