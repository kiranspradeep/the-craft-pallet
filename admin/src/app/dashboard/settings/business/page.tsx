"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import { adminGet, adminPut } from "@/lib/adminApi";

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    tagline: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
    faviconUrl: "",
    instagramUrl: "",
    currency: "INR",
    minOrderAmount: "",
  });

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    adminGet("/api/admin/settings/business")
      .then((d: any) => {
        if (d.data) {
          setForm({
            businessName: d.data.businessName || "",
            tagline: d.data.tagline || "",
            email: d.data.email || "",
            phone: d.data.phone || "",
            address: d.data.address || "",
            logoUrl: d.data.logoUrl || "",
            faviconUrl: d.data.faviconUrl || "",
            instagramUrl: d.data.instagramUrl || "",
            currency: d.data.currency || "INR",
            minOrderAmount: d.data.minOrderAmount?.toString() || "",
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

    try {
      await adminPut("/api/admin/settings/business", {
        ...form,
        minOrderAmount: form.minOrderAmount
          ? parseFloat(form.minOrderAmount)
          : undefined,
      });
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
          Business Settings
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
            label="Business Name"
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
          />
          <Input
            label="Tagline"
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <Textarea
            label="Address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            rows={2}
          />
          <FileUpload
            label="Logo"
            value={form.logoUrl}
            onUpload={(urls) => set("logoUrl", urls[0])}
            onRemove={() => set("logoUrl", "")}
          />
          <FileUpload
            label="Favicon"
            value={form.faviconUrl}
            onUpload={(urls) => set("faviconUrl", urls[0])}
            onRemove={() => set("faviconUrl", "")}
          />
          <Input
            label="Instagram URL"
            type="url"
            value={form.instagramUrl}
            onChange={(e) => set("instagramUrl", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            />
            <Input
              label="Min Order Amount (₹)"
              type="number"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) => set("minOrderAmount", e.target.value)}
            />
          </div>
          <Button type="submit" loading={loading}>
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}