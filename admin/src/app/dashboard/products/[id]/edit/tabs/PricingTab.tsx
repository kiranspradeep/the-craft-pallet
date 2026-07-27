"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

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
  { value: "CUSTOM_QUOTE", label: "Custom Quote — no price shown" },
];

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

export default function PricingTab({ product, onUpdate }: Props) {
  const pricing = product.pricingConfig;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    strategy: pricing?.strategy || "PER_UNIT",
    unitPrice: pricing?.unitPrice?.toString() || "",
    minimumOrderQuantity:
      pricing?.minimumOrderQuantity?.toString() || "",
    incrementQuantity: pricing?.incrementQuantity?.toString() || "",
    incrementPrice: pricing?.incrementPrice?.toString() || "",
  });

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

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
      const productRes = await fetch(
        `${API}/api/admin/products/${product.id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const productData = await productRes.json();
      if (productRes.ok) onUpdate(productData.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        Pricing Configuration
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
              onChange={(e) => set("minimumOrderQuantity", e.target.value)}
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
              helpText="Price added per increment"
            />
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                backgroundColor: "rgba(166,138,117,0.08)",
                color: "var(--brand)",
              }}
            >
              Example: {form.incrementQuantity || "36"} photos = ₹
              {form.incrementPrice || "99"}, {parseInt(form.incrementQuantity || "36") * 2} photos = ₹
              {parseInt(form.incrementPrice || "99") * 2}
            </div>
          </div>
        )}

        {form.strategy === "FIXED_VARIANTS" && (
          <div
            className="p-4 rounded-xl text-sm"
            style={{
              backgroundColor: "rgba(166,138,117,0.08)",
              color: "var(--brand)",
            }}
          >
            Price is taken from the selected variant. Configure variant prices
            in the Variants tab.
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
            No price will be shown. Customers will see a &ldquo;Contact Us&rdquo; button.
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" loading={loading}>
            Save Pricing
          </Button>
        </div>
      </form>
    </div>
  );
}