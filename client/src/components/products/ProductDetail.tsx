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
  MessageCircle,
  Check,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { cartApi, buyNowApi, formatPrice } from "@/lib/cart";

interface VariantImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  images: VariantImage[];
}

interface Props {
  product: any;
}

export default function ProductDetail({
  product,
}: Props) {
  const router = useRouter();

  const [activeImageIdx, setActiveImageIdx] =
    useState(0);

  const [selectedVariantId, setSelectedVariantId] =
    useState<string | null>(
      product.variants[0]?.id ?? null
    );

  const [selectedTier, setSelectedTier] =
    useState<number | null>(
      product.pricingConfig?.tiers?.[0]?.quantity ??
        null
    );

  const [quantity, setQuantity] =
    useState<number>(() => {
      const p = product.pricingConfig;

      if (!p) return 1;

      if (
        p.strategy === "TIERED_PRICING" &&
        p.tiers[0]
      ) {
        return p.tiers[0].quantity;
      }

      if (
        p.strategy === "INCREMENTAL_QUANTITY"
      ) {
        return (
          p.minimumOrderQuantity ||
          p.incrementQuantity ||
          1
        );
      }

      return 1;
    });

  const [
    customFieldValues,
    setCustomFieldValues,
  ] = useState<Record<string, string>>({});

  const [notes, setNotes] = useState("");

  const [adding, setAdding] =
    useState(false);

  const [buying, setBuying] =
    useState(false);

  const [added, setAdded] =
    useState(false);

  const [error, setError] =
    useState("");

  // ─────────────────────────────────────────────────────────────────
  // Selected Variant
  // ─────────────────────────────────────────────────────────────────

  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (v: Variant) =>
          v.id === selectedVariantId
      ),
    [
      selectedVariantId,
      product.variants,
    ]
  );

  // ─────────────────────────────────────────────────────────────────
  // Gallery Images
  //
  // Variant images take priority.
  // If no variant images exist, use product images.
  // ─────────────────────────────────────────────────────────────────

  const galleryImages = useMemo(() => {
    if (
      selectedVariant?.images?.length > 0
    ) {
      return selectedVariant.images as VariantImage[];
    }

    return (product.images ?? []) as any[];
  }, [
    selectedVariant,
    product.images,
  ]);

  // ─────────────────────────────────────────────────────────────────
  // Quantity
  // ─────────────────────────────────────────────────────────────────

  const quantityStep = useMemo(() => {
    const p = product.pricingConfig;

    if (!p) return 1;

    if (
      p.strategy ===
      "INCREMENTAL_QUANTITY"
    ) {
      return p.incrementQuantity || 1;
    }

    return 1;
  }, [product.pricingConfig]);

  const quantityMin = useMemo(() => {
    const p = product.pricingConfig;

    if (!p) return 1;

    if (
      p.strategy ===
      "INCREMENTAL_QUANTITY"
    ) {
      return (
        p.minimumOrderQuantity ||
        p.incrementQuantity ||
        1
      );
    }

    return 1;
  }, [product.pricingConfig]);

  // ─────────────────────────────────────────────────────────────────
  // Display Price
  // ─────────────────────────────────────────────────────────────────

  const displayPrice = useMemo(() => {
    const p = product.pricingConfig;

    if (!p) return "Contact us";

    switch (p.strategy) {
      case "PER_UNIT":
        return p.unitPrice
          ? formatPrice(
              Number(p.unitPrice) *
                quantity
            )
          : "—";

      case "INCREMENTAL_QUANTITY": {
        if (
          !p.incrementPrice ||
          !p.incrementQuantity
        ) {
          return "—";
        }

        const inc = Math.ceil(
          quantity /
            p.incrementQuantity
        );

        return formatPrice(
          Number(p.incrementPrice) *
            inc
        );
      }

      case "TIERED_PRICING": {
        const tier = p.tiers.find(
          (t: any) =>
            t.quantity ===
            selectedTier
        );

        if (tier) {
          return formatPrice(
            tier.price
          );
        }

        if (p.baseUnitPrice) {
          return formatPrice(
            Number(
              p.baseUnitPrice
            ) * quantity
          );
        }

        return "—";
      }

      case "FIXED_VARIANTS":
        return selectedVariant
          ? formatPrice(
              Number(
                selectedVariant.price
              ) * quantity
            )
          : "—";

      case "CUSTOM_QUOTE":
        return "Contact us";

      default:
        return "—";
    }
  }, [
    product.pricingConfig,
    quantity,
    selectedTier,
    selectedVariant,
  ]);

  // ─────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    for (const field of
      product.customFields || []) {
      if (
        field.isRequired &&
        field.type !== "PHOTO_UPLOAD"
      ) {
        if (
          !customFieldValues[field.id]
        ) {
          setError(
            `${field.label} is required`
          );
          return false;
        }
      }
    }

    return true;
  };

  // ─────────────────────────────────────────────────────────────────
  // Build Customizations
  // ─────────────────────────────────────────────────────────────────

  const buildCustomizations = () =>
    (product.customFields || [])
      .filter(
        (f: any) =>
          customFieldValues[f.id] &&
          f.type !== "PHOTO_UPLOAD"
      )
      .map((f: any) => {
        const base = {
          customFieldId: f.id,
          fieldLabel: f.label,
          fieldType: f.type,
        };

        if (f.type === "NUMBER") {
          return {
            ...base,
            numberValue: Number(
              customFieldValues[f.id]
            ),
          };
        }

        if (f.type === "DATE") {
          return {
            ...base,
            dateValue: new Date(
              customFieldValues[f.id]
            ).toISOString(),
          };
        }

        if (f.type === "CHECKBOX") {
          return {
            ...base,
            booleanValue:
              customFieldValues[
                f.id
              ] === "true",
          };
        }

        return {
          ...base,
          textValue:
            customFieldValues[f.id],
        };
      });

  // ─────────────────────────────────────────────────────────────────
  // Add To Cart
  // ─────────────────────────────────────────────────────────────────

  const handleAddToCart = async () => {
    setError("");

    if (!validate()) return;

    setAdding(true);

    try {
      await cartApi.addItem({
        productId: product.id,
        variantId:
          selectedVariantId ||
          undefined,
        quantity,
        selectedTierQuantity:
          selectedTier ||
          undefined,
        notes:
          notes || undefined,
        customizations:
          buildCustomizations(),
      });

      setAdded(true);

      setTimeout(() => {
        router.push("/cart");
      }, 800);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to add to cart"
      );

      setAdding(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Buy Now
  // ─────────────────────────────────────────────────────────────────

  const handleBuyNow = async () => {
    setError("");

    if (!validate()) return;

    setBuying(true);

    try {
      const session =
        await buyNowApi.create({
          productId: product.id,
          variantId:
            selectedVariantId ||
            undefined,
          quantity,
          selectedTierQuantity:
            selectedTier ||
            undefined,
          notes:
            notes || undefined,
          customizations:
            buildCustomizations(),
        });

      router.push(
        `/checkout/upload-method?bn=${session.id}`
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to start checkout"
      );

      setBuying(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Styles
  // ─────────────────────────────────────────────────────────────────

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius:
      "var(--radius-input)",
    border: "1px solid var(--border)",
    fontSize: "14px",
    backgroundColor:
      "var(--surface)",
    color: "var(--text-primary)",
    transition:
      "border-color 200ms ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform:
      "uppercase" as const,
    color: "var(--text-tertiary)",
    marginBottom: "10px",
  };

  return (
    <div
      className="tcp-container"
      style={{
        padding:
          "48px 32px 80px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr",
          gap: "48px",
        }}
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
          className="pdp-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr",
            gap: "48px",
          }}
        >
          {/* ═══════════════════════════════════════════════════════════
              PRODUCT GALLERY
          ═══════════════════════════════════════════════════════════ */}

          <div>
            {/* ─────────────────────────────────────────────────────────
                Main Image
            ───────────────────────────────────────────────────────── */}

            <div
              style={{
                aspectRatio: "1 / 1",
                borderRadius:
                  "var(--radius-card)",
                overflow: "hidden",
                backgroundColor:
                  "var(--brand-soft)",
                marginBottom: "12px",

                // Center the image.
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {galleryImages[
                activeImageIdx
              ] ? (
                <img
                  src={
                    galleryImages[
                      activeImageIdx
                    ].url
                  }
                  alt={
                    galleryImages[
                      activeImageIdx
                    ].altText ||
                    product.name
                  }
                  loading="eager"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",

                    // IMPORTANT:
                    // Never crop the original product image.
                    objectFit: "contain",
                    objectPosition:
                      "center",

                    // Prevent inline-image spacing.
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <ImageIcon
                    size={40}
                    strokeWidth={1}
                    style={{
                      color:
                        "var(--border)",
                      opacity: 0.5,
                    }}
                  />
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────
                Thumbnails
            ───────────────────────────────────────────────────────── */}

            {galleryImages.length >
              1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(72px, 1fr))",
                  gap: "8px",
                }}
              >
                {galleryImages.map(
                  (
                    img: any,
                    i: number
                  ) => (
                    <button
                      key={img.id}
                      type="button"
                      aria-label={`View image ${
                        i + 1
                      }`}
                      onClick={() =>
                        setActiveImageIdx(
                          i
                        )
                      }
                      style={{
                        aspectRatio:
                          "1 / 1",
                        borderRadius:
                          "var(--radius-card)",
                        overflow:
                          "hidden",
                        border:
                          activeImageIdx ===
                          i
                            ? "1.5px solid var(--text-primary)"
                            : "1px solid var(--border)",
                        cursor:
                          "pointer",
                        transition:
                          "border-color 200ms ease",
                        padding: 0,

                        // Keep thumbnail background consistent.
                        backgroundColor:
                          "var(--brand-soft)",

                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <img
                        src={img.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",

                          // IMPORTANT:
                          // Thumbnails should also never crop.
                          objectFit:
                            "contain",
                          objectPosition:
                            "center",

                          display: "block",
                        }}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              PRODUCT INFORMATION
          ═══════════════════════════════════════════════════════════ */}

          <div>
            {/* Category */}
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
                color:
                  "var(--text-tertiary)",
                marginBottom:
                  "12px",
              }}
            >
              {product.category.name}
            </p>

            {/* Title */}
            <h1
              style={{
                fontFamily:
                  "'Playfair Display', serif",
                fontSize:
                  "clamp(26px, 3.5vw, 38px)",
                fontWeight: 500,
                letterSpacing:
                  "-0.02em",
                color:
                  "var(--text-primary)",
                lineHeight: 1.15,
                marginBottom:
                  "16px",
              }}
            >
              {product.name}
            </h1>

            {/* Short Description */}
            {product.shortDescription && (
              <p
                style={{
                  fontSize: "15px",
                  color:
                    "var(--text-secondary)",
                  lineHeight: 1.75,
                  marginBottom:
                    "28px",
                }}
              >
                {
                  product.shortDescription
                }
              </p>
            )}

            {/* Price */}
            <div
              style={{
                padding:
                  "20px 0",
                borderTop:
                  "1px solid var(--border-soft)",
                borderBottom:
                  "1px solid var(--border-soft)",
                marginBottom:
                  "28px",
              }}
            >
              <p
                style={
                  labelStyle
                }
              >
                Total Price
              </p>

              <div
                style={{
                  fontFamily:
                    "'Playfair Display', serif",
                  fontSize: "34px",
                  fontWeight: 600,
                  color:
                    "var(--text-primary)",
                  letterSpacing:
                    "-0.02em",
                }}
              >
                {displayPrice}
              </div>
            </div>

            {/* Variants */}
            {product.variants
              ?.length > 0 && (
              <div
                style={{
                  marginBottom:
                    "24px",
                }}
              >
                <p
                  style={
                    labelStyle
                  }
                >
                  Size / Variant
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  {product.variants.map(
                    (
                      v: Variant
                    ) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(
                            v.id
                          );

                          // Reset gallery when
                          // changing variants.
                          setActiveImageIdx(
                            0
                          );
                        }}
                        style={{
                          padding:
                            "10px 18px",
                          borderRadius:
                            "var(--radius-input)",
                          border:
                            selectedVariantId ===
                            v.id
                              ? "1.5px solid var(--text-primary)"
                              : "1px solid var(--border)",
                          backgroundColor:
                            selectedVariantId ===
                            v.id
                              ? "var(--text-primary)"
                              : "transparent",
                          color:
                            selectedVariantId ===
                            v.id
                              ? "#fff"
                              : "var(--text-primary)",
                          fontSize:
                            "13px",
                          fontWeight:
                            500,
                          cursor:
                            "pointer",
                          transition:
                            "all 200ms ease",
                        }}
                      >
                        {v.name}

                        <span
                          style={{
                            display:
                              "block",
                            fontSize:
                              "12px",
                            fontWeight:
                              400,
                            opacity:
                              0.75,
                            marginTop:
                              "1px",
                          }}
                        >
                          {formatPrice(
                            v.price
                          )}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Tiers */}
            {product
              .pricingConfig
              ?.strategy ===
              "TIERED_PRICING" &&
              product.pricingConfig
                .tiers.length >
                0 && (
                <div
                  style={{
                    marginBottom:
                      "24px",
                  }}
                >
                  <p
                    style={
                      labelStyle
                    }
                  >
                    Choose a Set
                  </p>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {product
                      .pricingConfig
                      .tiers.map(
                        (t: any) => (
                          <button
                            key={
                              t.quantity
                            }
                            type="button"
                            onClick={() => {
                              setSelectedTier(
                                t.quantity
                              );

                              setQuantity(
                                t.quantity
                              );
                            }}
                            style={{
                              position:
                                "relative",
                              padding:
                                "14px 16px",
                              borderRadius:
                                "var(--radius-input)",
                              border:
                                selectedTier ===
                                t.quantity
                                  ? "1.5px solid var(--text-primary)"
                                  : "1px solid var(--border)",
                              backgroundColor:
                                selectedTier ===
                                t.quantity
                                  ? "var(--text-primary)"
                                  : "transparent",
                              color:
                                selectedTier ===
                                t.quantity
                                  ? "#fff"
                                  : "var(--text-primary)",
                              textAlign:
                                "left",
                              cursor:
                                "pointer",
                              transition:
                                "all 200ms ease",
                            }}
                          >
                            {t.isSpecialOffer && (
                              <span
                                style={{
                                  position:
                                    "absolute",
                                  top:
                                    "-8px",
                                  right:
                                    "8px",
                                  padding:
                                    "2px 8px",
                                  borderRadius:
                                    "var(--radius-badge)",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    600,
                                  letterSpacing:
                                    "0.08em",
                                  textTransform:
                                    "uppercase",
                                  backgroundColor:
                                    "var(--accent)",
                                  color:
                                    "#fff",
                                }}
                              >
                                Best Value
                              </span>
                            )}

                            <div
                              style={{
                                fontSize:
                                  "13px",
                                fontWeight:
                                  600,
                                marginBottom:
                                  "2px",
                              }}
                            >
                              {
                                t.quantity
                              }{" "}
                              prints
                            </div>

                            {t.label && (
                              <div
                                style={{
                                  fontSize:
                                    "11px",
                                  opacity:
                                    0.65,
                                  marginBottom:
                                    "4px",
                                }}
                              >
                                {t.label}
                              </div>
                            )}

                            <div
                              style={{
                                fontSize:
                                  "16px",
                                fontWeight:
                                  700,
                              }}
                            >
                              {formatPrice(
                                t.price
                              )}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "11px",
                                opacity:
                                  0.6,
                                marginTop:
                                  "2px",
                              }}
                            >
                              ₹
                              {(
                                Number(
                                  t.price
                                ) /
                                t.quantity
                              ).toFixed(
                                1
                              )}
                              /print
                            </div>
                          </button>
                        )
                      )}
                  </div>
                </div>
              )}

            {/* Custom Fields */}
            {product.customFields
              ?.filter(
                (f: any) =>
                  f.type !==
                  "PHOTO_UPLOAD"
              )
              .map(
                (field: any) => (
                  <div
                    key={
                      field.id
                    }
                    style={{
                      marginBottom:
                        "20px",
                    }}
                  >
                    <label
                      style={
                        labelStyle
                      }
                    >
                      {field.label}

                      {field.isRequired && (
                        <span
                          style={{
                            color:
                              "var(--accent)",
                            marginLeft:
                              "2px",
                          }}
                        >
                          *
                        </span>
                      )}
                    </label>

                    {field.type ===
                      "TEXT" ||
                    field.type ===
                      "URL" ? (
                      <input
                        type={
                          field.type ===
                          "URL"
                            ? "url"
                            : "text"
                        }
                        placeholder={
                          field.placeholder ||
                          ""
                        }
                        maxLength={
                          field
                            .validationJson
                            ?.maxTextLength ||
                          undefined
                        }
                        value={
                          customFieldValues[
                            field.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setCustomFieldValues(
                            (v) => ({
                              ...v,
                              [field.id]:
                                e.target
                                  .value,
                            })
                          )
                        }
                        style={
                          inputStyle
                        }
                      />
                    ) : field.type ===
                      "TEXTAREA" ? (
                      <textarea
                        rows={3}
                        placeholder={
                          field.placeholder ||
                          ""
                        }
                        maxLength={
                          field
                            .validationJson
                            ?.maxTextLength ||
                          undefined
                        }
                        value={
                          customFieldValues[
                            field.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setCustomFieldValues(
                            (v) => ({
                              ...v,
                              [field.id]:
                                e.target
                                  .value,
                            })
                          )
                        }
                        style={{
                          ...inputStyle,
                          resize:
                            "vertical",
                        }}
                      />
                    ) : field.type ===
                        "SELECT" ||
                      field.type ===
                        "RADIO" ? (
                      <select
                        value={
                          customFieldValues[
                            field.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setCustomFieldValues(
                            (v) => ({
                              ...v,
                              [field.id]:
                                e.target
                                  .value,
                            })
                          )
                        }
                        style={
                          inputStyle
                        }
                      >
                        <option value="">
                          Choose{" "}
                          {
                            field.label
                          }
                        </option>

                        {field.options?.map(
                          (
                            opt: any
                          ) => (
                            <option
                              key={
                                opt.id
                              }
                              value={
                                opt.value
                              }
                            >
                              {
                                opt.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    ) : field.type ===
                      "NUMBER" ? (
                      <input
                        type="number"
                        placeholder={
                          field.placeholder ||
                          ""
                        }
                        min={
                          field
                            .validationJson
                            ?.min ??
                          undefined
                        }
                        max={
                          field
                            .validationJson
                            ?.max ??
                          undefined
                        }
                        value={
                          customFieldValues[
                            field.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setCustomFieldValues(
                            (v) => ({
                              ...v,
                              [field.id]:
                                e.target
                                  .value,
                            })
                          )
                        }
                        style={
                          inputStyle
                        }
                      />
                    ) : field.type ===
                      "DATE" ? (
                      <input
                        type="date"
                        value={
                          customFieldValues[
                            field.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setCustomFieldValues(
                            (v) => ({
                              ...v,
                              [field.id]:
                                e.target
                                  .value,
                            })
                          )
                        }
                        style={
                          inputStyle
                        }
                      />
                    ) : null}

                    {field.helpText && (
                      <p
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "var(--text-tertiary)",
                          marginTop:
                            "6px",
                        }}
                      >
                        {
                          field.helpText
                        }
                      </p>
                    )}
                  </div>
                )
              )}

            {/* Photo Upload Notice */}
            {product.configuration
              ?.uploadRequired && (
              <div
                style={{
                  padding:
                    "14px 16px",
                  borderRadius:
                    "var(--radius-input)",
                  backgroundColor:
                    "var(--brand-soft)",
                  border:
                    "1px solid var(--border-soft)",
                  marginBottom:
                    "24px",
                }}
              >
                <p
                  style={{
                    fontSize:
                      "13px",
                    fontWeight:
                      500,
                    color:
                      "var(--brand)",
                    marginBottom:
                      "4px",
                  }}
                >
                  Photo upload
                  required
                </p>

                <p
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  You'll upload{" "}
                  {product
                    .configuration
                    .minImages ===
                  product
                    .configuration
                    .maxImages
                    ? `${product.configuration.maxImages}`
                    : `${
                        product
                          .configuration
                          .minImages ||
                        1
                      }–${
                        product
                          .configuration
                          .maxImages
                      }`}{" "}
                  photos in the
                  next step.
                </p>
              </div>
            )}

            {/* Quantity */}
            {product
              .pricingConfig
              ?.strategy !==
              "TIERED_PRICING" &&
              product
                .pricingConfig
                ?.strategy !==
                "FIXED_VARIANTS" && (
                <div
                  style={{
                    marginBottom:
                      "24px",
                  }}
                >
                  <p
                    style={
                      labelStyle
                    }
                  >
                    Quantity

                    {product
                      .pricingConfig
                      ?.strategy ===
                      "INCREMENTAL_QUANTITY" && (
                      <span
                        style={{
                          marginLeft:
                            "8px",
                          fontSize:
                            "10px",
                          color:
                            "var(--text-tertiary)",
                          fontWeight:
                            400,
                          textTransform:
                            "none",
                          letterSpacing:
                            0,
                        }}
                      >
                        Steps of{" "}
                        {
                          quantityStep
                        }
                      </span>
                    )}
                  </p>

                  <div
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      border:
                        "1px solid var(--border)",
                      borderRadius:
                        "var(--radius-input)",
                      overflow:
                        "hidden",
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity(
                          (q) =>
                            Math.max(
                              quantityMin,
                              q -
                                quantityStep
                            )
                        )
                      }
                      style={{
                        width:
                          "44px",
                        height:
                          "44px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        color:
                          "var(--text-primary)",
                        borderRight:
                          "1px solid var(--border)",
                        transition:
                          "background-color 150ms ease",
                      }}
                      onMouseEnter={(
                        e
                      ) => {
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "var(--bg)";
                      }}
                      onMouseLeave={(
                        e
                      ) => {
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "transparent";
                      }}
                    >
                      <Minus
                        size={14}
                        strokeWidth={
                          2
                        }
                      />
                    </button>

                    <span
                      style={{
                        minWidth:
                          "52px",
                        textAlign:
                          "center",
                        fontSize:
                          "15px",
                        fontWeight:
                          600,
                        color:
                          "var(--text-primary)",
                      }}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQuantity(
                          (q) =>
                            q +
                            quantityStep
                        )
                      }
                      style={{
                        width:
                          "44px",
                        height:
                          "44px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        color:
                          "var(--text-primary)",
                        borderLeft:
                          "1px solid var(--border)",
                        transition:
                          "background-color 150ms ease",
                      }}
                      onMouseEnter={(
                        e
                      ) => {
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "var(--bg)";
                      }}
                      onMouseLeave={(
                        e
                      ) => {
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "transparent";
                      }}
                    >
                      <Plus
                        size={14}
                        strokeWidth={
                          2
                        }
                      />
                    </button>
                  </div>
                </div>
              )}

            {/* Notes */}
            <div
              style={{
                marginBottom:
                  "24px",
              }}
            >
              <label
                style={
                  labelStyle
                }
              >
                Special
                Instructions
                (optional)
              </label>

              <textarea
                rows={2}
                placeholder="Any special requests..."
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                style={{
                  ...inputStyle,
                  resize:
                    "vertical",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding:
                    "12px 14px",
                  borderRadius:
                    "var(--radius-input)",
                  backgroundColor:
                    "#FEF2F2",
                  border:
                    "1px solid #FECACA",
                  color:
                    "#DC2626",
                  fontSize:
                    "13px",
                  marginBottom:
                    "16px",
                }}
              >
                {error}
              </div>
            )}

            {/* CTAs */}
            <div
              style={{
                display:
                  "flex",
                gap: "10px",
                marginBottom:
                  "20px",
                flexWrap:
                  "wrap",
              }}
            >
              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={
                  buying ||
                  adding ||
                  added
                }
                className="btn-primary"
                style={{
                  flex: 1,
                  minWidth:
                    "160px",
                  backgroundColor:
                    "var(--accent)",
                }}
              >
                {buying
                  ? "Starting..."
                  : "Buy Now"}

                {!buying && (
                  <ChevronRight
                    size={15}
                    strokeWidth={
                      2
                    }
                  />
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  adding ||
                  buying ||
                  added
                }
                className="btn-secondary"
                style={{
                  flex: 1,
                  minWidth:
                    "160px",
                }}
              >
                {added ? (
                  <>
                    <Check
                      size={15}
                      strokeWidth={
                        2
                      }
                    />
                    Added
                  </>
                ) : adding ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingBag
                      size={15}
                      strokeWidth={
                        2
                      }
                    />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919746292208"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "7px",
                fontSize:
                  "12px",
                color:
                  "var(--text-tertiary)",
                marginBottom:
                  "28px",
                transition:
                  "color 200ms ease",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              <MessageCircle
                size={13}
                strokeWidth={
                  1.75
                }
              />
              Need help? Chat
              with us on WhatsApp
            </a>

            {/* Trust Badges */}
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "8px",
                paddingTop:
                  "24px",
                borderTop:
                  "1px solid var(--border-soft)",
              }}
            >
              {[
                {
                  icon: Truck,
                  label: "7–10 days",
                },
                {
                  icon: Shield,
                  label: "Secure Pay",
                },
                {
                  icon: Award,
                  label: "Premium",
                },
              ].map(
                ({
                  icon: Icon,
                  label,
                }) => (
                  <div
                    key={
                      label
                    }
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "14px 8px",
                      border:
                        "1px solid var(--border-soft)",
                      borderRadius:
                        "var(--radius-input)",
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={
                        1.5
                      }
                      style={{
                        color:
                          "var(--text-tertiary)",
                        margin:
                          "0 auto 6px",
                      }}
                    />

                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "var(--text-secondary)",
                        fontWeight:
                          500,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            PRODUCT DESCRIPTION
        ═══════════════════════════════════════════════════════════ */}

        {product.description && (
          <div
            style={{
              paddingTop:
                "64px",
              borderTop:
                "1px solid var(--border-soft)",
              maxWidth:
                "680px",
            }}
          >
            <h2
              style={{
                fontFamily:
                  "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 600,
                marginBottom:
                  "20px",
                color:
                  "var(--text-primary)",
                letterSpacing:
                  "-0.01em",
              }}
            >
              About This
              Product
            </h2>

            <p
              style={{
                fontSize:
                  "15px",
                lineHeight:
                  1.85,
                color:
                  "var(--text-secondary)",
                whiteSpace:
                  "pre-wrap",
              }}
            >
              {
                product.description
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}