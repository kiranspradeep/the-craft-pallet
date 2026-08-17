"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Folder,
  FileArchive,
  Cloud,
  Check,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { assetApi, cartApi } from "@/lib/cart";

// ── Types ─────────────────────────────────────────────────────────────────

interface UploadField {
  customizationId: string;
  customFieldId: string;
  fieldLabel: string;
  cartItemId: string;
  productName: string;
  productId: string;
  minImages: number | null;
  maxImages: number | null;
  assetId: string | null;
  unitIndex: number;
  unitTotal: number;
}

interface FieldUploadState {
  files: File[];
  uploading: boolean;
  assetId: string | null;
  error: string;
}

// ── Main Component ────────────────────────────────────────────────────────

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("bn");

  const [uploadFields, setUploadFields] = useState<UploadField[]>([]);
  const [fieldStates, setFieldStates] = useState<
    Record<string, FieldUploadState>
  >({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (buyNowId) {
          // Buy Now — single product handled via CheckoutSession
          router.push(`/checkout?bn=${buyNowId}`);
          return;
        }

        const res = await cartApi.getCart();
        if (!res?.cart?.items?.length) {
          router.push("/cart");
          return;
        }

        const fields: UploadField[] = [];

        for (const item of res.cart.items) {
          if (!item.product?.configuration?.uploadRequired) continue;

          const photoCustomizations =
            item.customizations?.filter(
              (c: any) => c.fieldType === "PHOTO_UPLOAD"
            ) ?? [];

          // Sort by unitIndex — should already be ordered from DB but sort
          // client-side as a safety net
          photoCustomizations.sort(
            (a: any, b: any) => (a.unitIndex ?? 0) - (b.unitIndex ?? 0)
          );

          // unitTotal = how many upload sections this product needs
          // For FIXED_VARIANTS/PER_UNIT: equals quantity
          // For INCREMENTAL_QUANTITY/TIERED_PRICING: always 1
          const unitTotal = photoCustomizations.length;

          for (const c of photoCustomizations) {
            fields.push({
              customizationId: c.id,
              customFieldId: c.customFieldId,
              fieldLabel: c.fieldLabel,
              cartItemId: item.id,
              productName: item.product.name,
              productId: item.productId,
              minImages: item.product.configuration.minImages ?? null,
              maxImages: item.product.configuration.maxImages ?? null,
              assetId: c.assetId ?? null,
              unitIndex: c.unitIndex ?? 0,
              unitTotal,
            });
          }
        }

        if (fields.length === 0) {
          router.push("/checkout");
          return;
        }

        setUploadFields(fields);

        const states: Record<string, FieldUploadState> = {};
        for (const f of fields) {
          states[f.customizationId] = {
            files: [],
            uploading: false,
            assetId: f.assetId,
            error: "",
          };
        }
        setFieldStates(states);
      } catch {
        setPageError("Failed to load your cart");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [buyNowId, router]);

  const allComplete = uploadFields.every((f) => {
    const state = fieldStates[f.customizationId];
    return state?.assetId !== null && state?.assetId !== undefined;
  });

  const updateField = (
    customizationId: string,
    update: Partial<FieldUploadState>
  ) => {
    setFieldStates((prev) => ({
      ...prev,
      [customizationId]: { ...prev[customizationId]!, ...update },
    }));
  };

  const uploadFilesForField = async (field: UploadField, files: File[]) => {
    if (field.minImages && files.length < field.minImages) {
      updateField(field.customizationId, {
        error: `Please select at least ${field.minImages} photos`,
      });
      return;
    }
    if (field.maxImages && files.length > field.maxImages) {
      updateField(field.customizationId, {
        error: `Maximum ${field.maxImages} photos allowed`,
      });
      return;
    }

    updateField(field.customizationId, { files, uploading: true, error: "" });

    try {
      const asset = await assetApi.uploadDirect(files, field.productId);
      await cartApi.linkAssetToUploadField(
        field.cartItemId,
        field.customizationId,
        asset.id
      );
      updateField(field.customizationId, {
        uploading: false,
        assetId: asset.id,
        error: "",
      });
    } catch (err: any) {
      updateField(field.customizationId, {
        uploading: false,
        error: err.message || "Upload failed",
      });
    }
  };

  const uploadZipForField = async (field: UploadField, file: File) => {
    updateField(field.customizationId, { uploading: true, error: "" });
    try {
      const asset = await assetApi.uploadZip(file, field.productId);
      await cartApi.linkAssetToUploadField(
        field.cartItemId,
        field.customizationId,
        asset.id
      );
      updateField(field.customizationId, {
        uploading: false,
        assetId: asset.id,
        error: "",
      });
    } catch (err: any) {
      updateField(field.customizationId, {
        uploading: false,
        error: err.message || "ZIP upload failed",
      });
    }
  };

  const submitDriveLinkForField = async (
    field: UploadField,
    driveLink: string
  ) => {
    updateField(field.customizationId, { uploading: true, error: "" });
    try {
      const asset = await assetApi.uploadDriveLink(driveLink);
      await cartApi.linkAssetToUploadField(
        field.cartItemId,
        field.customizationId,
        asset.id
      );
      updateField(field.customizationId, {
        uploading: false,
        assetId: asset.id,
        error: "",
      });
    } catch (err: any) {
      updateField(field.customizationId, {
        uploading: false,
        error: err.message || "Failed to save Drive link",
      });
    }
  };

  const clearField = (customizationId: string) => {
    updateField(customizationId, { files: [], assetId: null, error: "" });
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "160px 0",
          textAlign: "center",
          backgroundColor: "var(--bg)",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div
        style={{
          padding: "160px 0",
          textAlign: "center",
          backgroundColor: "var(--bg)",
        }}
      >
        <p style={{ fontSize: "13px", color: "#DC2626" }}>{pageError}</p>
      </div>
    );
  }

  const completedCount = uploadFields.filter(
    (f) => fieldStates[f.customizationId]?.assetId
  ).length;

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "56px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "860px" }}>
        {/* Back */}
        <Link
          href="/checkout/upload-method"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            marginBottom: "32px",
            letterSpacing: "0.02em",
          }}
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          Back
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <p className="tcp-eyebrow">Step 2 of 3</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Upload your{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              photos
            </em>
          </h1>

          {/* Progress dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              {uploadFields.map((f) => (
                <div
                  key={f.customizationId}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    backgroundColor: fieldStates[f.customizationId]?.assetId
                      ? "var(--success)"
                      : "var(--border)",
                    transition: "background-color 300ms ease",
                  }}
                />
              ))}
            </div>
            <span>
              {completedCount} of {uploadFields.length} uploads complete
            </span>
          </div>
        </div>

        {/* One section per upload field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {uploadFields.map((field, index) => (
            <UploadSection
              key={field.customizationId}
              field={field}
              state={fieldStates[field.customizationId]!}
              index={index}
              onUploadFiles={(files) => uploadFilesForField(field, files)}
              onUploadZip={(file) => uploadZipForField(field, file)}
              onSubmitDrive={(link) => submitDriveLinkForField(field, link)}
              onClear={() => clearField(field.customizationId)}
            />
          ))}
        </div>

        {/* Continue */}
        <div
          style={{
            marginTop: "28px",
            padding: "20px",
            borderRadius: "var(--radius-card)",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-soft)",
          }}
        >
          {!allComplete && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Upload photos for all products above to continue
            </p>
          )}
          <button
            onClick={() => router.push("/checkout")}
            disabled={!allComplete}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              opacity: allComplete ? 1 : 0.4,
            }}
          >
            Continue to Checkout
            <ArrowRight size={15} strokeWidth={2} />
          </button>

          <button
            onClick={() => router.push("/checkout?method=whatsapp")}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px",
              fontSize: "12px",
              color: "var(--text-tertiary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <MessageCircle size={13} strokeWidth={1.75} />
            Or continue on WhatsApp instead
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upload Section ────────────────────────────────────────────────────────

function UploadSection({
  field,
  state,
  index,
  onUploadFiles,
  onUploadZip,
  onSubmitDrive,
  onClear,
}: {
  field: UploadField;
  state: FieldUploadState;
  index: number;
  onUploadFiles: (files: File[]) => void;
  onUploadZip: (file: File) => void;
  onSubmitDrive: (link: string) => void;
  onClear: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [driveLink, setDriveLink] = useState("");
  const [driveLoading, setDriveLoading] = useState(false);

  const isComplete = !!state.assetId;

  const handleDrive = async () => {
    if (!driveLink.trim()) return;
    setDriveLoading(true);
    await onSubmitDrive(driveLink.trim());
    setDriveLoading(false);
  };

  const photoRequirement =
    field.minImages && field.maxImages
      ? field.minImages === field.maxImages
        ? `${field.maxImages} photos required`
        : `${field.minImages}–${field.maxImages} photos`
      : field.minImages
      ? `At least ${field.minImages} photos`
      : field.maxImages
      ? `Up to ${field.maxImages} photos`
      : "Upload photos";

  return (
    <div
      style={{
        borderRadius: "var(--radius-card)",
        border: `1.5px solid ${
          isComplete ? "rgba(142,159,130,0.4)" : "var(--border)"
        }`,
        backgroundColor: "var(--surface)",
        overflow: "hidden",
        transition: "border-color 300ms ease",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isComplete
            ? "rgba(142,159,130,0.06)"
            : "var(--bg-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Circle number / check */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "999px",
              backgroundColor: isComplete ? "var(--success)" : "var(--border)",
              color: isComplete ? "#fff" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 600,
              flexShrink: 0,
              transition: "all 300ms ease",
            }}
          >
            {isComplete ? <Check size={13} strokeWidth={2.5} /> : index + 1}
          </div>

          <div>
            {/* Product name + unit badge */}
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "2px",
              }}
            >
              {field.productName}
              {field.unitTotal > 1 && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--text-tertiary)",
                  }}
                >
                  Unit {field.unitIndex + 1} of {field.unitTotal}
                </span>
              )}
            </p>

            {/* Field label + photo requirement */}
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              {field.fieldLabel} · {photoRequirement}
            </p>
          </div>
        </div>

        {isComplete && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--success)",
              }}
            >
              Uploaded ✓
            </span>
            <button
              onClick={onClear}
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                textDecoration: "underline",
              }}
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Upload controls */}
      {!isComplete && (
        <div style={{ padding: "20px" }}>
          {state.error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-input)",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                fontSize: "12px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={13} strokeWidth={1.75} />
              {state.error}
            </div>
          )}

          {/* Upload method buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <UploadButton
              icon={<Upload size={15} strokeWidth={1.75} />}
              label="Photos"
              onClick={() => fileInputRef.current?.click()}
              disabled={state.uploading}
            />
            <UploadButton
              icon={<Folder size={15} strokeWidth={1.75} />}
              label="Folder"
              onClick={() => folderInputRef.current?.click()}
              disabled={state.uploading}
            />
            <UploadButton
              icon={<FileArchive size={15} strokeWidth={1.75} />}
              label="ZIP"
              onClick={() => zipInputRef.current?.click()}
              disabled={state.uploading}
            />
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files) {
                onUploadFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            accept="image/*"
            hidden
            // @ts-expect-error non-standard
            webkitdirectory=""
            onChange={(e) => {
              if (e.target.files) {
                onUploadFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadZip(file);
                e.target.value = "";
              }
            }}
          />

          {/* Google Drive */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                padding: "10px 12px",
                borderRadius: "var(--radius-input)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
              }}
            >
              <Cloud
                size={14}
                strokeWidth={1.75}
                style={{ color: "var(--brand)", flexShrink: 0 }}
              />
              <input
                type="url"
                placeholder="Google Drive link..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                disabled={state.uploading}
                style={{
                  flex: 1,
                  fontSize: "13px",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={handleDrive}
              disabled={driveLoading || !driveLink.trim() || state.uploading}
              className="btn-secondary"
              style={{ padding: "10px 14px", fontSize: "12px" }}
            >
              {driveLoading ? "..." : "Import"}
            </button>
          </div>

          {/* Upload progress */}
          {state.uploading && (
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <Loader2 size={14} className="animate-spin" strokeWidth={2} />
              Uploading
              {state.files.length > 0
                ? ` ${state.files.length} photos`
                : ""}
              ...
            </div>
          )}

          {state.files.length > 0 && !state.uploading && !state.assetId && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {state.files.length} photo
              {state.files.length !== 1 ? "s" : ""} selected — uploading...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Small upload button ───────────────────────────────────────────────────

function UploadButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px",
        borderRadius: "var(--radius-input)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--bg-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        transition: "border-color 200ms ease",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      <span style={{ color: "var(--brand)" }}>{icon}</span>
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-secondary)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </button>
  );
}