"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MessageCircle, Copy, ArrowRight, Clock } from "lucide-react";
import { formatPrice } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const phone = searchParams.get("phone");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(
          `${API}/api/orders/track/${orderNumber}?phone=${phone}`
        );
        const data = await res.json();
        if (res.ok) setOrder(data.data);
      } catch {}
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [orderNumber, phone]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading order details...</p>
      </div>
    );
  }

  const isPaid = order?.payment?.status === "SUCCESS";
  const isDraft = order?.status === "DRAFT";
  const isAwaitingPayment = order?.status === "AWAITING_PAYMENT";
  const orderSource = order?.orderSource;

  // Status headline
  let statusLabel = "Order Placed";
  let statusIcon = <CheckCircle size={36} strokeWidth={1.5} />;
  let statusColor = "var(--brand)";
  let bgColor = "var(--brand-soft)";
  let headline = "Thank you for your order";

  if (isPaid) {
    statusLabel = "Payment Successful";
    statusColor = "var(--success)";
    bgColor = "rgba(142,159,130,0.2)";
    headline = "Order confirmed";
  } else if (isDraft) {
    statusLabel = "Draft Order Created";
    statusIcon = <Clock size={36} strokeWidth={1.5} />;
    headline = "Complete on WhatsApp";
  } else if (isAwaitingPayment) {
    statusLabel = "Awaiting Payment";
    statusIcon = <Clock size={36} strokeWidth={1.5} />;
    headline = "Almost done";
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "80px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "700px" }}>
        {/* Success Icon */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "999px",
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: statusColor,
            }}
          >
            {statusIcon}
          </div>
          <p className="tcp-eyebrow">{statusLabel}</p>
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
            {headline}
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            {isPaid
              ? "Your order has been confirmed. We'll start crafting your keepsakes shortly."
              : isDraft
              ? "Please continue on WhatsApp to share your photos and complete payment."
              : isAwaitingPayment
              ? "Please complete the payment to begin production."
              : "Your order has been received successfully."}
          </p>
        </div>

        {/* Order card */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            borderRadius: "24px",
            border: "1px solid var(--border-soft)",
            padding: "32px",
            boxShadow: "var(--shadow-sm)",
            marginBottom: "24px",
          }}
        >
          {/* Order number */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderRadius: "14px",
              backgroundColor: "var(--brand-soft)",
              marginBottom: "24px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--brand)",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Order Number
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {orderNumber}
              </p>
              {orderSource === "WHATSAPP" && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "4px",
                    fontSize: "11px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(37,211,102,0.15)",
                    color: "#25D366",
                    fontWeight: 500,
                  }}
                >
                  💬 WhatsApp Order
                </span>
              )}
            </div>
            <button
              onClick={copyOrderNumber}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--surface)",
                color: "var(--brand)",
                fontSize: "12px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Copy size={13} strokeWidth={1.75} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {order && (
            <>
              {/* Items */}
              <div style={{ marginBottom: "24px" }}>
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
                  Items ({order.items?.length})
                </p>
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--border-soft)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {item.variantName}
                        </p>
                      )}
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div
                style={{
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                <TotalRow label="Subtotal" value={formatPrice(order.subtotal)} />
                {Number(order.discountAmount) > 0 && (
                  <TotalRow
                    label="Discount"
                    value={`-${formatPrice(order.discountAmount)}`}
                    color="var(--success)"
                  />
                )}
                <TotalRow
                  label="Shipping"
                  value={formatPrice(order.shippingCharge)}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingTop: "12px",
                    marginTop: "8px",
                    borderTop: "1px solid var(--border-soft)",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    {isPaid ? "Total Paid" : "Total"}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <a
            href={`https://wa.me/918086415357?text=Hi! I have order ${orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: "14px" }}
          >
            <MessageCircle size={16} strokeWidth={2} />
            WhatsApp
          </a>
          <Link
            href={`/track-order?order=${orderNumber}&phone=${phone || ""}`}
            className="btn-primary"
            style={{ padding: "14px" }}
          >
            Track Order
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/"
            style={{ fontSize: "13px", color: "var(--text-secondary)" }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: "8px" }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}