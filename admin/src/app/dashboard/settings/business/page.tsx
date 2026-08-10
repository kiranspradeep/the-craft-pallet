"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FileUpload from "@/components/ui/FileUpload";
import { adminGet, adminPut } from "@/lib/adminApi";
import {
  SettingsPageLayout,
  SettingsSection,
  SaveButton,
} from "../SettingsPageLayout";

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
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <SettingsPageLayout title="Business Settings" error={error} success={success}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <SettingsSection>
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
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
          >
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
        </SettingsSection>

        <SettingsSection label="Branding">
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
        </SettingsSection>

        <SettingsSection label="Store">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
          >
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
        </SettingsSection>

        <SaveButton loading={loading} />
      </form>
    </SettingsPageLayout>
  );
}