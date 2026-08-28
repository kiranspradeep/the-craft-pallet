"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  MessageCircle,
  Copy,
  ArrowRight,
  Clock,
  Check,
} from "lucide-react";
import { formatPrice } from "@/lib/cart";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const phone = searchParams.get("phone");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const orderRef = useRef<any>(null);

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
        if (res.ok) {
          setOrder(data.data);
          orderRef.current = data.data;
        }
      } catch {}
      setLoading(false);
    };

    load();
    const interval = setInterval(() => {
      const current = orderRef.current;
      if (
        current?.status === "CONFIRMED" ||
        current?.payment?.status === "SUCCESS"
      ) {
        clearInterval(interval);
        return;
      }
      load();
    }, 5000);
    return () => clearInterval(interval);
  }, [orderNumber, phone]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          Loading order details...
        </p>
      </div>
    );
  }

  const paidParam = searchParams.get("paid") === "true";
  const isPaid =
    paidParam ||
    order?.payment?.status === "SUCCESS" ||
    order?.status === "CONFIRMED";
  const isDraft = order?.status === "DRAFT";
  const isAwaitingPayment = !isPaid && order?.status === "AWAITING_PAYMENT";

  let statusLabel = "Order Placed";
  let statusColor = "var(--brand)";
  let statusBg = "var(--brand-soft)";
  let headline = "Thank you for your order";
  let StatusIcon = CheckCircle;

  if (isPaid) {
    statusLabel = "Payment Confirmed";
    statusColor = "var(--success)";
    statusBg = "rgba(142,159,130,0.15)";
    headline = "Order confirmed";
    StatusIcon = CheckCircle;
  } else if (isDraft) {
    statusLabel = "Draft Order Created";
    statusColor = "#25D366";
    statusBg = "rgba(37,211,102,0.1)";
    headline = "Complete on WhatsApp";
    StatusIcon = Clock;
  } else if (isAwaitingPayment) {
    statusLabel = "Awaiting Payment";
    statusColor = "var(--brand)";
    statusBg = "var(--brand-soft)";
    headline = "Almost done";
    StatusIcon = Clock;
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "72px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "640px" }}>
        {/* Icon + heading */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "var(--radius-card)",
              backgroundColor: statusBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              color: statusColor,
            }}
          >
            <StatusIcon size={32} strokeWidth={1.25} />
          </div>

          <p className="tcp-eyebrow">{statusLabel}</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "14px",
            }}
          >
            {headline}
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "420px",
              margin: "0 auto",
              lineHeight: 1.7,
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
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border-soft)",
            padding: "28px",
            marginBottom: "16px",
          }}
        >
          {/* Order number row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: "var(--radius-input)",
              backgroundColor: "var(--brand-soft)",
              marginBottom: "24px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--brand)",
                  marginBottom: "3px",
                }}
              >
                Order Number
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {orderNumber}
              </p>
            </div>
            <button
              onClick={copyOrderNumber}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "var(--radius-input)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                fontSize: "12px",
                fontWeight: 500,
                color: copied ? "var(--success)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
            >
              {copied ? (
                <Check size={12} strokeWidth={2} />
              ) : (
                <Copy size={12} strokeWidth={1.75} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {order && (
            <>
              {/* Items */}
              <div style={{ marginBottom: "20px" }}>
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
                  Items ({order.items?.length})
                </p>
                {order.items?.map((item: any) => (
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
              </div>

              {/* Totals */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                {[
                  { label: "Subtotal", value: formatPrice(order.subtotal) },
                  ...(Number(order.discountAmount) > 0
                    ? [
                        {
                          label: "Discount",
                          value: `−${formatPrice(order.discountAmount)}`,
                          color: "var(--success)",
                        },
                      ]
                    : []),
                  {
                    label: "Shipping",
                    value: formatPrice(order.shippingCharge),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: (row as any).color || "var(--text-primary)",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingTop: "14px",
                    marginTop: "8px",
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
                    {isPaid ? "Total Paid" : "Total"}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
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
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <a
            href={`https://wa.me/919746292208?text=Hi! I have order ${orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ justifyContent: "center" }}
          >
            <WhatsAppIcon size={15} />
            WhatsApp
          </a>
          <Link
            href={`/track-order?order=${orderNumber}&phone=${phone || ""}`}
            className="btn-primary"
            style={{ justifyContent: "center" }}
          >
            Track Order
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>

        <div style={{ textAlign: "center" }}>
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