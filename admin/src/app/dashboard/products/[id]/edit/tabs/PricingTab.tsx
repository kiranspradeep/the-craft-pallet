"use client";

import { useState } from "react";
import { Plus, Trash2, Star, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";

const STRATEGIES = [
  { value: "PER_UNIT", label: "Per Unit — fixed price per item" },
  { value: "INCREMENTAL_QUANTITY", label: "Incremental Quantity — price per batch" },
  { value: "FIXED_VARIANTS", label: "Fixed Variants — price from selected variant" },
  { value: "TIERED_PRICING", label: "Tiered Pricing — special offers + base price" },
  { value: "CUSTOM_QUOTE", label: "Custom Quote — no price shown" },
];

interface PricingTier {
  id: string;
  quantity: number;
  price: string;
  label: string | null;
  isSpecialOffer: boolean;
  sortOrder: number;
}

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

const emptyTierForm = {
  quantity: "",
  price: "",
  label: "",
  isSpecialOffer: false,
  sortOrder: 0,
};

const sectionLabel = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--text-secondary)",
  display: "block",
};

export default function PricingTab({ product, onUpdate }: Props) {
  const pricing = product.pricingConfig;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    strategy: pricing?.strategy || "PER_UNIT",
    unitPrice: pricing?.unitPrice?.toString() || "",
    baseUnitPrice: pricing?.baseUnitPrice?.toString() || "",
    minimumOrderQuantity: pricing?.minimumOrderQuantity?.toString() || "",
    incrementQuantity: pricing?.incrementQuantity?.toString() || "",
    incrementPrice: pricing?.incrementPrice?.toString() || "",
  });

  const [showTierForm, setShowTierForm] = useState(false);
  const [tierForm, setTierForm] = useState(emptyTierForm);
  const [tierLoading, setTierLoading] = useState(false);
  const [tierError, setTierError] = useState("");
  const [deletingTier, setDeletingTier] = useState<string | null>(null);

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));
  const setTier = (key: string, val: unknown) =>
    setTierForm((f) => ({ ...f, [key]: val }));

  const refreshProduct = async () => {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const body: Record<string, unknown> = { strategy: form.strategy };
    if (form.strategy === "PER_UNIT")
      body.unitPrice = parseFloat(form.unitPrice);
    if (form.strategy === "INCREMENTAL_QUANTITY") {
      if (form.minimumOrderQuantity)
        body.minimumOrderQuantity = parseInt(form.minimumOrderQuantity);
      body.incrementQuantity = parseInt(form.incrementQuantity);
      body.incrementPrice = parseFloat(form.incrementPrice);
    }
    if (form.strategy === "TIERED_PRICING" && form.baseUnitPrice)
      body.baseUnitPrice = parseFloat(form.baseUnitPrice);

    try {
      const res = await fetch(`/api/admin/products/${product.id}/pricing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to save pricing");
        return;
      }
      await refreshProduct();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setTierLoading(true);
    setTierError("");
    try {
      const res = await fetch(
        `/api/admin/products/${product.id}/pricing/tiers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: parseInt(tierForm.quantity),
            price: parseFloat(tierForm.price),
            label: tierForm.label || undefined,
            isSpecialOffer: tierForm.isSpecialOffer,
            sortOrder: tierForm.sortOrder,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setTierError(data.message || "Failed to create tier");
        return;
      }
      setTierForm(emptyTierForm);
      setShowTierForm(false);
      await refreshProduct();
    } catch {
      setTierError("Network error");
    } finally {
      setTierLoading(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm("Delete this pricing tier?")) return;
    setDeletingTier(tierId);
    try {
      await fetch(
        `/api/admin/products/${product.id}/pricing/tiers/${tierId}`,
        { method: "DELETE" }
      );
      await refreshProduct();
    } finally {
      setDeletingTier(null);
    }
  };

  const tiers: PricingTier[] = pricing?.tiers || [];

  const infoBox = (text: string) => (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "6px",
        fontSize: "12px",
        backgroundColor: "rgba(166,138,117,0.08)",
        color: "var(--brand)",
        lineHeight: 1.6,
        border: "1px solid rgba(166,138,117,0.15)",
      }}
    >
      {text}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Strategy form */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <span style={{ ...sectionLabel, marginBottom: "16px" }}>
          Pricing Strategy
        </span>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 14px",
              borderRadius: "6px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={13} strokeWidth={1.75} />
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 14px",
              borderRadius: "6px",
              backgroundColor: "rgba(142,159,130,0.12)",
              border: "1px solid rgba(142,159,130,0.3)",
              color: "var(--success)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={13} strokeWidth={1.75} />
            Pricing saved
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Select
            label="Pricing Strategy"
            value={form.strategy}
            onChange={(e) => set("strategy", e.target.value)}
            options={STRATEGIES}
          />

          {form.strategy === "PER_UNIT" && (
            <Input
              label="Unit Price (₹)"
              required
              type="number"
              min={0}
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => set("unitPrice", e.target.value)}
              placeholder="0.00"
              helpText="Fixed price per unit ordered"
            />
          )}

          {form.strategy === "INCREMENTAL_QUANTITY" && (
            <>
              <Input
                label="Minimum Order Quantity"
                type="number"
                min={1}
                value={form.minimumOrderQuantity}
                onChange={(e) =>
                  set("minimumOrderQuantity", e.target.value)
                }
                placeholder="e.g. 36"
              />
              <Input
                label="Increment Quantity"
                required
                type="number"
                min={1}
                value={form.incrementQuantity}
                onChange={(e) => set("incrementQuantity", e.target.value)}
                placeholder="e.g. 36"
                helpText="Price increases per this many units"
              />
              <Input
                label="Increment Price (₹)"
                required
                type="number"
                min={0}
                step="0.01"
                value={form.incrementPrice}
                onChange={(e) => set("incrementPrice", e.target.value)}
                placeholder="e.g. 99"
              />
              {infoBox(
                `Example: ${form.incrementQuantity || "36"} photos = ₹${form.incrementPrice || "99"}, ${parseInt(form.incrementQuantity || "36") * 2} photos = ₹${parseInt(form.incrementPrice || "99") * 2}`
              )}
            </>
          )}

          {form.strategy === "TIERED_PRICING" && (
            <Input
              label="Base Price Per Unit (₹)"
              type="number"
              min={0}
              step="0.01"
              value={form.baseUnitPrice}
              onChange={(e) => set("baseUnitPrice", e.target.value)}
              placeholder="e.g. 9"
              helpText="Fallback price per unit. Leave empty to require tier selection."
            />
          )}

          {form.strategy === "FIXED_VARIANTS" &&
            infoBox(
              "Price is taken from the selected variant. Configure variant prices in the Variants tab."
            )}

          {form.strategy === "CUSTOM_QUOTE" &&
            infoBox(
              'No price will be shown. Customers will see a "Contact Us" button.'
            )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 20px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: loading
                ? "var(--text-secondary)"
                : "var(--text-primary)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Saving..." : "Save Pricing"}
          </button>
        </form>
      </div>

      {/* Tiers */}
      {form.strategy === "TIERED_PRICING" && (
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "2px",
                }}
              >
                Pricing Tiers ({tiers.length})
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                Customers choose a tier before ordering
              </p>
            </div>
            {!showTierForm && (
              <button
                onClick={() => setShowTierForm(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                <Plus size={13} strokeWidth={2} />
                Add Tier
              </button>
            )}
          </div>

          {/* Tier form */}
          {showTierForm && (
            <div
              style={{
                padding: "16px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border)",
                marginTop: "16px",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "14px",
                }}
              >
                New Pricing Tier
              </p>

              {tierError && (
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#DC2626",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <AlertCircle size={13} strokeWidth={1.75} />
                  {tierError}
                </div>
              )}

              <form
                onSubmit={handleCreateTier}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <Input
                    label="Quantity (exact)"
                    required
                    type="number"
                    min={1}
                    value={tierForm.quantity}
                    onChange={(e) => setTier("quantity", e.target.value)}
                    placeholder="e.g. 30"
                    helpText="Customer orders exactly this many"
                  />
                  <Input
                    label="Total Price (₹)"
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={tierForm.price}
                    onChange={(e) => setTier("price", e.target.value)}
                    placeholder="e.g. 99"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <Input
                    label="Label (optional)"
                    value={tierForm.label}
                    onChange={(e) => setTier("label", e.target.value)}
                    placeholder="e.g. Best Value"
                  />
                  <Input
                    label="Sort Order"
                    type="number"
                    min={0}
                    value={tierForm.sortOrder}
                    onChange={(e) =>
                      setTier("sortOrder", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <Toggle
                  label="Special Offer"
                  helpText="Highlights this tier with a badge"
                  checked={tierForm.isSpecialOffer}
                  onChange={(v) => setTier("isSpecialOffer", v)}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={tierLoading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#fff",
                      backgroundColor: tierLoading
                        ? "var(--text-secondary)"
                        : "var(--text-primary)",
                      border: "none",
                      cursor: tierLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {tierLoading && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    Add Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTierForm(false);
                      setTierForm(emptyTierForm);
                      setTierError("");
                    }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tiers list */}
          {tiers.length === 0 && !showTierForm ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p
                style={{ fontSize: "13px", color: "var(--text-secondary)" }}
              >
                No tiers yet. Add your first pricing tier above.
              </p>
            </div>
          ) : (
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {tier.isSpecialOffer && (
                      <Star
                        size={13}
                        fill="currentColor"
                        style={{ color: "#F59E0B", flexShrink: 0 }}
                      />
                    )}
                    <div>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          marginBottom: "2px",
                        }}
                      >
                        {tier.quantity} prints = ₹
                        {Number(tier.price).toFixed(2)}
                        {tier.label && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "11px",
                              color: "var(--brand)",
                            }}
                          >
                            {tier.label}
                          </span>
                        )}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          ₹
                          {(Number(tier.price) / tier.quantity).toFixed(2)}{" "}
                          / print
                        </p>
                        {tier.isSpecialOffer && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: "999px",
                              backgroundColor: "rgba(245,158,11,0.1)",
                              color: "#F59E0B",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Special Offer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    disabled={deletingTier === tier.id}
                    aria-label="Delete tier"
                    style={{
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "6px",
                      color: "#DC2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      opacity: deletingTier === tier.id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}