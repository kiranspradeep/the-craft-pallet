"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import { adminGet, adminPut } from "@/lib/adminApi";

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
      <div className="text-center py-20">
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/settings">
          <button
            className="p-2 rounded-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={18} />
          </button>
        </Link>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Payment Settings
        </h1>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
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
            Settings saved
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="grid grid-cols-2 gap-4">
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
          <Toggle
            label="Cash on Delivery"
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
          <Button type="submit" loading={loading}>
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}