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
    a: "Yes! Simply place a new order and upload the same photos. We recommend saving your photos in a folder for easy re-ordering.",
  },
  {
    q: "What if I'm not happy with my order?",
    a: "Your satisfaction is our priority. If there's a quality issue with your order, please contact us via WhatsApp with photos and we'll make it right.",
  },
  {
    q: "Do you offer bulk or custom orders?",
    a: "Absolutely! For bulk orders, custom sizes, or special requirements, contact us via WhatsApp for personalised pricing.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="tcp-section"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="tcp-container" style={{ maxWidth: "800px" }}>
        <div className="text-center" style={{ marginBottom: "64px" }}>
          <p className="tcp-eyebrow">Questions</p>
          <h2 className="tcp-heading">Frequently Asked Questions</h2>
          <p
            style={{
              marginTop: "16px",
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "16px auto 0",
            }}
          >
            Everything you need to know about ordering, delivery, and care.
          </p>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <button
                className="flex items-center justify-between w-full text-left"
                style={{
                  padding: "24px 0",
                }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    paddingRight: "24px",
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    width: "32px",
                    height: "32px",
                    borderRadius: "999px",
                    backgroundColor:
                      openIndex === i ? "var(--brand)" : "var(--brand-soft)",
                    color: openIndex === i ? "#fff" : "var(--brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 300ms ease",
                  }}
                >
                  {openIndex === i ? (
                    <Minus size={16} strokeWidth={2} />
                  ) : (
                    <Plus size={16} strokeWidth={2} />
                  )}
                </span>
              </button>
              <div
                style={{
                  maxHeight: openIndex === i ? "300px" : "0",
                  overflow: "hidden",
                  transition: "max-height 400ms ease",
                }}
              >
                <p
                  style={{
                    paddingBottom: "24px",
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                    maxWidth: "700px",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}