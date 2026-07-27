"use client";

import { useState } from "react";
import { Trash2, ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const getToken = () =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("tcp_admin_token="))
    ?.split("=")[1] || "";

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

const IMAGE_TYPES = [
  { value: "THUMBNAIL", label: "Thumbnail" },
  { value: "GALLERY", label: "Gallery" },
  { value: "BANNER", label: "Banner" },
];

export default function ImagesTab({ product, onUpdate }: Props) {
  const [form, setForm] = useState({
    url: "",
    altText: "",
    type: "GALLERY",
    sortOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refreshProduct = async () => {
    const res = await fetch(`${API}/api/admin/products/${product.id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/admin/products/${product.id}/images`,
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
        setError(data.message || "Failed to add image");
        return;
      }
      setForm({ url: "", altText: "", type: "GALLERY", sortOrder: 0 });
      await refreshProduct();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeleting(imageId);
    try {
      await fetch(`${API}/api/admin/products/${product.id}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      await refreshProduct();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Existing images */}
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
          Product Images ({product.images?.length ?? 0})
        </p>

        {product.images?.length === 0 ? (
          <div className="text-center py-10">
            <ImageIcon
              size={32}
              className="mx-auto mb-2"
              style={{ color: "var(--border)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No images yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.images?.map(
              (img: {
                id: string;
                url: string;
                type: string;
                altText: string | null;
                sortOrder: number;
              }) => (
                <div key={img.id} className="group relative">
                  <div
                    className="aspect-square rounded-xl overflow-hidden border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(166,138,117,0.1)",
                        color: "var(--brand)",
                      }}
                    >
                      {img.type}
                    </span>
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={deleting === img.id}
                      className="p-1 rounded-lg transition-colors"
                      style={{ color: "#DC2626" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Add Image Form */}
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
          Add Image
        </p>

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

        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Image URL"
            required
            type="url"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={IMAGE_TYPES}
            />
            <Input
              label="Sort Order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sortOrder: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
          <Input
            label="Alt Text"
            value={form.altText}
            onChange={(e) =>
              setForm((f) => ({ ...f, altText: e.target.value }))
            }
            placeholder="Describe this image..."
          />
          <Button type="submit" loading={loading}>
            Add Image
          </Button>
        </form>
      </div>
    </div>
  );
}