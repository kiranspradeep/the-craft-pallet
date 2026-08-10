import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

export default function FeaturedStory() {
  return (
    <section
      id="about"
      className="tcp-section"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="tcp-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "64px",
            alignItems: "center",
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
            className="story-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "64px",
              alignItems: "center",
            }}
          >
            {/* Image */}
            <div
              style={{
                position: "relative",
                aspectRatio: "4/5",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                backgroundColor: "var(--brand-soft)",
              }}
            >
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
            </div>

            {/* Text */}
            <div style={{ maxWidth: "520px" }}>
              <p className="tcp-eyebrow">Our Story</p>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(30px, 4vw, 46px)",
                  fontWeight: 500,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                  marginBottom: "28px",
                }}
              >
                Every memory deserves
                <br />
                to be{" "}
                <em
                  style={{
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
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  marginBottom: "20px",
                }}
              >
                At The Craft Pallet, we believe photographs are more than
                images — they are windows into moments that matter. Every
                polaroid we print, every gift we craft, is made with the
                care your memories deserve.
              </p>

              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  marginBottom: "40px",
                }}
              >
                From premium photo paper to hand-finished touches, we treat
                every order like a personal gift — because that's exactly
                what it is.
              </p>

              <Link href="/products" className="btn-ghost">
                Explore Our Craft
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}