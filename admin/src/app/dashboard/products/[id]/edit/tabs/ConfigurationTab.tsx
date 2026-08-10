"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import Input from "@/components/ui/Input";

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

const sectionLabel = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--text-secondary)",
  marginBottom: "14px",
  display: "block",
};

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
    estimatedProductionDays:
      config?.estimatedProductionDays?.toString() || "",
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
      maxFileSizeMb: form.maxFileSizeMb
        ? parseInt(form.maxFileSizeMb)
        : undefined,
      maxZipSizeMb: form.maxZipSizeMb
        ? parseInt(form.maxZipSizeMb)
        : undefined,
      allowedExtensions: form.allowedExtensions
        ? form.allowedExtensions
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      allowedSources: form.allowedSources,
      allowDuplicateImages: form.allowDuplicateImages,
      allowImageReordering: form.allowImageReordering,
      estimatedProductionDays: form.estimatedProductionDays
        ? parseInt(form.estimatedProductionDays)
        : undefined,
    };

    try {
      await fetch(`/api/admin/products/${product.id}/configuration`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const res = await fetch(`/api/admin/products/${product.id}`);
      const data = await res.json();
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
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <span style={{ ...sectionLabel, marginBottom: "20px" }}>
        Upload & Production Configuration
      </span>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={13} strokeWidth={1.75} />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: "rgba(142,159,130,0.12)",
            border: "1px solid rgba(142,159,130,0.3)",
            color: "var(--success)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle size={13} strokeWidth={1.75} />
          Configuration saved
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <Toggle
          label="Upload Required"
          helpText="Customer must upload images to order this product"
          checked={form.uploadRequired}
          onChange={(v) => set("uploadRequired", v)}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Minimum Images"
            type="number"
            min={1}
            value={form.minImages}
            onChange={(e) => set("minImages", e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Maximum Images"
            type="number"
            min={1}
            value={form.maxImages}
            onChange={(e) => set("maxImages", e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Max File Size (MB)"
            type="number"
            min={1}
            value={form.maxFileSizeMb}
            onChange={(e) => set("maxFileSizeMb", e.target.value)}
            placeholder="e.g. 20"
          />
          <Input
            label="Max ZIP Size (MB)"
            type="number"
            min={1}
            value={form.maxZipSizeMb}
            onChange={(e) => set("maxZipSizeMb", e.target.value)}
            placeholder="e.g. 200"
          />
          <Input
            label="Estimated Production Days"
            type="number"
            min={1}
            value={form.estimatedProductionDays}
            onChange={(e) => set("estimatedProductionDays", e.target.value)}
            placeholder="e.g. 3"
          />
          <Input
            label="Allowed Extensions"
            value={form.allowedExtensions}
            onChange={(e) => set("allowedExtensions", e.target.value)}
            placeholder=".jpg, .png, .webp"
            helpText="Comma separated"
          />
        </div>

        {/* Allowed sources */}
        <div>
          <span style={sectionLabel}>Allowed Upload Sources</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {ALL_SOURCES.map((source) => {
              const active = form.allowedSources.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleSource(source)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    border: active
                      ? "1px solid var(--text-primary)"
                      : "1px solid var(--border)",
                    backgroundColor: active
                      ? "var(--text-primary)"
                      : "transparent",
                    color: active ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {source.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          <Toggle
            label="Allow Duplicate Images"
            checked={form.allowDuplicateImages}
            onChange={(v) => set("allowDuplicateImages", v)}
          />
          <Toggle
            label="Allow Image Reordering"
            checked={form.allowImageReordering}
            onChange={(v) => set("allowImageReordering", v)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 20px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#fff",
            backgroundColor: loading
              ? "var(--text-secondary)"
              : "var(--text-primary)",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            alignSelf: "flex-start",
          }}
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {loading ? "Saving..." : "Save Configuration"}
        </button>
      </form>
    </div>
  );
}