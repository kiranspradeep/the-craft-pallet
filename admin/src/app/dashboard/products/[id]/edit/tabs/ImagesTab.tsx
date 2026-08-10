"use client";

import { useState } from "react";
import { Trash2, ImageIcon } from "lucide-react";
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

const sectionLabel = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--text-secondary)",
  marginBottom: "14px",
  display: "block",
};

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

  const handleUpload = async (urls: string[]) => {
    setSaving(true);
    setError("");
    try {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Existing images */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <span style={sectionLabel}>
          Product Images ({product.images?.length ?? 0})
        </span>

        {product.images?.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <ImageIcon
              size={28}
              strokeWidth={1.25}
              style={{
                color: "var(--border)",
                margin: "0 auto 10px",
              }}
            />
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              No images yet
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
              gap: "12px",
            }}
          >
            {product.images?.map(
              (img: {
                id: string;
                url: string;
                type: string;
                altText: string | null;
                sortOrder: number;
              }) => (
                <div key={img.id}>
                  <div
                    style={{
                      aspectRatio: "1/1",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 500,
                        padding: "2px 7px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(166,138,117,0.1)",
                        color: "var(--brand)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {img.type}
                    </span>
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={deleting === img.id}
                      aria-label="Delete image"
                      style={{
                        color: "#DC2626",
                        display: "flex",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        opacity: deleting === img.id ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Upload new */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <span style={sectionLabel}>Upload Image</span>

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
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <Select
              label="Image Type"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              options={IMAGE_TYPES}
            />
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: "7px",
                }}
              >
                Sort Order
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <FileUpload
            label="Select Image"
            multiple={true}
            maxFiles={10}
            accept="image/jpeg,image/png,image/webp"
            onUpload={handleUpload}
            helpText="Images are uploaded to Cloudinary. Select type before uploading."
          />

          {saving && (
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Saving image records...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}