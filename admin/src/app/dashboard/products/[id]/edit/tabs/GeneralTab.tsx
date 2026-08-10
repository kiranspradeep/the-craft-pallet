"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
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
          Product updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            General Information
          </p>
          <div className="space-y-4">
            <Select
              label="Category"
              required
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
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
            <div className="flex gap-6">
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

        <div
          className="pt-5 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            SEO
          </p>
          <div className="space-y-4">
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

        <div
          className="flex gap-3 pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}