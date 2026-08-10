"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
    <div style={{ maxWidth: "600px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <Link href="/dashboard/categories">
          <button
            aria-label="Back to categories"
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
              transition: "background-color 150ms ease",
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
            Edit Category
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "2px",
            }}
          >
            {category.name}
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
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
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
            onChange={(e) =>
              set("sortOrder", parseInt(e.target.value) || 0)
            }
          />
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(v) => set("isActive", v)}
          />

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
            >
              {loading && (
                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <Link href="/dashboard/categories">
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