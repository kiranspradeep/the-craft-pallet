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
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? ORDER_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "80px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "720px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p className="tcp-eyebrow">Order Tracking</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 4vw, 44px)",
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

        {/* Form */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            borderRadius: "20px",
            border: "1px solid var(--border-soft)",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <form onSubmit={handleTrack}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="TCP-2026-0001"
                  value={orderNumber}
                  onChange={(e) =>
                    setOrderNumber(e.target.value.toUpperCase())
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border)",
                    fontSize: "14px",
                    backgroundColor: "var(--bg)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border)",
                    fontSize: "14px",
                    backgroundColor: "var(--bg)",
                  }}
                />
              </div>
            </div>
            {error && (
              <p style={{ fontSize: "12px", color: "#DC2626", marginBottom: "12px" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              <Search size={16} strokeWidth={2} />
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Order details */}
        {order && (
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "24px",
              border: "1px solid var(--border-soft)",
              padding: "32px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ marginBottom: "32px" }}>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--brand)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Order
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {order.orderNumber}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
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
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor:
                    order.photoStatus === "VERIFIED"
                      ? "rgba(142,159,130,0.15)"
                      : "var(--brand-soft)",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {order.photoStatus === "VERIFIED" ? (
                  <ShieldCheck
                    size={18}
                    strokeWidth={1.75}
                    style={{ color: "var(--success)" }}
                  />
                ) : (
                  <Camera
                    size={18}
                    strokeWidth={1.75}
                    style={{ color: "var(--brand)" }}
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
                  {order.photoStatus === "NOT_RECEIVED"
                    ? "Awaiting your photos"
                    : order.photoStatus === "RECEIVED"
                    ? "Received — pending verification"
                    : "Verified & approved"}
                </p>
              </div>
            )}

            {/* Timeline */}
            {order.status !== "DRAFT" && order.status !== "CANCELLED" && (
              <div style={{ marginBottom: "32px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    letterSpacing: "0.05em",
                    marginBottom: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  Progress
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {ORDER_STEPS.map((step, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isCurrent = i === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        style={{
                          display: "flex",
                          gap: "16px",
                          alignItems: "center",
                          opacity: isCompleted || isCurrent ? 1 : 0.4,
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "999px",
                            backgroundColor: isCompleted
                              ? "var(--success)"
                              : isCurrent
                              ? "var(--brand)"
                              : "var(--border)",
                            color:
                              isCompleted || isCurrent
                                ? "#fff"
                                : "var(--text-tertiary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <step.icon size={16} strokeWidth={1.75} />
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: isCurrent ? 600 : 500,
                              color: "var(--text-primary)",
                            }}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--brand)",
                              }}
                            >
                              Current Status
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
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(37,211,102,0.1)",
                  border: "1px solid rgba(37,211,102,0.3)",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  💬 This order is being processed via WhatsApp
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Continue the conversation with our team to complete payment.
                </p>
              </div>
            )}

            {/* Items */}
            <div
              style={{
                paddingTop: "24px",
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                  textTransform: "uppercase",
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
                    padding: "10px 0",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item.variantName}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}

              <div
                className="flex items-center justify-between"
                style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Total</span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* WhatsApp help */}
            <a
              href={`https://wa.me/918086415357?text=Hi! I have questions about order ${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ width: "100%", marginTop: "24px" }}
            >
              <MessageCircle size={16} strokeWidth={2} />
              Need help? WhatsApp us
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}