"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Shield,
  Award,
  Zap,
  MessageCircle,
  Check,
} from "lucide-react";
import { cartApi, buyNowApi, formatPrice } from "@/lib/cart";

interface Props {
  product: any;
}

export default function ProductDetail({ product }: Props) {
  const router = useRouter();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null
  );
  const [selectedTier, setSelectedTier] = useState<number | null>(
    product.pricingConfig?.tiers?.[0]?.quantity ?? null
  );
  const [quantity, setQuantity] = useState<number>(() => {
    const p = product.pricingConfig;
    if (!p) return 1;
    if (p.strategy === "TIERED_PRICING" && p.tiers[0])
      return p.tiers[0].quantity;
    if (p.strategy === "INCREMENTAL_QUANTITY")
      return p.minimumOrderQuantity || p.incrementQuantity || 1;
    return 1;
  });

  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  // ── Derived values ────────────────────────────────────────────────────

  const selectedVariant = useMemo(
    () => product.variants.find((v: any) => v.id === selectedVariantId),
    [selectedVariantId, product.variants]
  );

  // Step size for quantity buttons
  const quantityStep = useMemo(() => {
    const p = product.pricingConfig;
    if (!p) return 1;
    if (p.strategy === "INCREMENTAL_QUANTITY")
      return p.incrementQuantity || 1;
    return 1;
  }, [product.pricingConfig]);

  // Minimum allowed quantity
  const quantityMin = useMemo(() => {
    const p = product.pricingConfig;
    if (!p) return 1;
    if (p.strategy === "INCREMENTAL_QUANTITY")
      return p.minimumOrderQuantity || p.incrementQuantity || 1;
    return 1;
  }, [product.pricingConfig]);

  const displayPrice = useMemo(() => {
    const p = product.pricingConfig;
    if (!p) return "Contact us";

    switch (p.strategy) {
      case "PER_UNIT":
        return p.unitPrice
          ? formatPrice(Number(p.unitPrice) * quantity)
          : "—";
      case "INCREMENTAL_QUANTITY": {
        if (!p.incrementPrice || !p.incrementQuantity) return "—";
        const inc = Math.ceil(quantity / p.incrementQuantity);
        return formatPrice(Number(p.incrementPrice) * inc);
      }
      case "TIERED_PRICING": {
        const tier = p.tiers.find((t: any) => t.quantity === selectedTier);
        if (tier) return formatPrice(tier.price);
        if (p.baseUnitPrice)
          return formatPrice(Number(p.baseUnitPrice) * quantity);
        return "—";
      }
      case "FIXED_VARIANTS":
        return selectedVariant
          ? formatPrice(Number(selectedVariant.price) * quantity)
          : "—";
      case "CUSTOM_QUOTE":
        return "Contact us";
      default:
        return "—";
    }
  }, [product.pricingConfig, quantity, selectedTier, selectedVariant]);

  // ── Validation ────────────────────────────────────────────────────────

  const validate = (): boolean => {
    for (const field of product.customFields || []) {
      if (field.isRequired && field.type !== "PHOTO_UPLOAD") {
        if (!customFieldValues[field.id]) {
          setError(`${field.label} is required`);
          return false;
        }
      }
    }
    return true;
  };

  const buildCustomizations = () =>
    (product.customFields || [])
      .filter(
        (f: any) => customFieldValues[f.id] && f.type !== "PHOTO_UPLOAD"
      )
      .map((f: any) => {
        const base = {
          customFieldId: f.id,
          fieldLabel: f.label,
          fieldType: f.type,
        };
        if (f.type === "NUMBER")
          return { ...base, numberValue: Number(customFieldValues[f.id]) };
        if (f.type === "DATE")
          return {
            ...base,
            dateValue: new Date(customFieldValues[f.id]).toISOString(),
          };
        if (f.type === "CHECKBOX")
          return {
            ...base,
            booleanValue: customFieldValues[f.id] === "true",
          };
        return { ...base, textValue: customFieldValues[f.id] };
      });

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleAddToCart = async () => {
    setError("");
    if (!validate()) return;

    setAdding(true);
    try {
      await cartApi.addItem({
        productId: product.id,
        variantId: selectedVariantId || undefined,
        quantity,
        selectedTierQuantity: selectedTier || undefined,
        notes: notes || undefined,
        customizations: buildCustomizations(),
      });

      setAdded(true);
      setTimeout(() => {
        router.push("/cart");
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setError("");
    if (!validate()) return;

    setBuying(true);
    try {
      const session = await buyNowApi.create({
        productId: product.id,
        variantId: selectedVariantId || undefined,
        quantity,
        selectedTierQuantity: selectedTier || undefined,
        notes: notes || undefined,
        customizations: buildCustomizations(),
      });

      router.push(`/checkout/upload-method?bn=${session.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start checkout");
      setBuying(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="tcp-container">
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr", gap: "48px" }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .pdp-grid {
              grid-template-columns: 1.1fr 1fr !important;
              gap: 80px !important;
            }
          }
        `}</style>

        <div
          className="pdp-grid grid"
          style={{ gridTemplateColumns: "1fr", gap: "48px" }}
        >
          {/* ── Left — Gallery ── */}
          <div>
            <div
              style={{
                aspectRatio: "1/1",
                borderRadius: "24px",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, #F5EFE8 0%, #E8DDD1 100%)",
                marginBottom: "16px",
              }}
            >
              {product.images?.[activeImageIdx] ? (
                <img
                  src={product.images[activeImageIdx].url}
                  alt={
                    product.images[activeImageIdx].altText || product.name
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "80px",
                    opacity: 0.4,
                  }}
                >
                  📸
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                  gap: "12px",
                }}
              >
                {product.images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIdx(i)}
                    style={{
                      aspectRatio: "1/1",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border:
                        activeImageIdx === i
                          ? "2px solid var(--brand)"
                          : "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right — Info ── */}
          <div>
            <p className="tcp-eyebrow">{product.category.name}</p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                marginBottom: "12px",
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>
            {product.shortDescription && (
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "24px",
                }}
              >
                {product.shortDescription}
              </p>
            )}

            {/* Price */}
            <div
              style={{
                padding: "20px 0",
                borderTop: "1px solid var(--border-soft)",
                borderBottom: "1px solid var(--border-soft)",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  marginBottom: "4px",
                  letterSpacing: "0.05em",
                }}
              >
                TOTAL PRICE
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "36px",
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                {displayPrice}
              </div>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "12px",
                  }}
                >
                  Select Size / Variant
                </label>
                <div
                  style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                >
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        border:
                          selectedVariantId === v.id
                            ? "1.5px solid var(--text-primary)"
                            : "1.5px solid var(--border)",
                        backgroundColor:
                          selectedVariantId === v.id
                            ? "var(--brand-soft)"
                            : "var(--surface)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {v.name}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--accent)",
                          marginTop: "2px",
                          fontWeight: 600,
                        }}
                      >
                        {formatPrice(v.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tiers */}
            {product.pricingConfig?.strategy === "TIERED_PRICING" &&
              product.pricingConfig.tiers.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      marginBottom: "12px",
                    }}
                  >
                    Choose a Set
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {product.pricingConfig.tiers.map((t: any) => (
                      <button
                        key={t.quantity}
                        onClick={() => {
                          setSelectedTier(t.quantity);
                          setQuantity(t.quantity);
                        }}
                        style={{
                          position: "relative",
                          padding: "16px",
                          borderRadius: "16px",
                          border:
                            selectedTier === t.quantity
                              ? "1.5px solid var(--text-primary)"
                              : "1.5px solid var(--border)",
                          backgroundColor:
                            selectedTier === t.quantity
                              ? "var(--brand-soft)"
                              : "var(--surface)",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {t.isSpecialOffer && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "10px",
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontSize: "10px",
                              fontWeight: 600,
                              backgroundColor: "var(--accent)",
                              color: "#fff",
                            }}
                          >
                            BEST VALUE
                          </span>
                        )}
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {t.quantity} prints
                        </div>
                        {t.label && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                              marginTop: "2px",
                            }}
                          >
                            {t.label}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "var(--accent)",
                            marginTop: "6px",
                          }}
                        >
                          {formatPrice(t.price)}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                            marginTop: "2px",
                          }}
                        >
                          ₹{(Number(t.price) / t.quantity).toFixed(1)}/print
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Custom Fields */}
            {product.customFields
              ?.filter((f: any) => f.type !== "PHOTO_UPLOAD")
              .map((field: any) => (
                <div key={field.id} style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {field.label}
                    {field.isRequired && (
                      <span style={{ color: "var(--accent)" }}> *</span>
                    )}
                  </label>

                  {field.type === "TEXT" || field.type === "URL" ? (
                    <input
                      type={field.type === "URL" ? "url" : "text"}
                      placeholder={field.placeholder || ""}
                      maxLength={
                        field.validationJson?.maxTextLength || undefined
                      }
                      value={customFieldValues[field.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues((v) => ({
                          ...v,
                          [field.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "14px",
                        backgroundColor: "var(--surface)",
                      }}
                    />
                  ) : field.type === "TEXTAREA" ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder || ""}
                      maxLength={
                        field.validationJson?.maxTextLength || undefined
                      }
                      value={customFieldValues[field.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues((v) => ({
                          ...v,
                          [field.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "14px",
                        backgroundColor: "var(--surface)",
                        resize: "vertical",
                      }}
                    />
                  ) : field.type === "SELECT" || field.type === "RADIO" ? (
                    <select
                      value={customFieldValues[field.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues((v) => ({
                          ...v,
                          [field.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "14px",
                        backgroundColor: "var(--surface)",
                      }}
                    >
                      <option value="">Choose {field.label}</option>
                      {field.options?.map((opt: any) => (
                        <option key={opt.id} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "NUMBER" ? (
                    <input
                      type="number"
                      placeholder={field.placeholder || ""}
                      min={field.validationJson?.min ?? undefined}
                      max={field.validationJson?.max ?? undefined}
                      value={customFieldValues[field.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues((v) => ({
                          ...v,
                          [field.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "14px",
                        backgroundColor: "var(--surface)",
                      }}
                    />
                  ) : field.type === "DATE" ? (
                    <input
                      type="date"
                      value={customFieldValues[field.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues((v) => ({
                          ...v,
                          [field.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "14px",
                        backgroundColor: "var(--surface)",
                      }}
                    />
                  ) : null}

                  {field.helpText && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        marginTop: "6px",
                      }}
                    >
                      {field.helpText}
                    </p>
                  )}

                  {/* Show min/max hint for NUMBER fields */}
                  {field.type === "NUMBER" &&
                    (field.validationJson?.min !== undefined ||
                      field.validationJson?.max !== undefined) && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "6px",
                        }}
                      >
                        {field.validationJson?.min !== undefined &&
                          field.validationJson?.max !== undefined
                          ? `Enter a value between ${field.validationJson.min} and ${field.validationJson.max}`
                          : field.validationJson?.min !== undefined
                          ? `Minimum: ${field.validationJson.min}`
                          : `Maximum: ${field.validationJson.max}`}
                      </p>
                    )}

                  {/* Show char count hint for TEXT fields */}
                  {(field.type === "TEXT" || field.type === "TEXTAREA") &&
                    field.validationJson?.maxTextLength && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "6px",
                        }}
                      >
                        {(customFieldValues[field.id] || "").length} /{" "}
                        {field.validationJson.maxTextLength} characters
                      </p>
                    )}
                </div>
              ))}

            {/* Photo upload notice */}
            {product.configuration?.uploadRequired && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "var(--brand-soft)",
                  border: "1px solid var(--border-soft)",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--brand)",
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}
                >
                  📸 Photo upload required
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  You&apos;ll upload{" "}
                  {product.configuration.minImages ===
                  product.configuration.maxImages
                    ? `${product.configuration.maxImages}`
                    : `${product.configuration.minImages || 1}–${
                        product.configuration.maxImages
                      }`}{" "}
                  photos in the next step.
                </p>
              </div>
            )}

            {/* Quantity — not shown for TIERED or FIXED_VARIANTS */}
            {product.pricingConfig?.strategy !== "TIERED_PRICING" &&
              product.pricingConfig?.strategy !== "FIXED_VARIANTS" && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Quantity
                    {product.pricingConfig?.strategy ===
                      "INCREMENTAL_QUANTITY" && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          fontWeight: 400,
                        }}
                      >
                        (steps of {quantityStep})
                      </span>
                    )}
                  </label>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "6px 8px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "999px",
                    }}
                  >
                    {/* MINUS — steps down by quantityStep, never below quantityMin */}
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          Math.max(quantityMin, q - quantityStep)
                        )
                      }
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        backgroundColor: "var(--brand-soft)",
                        color: "var(--brand)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={14} strokeWidth={2} />
                    </button>

                    <span
                      style={{
                        minWidth: "40px",
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      {quantity}
                    </span>

                    {/* PLUS — steps up by quantityStep */}
                    <button
                      onClick={() =>
                        setQuantity((q) => q + quantityStep)
                      }
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        backgroundColor: "var(--brand-soft)",
                        color: "var(--brand)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}

            {/* Notes */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                Special Instructions (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Any special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border)",
                  fontSize: "14px",
                  backgroundColor: "var(--surface)",
                  resize: "vertical",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleBuyNow}
                disabled={buying || adding || added}
                className="btn-primary"
                style={{ flex: 1, minWidth: "180px", padding: "16px" }}
              >
                {buying ? (
                  "Starting checkout..."
                ) : (
                  <>
                    <Zap size={16} strokeWidth={2} />
                    Buy Now
                  </>
                )}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={adding || buying || added}
                className="btn-secondary"
                style={{ flex: 1, minWidth: "180px", padding: "15px" }}
              >
                {added ? (
                  <>
                    <Check size={16} strokeWidth={2} />
                    Added to Cart
                  </>
                ) : adding ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingBag size={16} strokeWidth={2} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            <a
              href="https://wa.me/918086415357"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "24px",
              }}
            >
              <MessageCircle size={14} strokeWidth={1.75} />
              Need help? Chat with us on WhatsApp
            </a>

            {/* Trust badges */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              {[
                { icon: Truck, label: "7–10 days" },
                { icon: Shield, label: "Secure Pay" },
                { icon: Award, label: "Premium" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    style={{ color: "var(--brand)", margin: "0 auto 6px" }}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div style={{ marginTop: "80px", maxWidth: "800px" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                marginBottom: "20px",
                color: "var(--text-primary)",
              }}
            >
              About This Product
            </h2>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.8,
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
              }}
            >
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}