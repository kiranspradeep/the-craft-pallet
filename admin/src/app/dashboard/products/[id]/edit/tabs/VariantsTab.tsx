"use client";

import { useState, useRef } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  Upload,
  X,
  ImageIcon,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";

interface VariantImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  isActive: boolean;
  sortOrder: number;
  processingDays: number | null;
  images: VariantImage[];
}

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

const emptyForm = {
  name: "",
  sku: "",
  price: "",
  processingDays: "",
  isActive: true,
  sortOrder: 0,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
} as const;

function VariantForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  loading,
  error,
}: {
  form: typeof emptyForm;
  onChange: (key: string, val: unknown) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  onCancel: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}
    >
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <AlertCircle size={13} strokeWidth={1.75} />
          {error}
        </div>
      )}
      <div style={formGrid}>
        <Input
          label="Variant Name"
          required
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. 4×4, A4, Large"
        />
        <Input
          label="SKU"
          value={form.sku}
          onChange={(e) => onChange("sku", e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Price (₹)"
          required
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => onChange("price", e.target.value)}
          placeholder="0.00"
        />
        <Input
          label="Processing Days"
          type="number"
          min={1}
          value={form.processingDays}
          onChange={(e) => onChange("processingDays", e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Sort Order"
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) => onChange("sortOrder", parseInt(e.target.value) || 0)}
        />
      </div>
      <Toggle
        label="Active"
        checked={form.isActive}
        onChange={(v) => onChange("isActive", v)}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#fff",
            backgroundColor: loading ? "var(--text-secondary)" : "var(--text-primary)",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function VariantsTab({ product, onUpdate }: Props) {
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [form,         setForm]         = useState(emptyForm);
  const [loading,      setLoading]      = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [error,        setError]        = useState("");
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const refreshProduct = async () => {
    const res  = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const buildBody = () => ({
    name: form.name,
    sku: form.sku || undefined,
    price: parseFloat(form.price),
    processingDays: form.processingDays ? parseInt(form.processingDays) : undefined,
    isActive: form.isActive,
    sortOrder: form.sortOrder,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to create variant"); return; }
      setForm(emptyForm);
      setShowForm(false);
      await refreshProduct();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (variantId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${product.id}/variants/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to update variant"); return; }
      setEditingId(null);
      setForm(emptyForm);
      await refreshProduct();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this variant and all its images?")) return;
    setDeleting(variantId);
    try {
      await fetch(`/api/admin/products/${product.id}/variants/${variantId}`, {
        method: "DELETE",
      });
      await refreshProduct();
    } finally { setDeleting(null); }
  };

  const handleVariantImageUpload = async (variantId: string, files: FileList) => {
    if (!files.length) return;
    setUploadingFor(variantId);
    setError("");
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

      const urls: string[] = uploadData.data?.urls ?? [];

      for (const url of urls) {
        await fetch(
          `/api/admin/products/${product.id}/variants/${variantId}/images`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          }
        );
      }

      await refreshProduct();
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteVariantImage = async (variantId: string, imageId: string) => {
    try {
      await fetch(
        `/api/admin/products/${product.id}/variants/${variantId}/images/${imageId}`,
        { method: "DELETE" }
      );
      await refreshProduct();
    } catch {
      setError("Failed to delete image");
    }
  };

  const startEdit = (v: Variant) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      sku: v.sku || "",
      price: v.price,
      processingDays: v.processingDays?.toString() || "",
      isActive: v.isActive,
      sortOrder: v.sortOrder,
    });
    setShowForm(false);
    setExpandedId(v.id);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          Variants ({product.variants?.length ?? 0})
        </p>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            <Plus size={13} strokeWidth={2} />
            Add Variant
          </button>
        )}
      </div>

      {/* Global error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: "13px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <AlertCircle size={13} strokeWidth={1.75} />
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div
          style={{
            padding: "16px",
            borderRadius: "6px",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border)",
            marginBottom: "14px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
            New Variant
          </p>
          <VariantForm
            form={form}
            onChange={set}
            onSubmit={handleCreate}
            submitLabel="Create Variant"
            onCancel={() => { setShowForm(false); setForm(emptyForm); setError(""); }}
            loading={loading}
            error=""
          />
        </div>
      )}

      {/* Empty */}
      {product.variants?.length === 0 && !showForm ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            No variants yet. Add one above.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {product.variants?.map((v: Variant) => {
            const isExpanded = expandedId === v.id;
            const isEditing  = editingId === v.id;

            return (
              <div
                key={v.id}
                style={{
                  border: `1px solid ${isEditing ? "var(--brand)" : "var(--border-soft)"}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "border-color 200ms ease",
                }}
              >
                {/* Variant row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    backgroundColor: isEditing
                      ? "rgba(166,138,117,0.06)"
                      : "var(--bg-primary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>
                      {v.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      ₹{Number(v.price).toFixed(2)}
                      {v.sku && ` · ${v.sku}`}
                      {v.processingDays && ` · ${v.processingDays}d`}
                      {v.images?.length > 0 && (
                        <span style={{ color: "var(--brand)" }}>
                          {" · "}
                          <ImageIcon size={10} strokeWidth={1.75} style={{ display: "inline", verticalAlign: "middle" }} />
                          {" "}{v.images.length} img
                        </span>
                      )}
                    </p>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "12px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "999px",
                        backgroundColor: v.isActive ? "rgba(142,159,130,0.12)" : "var(--bg-primary)",
                        color: v.isActive ? "var(--success)" : "var(--text-secondary)",
                        border: v.isActive ? "1px solid rgba(142,159,130,0.25)" : "1px solid var(--border)",
                      }}
                    >
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => startEdit(v)}
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Pencil size={13} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deleting === v.id}
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", opacity: deleting === v.id ? 0.5 : 1 }}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                    <div style={{ color: "var(--text-tertiary)" }}>
                      {isExpanded
                        ? <ChevronUp size={14} strokeWidth={1.75} />
                        : <ChevronDown size={14} strokeWidth={1.75} />
                      }
                    </div>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-soft)" }}>
                    {/* Edit form */}
                    {isEditing && (
                      <>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--brand)", marginBottom: "4px" }}>
                          Edit Details
                        </p>
                        <VariantForm
                          form={form}
                          onChange={set}
                          onSubmit={(e) => { e.preventDefault(); handleUpdate(v.id); }}
                          submitLabel="Save Changes"
                          onCancel={() => { setEditingId(null); setForm(emptyForm); setError(""); }}
                          loading={loading}
                          error={error}
                        />
                        <div style={{ borderTop: "1px solid var(--border-soft)", margin: "20px 0" }} />
                      </>
                    )}

                    {/* Images section */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Images ({v.images?.length ?? 0})
                        </p>

                        {/* Hidden file input per variant */}
                        <input
                          ref={(el) => { fileInputRefs.current[v.id] = el; }}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          hidden
                          onChange={(e) => {
                            if (e.target.files) {
                              handleVariantImageUpload(v.id, e.target.files);
                              e.target.value = "";
                            }
                          }}
                        />
                        <button
                          onClick={() => fileInputRefs.current[v.id]?.click()}
                          disabled={uploadingFor === v.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "var(--brand)",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--surface)",
                            cursor: uploadingFor === v.id ? "not-allowed" : "pointer",
                            opacity: uploadingFor === v.id ? 0.5 : 1,
                          }}
                        >
                          {uploadingFor === v.id
                            ? <><Loader2 size={11} className="animate-spin" /> Uploading...</>
                            : <><Upload size={11} strokeWidth={2} /> Add Images</>
                          }
                        </button>
                      </div>

                      {/* Image grid */}
                      {v.images?.length === 0 ? (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            border: "1px dashed var(--border)",
                            borderRadius: "8px",
                            backgroundColor: "var(--bg-primary)",
                          }}
                        >
                          <ImageIcon
                            size={20}
                            strokeWidth={1}
                            style={{ color: "var(--border)", margin: "0 auto 6px" }}
                          />
                          <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                            No images yet. Click "Add Images" to upload.
                          </p>
                          <p style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                            Uploaded to Cloudinary. Customers see these when this variant is selected.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                            gap: "10px",
                          }}
                        >
                          {v.images.map((img) => (
                            <div key={img.id} style={{ position: "relative" }}>
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
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteVariantImage(v.id, img.id)}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "4px",
                                  backgroundColor: "rgba(220,38,38,0.85)",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={11} strokeWidth={2.5} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}