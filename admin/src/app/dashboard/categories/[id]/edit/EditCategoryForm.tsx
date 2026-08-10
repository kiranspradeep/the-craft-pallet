"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function EditCategoryForm({
  category,
}: {
  category: Category;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    imageUrl: category.imageUrl || "",
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  });

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update category");
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
        <Link href="/dashboard/categories">
          <button
            className="p-2 rounded-xl transition-colors"
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
            Edit Category
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {category.name}
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
            onChange={(e) => {
              set("name", e.target.value);
              set("slug", generateSlug(e.target.value));
            }}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            helpText="Changing the slug affects existing URLs"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
          />

          {/* Replaced Image URL input with Cloudinary file upload */}
          <FileUpload
            label="Category Image"
            multiple={false}
            maxFiles={1}
            value={form.imageUrl || undefined}
            onUpload={(urls) => set("imageUrl", urls[0] ?? "")}
            onRemove={() => set("imageUrl", "")}
            helpText="Upload a new image to replace the current one."
          />

          <Input
            label="Sort Order"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
          />
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(v) => set("isActive", v)}
          />
          <div
            className="flex gap-3 pt-2 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Button type="submit" loading={loading}>
              Save Changes
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