"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, MessageCircle } from "lucide-react";
import { cartApi, buyNowApi } from "@/lib/cart";

export default function UploadMethodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("bn");

  const [needsUpload, setNeedsUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        if (buyNowId) {
          const session = await buyNowApi.get(buyNowId);
          // Assume Buy Now has product info — for now assume upload might be needed
          // We'll check via cart API which one has upload requirement
          // For simplicity here, always show both options
          setNeedsUpload(true);
        } else {
          const res = await cartApi.getCart();
          if (!res?.cart?.items?.length) {
            router.push("/cart");
            return;
          }
          const anyUploadRequired = res.cart.items.some(
            (i: any) => i.product?.configuration?.uploadRequired
          );
          setNeedsUpload(anyUploadRequired);
        }
      } catch {
        router.push("/");
        return;
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [buyNowId, router]);

  const goWebsite = () => {
    if (needsUpload) {
      router.push(
        `/checkout/upload${buyNowId ? `?bn=${buyNowId}` : ""}`
      );
    } else {
      // Skip upload if no photos required
      router.push(`/checkout${buyNowId ? `?bn=${buyNowId}` : ""}`);
    }
  };

  const goWhatsApp = () => {
    router.push(
      `/checkout?method=whatsapp${buyNowId ? `&bn=${buyNowId}` : ""}`
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "60px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "800px" }}>
        {/* Back */}
        <Link
          href={buyNowId ? "/products" : "/cart"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Back
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <p className="tcp-eyebrow">Almost There</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            How would you like to{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              continue
            </em>
            ?
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {needsUpload
              ? "Choose your preferred way to share your photos."
              : "Choose how you'd like to complete your order."}
          </p>
        </div>

        {/* Options */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr",
            gap: "20px",
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .method-grid {
                grid-template-columns: 1fr 1fr !important;
              }
            }
          `}</style>

          <div
            className="method-grid grid"
            style={{ gridTemplateColumns: "1fr", gap: "20px" }}
          >
            {/* Website Option */}
            <button
              onClick={goWebsite}
              style={{
                textAlign: "left",
                padding: "32px",
                borderRadius: "24px",
                border: "2px solid var(--border)",
                backgroundColor: "var(--surface)",
                cursor: "pointer",
                transition: "all 300ms ease",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--brand)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  backgroundColor: "var(--brand-soft)",
                  color: "var(--brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={24} strokeWidth={1.75} />
              </div>

              <div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(142,159,130,0.15)",
                    color: "var(--success)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    marginBottom: "10px",
                  }}
                >
                  RECOMMENDED
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  Continue on Website
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {needsUpload
                    ? "Upload your photos securely and complete the entire order online. Faster processing and instant confirmation."
                    : "Complete your order and pay securely online. Instant confirmation."}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--brand)",
                  marginTop: "auto",
                  paddingTop: "12px",
                }}
              >
                {needsUpload ? "Upload Photos" : "Continue Checkout"}
                <ArrowRight size={14} strokeWidth={2} />
              </div>
            </button>

            {/* WhatsApp Option */}
            <button
              onClick={goWhatsApp}
              style={{
                textAlign: "left",
                padding: "32px",
                borderRadius: "24px",
                border: "2px solid var(--border)",
                backgroundColor: "var(--surface)",
                cursor: "pointer",
                transition: "all 300ms ease",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "#25D366";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(37,211,102,0.12)",
                  color: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageCircle size={24} strokeWidth={1.75} />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  Continue on WhatsApp
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {needsUpload
                    ? "Prefer WhatsApp? We'll create your order and you can send photos directly through our chat."
                    : "We'll create your order and confirm everything through WhatsApp."}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#25D366",
                  marginTop: "auto",
                  paddingTop: "12px",
                }}
              >
                Continue with WhatsApp
                <ArrowRight size={14} strokeWidth={2} />
              </div>
            </button>
          </div>
        </div>

        {/* Trust footer */}
        <div
          style={{
            marginTop: "48px",
            padding: "20px 24px",
            borderRadius: "16px",
            backgroundColor: "var(--brand-soft)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--brand)",
              fontWeight: 500,
            }}
          >
            ✨ Both options create the same order. Choose what feels easier.
          </p>
        </div>
      </div>
    </div>
  );
}