"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ImageIcon,
  Paperclip,
  Check,
} from "lucide-react";
import { cartApi, formatPrice } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
  setLoading(true);
  try {
    const res = await cartApi.getCart();

    // Handle case where session ID wasn't ready
    if (!res) {
      setCart(null);
      setTotals(null);
      return;
    }

    setCart(res.cart);
    setTotals(res.totals);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdating(itemId);
    try {
      const updated = await cartApi.updateItem(itemId, { quantity: newQty });
      setCart(updated.cart ?? updated);
      const res = await cartApi.getCart();
      setTotals(res.totals);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!confirm("Remove this item from cart?")) return;
    setUpdating(itemId);
    try {
      await cartApi.removeItem(itemId);
      await loadCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      const result = await cartApi.applyCoupon(couponCode.trim().toUpperCase());
      setAppliedCoupon(result);
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    if (appliedCoupon) {
      sessionStorage.setItem("tcp_coupon", couponCode.trim().toUpperCase());
    }
    router.push("/checkout/upload-method");
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
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
            letterSpacing: "0.04em",
          }}
        >
          Loading your cart...
        </p>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const subtotal = Number(totals?.subtotal ?? 0);
  const discount = appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
  const total = subtotal - discount;

  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        padding: "56px 0 120px",
      }}
    >
      <div className="tcp-container">
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p className="tcp-eyebrow">Your Selection</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(30px, 4vw, 44px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Shopping Cart
          </h1>
        </div>

        {isEmpty ? (
          /* ── Empty state ── */
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--radius-card)",
              backgroundColor: "var(--surface)",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-card)",
                backgroundColor: "var(--brand-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: "var(--brand)",
              }}
            >
              <ShoppingBag size={24} strokeWidth={1.5} />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "10px",
              }}
            >
              Your cart is empty
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: "32px",
                maxWidth: "320px",
                margin: "0 auto 32px",
              }}
            >
              Start exploring our collection to add beautiful keepsakes.
            </p>
            <Link href="/products" className="btn-primary">
              Browse Products
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        ) : (
          /* ── Cart with items ── */
          <>
            <style>{`
              @media (min-width: 900px) {
                .cart-grid {
                  grid-template-columns: 1fr 360px !important;
                  gap: 56px !important;
                }
              }
            `}</style>

            <div
              className="cart-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "32px",
              }}
            >
              {/* ── Left — Items ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {/* Column headers — desktop only */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "16px",
                    padding: "0 0 12px",
                    borderBottom: "1px solid var(--border-soft)",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Product
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Total
                  </span>
                </div>

                {items.map((item: any) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updating={updating === item.id}
                    onQuantityChange={(q) => handleQuantity(item.id, q)}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </div>

              {/* ── Right — Summary ── */}
              <div>
                <div
                  style={{
                    position: "sticky",
                    top: "96px",
                    backgroundColor: "var(--surface)",
                    borderRadius: "var(--radius-card)",
                    border: "1px solid var(--border-soft)",
                    padding: "28px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      marginBottom: "24px",
                    }}
                  >
                    Order Summary
                  </h3>

                  {/* Coupon */}
                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                        marginBottom: "10px",
                      }}
                    >
                      Have a Coupon?
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        style={{
                          flex: 1,
                          padding: "11px 14px",
                          borderRadius: "var(--radius-input)",
                          border: "1px solid var(--border)",
                          fontSize: "13px",
                          backgroundColor: "var(--bg)",
                          color: "var(--text-primary)",
                          letterSpacing: "0.05em",
                          transition: "border-color 200ms ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--brand)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="btn-secondary"
                        style={{ padding: "11px 16px", fontSize: "12px" }}
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#DC2626",
                          marginTop: "8px",
                        }}
                      >
                        {couponError}
                      </p>
                    )}

                    {appliedCoupon && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-input)",
                          backgroundColor: "rgba(142,159,130,0.12)",
                          border: "1px solid rgba(142,159,130,0.25)",
                          color: "var(--success)",
                          fontSize: "12px",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <Check size={13} strokeWidth={2} />
                        {appliedCoupon.coupon.code} — save{" "}
                        {formatPrice(discount)}
                      </div>
                    )}
                  </div>

                  {/* Line items */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      paddingTop: "20px",
                      marginBottom: "4px",
                    }}
                  >
                    <SummaryRow
                      label="Subtotal"
                      value={formatPrice(subtotal)}
                    />
                    {discount > 0 && (
                      <SummaryRow
                        label="Discount"
                        value={`−${formatPrice(discount)}`}
                        color="var(--success)"
                      />
                    )}
                    <SummaryRow
                      label="Shipping"
                      value="Calculated at checkout"
                      small
                    />
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "20px 0 24px",
                      borderTop: "1px solid var(--border-soft)",
                      borderBottom: "1px solid var(--border-soft)",
                      marginBottom: "24px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "28px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Proceed to Checkout
                    <ArrowRight size={15} strokeWidth={2} />
                  </button>

                  <Link
                    href="/products"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "16px",
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      letterSpacing: "0.02em",
                      transition: "color 200ms ease",
                    }}
                    className="hover:text-[var(--text-primary)]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Cart Item ─────────────────────────────────────────────────────────────── */

function CartItem({
  item,
  updating,
  onQuantityChange,
  onRemove,
}: {
  item: any;
  updating: boolean;
  onQuantityChange: (q: number) => void;
  onRemove: () => void;
}) {
  const thumb = item.product?.images?.[0];

  const uploadedFiles = item.customizations
    ?.filter((c: any) => c.fieldType === "PHOTO_UPLOAD" && c.asset)
    .flatMap((c: any) => c.asset.files ?? []);

  const textCustomizations = item.customizations?.filter(
    (c: any) => c.fieldType !== "PHOTO_UPLOAD"
  );

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-card)",
        padding: "20px",
        display: "flex",
        gap: "20px",
        opacity: updating ? 0.5 : 1,
        transition: "opacity 200ms ease",
        marginBottom: "8px",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          backgroundColor: "var(--brand-soft)",
          flexShrink: 0,
        }}
      >
        {thumb ? (
          <img
            src={thumb.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageIcon
              size={24}
              strokeWidth={1}
              style={{ color: "var(--border)", opacity: 0.6 }}
            />
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/products/${item.product?.slug}`}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "var(--text-primary)",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
                transition: "color 200ms ease",
              }}
              className="hover:text-[var(--brand)]"
            >
              {item.product?.name}
            </Link>
            {item.variant && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  marginTop: "2px",
                }}
              >
                {item.variant.name}
              </p>
            )}
          </div>

          <button
            onClick={onRemove}
            aria-label="Remove item"
            style={{
              color: "var(--text-tertiary)",
              padding: "4px",
              flexShrink: 0,
              transition: "color 200ms ease",
            }}
            className="hover:text-[var(--text-primary)]"
          >
            <Trash2 size={15} strokeWidth={1.75} />
          </button>
        </div>

        {/* Text customizations */}
        {textCustomizations?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            {textCustomizations.map((c: any) => (
              <span
                key={c.id}
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-badge)",
                  backgroundColor: "var(--brand-soft)",
                  color: "var(--brand)",
                  fontWeight: 500,
                }}
              >
                {c.fieldLabel}:{" "}
                {c.textValue ?? c.numberValue ?? c.dateValue ?? "—"}
              </span>
            ))}
          </div>
        )}

        {/* Photo upload count */}
        {uploadedFiles?.length > 0 && (
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Paperclip size={11} strokeWidth={1.75} />
            {uploadedFiles.length} photos uploaded
          </p>
        )}

        {/* Notes */}
        {item.notes && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            &ldquo;{item.notes}&rdquo;
          </p>
        )}

        {/* Quantity + Price */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "14px",
          }}
        >
          {/* Qty control */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-input)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              aria-label="Decrease quantity"
              style={{
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                borderRight: "1px solid var(--border)",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
              }}
            >
              <Minus size={12} strokeWidth={2} />
            </button>

            <span
              style={{
                minWidth: "40px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {item.quantity}
            </span>

            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={updating}
              aria-label="Increase quantity"
              style={{
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                borderLeft: "1px solid var(--border)",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
              }}
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Price */}
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "2px",
              }}
            >
              {formatPrice(item.unitPrice)} × {item.quantity}
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "-0.01em",
              }}
            >
              {formatPrice(Number(item.unitPrice) * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Summary Row ───────────────────────────────────────────────────────────── */

function SummaryRow({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: small ? "12px" : "13px",
          fontWeight: 500,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}