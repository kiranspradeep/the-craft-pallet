"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  MessageCircle,
  Loader2,
  ImageIcon,
  Lock,
  AlertCircle,
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

// ── Validation ────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  shipName?: string;
  shipPhone?: string;
  shipLine1?: string;
  shipCity?: string;
  shipState?: string;
  shipPincode?: string;
}

function validateForm(
  form: Record<string, string>,
  sameShipping: boolean
): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Full name is required";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit phone number";
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!sameShipping) {
    if (!form.shipName.trim()) {
      errors.shipName = "Recipient name is required";
    }
    if (!form.shipPhone.trim()) {
      errors.shipPhone = "Recipient phone is required";
    } else if (!/^\d{10}$/.test(form.shipPhone.trim())) {
      errors.shipPhone = "Enter a valid 10-digit phone number";
    }
  }

  if (!form.shipLine1.trim()) {
    errors.shipLine1 = "Address is required";
  }

  if (!form.shipCity.trim()) {
    errors.shipCity = "City is required";
  }

  if (!form.shipState.trim()) {
    errors.shipState = "State is required";
  }

  if (!form.shipPincode.trim()) {
    errors.shipPincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(form.shipPincode.trim())) {
    errors.shipPincode = "Enter a valid 6-digit pincode";
  }

  return errors;
}

// ── Main Component ────────────────────────────────────────────────────────

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
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear field error when user starts typing
    if (fieldErrors[k as keyof FormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const touch = (k: string) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Run validation
    const errors = validateForm(form, sameShipping);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Mark all fields as touched so errors show
      const allTouched: Record<string, boolean> = {};
      Object.keys(form).forEach((k) => (allTouched[k] = true));
      setTouched(allTouched);

      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.querySelector(`[data-field="${firstErrorKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPlacing(true);

    try {
      const couponCode = sessionStorage.getItem("tcp_coupon");
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        shipName: sameShipping ? form.name.trim() : form.shipName.trim(),
        shipPhone: sameShipping
          ? form.phone.trim()
          : form.shipPhone.trim(),
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
      "Hello Craft Pallet",
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
    window.location.href = `https://wa.me/918086415357?text=${encodeURIComponent(
      parts
    )}`;
  };

  const openRazorpayCheckout = async (order: any) => {
    try {
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
      if (!rzpRes.ok)
        throw new Error(rzpData.message || "Failed to initialize payment");
      const razorpayData = rzpData.data;

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
        notes: { orderNumber: order.orderNumber, orderId: order.id },
        theme: { color: "#2B2B2B" },
        handler: function () {
          setTimeout(() => {
            router.push(
              `/order-confirmation/${order.orderNumber}?phone=${form.phone}&paid=true`
            );
          }, 1500);
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
      <div
        style={{
          padding: "160px 0",
          textAlign: "center",
          backgroundColor: "var(--bg)",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
          Loading checkout...
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div style={{ backgroundColor: "var(--bg)", padding: "56px 0 120px" }}>
        <div className="tcp-container">
          {/* Header */}
          <div style={{ marginBottom: "48px" }}>
            <Link
              href={`/checkout/upload-method${
                buyNowId ? `?bn=${buyNowId}` : ""
              }`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--text-tertiary)",
                marginBottom: "24px",
                letterSpacing: "0.02em",
                transition: "color 200ms ease",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={13} strokeWidth={1.75} />
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
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {method === "whatsapp" ? (
                <>
                  Your Details for{" "}
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

          <form onSubmit={handleSubmit} noValidate>
            <style>{`
              @media (min-width: 900px) {
                .checkout-grid {
                  grid-template-columns: 1fr 340px !important;
                  gap: 56px !important;
                }
              }
              @media (max-width: 640px) {
                .field-grid-2 { grid-template-columns: 1fr !important; }
                .field-grid-3 { grid-template-columns: 1fr !important; }
              }
            `}</style>

            <div
              className="checkout-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "32px",
              }}
            >
              {/* Left — Form */}
              <div>
                {/* Contact Information */}
                <FormSection title="Contact Information" step={1}>
                  <div
                    className="field-grid-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <Field label="Full Name" required error={touched.name ? fieldErrors.name : undefined}>
                      <Input
                        data-field="name"
                        placeholder="Priya Sharma"
                        value={form.name}
                        onChange={(v) => set("name", v)}
                        onBlur={() => touch("name")}
                        hasError={!!(touched.name && fieldErrors.name)}
                        required
                      />
                    </Field>
                    <Field label="Phone" required error={touched.phone ? fieldErrors.phone : undefined}>
                      <Input
                        data-field="phone"
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={(v) =>
                          set("phone", v.replace(/\D/g, "").slice(0, 10))
                        }
                        onBlur={() => touch("phone")}
                        hasError={!!(touched.phone && fieldErrors.phone)}
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Field>
                  </div>
                  <Field
                    label="Email (optional)"
                    error={touched.email ? fieldErrors.email : undefined}
                  >
                    <Input
                      data-field="email"
                      type="email"
                      placeholder="priya@example.com"
                      value={form.email}
                      onChange={(v) => set("email", v)}
                      onBlur={() => touch("email")}
                      hasError={!!(touched.email && fieldErrors.email)}
                    />
                  </Field>
                </FormSection>

                {/* Shipping Address */}
                <FormSection title="Shipping Address" step={2}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "20px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sameShipping}
                      onChange={(e) => {
                        setSameShipping(e.target.checked);
                        // Clear ship field errors when toggling
                        setFieldErrors((prev) => ({
                          ...prev,
                          shipName: undefined,
                          shipPhone: undefined,
                        }));
                      }}
                      style={{ accentColor: "var(--text-primary)" }}
                    />
                    Same as contact info
                  </label>

                  {!sameShipping && (
                    <div
                      className="field-grid-2"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <Field
                        label="Recipient Name"
                        required
                        error={touched.shipName ? fieldErrors.shipName : undefined}
                      >
                        <Input
                          data-field="shipName"
                          value={form.shipName}
                          onChange={(v) => set("shipName", v)}
                          onBlur={() => touch("shipName")}
                          hasError={!!(touched.shipName && fieldErrors.shipName)}
                          placeholder="Priya Sharma"
                        />
                      </Field>
                      <Field
                        label="Recipient Phone"
                        required
                        error={touched.shipPhone ? fieldErrors.shipPhone : undefined}
                      >
                        <Input
                          data-field="shipPhone"
                          value={form.shipPhone}
                          onChange={(v) =>
                            set("shipPhone", v.replace(/\D/g, "").slice(0, 10))
                          }
                          onBlur={() => touch("shipPhone")}
                          hasError={
                            !!(touched.shipPhone && fieldErrors.shipPhone)
                          }
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="9876543210"
                        />
                      </Field>
                    </div>
                  )}

                  <Field
                    label="Address Line 1"
                    required
                    error={touched.shipLine1 ? fieldErrors.shipLine1 : undefined}
                  >
                    <Input
                      data-field="shipLine1"
                      placeholder="House / Flat, Street"
                      value={form.shipLine1}
                      onChange={(v) => set("shipLine1", v)}
                      onBlur={() => touch("shipLine1")}
                      hasError={!!(touched.shipLine1 && fieldErrors.shipLine1)}
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
                    className="field-grid-3"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <Field
                      label="City"
                      required
                      error={touched.shipCity ? fieldErrors.shipCity : undefined}
                    >
                      <Input
                        data-field="shipCity"
                        value={form.shipCity}
                        onChange={(v) => set("shipCity", v)}
                        onBlur={() => touch("shipCity")}
                        hasError={!!(touched.shipCity && fieldErrors.shipCity)}
                        placeholder="Mumbai"
                      />
                    </Field>
                    <Field
                      label="State"
                      required
                      error={touched.shipState ? fieldErrors.shipState : undefined}
                    >
                      <Input
                        data-field="shipState"
                        value={form.shipState}
                        onChange={(v) => set("shipState", v)}
                        onBlur={() => touch("shipState")}
                        hasError={!!(touched.shipState && fieldErrors.shipState)}
                        placeholder="Maharashtra"
                      />
                    </Field>
                    <Field
                      label="Pincode"
                      required
                      error={touched.shipPincode ? fieldErrors.shipPincode : undefined}
                    >
                      <Input
                        data-field="shipPincode"
                        value={form.shipPincode}
                        onChange={(v) =>
                          set("shipPincode", v.replace(/\D/g, "").slice(0, 6))
                        }
                        onBlur={() => touch("shipPincode")}
                        hasError={
                          !!(touched.shipPincode && fieldErrors.shipPincode)
                        }
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="400001"
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* Order Notes */}
                <FormSection title="Order Notes" step={3}>
                  <textarea
                    rows={3}
                    placeholder="Special instructions, gift message..."
                    value={form.customerNote}
                    onChange={(e) => set("customerNote", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "var(--radius-input)",
                      border: "1px solid var(--border)",
                      fontSize: "14px",
                      backgroundColor: "var(--bg)",
                      color: "var(--text-primary)",
                      resize: "vertical",
                      transition: "border-color 200ms ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--brand)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      marginTop: "6px",
                    }}
                  >
                    Optional
                  </p>
                </FormSection>
              </div>

              {/* Right — Summary */}
              <div>
                <div
                  style={{
                    position: "sticky",
                    top: "96px",
                    backgroundColor: "var(--surface)",
                    borderRadius: "var(--radius-card)",
                    border: "1px solid var(--border-soft)",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      marginBottom: "20px",
                    }}
                  >
                    Order Summary
                  </h3>

                  {/* Items */}
                  <div style={{ marginBottom: "20px" }}>
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
                            width: "44px",
                            height: "44px",
                            borderRadius: "var(--radius-card)",
                            overflow: "hidden",
                            backgroundColor: "var(--brand-soft)",
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
                            <ImageIcon
                              size={18}
                              strokeWidth={1}
                              style={{ color: "var(--border)", opacity: 0.6 }}
                            />
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
                                color: "var(--text-tertiary)",
                                marginTop: "1px",
                              }}
                            >
                              {item.variant.name}
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
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatPrice(Number(item.unitPrice) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Subtotal
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        Shipping
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "16px 0",
                      borderTop: "1px solid var(--border-soft)",
                      borderBottom: "1px solid var(--border-soft)",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Estimated Total
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {error && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-input)",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        fontSize: "12px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle
                        size={14}
                        strokeWidth={1.75}
                        style={{ flexShrink: 0, marginTop: "1px" }}
                      />
                      {error}
                    </div>
                  )}

                  {/* Validation summary — shown when form submitted with errors */}
                  {Object.keys(fieldErrors).length > 0 &&
                    Object.values(touched).some(Boolean) && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: "var(--radius-input)",
                          backgroundColor: "#FEF2F2",
                          border: "1px solid #FECACA",
                          color: "#DC2626",
                          fontSize: "12px",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <AlertCircle
                          size={14}
                          strokeWidth={1.75}
                          style={{ flexShrink: 0, marginTop: "1px" }}
                        />
                        Please fix the errors in the form above
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={placing}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      backgroundColor:
                        method === "whatsapp"
                          ? "var(--text-primary)"
                          : "var(--accent)",
                    }}
                  >
                    {placing ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                          strokeWidth={2}
                        />
                        Processing...
                      </>
                    ) : method === "whatsapp" ? (
                      <>
                        Continue to WhatsApp
                        <MessageCircle size={15} strokeWidth={2} />
                      </>
                    ) : (
                      <>
                        Pay Securely
                        <CreditCard size={15} strokeWidth={2} />
                      </>
                    )}
                  </button>

                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Lock
                      size={11}
                      strokeWidth={1.75}
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-tertiary)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Your information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function FormSection({
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
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--border-soft)",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: "var(--text-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {step}
        </span>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "0.01em",
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
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: error ? "#DC2626" : "var(--text-tertiary)",
          marginBottom: "7px",
          transition: "color 200ms ease",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--accent)", marginLeft: "2px" }}>*</span>
        )}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: "11px",
            color: "#DC2626",
            marginTop: "5px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <AlertCircle size={11} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({
  value,
  onChange,
  onBlur,
  hasError,
  "data-field": dataField,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  "data-field"?: string;
  [k: string]: any;
}) {
  return (
    <input
      {...props}
      data-field={dataField}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: "var(--radius-input)",
        border: `1px solid ${hasError ? "#DC2626" : "var(--border)"}`,
        fontSize: "14px",
        backgroundColor: hasError ? "#FEF2F2" : "var(--bg)",
        color: "var(--text-primary)",
        transition: "border-color 200ms ease, background-color 200ms ease",
        outline: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = hasError ? "#DC2626" : "var(--brand)";
        e.currentTarget.style.backgroundColor = "var(--bg)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = hasError
          ? "#DC2626"
          : "var(--border)";
        if (hasError)
          e.currentTarget.style.backgroundColor = "#FEF2F2";
      }}
    />
  );
}