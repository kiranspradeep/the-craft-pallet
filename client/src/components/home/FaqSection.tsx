"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse our products, choose your size or variant, upload your photos, and complete checkout. You can pay securely online via Razorpay or through WhatsApp.",
  },
  {
    q: "What photo formats do you accept?",
    a: "We accept JPG, JPEG, PNG, WEBP, HEIC, and HEIF formats. You can upload directly, share a Google Drive link, or send via WhatsApp.",
  },
  {
    q: "How long does delivery take?",
    a: "Our standard production time is 7–10 working days. Once shipped, delivery typically takes 2–4 business days depending on your location.",
  },
  {
    q: "Can I reorder the same photos?",
    a: "Yes. Simply place a new order and upload the same photos. We recommend saving your photos in a folder for easy re-ordering.",
  },
  {
    q: "What if I am not happy with my order?",
    a: "Your satisfaction is our priority. If there is a quality issue with your order, please contact us via WhatsApp with photos and we will make it right.",
  },
  {
    q: "Do you offer bulk or custom orders?",
    a: "Absolutely. For bulk orders, custom sizes, or special requirements, contact us via WhatsApp for personalised pricing.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="tcp-section"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div
        className="tcp-container"
        style={{ maxWidth: "720px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <p className="tcp-eyebrow">Questions</p>
          <h2 className="tcp-heading">
            Frequently Asked Questions
          </h2>
          <p
            style={{
              marginTop: "16px",
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "480px",
              lineHeight: 1.75,
            }}
          >
            Everything you need to know about ordering, delivery, and care.
          </p>
        </div>

        {/* Accordion */}
        <div>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "24px",
                    padding: "22px 0",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      color: isOpen
                        ? "var(--text-primary)"
                        : "var(--text-tertiary)",
                      transition: "color 200ms ease",
                    }}
                  >
                    {isOpen ? (
                      <Minus size={16} strokeWidth={1.75} />
                    ) : (
                      <Plus size={16} strokeWidth={1.75} />
                    )}
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? "400px" : "0",
                    overflow: "hidden",
                    transition: "max-height 350ms ease",
                  }}
                >
                  <p
                    style={{
                      paddingBottom: "22px",
                      fontSize: "14px",
                      lineHeight: 1.8,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}