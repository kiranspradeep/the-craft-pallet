"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import FileUpload from "@/components/ui/FileUpload";

interface Category {
  id: string;
  name: string;
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImageUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/categories?limit=100")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create product");
        return;
      }
      router.push(`/dashboard/products/${data.data.id}/edit`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <Link href="/dashboard/products">
          <button
            aria-label="Back to products"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
          </button>
        </Link>
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            New Product
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "2px",
            }}
          >
            After creating, you can add images, variants, pricing and more
          </p>
        </div>
      </div>

      {/* Form card */}
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          {/* General Information */}
          <div>
            <span style={sectionLabel}>General Information</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Select
                label="Category"
                required
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                placeholder="Select a category"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              <Input
                label="Product Name"
                required
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  set("slug", generateSlug(e.target.value));
                }}
                placeholder="e.g. Mini Polaroids"
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                helpText="Auto-generated from name"
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Full product description..."
              />
              <Textarea
                label="Short Description"
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                rows={2}
                placeholder="Brief summary shown in listings..."
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
                placeholder="Page title for search engines"
              />
              <Textarea
                label="Meta Description"
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={2}
                placeholder="Brief description for search results..."
              />
              <Input
                label="Meta Keywords"
                value={form.metaKeywords}
                onChange={(e) => set("metaKeywords", e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
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

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              flexWrap: "wrap",
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
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#1F1F1F";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--text-primary)";
              }}
            >
              {loading && (
                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              )}
              {loading ? "Creating..." : "Create Product"}
            </button>

            <Link href="/dashboard/products">
              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "9px 20px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--text-primary)";
                  el.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border)";
                  el.style.color = "var(--text-secondary)";
                }}
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}