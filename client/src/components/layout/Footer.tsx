"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";

function InstagramIcon({ size = 15 }: { size?: number }) {
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

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const shopLinks = [
    { href: "/products",              label: "All Products"  },
    { href: "/categories",            label: "Collections"   },
    { href: "/products?featured=true",label: "Best Sellers"  },
    { href: "/track",                 label: "Track Order"   },
  ];

  const helpLinks = [
    { href: "/#faq",          label: "FAQ"                    },
    { href: "/#about",        label: "About Us"               },
    { href: "/contact",       label: "Contact Us"             },
    { href: "/refund-policy", label: "Cancellation & Refunds" },
  ];

  const legalLinks = [
    { href: "/privacy",          label: "Privacy Policy"         },
    { href: "/terms",            label: "Terms & Conditions"     },
    { href: "/refund-policy",    label: "Cancellation & Refunds" },
    { href: "/shipping-policy",  label: "Shipping & Delivery"    },
  ];

  const contactLinks = [
    {
      href:     "tel:+918086415357",
      icon:     <Phone size={13} strokeWidth={1.75} />,
      label:    "+91 80864 15357",
      external: false,
    },
    {
      href:     "mailto:kiranspradeep2002@gmail.com",
      icon:     <Mail size={13} strokeWidth={1.75} />,
      label:    "kiranspradeep2002@gmail.com",
      external: false,
    },
    {
      href:     "https://wa.me/918086415357",
      icon:     <WhatsAppIcon size={13} />,
      label:    "WhatsApp Chat",
      external: true,
    },
  ];

  const socialLinks = [
    {
      href:  "https://instagram.com",
      icon:  <InstagramIcon size={15} />,
      label: "Instagram",
    },
    {
      href:  "https://wa.me/918086415357",
      icon:  <WhatsAppIcon size={15} />,
      label: "WhatsApp",
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: "var(--surface)",
        borderTop:       "1px solid var(--border-soft)",
      }}
    >
      <div className="tcp-container" style={{ padding: "72px 32px 36px" }}>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr",
            gap:                 "48px",
            marginBottom:        "56px",
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .footer-grid {
                grid-template-columns: 1.5fr 1fr 1fr 1fr !important;
                gap: 48px !important;
              }
            }
          `}</style>

          <div
            className="footer-grid"
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr",
              gap:                 "48px",
            }}
          >
            {/* Brand */}
            <div>
              <h3
                style={{
                  fontFamily:    "'Playfair Display', serif",
                  fontSize:      "20px",
                  fontWeight:    600,
                  color:         "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  marginBottom:  "14px",
                }}
              >
                The Craft Pallet
              </h3>
              <p
                style={{
                  fontSize:     "13px",
                  lineHeight:   1.75,
                  color:        "var(--text-secondary)",
                  marginBottom: "28px",
                  maxWidth:     "280px",
                }}
              >
                Transform your favourite memories into beautifully crafted
                keepsakes. Premium personalised gifts, made with love.
              </p>

              {/* Social icons */}
              <div style={{ display: "flex", gap: "8px" }}>
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    style={{
                      width:           "36px",
                      height:          "36px",
                      borderRadius:    "4px",
                      border:          "1px solid var(--border)",
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "center",
                      color:           "var(--text-secondary)",
                      transition:      "all 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = "var(--text-primary)";
                      el.style.borderColor     = "var(--text-primary)";
                      el.style.color           = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = "transparent";
                      el.style.borderColor     = "var(--border)";
                      el.style.color           = "var(--text-secondary)";
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
                  fontSize:      "10px",
                  fontWeight:    600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color:         "var(--text-tertiary)",
                  marginBottom:  "20px",
                }}
              >
                Shop
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {shopLinks.map((link) => (
                  <li key={link.href} style={{ marginBottom: "11px" }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize:   "13px",
                        color:      "var(--text-secondary)",
                        transition: "color 200ms ease",
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
                  fontSize:      "10px",
                  fontWeight:    600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color:         "var(--text-tertiary)",
                  marginBottom:  "20px",
                }}
              >
                Help
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {helpLinks.map((link) => (
                  <li key={link.href} style={{ marginBottom: "11px" }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize:   "13px",
                        color:      "var(--text-secondary)",
                        transition: "color 200ms ease",
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
                  fontSize:      "10px",
                  fontWeight:    600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color:         "var(--text-tertiary)",
                  marginBottom:  "20px",
                }}
              >
                Get in Touch
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {contactLinks.map((item) => (
                  <li key={item.label} style={{ marginBottom: "11px" }}>
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      style={{
                        display:    "flex",
                        alignItems: "center",
                        gap:        "9px",
                        fontSize:   "13px",
                        color:      "var(--text-secondary)",
                        transition: "color 200ms ease",
                      }}
                      className="hover:text-[var(--text-primary)]"
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

        {/* ── Legal links row ─────────────────────────────────────────── */}
        <div
          style={{
            paddingBottom: "20px",
            marginBottom:  "20px",
            borderBottom:  "1px solid var(--border-soft)",
            display:       "flex",
            gap:           "20px",
            flexWrap:      "wrap",
          }}
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize:       "12px",
                color:          "var(--text-tertiary)",
                transition:     "color 200ms ease",
                letterSpacing:  "0.02em",
                textDecoration: "none",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "12px",
          }}
          className="md:flex-row md:items-center md:justify-between"
        >
          <p
            style={{
              fontSize:     "12px",
              color:        "var(--text-tertiary)",
              letterSpacing:"0.02em",
            }}
          >
            © {new Date().getFullYear()} The Craft Pallet · Crafted with love
            in India
          </p>

          <span
            style={{
              fontSize:     "11px",
              color:        "var(--text-tertiary)",
              letterSpacing:"0.02em",
            }}
          >
            Developed by{" "}
            <a
              href="https://kiranspradeep.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color:      "var(--brand)",
                fontWeight: 500,
                transition: "color 200ms ease",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              Kiran S Pradeep
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}