"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  CheckCircle,
  Clock,
  Truck,
  MessageCircle,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ORDER_STEPS = [
  { key: "AWAITING_PAYMENT", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Payment Confirmed", icon: CheckCircle },
  { key: "IN_PRODUCTION", label: "In Production", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || ""
  );
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderNumber && phone) handleTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Enter both order number and phone");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(
        `${API}/api/orders/track/${orderNumber.trim()}?phone=${phone.trim()}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Order not found");
        return;
      }
      setOrder(data.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? ORDER_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "var(--radius-input)",
    border: "1px solid var(--border)",
    fontSize: "14px",
    backgroundColor: "var(--bg)",
    color: "var(--text-primary)",
    transition: "border-color 200ms ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "var(--text-tertiary)",
    marginBottom: "7px",
  };

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "72px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p className="tcp-eyebrow">Order Tracking</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Track Your{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              Order
            </em>
          </h1>
        </div>

        {/* Search form */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border-soft)",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <form onSubmit={handleTrack}>
            <style>{`
              @media (min-width: 640px) {
                .track-fields { grid-template-columns: 1fr 1fr !important; }
              }
            `}</style>

            <div
              className="track-fields"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Order Number</label>
                <input
                  type="text"
                  placeholder="TCP-2026-0001"
                  value={orderNumber}
                  onChange={(e) =>
                    setOrderNumber(e.target.value.toUpperCase())
                  }
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#DC2626",
                  marginBottom: "12px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Search size={15} strokeWidth={2} />
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Order result */}
        {order && (
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border-soft)",
              padding: "28px",
            }}
          >
            {/* Order meta */}
            <div style={{ marginBottom: "28px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "4px",
                }}
              >
                Order
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                  marginBottom: "4px",
                }}
              >
                {order.orderNumber}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Photo status */}
            {order.photoStatus && order.photoStatus !== "NOT_REQUIRED" && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-input)",
                  backgroundColor:
                    order.photoStatus === "VERIFIED"
                      ? "rgba(142,159,130,0.12)"
                      : "var(--brand-soft)",
                  border:
                    order.photoStatus === "VERIFIED"
                      ? "1px solid rgba(142,159,130,0.25)"
                      : "1px solid var(--border-soft)",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {order.photoStatus === "VERIFIED" ? (
                  <ShieldCheck
                    size={15}
                    strokeWidth={1.75}
                    style={{ color: "var(--success)", flexShrink: 0 }}
                  />
                ) : (
                  <Camera
                    size={15}
                    strokeWidth={1.75}
                    style={{ color: "var(--brand)", flexShrink: 0 }}
                  />
                )}
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  Photos:{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {order.photoStatus === "NOT_RECEIVED"
                      ? "Awaiting your photos"
                      : order.photoStatus === "RECEIVED"
                      ? "Received — pending verification"
                      : "Verified and approved"}
                  </span>
                </p>
              </div>
            )}

            {/* Progress timeline */}
            {order.status !== "DRAFT" && order.status !== "CANCELLED" && (
              <div style={{ marginBottom: "28px" }}>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                    marginBottom: "20px",
                  }}
                >
                  Progress
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0",
                  }}
                >
                  {ORDER_STEPS.map((step, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const isLast = i === ORDER_STEPS.length - 1;

                    return (
                      <div
                        key={step.key}
                        style={{
                          display: "flex",
                          gap: "16px",
                          opacity: isCompleted || isCurrent ? 1 : 0.35,
                        }}
                      >
                        {/* Icon + connector */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "var(--radius-input)",
                              backgroundColor: isCompleted
                                ? "var(--success)"
                                : isCurrent
                                ? "var(--text-primary)"
                                : "var(--border)",
                              color:
                                isCompleted || isCurrent
                                  ? "#fff"
                                  : "var(--text-tertiary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <step.icon size={14} strokeWidth={1.75} />
                          </div>
                          {!isLast && (
                            <div
                              style={{
                                width: "1px",
                                flex: 1,
                                minHeight: "20px",
                                backgroundColor: isCompleted
                                  ? "var(--success)"
                                  : "var(--border-soft)",
                                margin: "4px 0",
                              }}
                            />
                          )}
                        </div>

                        {/* Text */}
                        <div
                          style={{
                            paddingBottom: isLast ? "0" : "20px",
                            paddingTop: "4px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: isCurrent ? 600 : 500,
                              color: "var(--text-primary)",
                              marginBottom: "1px",
                            }}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--brand)",
                                fontWeight: 500,
                              }}
                            >
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Draft notice */}
            {order.status === "DRAFT" && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-input)",
                  backgroundColor: "rgba(37,211,102,0.08)",
                  border: "1px solid rgba(37,211,102,0.2)",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "3px",
                  }}
                >
                  WhatsApp order in progress
                </p>
                <p
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                >
                  Continue the conversation with our team to complete payment.
                </p>
              </div>
            )}

            {/* Items */}
            <div
              style={{
                paddingTop: "20px",
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "12px",
                }}
              >
                Items
              </p>

              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {item.variantName}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/918086415357?text=Hi! I have questions about order ${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                width: "100%",
                marginTop: "24px",
                justifyContent: "center",
              }}
            >
              <WhatsAppIcon size={15} />
              Need help? WhatsApp us
            </a>
          </div>
        )}

        {/* Bottom link */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              letterSpacing: "0.02em",
              transition: "color 200ms ease",
            }}
            className="hover:text-[var(--text-primary)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <TrackContent />
    </Suspense>
  );
}