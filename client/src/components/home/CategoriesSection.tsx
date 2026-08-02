import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="tcp-container">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between"
          style={{ marginBottom: "64px", gap: "24px" }}
        >
          <div style={{ maxWidth: "600px" }}>
            <p className="tcp-eyebrow">Collections</p>
            <h2 className="tcp-heading">Shop by Category</h2>
            <p
              style={{
                marginTop: "16px",
                fontSize: "16px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              Every category is thoughtfully curated to help you find the
              perfect gift for every memory.
            </p>
          </div>
          <Link href="/categories" className="btn-ghost hidden md:inline-flex">
            View All Collections
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

        {/* Grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group"
              style={{
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                aspectRatio: "4/5",
                display: "block",
                transition: "transform 400ms ease",
              }}
            >
              {/* Background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: cat.imageUrl
                    ? `url(${cat.imageUrl}) center/cover`
                    : "linear-gradient(135deg, #F5EFE8 0%, #E8DDD1 100%)",
                  transition: "transform 700ms ease",
                }}
                className="group-hover:scale-105"
              />

              {/* Placeholder icon */}
              {!cat.imageUrl && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "72px",
                    opacity: 0.5,
                  }}
                >
                  🖼️
                </div>
              )}

              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(43,43,43,0.7) 0%, rgba(43,43,43,0.2) 50%, transparent 100%)",
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "28px",
                  color: "#fff",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                    marginBottom: "8px",
                  }}
                >
                  {cat.productCount} products
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "26px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {cat.name}
                </h3>
                <span
                  className="inline-flex items-center"
                  style={{
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    opacity: 0.9,
                    transition: "gap 300ms ease",
                  }}
                >
                  Explore
                  <ArrowRight
                    size={14}
                    strokeWidth={2}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}