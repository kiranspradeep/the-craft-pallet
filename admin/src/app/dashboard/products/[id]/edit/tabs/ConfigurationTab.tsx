"use client";

import { useState } from "react";
import Toggle from "@/components/ui/Toggle";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { adminPut, adminGet } from "@/lib/adminApi";

const ALL_SOURCES = [
  "DIRECT_UPLOAD",
  "ZIP_UPLOAD",
  "GOOGLE_DRIVE",
  "WHATSAPP",
  "ADMIN_UPLOAD",
];

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

export default function ConfigurationTab({ product, onUpdate }: Props) {
  const config = product.configuration;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    uploadRequired: config?.uploadRequired ?? false,
    minImages: config?.minImages?.toString() || "",
    maxImages: config?.maxImages?.toString() || "",
    maxFileSizeMb: config?.maxFileSizeMb?.toString() || "",
    maxZipSizeMb: config?.maxZipSizeMb?.toString() || "",
    allowedExtensions: config?.allowedExtensions?.join(", ") || "",
    allowedSources: (config?.allowedSources as string[]) || [],
    allowDuplicateImages: config?.allowDuplicateImages ?? false,
    allowImageReordering: config?.allowImageReordering ?? true,
    estimatedProductionDays: config?.estimatedProductionDays?.toString() || "",
  });

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleSource = (source: string) => {
    setForm((f) => ({
      ...f,
      allowedSources: f.allowedSources.includes(source)
        ? f.allowedSources.filter((s: string) => s !== source)
        : [...f.allowedSources, source],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const body = {
      uploadRequired: form.uploadRequired,
      minImages: form.minImages ? parseInt(form.minImages) : undefined,
      maxImages: form.maxImages ? parseInt(form.maxImages) : undefined,
      maxFileSizeMb: form.maxFileSizeMb ? parseInt(form.maxFileSizeMb) : undefined,
      maxZipSizeMb: form.maxZipSizeMb ? parseInt(form.maxZipSizeMb) : undefined,
      allowedExtensions: form.allowedExtensions
        ? form.allowedExtensions.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      allowedSources: form.allowedSources,
      allowDuplicateImages: form.allowDuplicateImages,
      allowImageReordering: form.allowImageReordering,
      estimatedProductionDays: form.estimatedProductionDays
        ? parseInt(form.estimatedProductionDays)
        : undefined,
    };

    try {
      await adminPut(`/api/admin/products/${product.id}/configuration`, body);
      const data: any = await adminGet(`/api/admin/products/${product.id}`);
      if (data.data) onUpdate(data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Network error");
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
        Upload & Production Configuration
      </p>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: "rgba(142,159,130,0.15)", color: "var(--success)", border: "1px solid rgba(142,159,130,0.3)" }}
        >
          Configuration saved
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Toggle
          label="Upload Required"
          helpText="Customer must upload images to order this product"
          checked={form.uploadRequired}
          onChange={(v) => set("uploadRequired", v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Minimum Images" type="number" min={1} value={form.minImages} onChange={(e) => set("minImages", e.target.value)} placeholder="Optional" />
          <Input label="Maximum Images" type="number" min={1} value={form.maxImages} onChange={(e) => set("maxImages", e.target.value)} placeholder="Optional" />
          <Input label="Max File Size (MB)" type="number" min={1} value={form.maxFileSizeMb} onChange={(e) => set("maxFileSizeMb", e.target.value)} placeholder="e.g. 20" />
          <Input label="Max ZIP Size (MB)" type="number" min={1} value={form.maxZipSizeMb} onChange={(e) => set("maxZipSizeMb", e.target.value)} placeholder="e.g. 200" />
          <Input label="Estimated Production Days" type="number" min={1} value={form.estimatedProductionDays} onChange={(e) => set("estimatedProductionDays", e.target.value)} placeholder="e.g. 3" />
          <Input label="Allowed Extensions" value={form.allowedExtensions} onChange={(e) => set("allowedExtensions", e.target.value)} placeholder=".jpg, .png, .webp" helpText="Comma separated" />
        </div>

        <div>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
            Allowed Upload Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_SOURCES.map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => toggleSource(source)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                style={{
                  backgroundColor: form.allowedSources.includes(source) ? "var(--brand)" : "transparent",
                  color: form.allowedSources.includes(source) ? "#fff" : "var(--text-secondary)",
                  borderColor: form.allowedSources.includes(source) ? "var(--brand)" : "var(--border)",
                }}
              >
                {source.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <Toggle label="Allow Duplicate Images" checked={form.allowDuplicateImages} onChange={(v) => set("allowDuplicateImages", v)} />
          <Toggle label="Allow Image Reordering" checked={form.allowImageReordering} onChange={(v) => set("allowImageReordering", v)} />
        </div>

        <Button type="submit" loading={loading}>
          Save Configuration
        </Button>
      </form>
    </div>
  );
}