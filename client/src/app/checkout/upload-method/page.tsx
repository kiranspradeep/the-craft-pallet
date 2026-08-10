"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, MessageCircle, Check } from "lucide-react";
import { cartApi, buyNowApi } from "@/lib/cart";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
          setNeedsUpload(session.uploadRequired ?? false);
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
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [buyNowId, router]);

  const goWebsite = () => {
    if (needsUpload) {
      router.push(`/checkout/upload${buyNowId ? `?bn=${buyNowId}` : ""}`);
    } else {
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
      <div
        style={{
          padding: "160px 0",
          textAlign: "center",
          backgroundColor: "var(--bg)",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "56px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "760px" }}>
        {/* Back */}
        <Link
          href={buyNowId ? "/products" : "/cart"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            marginBottom: "32px",
            letterSpacing: "0.02em",
            transition: "color 200ms ease",
          }}
          className="hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          Back
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p className="tcp-eyebrow">Almost There</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "14px",
            }}
          >
            How would you like to{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              continue?
            </em>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "480px",
              lineHeight: 1.7,
            }}
          >
            {needsUpload
              ? "Choose your preferred way to share your photos and complete your order."
              : "Choose how you'd like to complete your order."}
          </p>
        </div>

        {/* Method cards */}
        <style>{`
          @media (min-width: 640px) {
            .method-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>

        <div
          className="method-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {/* Website */}
          <button
            onClick={goWebsite}
            style={{
              textAlign: "left",
              padding: "28px",
              borderRadius: "var(--radius-card)",
              border: "1.5px solid var(--border)",
              backgroundColor: "var(--surface)",
              cursor: "pointer",
              transition: "border-color 250ms ease, box-shadow 250ms ease",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--text-primary)";
              el.style.boxShadow = "var(--shadow-sm)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--border)";
              el.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-card)",
                  backgroundColor: "var(--brand-soft)",
                  color: "var(--brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Upload size={20} strokeWidth={1.75} />
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-badge)",
                  backgroundColor: "rgba(142,159,130,0.12)",
                  border: "1px solid rgba(142,159,130,0.25)",
                  color: "var(--success)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                <Check size={10} strokeWidth={2.5} />
                Recommended
              </span>
            </div>

            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                Continue on Website
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {needsUpload
                  ? "Upload your photos securely and complete the entire order online. Faster processing and instant confirmation."
                  : "Complete your order and pay securely online. Instant confirmation."}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              {needsUpload ? "Upload & Checkout" : "Continue Checkout"}
              <ArrowRight size={13} strokeWidth={2} />
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={goWhatsApp}
            style={{
              textAlign: "left",
              padding: "28px",
              borderRadius: "var(--radius-card)",
              border: "1.5px solid var(--border)",
              backgroundColor: "var(--surface)",
              cursor: "pointer",
              transition: "border-color 250ms ease, box-shadow 250ms ease",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#25D366";
              el.style.boxShadow = "var(--shadow-sm)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--border)";
              el.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-card)",
                backgroundColor: "rgba(37,211,102,0.1)",
                color: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WhatsAppIcon size={20} />
            </div>

            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                Continue on WhatsApp
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {needsUpload
                  ? "Prefer WhatsApp? We'll create your order and you can send photos directly through our chat."
                  : "We'll create your order and confirm everything through WhatsApp."}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#25D366",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Chat on WhatsApp
              <ArrowRight size={13} strokeWidth={2} />
            </div>
          </button>
        </div>

        {/* Footer note */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-input)",
            border: "1px solid var(--border-soft)",
            backgroundColor: "var(--surface)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Both options create the same order — choose whatever feels easier.
          </p>
        </div>
      </div>
    </div>
  );
}