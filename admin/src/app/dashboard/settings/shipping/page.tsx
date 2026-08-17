"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { adminGet, adminPut } from "@/lib/adminApi";
import {
  SettingsPageLayout,
  SettingsSection,
  SaveButton,
} from "../SettingsPageLayout";

export default function ShippingSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    keralaShippingCharge: "",
    outsideKeralaShippingCharge: "",
    keralaProcessingDays: "",
    outsideKeralaProcessingDays: "",
  });

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    adminGet("/api/admin/settings/shipping")
      .then((d: any) => {
        if (d.data) {
          setForm({
            keralaShippingCharge:
              d.data.keralaShippingCharge?.toString() || "",
            outsideKeralaShippingCharge:
              d.data.outsideKeralaShippingCharge?.toString() || "",
            keralaProcessingDays:
              d.data.keralaProcessingDays?.toString() || "",
            outsideKeralaProcessingDays:
              d.data.outsideKeralaProcessingDays?.toString() || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const body: Record<string, number> = {};
    if (form.keralaShippingCharge)
      body.keralaShippingCharge = parseFloat(form.keralaShippingCharge);
    if (form.outsideKeralaShippingCharge)
      body.outsideKeralaShippingCharge = parseFloat(
        form.outsideKeralaShippingCharge
      );
    if (form.keralaProcessingDays)
      body.keralaProcessingDays = parseInt(form.keralaProcessingDays);
    if (form.outsideKeralaProcessingDays)
      body.outsideKeralaProcessingDays = parseInt(
        form.outsideKeralaProcessingDays
      );

    try {
      await adminPut("/api/admin/settings/shipping", body);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <SettingsPageLayout
      title="Shipping Settings"
      error={error}
      success={success}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {/* Kerala */}
        <SettingsSection label="Inside Kerala">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <Input
              label="Shipping Charge (₹)"
              type="number"
              min={0}
              step="0.01"
              value={form.keralaShippingCharge}
              onChange={(e) => set("keralaShippingCharge", e.target.value)}
              placeholder="e.g. 40"
            />
            <Input
              label="Processing Days"
              type="number"
              min={1}
              value={form.keralaProcessingDays}
              onChange={(e) => set("keralaProcessingDays", e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        </SettingsSection>

        {/* Outside Kerala */}
        <SettingsSection label="Outside Kerala">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <Input
              label="Shipping Charge (₹)"
              type="number"
              min={0}
              step="0.01"
              value={form.outsideKeralaShippingCharge}
              onChange={(e) =>
                set("outsideKeralaShippingCharge", e.target.value)
              }
              placeholder="e.g. 80"
            />
            <Input
              label="Processing Days"
              type="number"
              min={1}
              value={form.outsideKeralaProcessingDays}
              onChange={(e) =>
                set("outsideKeralaProcessingDays", e.target.value)
              }
              placeholder="e.g. 7"
            />
          </div>
        </SettingsSection>

        <SaveButton loading={loading} />
      </form>
    </SettingsPageLayout>
  );
}