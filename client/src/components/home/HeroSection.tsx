import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg)",
        padding: "80px 0 120px",
        position: "relative",
        overflow: "hidden",
      }}
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
              .hero-grid {
                grid-template-columns: 1.1fr 1fr !important;
                gap: 100px !important;
              }
            }
          `}</style>

          <div
            className="hero-grid grid items-center animate-fade-up"
            style={{
              gridTemplateColumns: "1fr",
              gap: "60px",
            }}
          >
            {/* Left */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "var(--brand-soft)",
                  borderRadius: "999px",
                  marginBottom: "32px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "var(--brand)",
                    borderRadius: "999px",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--brand)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Handcrafted Personalised Gifts
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(40px, 6vw, 68px)",
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  marginBottom: "28px",
                }}
              >
                Turn Memories
                <br />
                Into{" "}
                <em
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    fontStyle: "italic",
                    color: "var(--brand)",
                  }}
                >
                  Keepsakes
                </em>
              </h1>

              <p
                style={{
                  fontSize: "17px",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                  marginBottom: "40px",
                  maxWidth: "480px",
                }}
              >
                Premium polaroids, photo prints, and personalised gifts crafted
                with love. Upload your photos and receive beautifully printed
                memories at your door.
              </p>

              {/* Rating */}
              <div
                className="flex items-center"
                style={{ gap: "16px", marginBottom: "40px" }}
              >
                <div className="flex -space-x-2">
                  {["P", "R", "A", "S"].map((letter, i) => (
                    <div
                      key={i}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "999px",
                        border: "2px solid var(--bg)",
                        backgroundColor: `hsl(${i * 40 + 20}, 30%, 65%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center" style={{ gap: "4px" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="var(--accent)"
                        color="var(--accent)"
                      />
                    ))}
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginLeft: "6px",
                      }}
                    >
                      4.9
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      marginTop: "2px",
                    }}
                  >
                    from 500+ happy customers
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center" style={{ gap: "16px" }}>
                <Link href="/products" className="btn-primary">
                  Shop Collection
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
                <Link href="/#about" className="btn-secondary">
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative" style={{ minHeight: "560px" }}>
              {/* Main hero image container */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4/5",
                  borderRadius: "24px",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #F5EFE8 0%, #E8DDD1 100%)",
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
                    padding: "48px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "80px",
                      marginBottom: "24px",
                      opacity: 0.9,
                    }}
                    className="animate-float"
                  >
                    📸
                  </div>
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: 500,
                      color: "var(--brand)",
                      lineHeight: 1.3,
                      fontStyle: "italic",
                    }}
                  >
                    Your Memories,
                    <br />
                    Beautifully Printed
                  </p>
                </div>
              </div>

              {/* Floating card top-left */}
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "-24px",
                  padding: "16px 20px",
                  backgroundColor: "var(--surface)",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border-soft)",
                  zIndex: 10,
                }}
                className="animate-float"
              >
                <div className="flex items-center" style={{ gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "var(--brand-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    ✨
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      Mini Polaroids
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      36 prints for ₹99
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating card bottom-right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "15%",
                  right: "-24px",
                  padding: "16px 20px",
                  backgroundColor: "var(--surface)",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border-soft)",
                  zIndex: 10,
                }}
                className="animate-float"
              >
                <div className="flex items-center" style={{ gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(142,159,130,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--success)",
                      fontSize: "20px",
                      fontWeight: 600,
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      Order Delivered
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      7–10 working days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}