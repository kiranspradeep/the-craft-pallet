import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturedStory() {
  return (
    <section
      className="tcp-section"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="tcp-container">
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: "1fr",
            gap: "60px",
          }}
        >
          <style>{`
            @media (min-width: 1024px) {
              .story-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 100px !important;
              }
            }
          `}</style>

          <div
            className="story-grid grid items-center"
            style={{
              gridTemplateColumns: "1fr",
              gap: "60px",
            }}
          >
            {/* Image */}
            <div
              style={{
                position: "relative",
                aspectRatio: "5/6",
                borderRadius: "24px",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, #E8DDD1 0%, #D4C4B3 100%)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "var(--brand)",
                }}
              >
                <div style={{ fontSize: "100px", opacity: 0.4 }}>🖼️</div>
              </div>
            </div>

            {/* Story */}
            <div>
              <p className="tcp-eyebrow">Our Story</p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(32px, 4vw, 48px)",
                  fontWeight: 500,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                  marginBottom: "24px",
                }}
              >
                Every memory
                <br />
                deserves to be
                <br />
                <em
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    color: "var(--brand)",
                    fontWeight: 500,
                  }}
                >
                  preserved beautifully.
                </em>
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  marginBottom: "20px",
                }}
              >
                At The Craft Pallet, we believe photographs are more than just
                images—they're windows into moments that matter. Every polaroid
                we print, every gift we craft, is made with the care your
                memories deserve.
              </p>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  marginBottom: "40px",
                }}
              >
                From premium photo paper to hand-finished touches, we treat
                every order like a personal gift because that's exactly what it
                is.
              </p>
              <Link href="/products" className="btn-primary">
                Explore Our Craft
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}