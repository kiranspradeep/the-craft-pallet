import { apiGet } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Package, ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}

async function getCategories() {
  try {
    return await apiGet<Category[]>("/api/categories");
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <section style={{ padding: "72px 0 48px" }}>
        <div className="tcp-container">
          <p className="tcp-eyebrow">Browse</p>
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
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}
            >
              All{" "}
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--brand)",
                  fontWeight: 500,
                }}
              >
                Collections
              </em>
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                maxWidth: "400px",
                lineHeight: 1.7,
              }}
            >
              Discover our curated collections of handcrafted personalised
              gifts.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="tcp-container">
          {categories.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-card)",
                backgroundColor: "var(--surface)",
              }}
            >
              <Package
                size={32}
                strokeWidth={1.25}
                style={{
                  color: "var(--text-tertiary)",
                  margin: "0 auto 16px",
                }}
              />
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                No categories yet
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2px",
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group"
                  style={{
                    display: "block",
                    overflow: "hidden",
                    aspectRatio: "3/4",
                    position: "relative",
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
                        style={{ color: "var(--border)", opacity: 0.4 }}
                      />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(43,43,43,0.68) 0%, rgba(43,43,43,0.08) 55%, transparent 100%)",
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
                        fontSize: "10px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        fontWeight: 500,
                        opacity: 0.65,
                        marginBottom: "6px",
                      }}
                    >
                      {cat.productCount} products
                    </p>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "22px",
                        fontWeight: 500,
                        marginBottom: "12px",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.2,
                      }}
                    >
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p
                        style={{
                          fontSize: "13px",
                          opacity: 0.75,
                          marginBottom: "14px",
                          lineHeight: 1.5,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {cat.description}
                      </p>
                    )}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
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
          )}
        </div>
      </section>
    </div>
  );
}