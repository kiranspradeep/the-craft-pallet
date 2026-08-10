"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import { adminGet, adminPut } from "@/lib/adminApi";
import {
  SettingsPageLayout,
  SettingsSection,
  SaveButton,
} from "../SettingsPageLayout";

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    gatewayName: "manual",
    isLiveMode: false,
    apiKey: "",
    apiSecret: "",
    webhookSecret: "",
    upiId: "",
    codEnabled: false,
    codMaxOrderAmount: "",
  });

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    adminGet("/api/admin/settings/payment")
      .then((d: any) => {
        if (d.data) {
          setForm({
            gatewayName: d.data.gatewayName || "manual",
            isLiveMode: d.data.isLiveMode ?? false,
            apiKey: d.data.apiKey || "",
            apiSecret: "",
            webhookSecret: "",
            upiId: d.data.upiId || "",
            codEnabled: d.data.codEnabled ?? false,
            codMaxOrderAmount: d.data.codMaxOrderAmount?.toString() || "",
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
    const body: Record<string, unknown> = {
      gatewayName: form.gatewayName,
      isLiveMode: form.isLiveMode,
      upiId: form.upiId || undefined,
      codEnabled: form.codEnabled,
    };
    if (form.apiKey) body.apiKey = form.apiKey;
    if (form.apiSecret) body.apiSecret = form.apiSecret;
    if (form.webhookSecret) body.webhookSecret = form.webhookSecret;
    if (form.codMaxOrderAmount)
      body.codMaxOrderAmount = parseFloat(form.codMaxOrderAmount);
    try {
      await adminPut("/api/admin/settings/payment", body);
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
    <SettingsPageLayout title="Payment Settings" error={error} success={success}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <SettingsSection>
          <Input
            label="Gateway Name"
            value={form.gatewayName}
            onChange={(e) => set("gatewayName", e.target.value)}
            helpText="e.g. razorpay, manual"
          />
          <Toggle
            label="Live Mode"
            helpText="Enable live payments (turn off for testing)"
            checked={form.isLiveMode}
            onChange={(v) => set("isLiveMode", v)}
          />
          <Input
            label="UPI ID"
            value={form.upiId}
            onChange={(e) => set("upiId", e.target.value)}
            placeholder="yourstore@okaxis"
          />
        </SettingsSection>

        <SettingsSection label="API Keys">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
          >
            <Input
              label="API Key"
              value={form.apiKey}
              onChange={(e) => set("apiKey", e.target.value)}
              placeholder="Leave blank to keep current"
            />
            <Input
              label="API Secret"
              type="password"
              value={form.apiSecret}
              onChange={(e) => set("apiSecret", e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>
          <Input
            label="Webhook Secret"
            type="password"
            value={form.webhookSecret}
            onChange={(e) => set("webhookSecret", e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </SettingsSection>

        <SettingsSection label="Cash on Delivery">
          <Toggle
            label="Enable COD"
            helpText="Allow COD payments"
            checked={form.codEnabled}
            onChange={(v) => set("codEnabled", v)}
          />
          {form.codEnabled && (
            <Input
              label="Max COD Amount (₹)"
              type="number"
              min={0}
              value={form.codMaxOrderAmount}
              onChange={(e) => set("codMaxOrderAmount", e.target.value)}
            />
          )}
        </SettingsSection>

        <SaveButton loading={loading} />
      </form>
    </SettingsPageLayout>
  );
}