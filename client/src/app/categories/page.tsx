import { apiGet } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

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
      {/* Hero */}
      <section style={{ padding: "80px 0 40px", textAlign: "center" }}>
        <div className="tcp-container">
          <p className="tcp-eyebrow">Browse</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            All{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              Categories
            </em>
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Discover our curated collections of handcrafted personalised gifts.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: "40px 0 120px" }}>
        <div className="tcp-container">
          {categories.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                borderRadius: "24px",
                border: "1px solid var(--border-soft)",
                backgroundColor: "var(--surface)",
              }}
            >
              <Package size={40} strokeWidth={1.5} style={{ color: "var(--text-tertiary)", margin: "0 auto 16px" }} />
              <p style={{ color: "var(--text-secondary)" }}>No categories yet</p>
            </div>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "32px",
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group"
                  style={{
                    display: "block",
                    borderRadius: "24px",
                    overflow: "hidden",
                    aspectRatio: "1/1",
                    position: "relative",
                  }}
                >
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

                  {!cat.imageUrl && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "80px",
                        opacity: 0.4,
                      }}
                    >
                      🖼️
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(43,43,43,0.75) 0%, transparent 60%)",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "32px",
                      color: "#fff",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        opacity: 0.85,
                        marginBottom: "10px",
                      }}
                    >
                      {cat.productCount} products
                    </p>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "28px",
                        fontWeight: 500,
                        marginBottom: "8px",
                      }}
                    >
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p
                        style={{
                          fontSize: "13px",
                          opacity: 0.85,
                          marginBottom: "16px",
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
                      className="inline-flex items-center"
                      style={{
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Explore Collection
                      <ArrowRight size={14} strokeWidth={2} />
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