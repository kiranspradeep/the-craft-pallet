"use client";

import { useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || undefined,
          price: parseFloat(form.price),
          processingDays: form.processingDays
            ? parseInt(form.processingDays)
            : undefined,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
        }),
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
          body: JSON.stringify({
            name: form.name,
            sku: form.sku || undefined,
            price: parseFloat(form.price),
            processingDays: form.processingDays
              ? parseInt(form.processingDays)
              : undefined,
            isActive: form.isActive,
            sortOrder: form.sortOrder,
          }),
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
      await fetch(`/api/admin/products/${product.id}/variants/${variantId}`, {
        method: "DELETE",
      });
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

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
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
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Variant Name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. 4x4, A4, Large"
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
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Variants ({product.variants?.length ?? 0})
        </p>
        {!showForm && !editingId && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} />
            Add Variant
          </Button>
        )}
      </div>

      {showForm && (
        <div
          className="p-4 rounded-xl mb-4"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
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

      {product.variants?.length === 0 && !showForm ? (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No variants yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {product.variants?.map((v: Variant) => (
            <div key={v.id}>
              {editingId === v.id ? (
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    borderColor: "var(--brand)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--brand)" }}
                  >
                    Editing: {v.name}
                  </p>
                  <VariantForm
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(v.id);
                    }}
                    submitLabel="Save Changes"
                    onCancel={cancelEdit}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {v.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      ₹{Number(v.price).toFixed(2)}
                      {v.sku && ` · SKU: ${v.sku}`}
                      {v.processingDays && ` · ${v.processingDays} days`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: v.isActive
                          ? "rgba(142,159,130,0.15)"
                          : "rgba(166,138,117,0.1)",
                        color: v.isActive
                          ? "var(--success)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => startEdit(v)}
                      className="p-1.5 rounded-lg"
                      style={{ color: "var(--brand)" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deleting === v.id}
                      className="p-1.5 rounded-lg"
                      style={{ color: "#DC2626" }}
                    >
                      <Trash2 size={14} />
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