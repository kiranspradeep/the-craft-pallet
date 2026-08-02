"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react";
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
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  const subtotal = Number(totals?.subtotal ?? 0);
  const discount = appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
  const total = subtotal - discount;

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "48px 0 120px" }}>
      <div className="tcp-container">
        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <p className="tcp-eyebrow">Your Selection</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Shopping Cart
          </h1>
        </div>

        {isEmpty ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              borderRadius: "24px",
              border: "1px solid var(--border-soft)",
              backgroundColor: "var(--surface)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "999px",
                backgroundColor: "var(--brand-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: "var(--brand)",
              }}
            >
              <ShoppingBag size={28} strokeWidth={1.5} />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "12px",
              }}
            >
              Your cart is empty
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                marginBottom: "28px",
              }}
            >
              Start exploring our collection to add beautiful keepsakes.
            </p>
            <Link href="/products" className="btn-primary">
              Browse Products
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr",
              gap: "32px",
            }}
          >
            <style>{`
              @media (min-width: 900px) {
                .cart-grid {
                  grid-template-columns: 1fr 380px !important;
                  gap: 48px !important;
                }
              }
            `}</style>

            <div
              className="cart-grid grid"
              style={{ gridTemplateColumns: "1fr", gap: "32px" }}
            >
              {/* Left — Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

              {/* Right — Summary */}
              <div>
                <div
                  style={{
                    position: "sticky",
                    top: "100px",
                    backgroundColor: "var(--surface)",
                    borderRadius: "20px",
                    border: "1px solid var(--border-soft)",
                    padding: "28px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
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
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                        marginBottom: "8px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      HAVE A COUPON?
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: "1.5px solid var(--border)",
                          fontSize: "13px",
                          backgroundColor: "var(--bg)",
                          textTransform: "uppercase",
                        }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "10px",
                          border: "1.5px solid var(--text-primary)",
                          backgroundColor: "var(--text-primary)",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#DC2626",
                          marginTop: "6px",
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
                          borderRadius: "10px",
                          backgroundColor: "rgba(142,159,130,0.15)",
                          color: "var(--success)",
                          fontSize: "12px",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Tag size={13} strokeWidth={1.75} />
                        {appliedCoupon.coupon.code} applied — save {formatPrice(discount)}
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      paddingTop: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                    {discount > 0 && (
                      <SummaryRow
                        label="Discount"
                        value={`-${formatPrice(discount)}`}
                        color="var(--success)"
                      />
                    )}
                    <SummaryRow
                      label="Shipping"
                      value="Calculated at checkout"
                      small
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      paddingTop: "20px",
                      borderTop: "1px solid var(--border-soft)",
                      marginBottom: "24px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "28px",
                        fontWeight: 600,
                        color: "var(--accent)",
                      }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="btn-primary"
                    style={{ width: "100%", padding: "16px", fontSize: "14px" }}
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>

                  <Link
                    href="/products"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "14px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cart Item Component ───────────────────────────────────────────────────

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
        borderRadius: "20px",
        padding: "20px",
        display: "flex",
        gap: "20px",
        opacity: updating ? 0.5 : 1,
        transition: "opacity 200ms ease",
      }}
    >
      {/* Image */}
      <div
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "14px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #F5EFE8 0%, #E8DDD1 100%)",
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
              fontSize: "36px",
              opacity: 0.4,
            }}
          >
            📸
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-start justify-between" style={{ marginBottom: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/products/${item.product?.slug}`}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "17px",
                fontWeight: 500,
                color: "var(--text-primary)",
                display: "block",
                marginBottom: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.product?.name}
            </Link>
            {item.variant && (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {item.variant.name}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            style={{ color: "var(--text-tertiary)", padding: "4px" }}
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Customizations */}
        {textCustomizations?.length > 0 && (
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {textCustomizations.map((c: any) => (
              <span
                key={c.id}
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  backgroundColor: "var(--brand-soft)",
                  color: "var(--brand)",
                }}
              >
                {c.fieldLabel}:{" "}
                {c.textValue ?? c.numberValue ?? c.dateValue ?? "—"}
              </span>
            ))}
          </div>
        )}

        {uploadedFiles?.length > 0 && (
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            📎 {uploadedFiles.length} photos uploaded
          </p>
        )}

        {item.notes && (
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", fontStyle: "italic" }}>
            "{item.notes}"
          </p>
        )}

        {/* Price + Qty */}
        <div className="flex items-center justify-between" style={{ marginTop: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "4px 6px",
              border: "1px solid var(--border)",
              borderRadius: "999px",
            }}
          >
            <button
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "999px",
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus size={11} strokeWidth={2} />
            </button>
            <span style={{ minWidth: "24px", textAlign: "center", fontSize: "13px", fontWeight: 600 }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={updating}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "999px",
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={11} strokeWidth={2} />
            </button>
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {formatPrice(item.unitPrice)} × {item.quantity}
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--accent)",
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
      className="flex items-center justify-between"
      style={{ marginBottom: "12px" }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: small ? "12px" : "14px",
          fontWeight: 500,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}