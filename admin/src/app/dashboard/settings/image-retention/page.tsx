"use client";

import { useState, useEffect, useMemo } from "react";
import Input from "@/components/ui/Input";
import { adminGet, adminPut } from "@/lib/adminApi";
import {
  SettingsPageLayout,
  SettingsSection,
  SaveButton,
} from "../SettingsPageLayout";

const DEFAULT_FORM = {
  retentionDays: "90",
  maxUploadSizeMb: "500",
  allowedMimeTypes: "image/jpeg, image/png, image/webp",
  storageProvider: "local",
  storageBucket: "",
  storageRegion: "",
};

export default function ImageRetentionSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState(DEFAULT_FORM);

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedForm);
  }, [form, savedForm]);

  useEffect(() => {
    adminGet("/api/admin/settings/image-retention")
      .then((d: any) => {
        if (d.data) {
          const loadedData = {
            retentionDays: d.data.retentionDays?.toString() || "90",
            maxUploadSizeMb: d.data.maxUploadSizeMb?.toString() || "500",
            allowedMimeTypes:
              d.data.allowedMimeTypes?.join(", ") ||
              "image/jpeg, image/png, image/webp",
            storageProvider: d.data.storageProvider || "local",
            storageBucket: d.data.storageBucket || "",
            storageRegion: d.data.storageRegion || "",
          };
          setForm(loadedData);
          setSavedForm(loadedData);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || loading) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await adminPut("/api/admin/settings/image-retention", {
        retentionDays: parseInt(form.retentionDays) || 0,
        maxUploadSizeMb: parseInt(form.maxUploadSizeMb) || 500,
        allowedMimeTypes: form.allowedMimeTypes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        storageProvider: form.storageProvider,
        storageBucket: form.storageBucket || undefined,
        storageRegion: form.storageRegion || undefined,
      });

      // Synchronize the saved baseline
      setSavedForm(form);
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
      title="Image Retention"
      error={error}
      success={success}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <SettingsSection>
          <Input
            label="Retention Days"
            type="number"
            min={0}
            value={form.retentionDays}
            onChange={(e) => set("retentionDays", e.target.value)}
            helpText="Days after an order is DELIVERED before customer photos are purged (0 = keep forever)"
          />
          <Input
            label="Max Upload Size (MB)"
            type="number"
            min={1}
            value={form.maxUploadSizeMb}
            onChange={(e) => set("maxUploadSizeMb", e.target.value)}
            helpText="Maximum file size limit for customer direct & ZIP uploads"
          />
          <Input
            label="Allowed MIME Types"
            value={form.allowedMimeTypes}
            onChange={(e) => set("allowedMimeTypes", e.target.value)}
            helpText="Comma separated. e.g. image/jpeg, image/png, image/webp"
          />
        </SettingsSection>

        <SettingsSection label="Storage Provider">
          <Input
            label="Storage Provider"
            value={form.storageProvider}
            onChange={(e) => set("storageProvider", e.target.value)}
            helpText="local, s3, gcs"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <Input
              label="Storage Bucket"
              value={form.storageBucket}
              onChange={(e) => set("storageBucket", e.target.value)}
              placeholder="Optional"
            />
            <Input
              label="Storage Region"
              value={form.storageRegion}
              onChange={(e) => set("storageRegion", e.target.value)}
              placeholder="Optional"
            />
          </div>
        </SettingsSection>

        {/* Visual wrapper that gracefully dims and disables clicks when there are no changes */}
        <div
          style={{
            opacity: isDirty ? 1 : 0.5,
            pointerEvents: isDirty && !loading ? "auto" : "none",
            transition: "opacity 200ms ease",
          }}
        >
          <SaveButton
            loading={loading}
            label={isDirty ? "Save Changes" : "Saved"}
          />
        </div>
      </form>
    </SettingsPageLayout>
  );
}