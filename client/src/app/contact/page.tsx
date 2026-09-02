"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
} from "lucide-react";

// ── Custom SVG icons ──────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

// ── Subject options ───────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: "",                     label: "Select a subject"     },
  { value: "Order Enquiry",        label: "Order Enquiry"        },
  { value: "Payment Issue",        label: "Payment Issue"        },
  { value: "Delivery Issue",       label: "Delivery Issue"       },
  { value: "Product Enquiry",      label: "Product Enquiry"      },
  { value: "Cancellation Request", label: "Cancellation Request" },
  { value: "Other",                label: "Other"                },
];

// ── Contact info ──────────────────────────────────────────────────────────────

const CONTACT = {
  whatsapp:    "+91 97462 92208",
  whatsappRaw: "9197462 92208",
  email:       "craftpallet12@gmail.com",
  instagram:   "https://instagram.com",
  instagramHandle: "@thecraftpallet",
  address:     "Kerala, India",
  hours:       { days: "Monday – Saturday", time: "10:00 AM – 6:00 PM" },
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    name:    "",
    email:   "",
    phone:   "",
    orderId: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);

    const text = [
      `*Contact Form — The Craft Pallet*`,
      ``,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      form.phone   ? `*Phone:* ${form.phone}`      : null,
      form.orderId ? `*Order ID:* ${form.orderId}`  : null,
      `*Subject:* ${form.subject}`,
      ``,
      `*Message:*`,
      form.message,
    ]
      .filter((l) => l !== null)
      .join("\n");

    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      window.open(
        `https://wa.me/${CONTACT.whatsappRaw}?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }, 800);
  };

  // ── Shared styles ───────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width:           "100%",
    padding:         "11px 14px",
    borderRadius:    "var(--radius-input)",
    border:          "1px solid var(--border)",
    fontSize:        "14px",
    backgroundColor: "var(--bg)",
    color:           "var(--text-primary)",
    outline:         "none",
    transition:      "border-color 200ms ease",
  };

  const labelStyle: React.CSSProperties = {
    display:       "block",
    fontSize:      "10px",
    fontWeight:    600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color:         "var(--text-tertiary)",
    marginBottom:  "6px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--surface)",
    borderRadius:    "var(--radius-card)",
    border:          "1px solid var(--border-soft)",
    padding:         "24px",
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 900px) {
          .contact-grid {
            grid-template-columns: 340px 1fr;
            gap: 32px;
            align-items: start;
          }
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 560px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }
        .contact-link {
          color: var(--text-primary);
          text-decoration: none;
          transition: color 200ms ease;
        }
        .contact-link:hover {
          color: var(--brand);
        }
      `}</style>

      <div style={{ backgroundColor: "var(--bg)", padding: "72px 0 120px" }}>
        <div className="tcp-container" style={{ maxWidth: "1040px" }}>

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: "56px" }}>
            <p className="tcp-eyebrow">Get in Touch</p>
            <h1
              style={{
                fontFamily:    "'Playfair Display', serif",
                fontSize:      "clamp(28px, 4vw, 48px)",
                fontWeight:    500,
                color:         "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom:  "16px",
              }}
            >
              Contact{" "}
              <em style={{ fontStyle: "italic", color: "var(--brand)" }}>Us</em>
            </h1>
            <p
              style={{
                fontSize:   "15px",
                color:      "var(--text-secondary)",
                lineHeight: 1.7,
                maxWidth:   "520px",
              }}
            >
              We create personalised gifts and handmade photo products designed
              to turn your favourite memories into keepsakes. We're happy to
              help with any questions.
            </p>
          </div>

          {/* ── Two-column grid ─────────────────────────────────────────── */}
          <div className="contact-grid">

            {/* ── Left: contact info ──────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Brand card */}
              <div style={cardStyle}>
                <p
                  style={{
                    fontFamily:    "'Playfair Display', serif",
                    fontSize:      "20px",
                    fontWeight:    600,
                    color:         "var(--text-primary)",
                    letterSpacing: "-0.01em",
                    marginBottom:  "4px",
                  }}
                >
                  The Craft Pallet
                </p>
                <p
                  style={{
                    fontSize:      "12px",
                    fontWeight:    500,
                    color:         "var(--brand)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom:  "12px",
                  }}
                >
                  Crafting Memories
                </p>
                <p
                  style={{
                    fontSize:   "13px",
                    color:      "var(--text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  Personalised gifts and handmade photo products, crafted with
                  care to keep your most cherished moments alive.
                </p>
              </div>

              {/* Contact details card */}
              <div style={cardStyle}>
                <p
                  style={{
                    fontSize:      "10px",
                    fontWeight:    600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:         "var(--text-tertiary)",
                    marginBottom:  "16px",
                  }}
                >
                  Customer Support
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${CONTACT.whatsappRaw}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        backgroundColor: "rgba(37,211,102,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "#25D366",
                      }}
                    >
                      <WhatsAppIcon size={18} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: "10px", fontWeight: 600, color: "var(--text-tertiary)",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1px",
                      }}>
                        WhatsApp
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>{CONTACT.whatsapp}</p>
                    </div>
                  </a>

                  {/* Phone */}
                  <a
                    href={`tel:${CONTACT.whatsappRaw}`}
                    className="contact-link"
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        backgroundColor: "rgba(166,138,117,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "var(--brand)",
                      }}
                    >
                      <Phone size={16} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: "10px", fontWeight: 600, color: "var(--text-tertiary)",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1px",
                      }}>
                        Phone
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>{CONTACT.whatsapp}</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="contact-link"
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        backgroundColor: "rgba(166,138,117,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "var(--brand)",
                      }}
                    >
                      <Mail size={16} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: "10px", fontWeight: 600, color: "var(--text-tertiary)",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1px",
                      }}>
                        Email
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>{CONTACT.email}</p>
                    </div>
                  </a>

                  {/* Instagram */}
                  <a
                    href={CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        backgroundColor: "rgba(225,48,108,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "#E1306C",
                      }}
                    >
                      <InstagramIcon size={16} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: "10px", fontWeight: 600, color: "var(--text-tertiary)",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1px",
                      }}>
                        Instagram
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>
                        {CONTACT.instagramHandle}
                      </p>
                    </div>
                  </a>

                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        backgroundColor: "rgba(166,138,117,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "var(--brand)",
                      }}
                    >
                      <MapPin size={16} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: "10px", fontWeight: 600, color: "var(--text-tertiary)",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1px",
                      }}>
                        Location
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {CONTACT.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support hours card */}
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <Clock size={15} strokeWidth={1.75} style={{ color: "var(--brand)" }} />
                  <p style={{
                    fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "var(--text-tertiary)",
                  }}>
                    Support Hours
                  </p>
                </div>
                <p style={{
                  fontSize: "14px", fontWeight: 600,
                  color: "var(--text-primary)", marginBottom: "4px",
                }}>
                  {CONTACT.hours.days}
                </p>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {CONTACT.hours.time}
                </p>
              </div>

              {/* Order support tip */}
              <div
                style={{
                  padding: "14px 16px", borderRadius: "var(--radius-input)",
                  backgroundColor: "var(--brand-soft)", border: "1px solid var(--border-soft)",
                }}
              >
                <p style={{
                  fontSize: "12px", fontWeight: 600,
                  color: "var(--text-primary)", marginBottom: "4px",
                }}>
                  Already placed an order?
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Please include your{" "}
                  <strong style={{ color: "var(--text-primary)" }}>Order ID</strong>{" "}
                  when contacting us so we can assist you faster.{" "}
                  <Link
                    href="/track-order"
                    style={{
                      color: "var(--brand)", fontWeight: 500, textDecoration: "underline",
                    }}
                  >
                    Track your order →
                  </Link>
                </p>
              </div>
            </div>

            {/* ── Right: contact form ──────────────────────────────────── */}
            <div style={cardStyle}>
              {submitted ? (
                <div
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", textAlign: "center",
                    padding: "48px 24px", gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "56px", height: "56px", borderRadius: "12px",
                      backgroundColor: "rgba(142,159,130,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--success)",
                    }}
                  >
                    <CheckCircle size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "'Playfair Display', serif", fontSize: "22px",
                      fontWeight: 600, color: "var(--text-primary)",
                      marginBottom: "8px", letterSpacing: "-0.01em",
                    }}>
                      Message sent!
                    </p>
                    <p style={{
                      fontSize: "14px", color: "var(--text-secondary)",
                      lineHeight: 1.65, maxWidth: "340px",
                    }}>
                      Opening WhatsApp with your message. We'll get back to you
                      within our support hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "", email: "", phone: "",
                        orderId: "", subject: "", message: "",
                      });
                    }}
                    style={{
                      marginTop: "8px", padding: "9px 20px",
                      borderRadius: "var(--radius-input)",
                      border: "1px solid var(--border)",
                      backgroundColor: "transparent", color: "var(--text-secondary)",
                      fontSize: "13px", fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <p style={{
                    fontFamily: "'Playfair Display', serif", fontSize: "20px",
                    fontWeight: 600, color: "var(--text-primary)",
                    letterSpacing: "-0.01em", marginBottom: "4px",
                  }}>
                    Send us a message
                  </p>
                  <p style={{
                    fontSize: "13px", color: "var(--text-secondary)",
                    marginBottom: "24px", lineHeight: 1.5,
                  }}>
                    We'll reply via WhatsApp during support hours.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Name + Email */}
                    <div className="form-row">
                      <div>
                        <label style={labelStyle}>
                          Name <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={form.name}
                          onChange={set("name")}
                          required
                          style={inputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          Email <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="you@email.com"
                          value={form.email}
                          onChange={set("email")}
                          required
                          style={inputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />
                      </div>
                    </div>

                    {/* Phone + Order ID */}
                    <div className="form-row">
                      <div>
                        <label style={labelStyle}>Phone</label>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                            }))
                          }
                          maxLength={10}
                          style={inputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Order ID (optional)</label>
                        <input
                          type="text"
                          placeholder="TCP-2026-0001"
                          value={form.orderId}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              orderId: e.target.value.toUpperCase(),
                            }))
                          }
                          style={inputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label style={labelStyle}>
                        Subject <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={form.subject}
                          onChange={set("subject")}
                          required
                          style={{
                            ...inputStyle,
                            appearance:       "none",
                            WebkitAppearance: "none",
                            paddingRight:     "36px",
                            cursor:           "pointer",
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                          {SUBJECTS.map((s) => (
                            <option key={s.value} value={s.value} disabled={s.value === ""}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            position: "absolute", right: "12px", top: "50%",
                            transform: "translateY(-50%)", color: "var(--text-tertiary)",
                            pointerEvents: "none",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label style={labelStyle}>
                        Message <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Describe your query or issue in detail..."
                        value={form.message}
                        onChange={set("message")}
                        required
                        style={{
                          ...inputStyle,
                          resize:     "vertical",
                          lineHeight: 1.6,
                          minHeight:  "120px",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                        onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <p style={{ fontSize: "12px", color: "#DC2626" }}>{error}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      style={{ justifyContent: "center", width: "100%" }}
                    >
                      <Send size={14} strokeWidth={2} />
                      {submitting ? "Sending..." : "Send Message"}
                    </button>

                    {/* Helper note */}
                    <p style={{
                      fontSize: "11px", color: "var(--text-tertiary)",
                      textAlign: "center", lineHeight: 1.5,
                    }}>
                      Your message will open in WhatsApp for a faster response.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}