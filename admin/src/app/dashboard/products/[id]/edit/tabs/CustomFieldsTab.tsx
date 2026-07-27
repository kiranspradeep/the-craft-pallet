"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const getToken = () =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("tcp_admin_token="))
    ?.split("=")[1] || "";

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Textarea" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "SELECT", label: "Select (Dropdown)" },
  { value: "RADIO", label: "Radio Buttons" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "URL", label: "URL" },
  { value: "PHOTO_UPLOAD", label: "Photo Upload" },
];

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  sortOrder: number;
  options: { id: string; label: string; value: string; sortOrder: number }[];
}

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

const emptyField = {
  name: "",
  label: "",
  type: "TEXT",
  placeholder: "",
  helpText: "",
  isRequired: false,
  sortOrder: 0,
};

export default function CustomFieldsTab({ product, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyField);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Option form state
  const [optionForms, setOptionForms] = useState<
    Record<string, { label: string; value: string }>
  >({});

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const refreshProduct = async () => {
    const res = await fetch(`${API}/api/admin/products/${product.id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/admin/products/${product.id}/custom-fields`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            ...form,
            placeholder: form.placeholder || undefined,
            helpText: form.helpText || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create field");
        return;
      }
      setForm(emptyField);
      setShowForm(false);
      await refreshProduct();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (fieldId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/admin/products/${product.id}/custom-fields/${fieldId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            ...form,
            placeholder: form.placeholder || undefined,
            helpText: form.helpText || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update field");
        return;
      }
      setEditingId(null);
      setForm(emptyField);
      await refreshProduct();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm("Delete this custom field and all its options?")) return;
    setDeleting(fieldId);
    try {
      await fetch(
        `${API}/api/admin/products/${product.id}/custom-fields/${fieldId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      await refreshProduct();
    } finally {
      setDeleting(null);
    }
  };

  const handleAddOption = async (fieldId: string) => {
    const opt = optionForms[fieldId];
    if (!opt?.label || !opt?.value) return;
    await fetch(
      `${API}/api/admin/products/${product.id}/custom-fields/${fieldId}/options`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ label: opt.label, value: opt.value }),
      }
    );
    setOptionForms((f) => ({ ...f, [fieldId]: { label: "", value: "" } }));
    await refreshProduct();
  };

  const handleDeleteOption = async (fieldId: string, optionId: string) => {
    await fetch(
      `${API}/api/admin/products/${product.id}/custom-fields/${fieldId}/options/${optionId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    await refreshProduct();
  };

  const startEdit = (f: CustomField) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder || "",
      helpText: f.helpText || "",
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
    });
    setShowForm(false);
  };

  const FieldForm = ({
    onSubmit,
    submitLabel,
    onCancel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    onCancel: () => void;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4 mt-3">
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
          label="Field Name (internal)"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="recipient_name"
        />
        <Input
          label="Label (shown to customer)"
          required
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="Recipient Name"
        />
      </div>
      <Select
        label="Field Type"
        value={form.type}
        onChange={(e) => set("type", e.target.value)}
        options={FIELD_TYPES}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Placeholder"
          value={form.placeholder}
          onChange={(e) => set("placeholder", e.target.value)}
          placeholder="Optional hint text"
        />
        <Input
          label="Sort Order"
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
        />
      </div>
      <Input
        label="Help Text"
        value={form.helpText}
        onChange={(e) => set("helpText", e.target.value)}
        placeholder="Additional instructions for customer"
      />
      <Toggle
        label="Required"
        helpText="Customer must fill this field before adding to cart"
        checked={form.isRequired}
        onChange={(v) => set("isRequired", v)}
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

  const fields: CustomField[] = product.customFields || [];

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
          Custom Fields ({fields.length})
        </p>
        {!showForm && !editingId && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} />
            Add Field
          </Button>
        )}
      </div>

      {showForm && (
        <div
          className="p-4 rounded-xl mb-4"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            New Field
          </p>
          <FieldForm
            onSubmit={handleCreate}
            submitLabel="Create Field"
            onCancel={() => {
              setShowForm(false);
              setForm(emptyField);
              setError("");
            }}
          />
        </div>
      )}

      {fields.length === 0 && !showForm ? (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No custom fields yet. Add fields like &ldquo;Recipient Name&rdquo;,
            &ldquo;Message&rdquo;, or &ldquo;Spotify Link&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id}>
              {editingId === field.id ? (
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    borderColor: "var(--brand)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--brand)" }}
                  >
                    Editing: {field.label}
                  </p>
                  <FieldForm
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(field.id);
                    }}
                    submitLabel="Save Changes"
                    onCancel={() => {
                      setEditingId(null);
                      setForm(emptyField);
                      setError("");
                    }}
                  />
                </div>
              ) : (
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Field header */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() =>
                        setExpandedId(
                          expandedId === field.id ? null : field.id
                        )
                      }
                    >
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {field.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {field.type}
                          {field.isRequired && " · Required"}
                        </p>
                      </div>
                      {expandedId === field.id ? (
                        <ChevronUp
                          size={14}
                          className="ml-auto"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      ) : (
                        <ChevronDown
                          size={14}
                          className="ml-auto"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => startEdit(field)}
                        className="p-1.5 rounded-lg"
                        style={{ color: "var(--brand)" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        disabled={deleting === field.id}
                        className="p-1.5 rounded-lg"
                        style={{ color: "#DC2626" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Options (for SELECT/RADIO) */}
                  {expandedId === field.id &&
                    ["SELECT", "RADIO"].includes(field.type) && (
                      <div
                        className="px-4 py-3 border-t"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Options
                        </p>
                        {field.options.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            {field.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg"
                                style={{ backgroundColor: "var(--bg-primary)" }}
                              >
                                <span
                                  className="text-sm"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {opt.label}
                                  <span
                                    className="ml-2 text-xs"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    ({opt.value})
                                  </span>
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteOption(field.id, opt.id)
                                  }
                                  className="p-1 rounded"
                                  style={{ color: "#DC2626" }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            placeholder="Label"
                            value={optionForms[field.id]?.label || ""}
                            onChange={(e) =>
                              setOptionForms((f) => ({
                                ...f,
                                [field.id]: {
                                  ...f[field.id],
                                  label: e.target.value,
                                },
                              }))
                            }
                            className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none"
                            style={{
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <input
                            placeholder="Value"
                            value={optionForms[field.id]?.value || ""}
                            onChange={(e) =>
                              setOptionForms((f) => ({
                                ...f,
                                [field.id]: {
                                  ...f[field.id],
                                  value: e.target.value,
                                },
                              }))
                            }
                            className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none"
                            style={{
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <button
                            onClick={() => handleAddOption(field.id)}
                            className="px-3 py-1.5 rounded-xl text-sm font-medium text-white"
                            style={{ backgroundColor: "var(--brand)" }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}