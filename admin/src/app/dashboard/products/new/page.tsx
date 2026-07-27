"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";

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

const getToken = () =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("tcp_admin_token="))
    ?.split("=")[1] || "";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
    fetch(`${API}/api/admin/categories?limit=100`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
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
      const res = await fetch(`${API}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/products">
          <button
            className="p-2 rounded-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            New Product
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            After creating, you can add images, variants, pricing and more
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border p-6 space-y-6"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General */}
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

          {/* SEO */}
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
              <Input
                label="OG Image URL"
                type="url"
                value={form.ogImageUrl}
                onChange={(e) => set("ogImageUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div
            className="flex gap-3 pt-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Button type="submit" loading={loading}>
              Create Product
            </Button>
            <Link href="/dashboard/products">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}