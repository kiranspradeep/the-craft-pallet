"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleNameChange = (name: string) => {
    set("name", name);
    set("slug", generateSlug(name));
  };

  const getToken = () => {
    const match = document.cookie
      .split("; ")
      .find((r) => r.startsWith("tcp_admin_token="));
    return match?.split("=")[1] || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create category");
        return;
      }
      router.push("/dashboard/categories");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/categories"
          className="p-2 rounded-xl transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            New Category
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Add a new product category
          </p>
        </div>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Category Name"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Mini Polaroids"
          />

          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="mini-polaroids"
            helpText="Auto-generated from name. You can customise it."
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Brief description of this category..."
            rows={3}
          />

          <Input
            label="Image URL"
            type="url"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://..."
          />

          <Input
            label="Sort Order"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
            helpText="Lower numbers appear first"
          />

          <Toggle
            label="Active"
            helpText="Inactive categories are hidden from the store"
            checked={form.isActive}
            onChange={(v) => set("isActive", v)}
          />

          <div
            className="flex gap-3 pt-2 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Button type="submit" loading={loading}>
              Create Category
            </Button>
            <Link href="/dashboard/categories">
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