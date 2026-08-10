"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import FileUpload from "@/components/ui/FileUpload";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  product: any;
  categories: { id: string; name: string }[];
  onUpdate: (p: any) => void;
}

const sectionLabel = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--text-secondary)",
  marginBottom: "16px",
  display: "block",
};

export default function GeneralTab({ product, categories, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    metaKeywords: product.metaKeywords || "",
    ogImageUrl: product.ogImageUrl || "",
  });

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update");
        return;
      }
      onUpdate(data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error");
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
        padding: "24px",
      }}
    >
      {error && (
        <div
          style={{
            marginBottom: "20px",
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
          <AlertCircle size={14} strokeWidth={1.75} />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "20px",
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
          <CheckCircle size={14} strokeWidth={1.75} />
          Product updated successfully
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {/* General */}
        <div>
          <span style={sectionLabel}>General Information</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Select
              label="Category"
              required
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="Product Name"
              required
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                set("slug", generateSlug(e.target.value));
              }}
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
            <Textarea
              label="Short Description"
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              rows={2}
            />
            <div style={{ display: "flex", gap: "32px" }}>
              <Toggle
                label="Active"
                checked={form.isActive}
                onChange={(v) => set("isActive", v)}
              />
              <Toggle
                label="Featured"
                checked={form.isFeatured}
                onChange={(v) => set("isFeatured", v)}
              />
            </div>
            <Input
              label="Sort Order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) =>
                set("sortOrder", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        {/* SEO */}
        <div
          style={{
            paddingTop: "20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={sectionLabel}>SEO</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
            />
            <Textarea
              label="Meta Description"
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              rows={2}
            />
            <Input
              label="Meta Keywords"
              value={form.metaKeywords}
              onChange={(e) => set("metaKeywords", e.target.value)}
            />
            <FileUpload
              label="OG Image (Social Media Preview)"
              multiple={false}
              maxFiles={1}
              value={form.ogImageUrl || undefined}
              onUpload={(urls) => set("ogImageUrl", urls[0] ?? "")}
              onRemove={() => set("ogImageUrl", "")}
              helpText="Optional. Used when sharing on Facebook, WhatsApp, etc."
            />
          </div>
        </div>

        {/* Submit */}
        <div
          style={{
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
          }}
        >
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
              letterSpacing: "0.02em",
              color: "#fff",
              backgroundColor: loading
                ? "var(--text-secondary)"
                : "var(--text-primary)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 150ms ease",
            }}
          >
            {loading && (
              <Loader2 size={14} strokeWidth={2} className="animate-spin" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}