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
    freeShippingThreshold: "",
    defaultShippingCharge: "",
    defaultProcessingDays: "",
  });

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    adminGet("/api/admin/settings/shipping")
      .then((d: any) => {
        if (d.data) {
          setForm({
            freeShippingThreshold:
              d.data.freeShippingThreshold?.toString() || "",
            defaultShippingCharge:
              d.data.defaultShippingCharge?.toString() || "",
            defaultProcessingDays:
              d.data.defaultProcessingDays?.toString() || "",
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
    if (form.freeShippingThreshold)
      body.freeShippingThreshold = parseFloat(form.freeShippingThreshold);
    if (form.defaultShippingCharge)
      body.defaultShippingCharge = parseFloat(form.defaultShippingCharge);
    if (form.defaultProcessingDays)
      body.defaultProcessingDays = parseInt(form.defaultProcessingDays);
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
    <SettingsPageLayout title="Shipping Settings" error={error} success={success}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <SettingsSection>
          <Input
            label="Free Shipping Threshold (₹)"
            type="number"
            min={0}
            value={form.freeShippingThreshold}
            onChange={(e) => set("freeShippingThreshold", e.target.value)}
            helpText="Orders above this amount get free shipping"
            placeholder="e.g. 500"
          />
          <Input
            label="Default Shipping Charge (₹)"
            type="number"
            min={0}
            value={form.defaultShippingCharge}
            onChange={(e) => set("defaultShippingCharge", e.target.value)}
            placeholder="e.g. 55"
          />
          <Input
            label="Default Processing Days"
            type="number"
            min={1}
            value={form.defaultProcessingDays}
            onChange={(e) => set("defaultProcessingDays", e.target.value)}
            placeholder="e.g. 3"
          />
        </SettingsSection>

        <SaveButton loading={loading} />
      </form>
    </SettingsPageLayout>
  );
}