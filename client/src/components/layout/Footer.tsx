"use client";
import Link from "next/link";
import { MessageCircle, Mail, Phone } from "lucide-react";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const shopLinks = [
    { href: "/products", label: "All Products" },
    { href: "/categories", label: "Categories" },
    { href: "/products?featured=true", label: "Best Sellers" },
    { href: "/track-order", label: "Track Order" },
  ];

  const helpLinks = [
    { href: "/#faq", label: "FAQ" },
    { href: "/#about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/", label: "Refund Policy" },
  ];

  return (
    <footer
      style={{
        backgroundColor: "var(--surface)",
        borderTop: "1px solid var(--border-soft)",
      }}
    >
      <div className="tcp-container" style={{ padding: "80px 32px 32px" }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr",
            gap: "48px",
            marginBottom: "56px",
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .footer-grid {
                grid-template-columns: 1.4fr 1fr 1fr 1fr !important;
                gap: 60px !important;
              }
            }
          `}</style>

          <div
            className="footer-grid grid"
            style={{
              gridTemplateColumns: "1fr",
              gap: "48px",
            }}
          >
            {/* Brand */}
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                }}
              >
                The Craft Pallet
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                  marginBottom: "28px",
                  maxWidth: "320px",
                }}
              >
                Transform your favourite memories into beautifully crafted
                keepsakes. Premium personalised gifts made with love.
              </p>
              <div className="flex items-center" style={{ gap: "10px" }}>
                {[
                  {
                    href: "https://instagram.com",
                    icon: <InstagramIcon size={16} />,
                    label: "Instagram",
                  },
                  {
                    href: "https://wa.me/918086415357",
                    icon: <MessageCircle size={16} strokeWidth={1.75} />,
                    label: "WhatsApp",
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "999px",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-primary)",
                      transition: "all 300ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border)";
                    }}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "20px",
                }}
              >
                Shop
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {shopLinks.map((link) => (
                  <li key={link.href} style={{ marginBottom: "12px" }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        transition: "color 200ms",
                      }}
                      className="hover:text-[var(--text-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "20px",
                }}
              >
                Help
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {helpLinks.map((link) => (
                  <li key={link.href} style={{ marginBottom: "12px" }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        transition: "color 200ms",
                      }}
                      className="hover:text-[var(--text-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "20px",
                }}
              >
                Get in Touch
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {[
                  {
                    href: "tel:+918086415357",
                    icon: <Phone size={14} strokeWidth={1.75} />,
                    label: "+91 80864 15357",
                  },
                  {
                    href: "mailto:hello@thecraftpallet.com",
                    icon: <Mail size={14} strokeWidth={1.75} />,
                    label: "hello@thecraftpallet.com",
                  },
                  {
                    href: "https://wa.me/918086415357",
                    icon: <MessageCircle size={14} strokeWidth={1.75} />,
                    label: "WhatsApp Chat",
                  },
                ].map((item) => (
                  <li key={item.label} style={{ marginBottom: "12px" }}>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="flex items-center hover:text-[var(--text-primary)]"
                      style={{
                        gap: "10px",
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        transition: "color 200ms",
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "32px",
            borderTop: "1px solid var(--border-soft)",
          }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
            }}
          >
            © {new Date().getFullYear()} The Craft Pallet · Crafted with love in
            India
          </p>
          <div className="flex items-center" style={{ gap: "24px" }}>
            {["Privacy", "Terms", "Refund Policy"].map((item) => (
              <Link
                key={item}
                href="/"
                style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  transition: "color 200ms",
                }}
                className="hover:text-[var(--text-primary)]"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}