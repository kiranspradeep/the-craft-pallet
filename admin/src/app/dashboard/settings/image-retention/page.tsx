"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { adminGet, adminPut } from "@/lib/adminApi";

export default function ImageRetentionSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    retentionDays: "90",
    maxUploadSizeMb: "500",
    allowedMimeTypes: "image/jpeg, image/png, image/webp",
    storageProvider: "local",
    storageBucket: "",
    storageRegion: "",
  });

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    adminGet("/api/admin/settings/image-retention")
      .then((d: any) => {
        if (d.data) {
          setForm({
            retentionDays: d.data.retentionDays?.toString() || "90",
            maxUploadSizeMb: d.data.maxUploadSizeMb?.toString() || "500",
            allowedMimeTypes:
              d.data.allowedMimeTypes?.join(", ") ||
              "image/jpeg, image/png, image/webp",
            storageProvider: d.data.storageProvider || "local",
            storageBucket: d.data.storageBucket || "",
            storageRegion: d.data.storageRegion || "",
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
      await adminPut("/api/admin/settings/image-retention", {
        retentionDays: parseInt(form.retentionDays),
        maxUploadSizeMb: parseInt(form.maxUploadSizeMb),
        allowedMimeTypes: form.allowedMimeTypes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        storageProvider: form.storageProvider,
        storageBucket: form.storageBucket || undefined,
        storageRegion: form.storageRegion || undefined,
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
          Image Retention Settings
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
            label="Retention Days"
            type="number"
            min={0}
            value={form.retentionDays}
            onChange={(e) => set("retentionDays", e.target.value)}
            helpText="0 = keep forever"
          />
          <Input
            label="Max Upload Size (MB)"
            type="number"
            min={1}
            value={form.maxUploadSizeMb}
            onChange={(e) => set("maxUploadSizeMb", e.target.value)}
          />
          <Input
            label="Allowed MIME Types"
            value={form.allowedMimeTypes}
            onChange={(e) => set("allowedMimeTypes", e.target.value)}
            helpText="Comma separated. e.g. image/jpeg, image/png"
          />
          <Input
            label="Storage Provider"
            value={form.storageProvider}
            onChange={(e) => set("storageProvider", e.target.value)}
            helpText="local, s3, gcs"
          />
          <div className="grid grid-cols-2 gap-4">
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
          <Button type="submit" loading={loading}>
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}