import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}

export default function CategoriesSection({
  categories = [],
}: {
  categories: Category[];
}) {
  if (categories.length === 0) return null;

  return (
    <section
      className="tcp-section"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="tcp-container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "56px",
          }}
        >
          <p className="tcp-eyebrow">Collections</p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <h2 className="tcp-heading">Shop by Category</h2>
            <Link href="/categories" className="btn-ghost">
              View All
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* Grid — editorial stacked layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2px",
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group"
              style={{
                position: "relative",
                aspectRatio: "3/4",
                display: "block",
                overflow: "hidden",
                backgroundColor: "var(--brand-soft)",
              }}
            >
              {/* Background image */}
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 600ms ease",
                  }}
                  className="group-hover:scale-[1.02]"
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageIcon
                    size={40}
                    strokeWidth={1}
                    style={{ color: "var(--border)", opacity: 0.5 }}
                  />
                </div>
              )}

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(43,43,43,0.65) 0%, rgba(43,43,43,0.05) 55%, transparent 100%)",
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "32px 28px",
                  color: "#fff",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.65,
                    marginBottom: "6px",
                  }}
                >
                  {cat.productCount} products
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    marginBottom: "14px",
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                    transition: "gap 250ms ease",
                  }}
                  className="group-hover:gap-[10px]"
                >
                  Explore
                  <ArrowRight size={13} strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}