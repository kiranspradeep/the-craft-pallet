"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  MessageCircle,
  Loader2,
} from "lucide-react";
import {
  cartApi,
  buyNowApi,
  checkoutApi,
  formatPrice,
  getSessionId,
} from "@/lib/cart";
import Script from "next/script";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("bn");
  const method =
    searchParams.get("method") === "whatsapp" ? "whatsapp" : "website";

  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    shipName: "",
    shipPhone: "",
    shipLine1: "",
    shipLine2: "",
    shipCity: "",
    shipState: "",
    shipPincode: "",
    customerNote: "",
  });

  const [sameShipping, setSameShipping] = useState(true);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyNowId]);

  const load = async () => {
    try {
      if (buyNowId) {
        const session = await buyNowApi.get(buyNowId);
        const productRes = await fetch(
          `${API_URL}/api/products/${session.productId}`
        );
        const productData = await productRes.json();
        const product = productData.data;

        const variant = product?.variants?.find(
          (v: any) => v.id === session.variantId
        );

        const total = Number(session.unitPrice) * session.quantity;

        setItems([
          {
            id: session.id,
            product: { name: product?.name, images: product?.images },
            variant: variant ? { name: variant.name } : null,
            quantity: session.quantity,
            unitPrice: session.unitPrice,
          },
        ]);
        setSubtotal(total);
      } else {
        const res = await cartApi.getCart();
        if (!res?.cart?.items?.length) {
          router.push("/cart");
          return;
        }
        setItems(res.cart.items);
        setSubtotal(Number(res.totals?.subtotal ?? 0));
      }
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      const couponCode = sessionStorage.getItem("tcp_coupon");

      const body = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        shipName: sameShipping ? form.name.trim() : form.shipName.trim(),
        shipPhone: sameShipping ? form.phone.trim() : form.shipPhone.trim(),
        shipLine1: form.shipLine1.trim(),
        shipLine2: form.shipLine2.trim() || undefined,
        shipCity: form.shipCity.trim(),
        shipState: form.shipState.trim(),
        shipPincode: form.shipPincode.trim(),
        shipCountry: "India",
        customerNote: form.customerNote.trim() || undefined,
        couponCode: couponCode || undefined,
        buyNowCheckoutId: buyNowId || undefined,
      };

      sessionStorage.removeItem("tcp_coupon");

      if (method === "whatsapp") {
        const order = await checkoutApi.placeDraftOrder(body);
        redirectToWhatsApp(order);
      } else {
        const order = await checkoutApi.placeWebsiteOrder(body);
        await openRazorpayCheckout(order);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setPlacing(false);
    }
  };

  const redirectToWhatsApp = (order: any) => {
    const parts = [
      "Hello Craft Pallet 👋",
      "",
      `Order: ${order.orderNumber}`,
      order.whatsappToken ? `Verification: ${order.whatsappToken}` : "",
      "",
      `Total: ₹${Number(order.totalAmount).toFixed(2)}`,
      "",
      "I'll share my photos here and confirm payment.",
    ]
      .filter(Boolean)
      .join("\n");

    const message = encodeURIComponent(parts);
    window.location.href = `https://wa.me/918086415357?text=${message}`;
  };

  const openRazorpayCheckout = async (order: any) => {
    try {
      // 1. Create Razorpay Order on backend (enables instant auto-capture)
      const rzpRes = await fetch(
        `${API_URL}/api/checkout/razorpay-order/${order.orderNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Id": getSessionId(),
          },
        }
      );
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpData.message || "Failed to initialize payment");
      }
      const razorpayData = rzpData.data;

      // 2. Open Razorpay checkout with the Razorpay order_id
      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "The Craft Pallet",
        description: `Order ${order.orderNumber}`,
        order_id: razorpayData.razorpayOrderId,
        prefill: {
          name: razorpayData.customer?.name || form.name,
          email: razorpayData.customer?.email || form.email,
          contact: `+91${razorpayData.customer?.phone || form.phone}`,
        },
        notes: {
          orderNumber: order.orderNumber,
          orderId: order.id,
        },
        theme: { color: "#C96C4A" },
        handler: function () {
          router.push(
            `/order-confirmation/${order.orderNumber}?phone=${form.phone}`
          );
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
            router.push(
              `/order-confirmation/${order.orderNumber}?phone=${form.phone}`
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        router.push(
          `/order-confirmation/${order.orderNumber}?phone=${form.phone}`
        );
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Payment failed to initialize");
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading checkout...</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div style={{ backgroundColor: "var(--bg)", padding: "48px 0 120px" }}>
        <div className="tcp-container">
          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <Link
              href={`/checkout/upload-method${
                buyNowId ? `?bn=${buyNowId}` : ""
              }`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "20px",
              }}
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              Back
            </Link>
            <p className="tcp-eyebrow">
              {method === "whatsapp"
                ? "WhatsApp Order — Step 3 of 3"
                : "Website Order — Final Step"}
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 4vw, 44px)",
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {method === "whatsapp" ? (
                <>
                  Your details for{" "}
                  <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
                    WhatsApp
                  </em>
                </>
              ) : (
                <>
                  Complete Your{" "}
                  <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
                    Order
                  </em>
                </>
              )}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid"
            style={{ gridTemplateColumns: "1fr", gap: "40px" }}
          >
            <style>{`
              @media (min-width: 900px) {
                .checkout-grid {
                  grid-template-columns: 1fr 380px !important;
                  gap: 48px !important;
                }
              }
            `}</style>

            <div
              className="checkout-grid grid"
              style={{ gridTemplateColumns: "1fr", gap: "40px" }}
            >
              {/* Left — Form */}
              <div>
                <Section title="Contact Information" step={1}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <Field label="Full Name" required>
                      <Input
                        placeholder="Priya Sharma"
                        value={form.name}
                        onChange={(v) => set("name", v)}
                        required
                      />
                    </Field>
                    <Field label="Phone" required>
                      <Input
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={(v) =>
                          set("phone", v.replace(/\D/g, "").slice(0, 10))
                        }
                        maxLength={10}
                        pattern="\d{10}"
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Email (optional)">
                    <Input
                      type="email"
                      placeholder="priya@example.com"
                      value={form.email}
                      onChange={(v) => set("email", v)}
                    />
                  </Field>
                </Section>

                <Section title="Shipping Address" step={2}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sameShipping}
                      onChange={(e) => setSameShipping(e.target.checked)}
                      style={{ accentColor: "var(--brand)" }}
                    />
                    Same as contact info
                  </label>

                  {!sameShipping && (
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <Field label="Recipient Name" required>
                        <Input
                          value={form.shipName}
                          onChange={(v) => set("shipName", v)}
                          required
                        />
                      </Field>
                      <Field label="Recipient Phone" required>
                        <Input
                          value={form.shipPhone}
                          onChange={(v) =>
                            set(
                              "shipPhone",
                              v.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          maxLength={10}
                          required
                        />
                      </Field>
                    </div>
                  )}

                  <Field label="Address Line 1" required>
                    <Input
                      placeholder="House / Flat, Street"
                      value={form.shipLine1}
                      onChange={(v) => set("shipLine1", v)}
                      required
                    />
                  </Field>
                  <Field label="Address Line 2 (optional)">
                    <Input
                      placeholder="Landmark, Area"
                      value={form.shipLine2}
                      onChange={(v) => set("shipLine2", v)}
                    />
                  </Field>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <Field label="City" required>
                      <Input
                        value={form.shipCity}
                        onChange={(v) => set("shipCity", v)}
                        required
                      />
                    </Field>
                    <Field label="State" required>
                      <Input
                        value={form.shipState}
                        onChange={(v) => set("shipState", v)}
                        required
                      />
                    </Field>
                    <Field label="Pincode" required>
                      <Input
                        value={form.shipPincode}
                        onChange={(v) =>
                          set(
                            "shipPincode",
                            v.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        maxLength={6}
                        pattern="\d{6}"
                        required
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="Order Notes (Optional)" step={3}>
                  <textarea
                    rows={3}
                    placeholder="Special instructions, gift message..."
                    value={form.customerNote}
                    onChange={(e) => set("customerNote", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid var(--border)",
                      fontSize: "14px",
                      backgroundColor: "var(--surface)",
                      resize: "vertical",
                    }}
                  />
                </Section>
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
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "20px",
                    }}
                  >
                    Order Summary
                  </h3>

                  <div style={{ marginBottom: "24px" }}>
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "12px",
                          padding: "12px 0",
                          borderBottom: "1px solid var(--border-soft)",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            background:
                              "linear-gradient(135deg, #F5EFE8, #E8DDD1)",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0].url}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "📸"
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.product?.name}
                          </p>
                          {item.variant && (
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {item.variant.name}
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
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {formatPrice(
                            Number(item.unitPrice) * item.quantity
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: "8px", fontSize: "13px" }}
                    >
                      <span style={{ color: "var(--text-secondary)" }}>
                        Subtotal
                      </span>
                      <span
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: "8px", fontSize: "12px" }}
                    >
                      <span style={{ color: "var(--text-secondary)" }}>
                        Shipping
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Auto-calculated
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-baseline justify-between"
                    style={{
                      paddingTop: "16px",
                      borderTop: "1px solid var(--border-soft)",
                      marginBottom: "20px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>
                      Estimated Total
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "var(--accent)",
                      }}
                    >
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {error && (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "#FEF2F2",
                        color: "#DC2626",
                        fontSize: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={placing}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "16px",
                      fontSize: "14px",
                    }}
                  >
                    {placing ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                          strokeWidth={2}
                        />
                        Processing...
                      </>
                    ) : method === "whatsapp" ? (
                      <>
                        Continue to WhatsApp
                        <MessageCircle size={16} strokeWidth={2} />
                      </>
                    ) : (
                      <>
                        Pay Securely
                        <CreditCard size={16} strokeWidth={2} />
                      </>
                    )}
                  </button>

                  <p
                    style={{
                      marginTop: "12px",
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      textAlign: "center",
                    }}
                  >
                    🔒 Your info is encrypted & secure
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Wrap in Suspense because useSearchParams requires it
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

// ── Components ────────────────────────────────────────────────────────────

function Section({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        borderRadius: "20px",
        border: "1px solid var(--border-soft)",
        padding: "28px",
        marginBottom: "20px",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: "12px", marginBottom: "20px" }}
      >
        <span
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            backgroundColor: "var(--brand-soft)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {step}
        </span>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "6px",
          letterSpacing: "0.02em",
        }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  [k: string]: any;
}) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "12px",
        border: "1.5px solid var(--border)",
        fontSize: "14px",
        backgroundColor: "var(--bg)",
        transition: "border-color 200ms",
      }}
    />
  );
}