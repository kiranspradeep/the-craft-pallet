import Link from "next/link";
import { formatPrice } from "@/lib/cart";

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

function getStartingPrice(product: Product): string {
  const p = product.pricingConfig;
  if (!p) return "Contact us";

  switch (p.strategy) {
    case "PER_UNIT":
      return p.unitPrice ? formatPrice(p.unitPrice) : "Contact us";
    case "INCREMENTAL_QUANTITY":
      return p.incrementPrice
        ? `From ${formatPrice(p.incrementPrice)}`
        : "Contact us";
    case "TIERED_PRICING": {
      const sorted = [...p.tiers].sort((a, b) => Number(a.price) - Number(b.price));
      if (sorted.length > 0) return `From ${formatPrice(sorted[0].price)}`;
      if (p.baseUnitPrice) return `${formatPrice(p.baseUnitPrice)}/print`;
      return "Contact us";
    }
    case "FIXED_VARIANTS": {
      if (product.variants.length > 0) {
        const prices = product.variants.map((v) => Number(v.price));
        return `From ${formatPrice(Math.min(...prices))}`;
      }
      return "Contact us";
    }
    case "CUSTOM_QUOTE":
      return "Get a quote";
    default:
      return "Contact us";
  }
}

export default function ProductCard({ product }: { product: Product }) {
  const price = getStartingPrice(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group"
      style={{ display: "block" }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "1/1",
          borderRadius: "16px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #F5EFE8 0%, #E8DDD1 100%)",
          marginBottom: "16px",
        }}
      >
        {product.thumbnail ? (
          <img
            src={product.thumbnail.url}
            alt={product.thumbnail.altText || product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 700ms ease",
            }}
            className="group-hover:scale-105"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              opacity: 0.4,
            }}
          >
            📸
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "18px",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: "6px",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </h3>
        {product.shortDescription && (
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              marginBottom: "12px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.shortDescription}
          </p>
        )}
        <p
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--accent)",
          }}
        >
          {price}
        </p>
      </div>
    </Link>
  );
}