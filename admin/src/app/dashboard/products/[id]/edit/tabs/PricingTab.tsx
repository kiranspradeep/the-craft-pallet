"use client";

import { useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const getToken = () =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("tcp_admin_token="))
    ?.split("=")[1] || "";

const STRATEGIES = [
  { value: "PER_UNIT", label: "Per Unit — fixed price per item" },
  {
    value: "INCREMENTAL_QUANTITY",
    label: "Incremental Quantity — price per batch",
  },
  {
    value: "FIXED_VARIANTS",
    label: "Fixed Variants — price from selected variant",
  },
  {
    value: "TIERED_PRICING",
    label: "Tiered Pricing — special offers + base price",
  },
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

  // Tier form
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
    const res = await fetch(`${API}/api/admin/products/${product.id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const body: Record<string, unknown> = { strategy: form.strategy };

    if (form.strategy === "PER_UNIT") {
      body.unitPrice = parseFloat(form.unitPrice);
    }
    if (form.strategy === "INCREMENTAL_QUANTITY") {
      if (form.minimumOrderQuantity)
        body.minimumOrderQuantity = parseInt(form.minimumOrderQuantity);
      body.incrementQuantity = parseInt(form.incrementQuantity);
      body.incrementPrice = parseFloat(form.incrementPrice);
    }
    if (form.strategy === "TIERED_PRICING") {
      if (form.baseUnitPrice)
        body.baseUnitPrice = parseFloat(form.baseUnitPrice);
    }

    try {
      const res = await fetch(
        `${API}/api/admin/products/${product.id}/pricing`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        }
      );
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
        `${API}/api/admin/products/${product.id}/pricing/tiers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
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
        `${API}/api/admin/products/${product.id}/pricing/tiers/${tierId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      await refreshProduct();
    } finally {
      setDeletingTier(null);
    }
  };

  const tiers: PricingTier[] = pricing?.tiers || [];

  return (
    <div className="space-y-5">
      {/* Strategy + base config */}
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Pricing Strategy
        </p>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              backgroundColor: "rgba(142,159,130,0.15)",
              color: "var(--success)",
              border: "1px solid rgba(142,159,130,0.3)",
            }}
          >
            Pricing saved
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="space-y-4">
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
              <div
                className="p-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(166,138,117,0.08)",
                  color: "var(--brand)",
                }}
              >
                Example: {form.incrementQuantity || "36"} photos = ₹
                {form.incrementPrice || "99"},{" "}
                {parseInt(form.incrementQuantity || "36") * 2} photos = ₹
                {parseInt(form.incrementPrice || "99") * 2}
              </div>
            </div>
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
              helpText="Fallback price per unit when customer doesn't select a tier. Leave empty to require tier selection."
            />
          )}

          {form.strategy === "FIXED_VARIANTS" && (
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                backgroundColor: "rgba(166,138,117,0.08)",
                color: "var(--brand)",
              }}
            >
              Price is taken from the selected variant. Configure variant
              prices in the Variants tab.
            </div>
          )}

          {form.strategy === "CUSTOM_QUOTE" && (
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                backgroundColor: "rgba(166,138,117,0.08)",
                color: "var(--brand)",
              }}
            >
              No price will be shown. Customers will see a &ldquo;Contact
              Us&rdquo; button.
            </div>
          )}

          <Button type="submit" loading={loading}>
            Save Pricing
          </Button>
        </form>
      </div>

      {/* Tiers — only shown for TIERED_PRICING */}
      {form.strategy === "TIERED_PRICING" && (
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Pricing Tiers ({tiers.length})
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Customers choose a tier before ordering
              </p>
            </div>
            {!showTierForm && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowTierForm(true)}
              >
                <Plus size={14} />
                Add Tier
              </Button>
            )}
          </div>

          {/* Add tier form */}
          {showTierForm && (
            <div
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <p
                className="text-sm font-medium mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                New Pricing Tier
              </p>

              {tierError && (
                <div
                  className="mb-3 px-4 py-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  {tierError}
                </div>
              )}

              <form onSubmit={handleCreateTier} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity (exact)"
                    required
                    type="number"
                    min={1}
                    value={tierForm.quantity}
                    onChange={(e) => setTier("quantity", e.target.value)}
                    placeholder="e.g. 30"
                    helpText="Customer must order exactly this many"
                  />
                  <Input
                    label="Total Price for this Tier (₹)"
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={tierForm.price}
                    onChange={(e) => setTier("price", e.target.value)}
                    placeholder="e.g. 99"
                  />
                </div>
                <Input
                  label="Label"
                  value={tierForm.label}
                  onChange={(e) => setTier("label", e.target.value)}
                  placeholder='e.g. "Best Value 🔥" or "Special Offer"'
                  helpText="Optional label shown to customer"
                />
                <div className="grid grid-cols-2 gap-4">
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
                  helpText="Highlights this tier with a special badge"
                  checked={tierForm.isSpecialOffer}
                  onChange={(v) => setTier("isSpecialOffer", v)}
                />
                <div className="flex gap-3">
                  <Button type="submit" loading={tierLoading}>
                    Add Tier
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowTierForm(false);
                      setTierForm(emptyTierForm);
                      setTierError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tier list */}
          {tiers.length === 0 && !showTierForm ? (
            <div className="text-center py-10">
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No tiers yet. Add your first pricing tier above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div className="flex items-center gap-3">
                    {tier.isSpecialOffer && (
                      <Star
                        size={14}
                        fill="currentColor"
                        style={{ color: "#F59E0B" }}
                      />
                    )}
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tier.quantity} prints = ₹
                        {Number(tier.price).toFixed(2)}
                        {tier.label && (
                          <span
                            className="ml-2 text-xs"
                            style={{ color: "var(--brand)" }}
                          >
                            {tier.label}
                          </span>
                        )}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        ₹
                        {(Number(tier.price) / tier.quantity).toFixed(2)}{" "}
                        per print
                        {tier.isSpecialOffer && (
                          <span
                            className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: "rgba(245,158,11,0.1)",
                              color: "#F59E0B",
                            }}
                          >
                            Special Offer
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    disabled={deletingTier === tier.id}
                    className="p-1.5 rounded-lg"
                    style={{ color: "#DC2626" }}
                  >
                    <Trash2 size={14} />
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