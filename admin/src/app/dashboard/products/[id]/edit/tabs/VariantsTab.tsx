"use client";

import { useState } from "react";
import { Trash2, Plus, Pencil, AlertCircle, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  isActive: boolean;
  sortOrder: number;
  processingDays: number | null;
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
};

export default function VariantsTab({ product, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const refreshProduct = async () => {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const buildBody = () => ({
    name: form.name,
    sku: form.sku || undefined,
    price: parseFloat(form.price),
    processingDays: form.processingDays
      ? parseInt(form.processingDays)
      : undefined,
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
      if (!res.ok) {
        setError(data.message || "Failed to create variant");
        return;
      }
      setForm(emptyForm);
      setShowForm(false);
      await refreshProduct();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (variantId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/products/${product.id}/variants/${variantId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildBody()),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update variant");
        return;
      }
      setEditingId(null);
      setForm(emptyForm);
      await refreshProduct();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;
    setDeleting(variantId);
    try {
      await fetch(
        `/api/admin/products/${product.id}/variants/${variantId}`,
        { method: "DELETE" }
      );
      await refreshProduct();
    } finally {
      setDeleting(null);
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
  };

  const VariantForm = ({
    onSubmit,
    submitLabel,
    onCancel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    onCancel: () => void;
  }) => (
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
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. 4×4, A4, Large"
        />
        <Input
          label="SKU"
          value={form.sku}
          onChange={(e) => set("sku", e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Price (₹)"
          required
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          placeholder="0.00"
        />
        <Input
          label="Processing Days"
          type="number"
          min={1}
          value={form.processingDays}
          onChange={(e) => set("processingDays", e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Sort Order"
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
        />
      </div>
      <Toggle
        label="Active"
        checked={form.isActive}
        onChange={(v) => set("isActive", v)}
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
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
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
              transition: "all 150ms ease",
            }}
          >
            <Plus size={13} strokeWidth={2} />
            Add Variant
          </button>
        )}
      </div>

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
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            New Variant
          </p>
          <VariantForm
            onSubmit={handleCreate}
            submitLabel="Create Variant"
            onCancel={() => {
              setShowForm(false);
              setForm(emptyForm);
              setError("");
            }}
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
          {product.variants?.map((v: Variant) => (
            <div key={v.id}>
              {editingId === v.id ? (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--brand)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--brand)",
                    }}
                  >
                    Editing: {v.name}
                  </p>
                  <VariantForm
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(v.id);
                    }}
                    submitLabel="Save Changes"
                    onCancel={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setError("");
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {v.name}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ₹{Number(v.price).toFixed(2)}
                      {v.sku && ` · ${v.sku}`}
                      {v.processingDays && ` · ${v.processingDays}d`}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "999px",
                        backgroundColor: v.isActive
                          ? "rgba(142,159,130,0.12)"
                          : "var(--bg-primary)",
                        color: v.isActive
                          ? "var(--success)"
                          : "var(--text-secondary)",
                        border: v.isActive
                          ? "1px solid rgba(142,159,130,0.25)"
                          : "1px solid var(--border)",
                      }}
                    >
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => startEdit(v)}
                      aria-label="Edit variant"
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "6px",
                        color: "var(--brand)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Pencil size={13} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deleting === v.id}
                      aria-label="Delete variant"
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "6px",
                        color: "#DC2626",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity: deleting === v.id ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}