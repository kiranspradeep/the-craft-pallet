"use client";

import { useState } from "react";
import { Trash2, ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import FileUpload from "@/components/ui/FileUpload";

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
  const [imageType, setImageType] = useState("GALLERY");
  const [sortOrder, setSortOrder] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refreshProduct = async () => {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  // Called by FileUpload after Cloudinary upload — receives array of URLs
  const handleUpload = async (urls: string[]) => {
    setSaving(true);
    setError("");
    try {
      // Save each uploaded URL as a product image record
      for (const url of urls) {
        const res = await fetch(`/api/admin/products/${product.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            type: imageType,
            sortOrder,
            altText: product.name,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Failed to save image");
          return;
        }
      }
      await refreshProduct();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeleting(imageId);
    try {
      await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
        method: "DELETE",
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

      {/* Upload new image */}
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
          Upload Image
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

        <div className="space-y-4">
          {/* Image type selector */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Image Type"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              options={IMAGE_TYPES}
            />
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Sort Order
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* File upload — goes to Cloudinary */}
          <FileUpload
            label="Select Image"
            multiple={true}
            maxFiles={10}
            accept="image/jpeg,image/png,image/webp"
            onUpload={handleUpload}
            helpText="Images are uploaded to Cloudinary. Select type before uploading."
          />

          {saving && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Saving image records...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}