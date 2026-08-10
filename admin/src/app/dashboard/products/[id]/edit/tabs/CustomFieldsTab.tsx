"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";

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
  validationJson: any;
  options: {
    id: string;
    label: string;
    value: string;
    sortOrder: number;
  }[];
}

interface FieldFormData {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  helpText: string;
  isRequired: boolean;
  sortOrder: number;
  minValue: string;
  maxValue: string;
  maxTextLength: string;
}

interface Props {
  product: any;
  onUpdate: (p: any) => void;
}

const emptyField: FieldFormData = {
  name: "",
  label: "",
  type: "TEXT",
  placeholder: "",
  helpText: "",
  isRequired: false,
  sortOrder: 0,
  minValue: "",
  maxValue: "",
  maxTextLength: "",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

function FieldForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  loading,
  error,
}: {
  form: FieldFormData;
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
      style={{
        marginTop: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
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
          label="Field Name (internal)"
          required
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="recipient_name"
        />
        <Input
          label="Label (shown to customer)"
          required
          value={form.label}
          onChange={(e) => onChange("label", e.target.value)}
          placeholder="Recipient Name"
        />
      </div>

      <Select
        label="Field Type"
        value={form.type}
        onChange={(e) => onChange("type", e.target.value)}
        options={FIELD_TYPES}
      />

      {form.type === "NUMBER" && (
        <div style={formGrid}>
          <Input
            label="Minimum Value"
            type="number"
            value={form.minValue}
            onChange={(e) => onChange("minValue", e.target.value)}
            placeholder="e.g. 1"
            helpText="Lowest allowed number"
          />
          <Input
            label="Maximum Value"
            type="number"
            value={form.maxValue}
            onChange={(e) => onChange("maxValue", e.target.value)}
            placeholder="e.g. 100"
            helpText="Highest allowed number"
          />
        </div>
      )}

      {(form.type === "TEXT" || form.type === "TEXTAREA") && (
        <Input
          label="Max Character Length"
          type="number"
          min={1}
          value={form.maxTextLength}
          onChange={(e) => onChange("maxTextLength", e.target.value)}
          placeholder="e.g. 50"
          helpText="Optional. Maximum characters allowed."
        />
      )}

      <div style={formGrid}>
        <Input
          label="Placeholder"
          value={form.placeholder}
          onChange={(e) => onChange("placeholder", e.target.value)}
          placeholder="Optional hint text"
        />
        <Input
          label="Sort Order"
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) =>
            onChange("sortOrder", parseInt(e.target.value) || 0)
          }
        />
      </div>

      <Input
        label="Help Text"
        value={form.helpText}
        onChange={(e) => onChange("helpText", e.target.value)}
        placeholder="Additional instructions for customer"
      />

      <Toggle
        label="Required"
        helpText="Customer must fill this field before adding to cart"
        checked={form.isRequired}
        onChange={(v) => onChange("isRequired", v)}
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
            backgroundColor: loading
              ? "var(--text-secondary)"
              : "var(--text-primary)",
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

export default function CustomFieldsTab({ product, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<FieldFormData>(emptyField);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [optionForms, setOptionForms] = useState<
    Record<string, { label: string; value: string }>
  >({});

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const refreshProduct = async () => {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (res.ok) onUpdate(data.data);
  };

  const buildPayload = () => {
    const validationJson: Record<string, unknown> = {};
    if (form.type === "NUMBER") {
      if (form.minValue) validationJson.min = Number(form.minValue);
      if (form.maxValue) validationJson.max = Number(form.maxValue);
    }
    if (form.type === "TEXT" || form.type === "TEXTAREA") {
      if (form.maxTextLength)
        validationJson.maxTextLength = Number(form.maxTextLength);
    }
    return {
      name: form.name,
      label: form.label,
      type: form.type,
      placeholder: form.placeholder || undefined,
      helpText: form.helpText || undefined,
      isRequired: form.isRequired,
      sortOrder: form.sortOrder,
      validationJson:
        Object.keys(validationJson).length > 0 ? validationJson : undefined,
    };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/products/${product.id}/custom-fields`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
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
        `/api/admin/products/${product.id}/custom-fields/${fieldId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
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
        `/api/admin/products/${product.id}/custom-fields/${fieldId}`,
        { method: "DELETE" }
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
      `/api/admin/products/${product.id}/custom-fields/${fieldId}/options`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: opt.label, value: opt.value }),
      }
    );
    setOptionForms((f) => ({
      ...f,
      [fieldId]: { label: "", value: "" },
    }));
    await refreshProduct();
  };

  const handleDeleteOption = async (fieldId: string, optionId: string) => {
    await fetch(
      `/api/admin/products/${product.id}/custom-fields/${fieldId}/options/${optionId}`,
      { method: "DELETE" }
    );
    await refreshProduct();
  };

  const startEdit = (f: CustomField) => {
    const vj = f.validationJson || {};
    setEditingId(f.id);
    setForm({
      name: f.name,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder || "",
      helpText: f.helpText || "",
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
      minValue: vj.min?.toString() || "",
      maxValue: vj.max?.toString() || "",
      maxTextLength: vj.maxTextLength?.toString() || "",
    });
    setShowForm(false);
  };

  const fields: CustomField[] = product.customFields || [];

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
          Custom Fields ({fields.length})
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
            Add Field
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
            New Field
          </p>
          <FieldForm
            form={form}
            onChange={set}
            onSubmit={handleCreate}
            submitLabel="Create Field"
            onCancel={() => {
              setShowForm(false);
              setForm(emptyField);
              setError("");
            }}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {/* Empty */}
      {fields.length === 0 && !showForm ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            No custom fields yet. Add fields like Recipient Name, Message,
            or Spotify Link.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {fields.map((field) => (
            <div key={field.id}>
              {editingId === field.id ? (
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
                    Editing: {field.label}
                  </p>
                  <FieldForm
                    form={form}
                    onChange={set}
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
                    loading={loading}
                    error={error}
                  />
                </div>
              ) : (
                <div
                  style={{
                    border: "1px solid var(--border-soft)",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  {/* Field row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      backgroundColor: "var(--bg-primary)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expandedId === field.id ? null : field.id
                        )
                      }
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            marginBottom: "1px",
                          }}
                        >
                          {field.label}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {field.type}
                          {field.isRequired && " · Required"}
                          {field.type === "NUMBER" &&
                            field.validationJson?.min !== undefined &&
                            field.validationJson?.max !== undefined &&
                            ` · Range: ${field.validationJson.min}–${field.validationJson.max}`}
                          {(field.type === "TEXT" ||
                            field.type === "TEXTAREA") &&
                            field.validationJson?.maxTextLength &&
                            ` · Max ${field.validationJson.maxTextLength} chars`}
                        </p>
                      </div>
                      {expandedId === field.id ? (
                        <ChevronUp
                          size={14}
                          strokeWidth={1.75}
                          style={{ color: "var(--text-tertiary)" }}
                        />
                      ) : (
                        <ChevronDown
                          size={14}
                          strokeWidth={1.75}
                          style={{ color: "var(--text-tertiary)" }}
                        />
                      )}
                    </button>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginLeft: "12px",
                      }}
                    >
                      <button
                        onClick={() => startEdit(field)}
                        aria-label="Edit field"
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
                        onClick={() => handleDelete(field.id)}
                        disabled={deleting === field.id}
                        aria-label="Delete field"
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
                          opacity: deleting === field.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>

                  {/* Options panel */}
                  {expandedId === field.id &&
                    ["SELECT", "RADIO"].includes(field.type) && (
                      <div
                        style={{
                          padding: "14px",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--text-secondary)",
                            marginBottom: "10px",
                          }}
                        >
                          Options
                        </p>

                        {field.options.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              marginBottom: "12px",
                            }}
                          >
                            {field.options.map((opt) => (
                              <div
                                key={opt.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  backgroundColor: "var(--bg-primary)",
                                  border: "1px solid var(--border-soft)",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "13px",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {opt.label}
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      fontSize: "11px",
                                      color: "var(--text-tertiary)",
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    ({opt.value})
                                  </span>
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteOption(field.id, opt.id)
                                  }
                                  aria-label="Delete option"
                                  style={{
                                    color: "#DC2626",
                                    display: "flex",
                                    alignItems: "center",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "2px",
                                  }}
                                >
                                  <Trash2 size={12} strokeWidth={1.75} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add option */}
                        <div style={{ display: "flex", gap: "8px" }}>
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
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                              outline: "none",
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
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => handleAddOption(field.id)}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "var(--text-primary)",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            <Plus size={14} strokeWidth={2} />
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