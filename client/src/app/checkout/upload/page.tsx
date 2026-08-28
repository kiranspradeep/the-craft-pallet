"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
  Image as ImageIcon,
} from "lucide-react";
import { assetApi, cartApi, buyNowApi, getSessionId } from "@/lib/cart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

interface UploadProgressState {
  productName: string;
  fieldName: string;
  totalFiles: number;
  progress: number;
  isZip: boolean;
  status: "uploading" | "optimizing";
}

function WhatsAppIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Helper function to upload files with real-time progress callbacks using XHR
const uploadWithProgress = (
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // Maintain session parity with cart operations
    const sessionId = getSessionId();
    if (sessionId) {
      xhr.setRequestHeader("X-Session-Id", sessionId);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resData = JSON.parse(xhr.responseText);
          resolve(resData.data || resData);
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.message || "Upload failed"));
        } catch {
          reject(new Error(`Server responded with code ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error."));
    xhr.send(formData);
  });
};

// ── Main Content ──────────────────────────────────────────────────────────────

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("bn");

  const [uploadFields, setUploadFields] = useState<UploadField[]>([]);
  const [fieldStates, setFieldStates] = useState<Record<string, FieldUploadState>>({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [buyNowSession, setBuyNowSession] = useState<any>(null);

  // Overlay progress state
  const [activeUpload, setActiveUpload] = useState<UploadProgressState | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (buyNowId) {
          // ── Buy Now Flow ───────────────────────────────────────────
          const session = await buyNowApi.get(buyNowId);
          setBuyNowSession(session);

          const productRes = await fetch(`${API_URL}/api/products/${session.productId}`);
          const productData = await productRes.json();
          const product = productData.data;

          if (!product || !product.configuration?.uploadRequired) {
            router.push(`/checkout?bn=${buyNowId}`);
            return;
          }

          const fields: UploadField[] = [];
          const sessionCustomizations = (session.customizations as any[]) ?? [];

          const photoCustomFields = product.customFields?.filter(
            (cf: any) => cf.type === "PHOTO_UPLOAD"
          ) ?? [];

          const isMultiUnit =
            product.pricingConfig?.strategy === "FIXED_VARIANTS" ||
            product.pricingConfig?.strategy === "PER_UNIT";

          const unitTotal = isMultiUnit ? (session.quantity ?? 1) : 1;

          if (photoCustomFields.length > 0) {
            for (let u = 0; u < unitTotal; u++) {
              for (const pcf of photoCustomFields) {
                const existing = sessionCustomizations.find(
                  (c: any) => c.customFieldId === pcf.id && (c.unitIndex ?? 0) === u
                );

                fields.push({
                  customizationId: `${pcf.id}_${u}`,
                  customFieldId: pcf.id,
                  fieldLabel: pcf.label || "Your Photos",
                  cartItemId: "",
                  productName: product.name,
                  productId: product.id,
                  minImages: product.configuration.minImages ?? null,
                  maxImages: product.configuration.maxImages ?? null,
                  assetId: existing?.assetId ?? (u === 0 ? session.assetId : null),
                  unitIndex: u,
                  unitTotal,
                });
              }
            }
          } else {
            for (let u = 0; u < unitTotal; u++) {
              fields.push({
                customizationId: `default_upload_${u}`,
                customFieldId: "default",
                fieldLabel: "Your Photos",
                cartItemId: "",
                productName: product.name,
                productId: product.id,
                minImages: product.configuration.minImages ?? null,
                maxImages: product.configuration.maxImages ?? null,
                assetId: u === 0 ? session.assetId : null,
                unitIndex: u,
                unitTotal,
              });
            }
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

        } else {
          // ── Cart Flow ──────────────────────────────────────────────
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

            photoCustomizations.sort(
              (a: any, b: any) => (a.unitIndex ?? 0) - (b.unitIndex ?? 0)
            );

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
        }
      } catch (err) {
        setPageError("Failed to load checkout upload workspace");
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

  const syncAssetIdToDatabase = async (field: UploadField, assetId: string) => {
    if (buyNowId) {
      const existingCustomizations = (buyNowSession?.customizations as any[]) ?? [];
      const updatedCustomizations = [...existingCustomizations];
      const matchIdx = updatedCustomizations.findIndex(
        (c: any) => c.customFieldId === field.customFieldId && (c.unitIndex ?? 0) === field.unitIndex
      );

      if (matchIdx >= 0) {
        updatedCustomizations[matchIdx] = {
          ...updatedCustomizations[matchIdx],
          assetId,
        };
      } else {
        updatedCustomizations.push({
          customFieldId: field.customFieldId,
          fieldLabel: field.fieldLabel,
          fieldType: "PHOTO_UPLOAD",
          unitIndex: field.unitIndex,
          assetId,
        });
      }

      await buyNowApi.update(buyNowId, {
        assetId,
        customizations: updatedCustomizations,
      });

      setBuyNowSession((prev: any) => ({
        ...prev,
        assetId,
        customizations: updatedCustomizations,
      }));
    } else {
      await cartApi.linkAssetToUploadField(
        field.cartItemId,
        field.customizationId,
        assetId
      );
    }
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
    setActiveUpload({
      productName: field.productName,
      fieldName: field.fieldLabel,
      totalFiles: files.length,
      progress: 0,
      isZip: false,
      status: "uploading",
    });

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("productId", field.productId);

      const asset = await uploadWithProgress(
        `${API_URL}/api/assets/upload`,
        formData,
        (percent) => {
          setActiveUpload((prev) =>
            prev
              ? {
                  ...prev,
                  progress: percent,
                  status: percent === 100 ? "optimizing" : "uploading",
                }
              : null
          );
        }
      );

      await syncAssetIdToDatabase(field, asset.id);

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
    } finally {
      setActiveUpload(null);
    }
  };

  const uploadZipForField = async (field: UploadField, file: File) => {
    updateField(field.customizationId, { uploading: true, error: "" });
    setActiveUpload({
      productName: field.productName,
      fieldName: field.fieldLabel,
      totalFiles: 1,
      progress: 0,
      isZip: true,
      status: "uploading",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", field.productId);

      const asset = await uploadWithProgress(
        `${API_URL}/api/assets/upload-zip`,
        formData,
        (percent) => {
          setActiveUpload((prev) =>
            prev
              ? {
                  ...prev,
                  progress: percent,
                  status: percent === 100 ? "optimizing" : "uploading",
                }
              : null
          );
        }
      );

      await syncAssetIdToDatabase(field, asset.id);

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
    } finally {
      setActiveUpload(null);
    }
  };

  const submitDriveLinkForField = async (
    field: UploadField,
    driveLink: string
  ) => {
    updateField(field.customizationId, { uploading: true, error: "" });
    try {
      const asset = await assetApi.uploadDriveLink(driveLink);
      await syncAssetIdToDatabase(field, asset.id);

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

  const clearField = async (field: UploadField) => {
    try {
      if (buyNowId) {
        const updatedCustomizations = (buyNowSession?.customizations as any[] ?? []).map((c: any) => {
          if (c.customFieldId === field.customFieldId && (c.unitIndex ?? 0) === field.unitIndex) {
            const { assetId: _ignored, ...rest } = c;
            return rest;
          }
          return c;
        });

        await buyNowApi.update(buyNowId, {
          assetId: undefined,
          customizations: updatedCustomizations,
        });

        setBuyNowSession((prev: any) => ({
          ...prev,
          assetId: undefined,
          customizations: updatedCustomizations,
        }));
      } else {
        await cartApi.linkAssetToUploadField(
          field.cartItemId,
          field.customizationId,
          ""
        );
      }

      updateField(field.customizationId, { files: [], assetId: null, error: "" });
    } catch (err: any) {
      console.error("Failed to clear field:", err);
    }
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
          Loading upload workspace...
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
    <>
      {/* Dynamic visual upload status modal overlay */}
      {activeUpload && (
        <UploadProgressOverlay activeUpload={activeUpload} />
      )}

      <div style={{ backgroundColor: "var(--bg)", padding: "56px 0 120px" }}>
        <div className="tcp-container" style={{ maxWidth: "860px" }}>
          
          {/* Back */}
          <Link
            href={`/checkout/upload-method${buyNowId ? `?bn=${buyNowId}` : ""}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-tertiary)",
              marginBottom: "32px",
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={13} strokeWidth={1.75} />
            Back
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "36px" }}>
            <p className="tcp-eyebrow">Website Order — Step 2 of 3</p>
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

          {/* Dynamic upload sections */}
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
                onClear={() => clearField(field)}
              />
            ))}
          </div>

          {/* Actions panel */}
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
              onClick={() => router.push(`/checkout${buyNowId ? `?bn=${buyNowId}` : ""}`)}
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
              onClick={() => router.push(`/checkout?method=whatsapp${buyNowId ? `&bn=${buyNowId}` : ""}`)}
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
              <WhatsAppIcon size={13} />
              Or continue on WhatsApp instead
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "160px 0",
            textAlign: "center",
            backgroundColor: "var(--bg)",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Loading upload step...
          </p>
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  );
}

// ── Upload Progress Overlay Modal ──────────────────────────────────────────

function UploadProgressOverlay({ activeUpload }: { activeUpload: UploadProgressState }) {
  const isOptimizing = activeUpload.status === "optimizing";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(18, 18, 18, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--radius-card)",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        {/* Animated Visual Icon */}
        <div style={{ display: "inline-flex", marginBottom: "20px", position: "relative" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--brand-soft)",
              color: "var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isOptimizing ? (
              <Loader2 size={28} className="animate-spin" strokeWidth={1.5} />
            ) : (
              <ImageIcon size={28} strokeWidth={1.5} className="pulse-icon" />
            )}
          </div>
        </div>

        {/* Labels */}
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {isOptimizing ? "Optimizing Assets" : "Transferring Files"}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "24px",
            lineHeight: 1.5,
          }}
        >
          {isOptimizing ? (
            <>
              Resizing to high-clarity output profiles.
              <br />
              <span style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>
                Preserving print configurations...
              </span>
            </>
          ) : activeUpload.isZip ? (
            `Sending ZIP bundle to secure processing repository...`
          ) : (
            `Transferring ${activeUpload.totalFiles} images to our server...`
          )}
        </p>

        {/* Real Progress Bar */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "var(--bg)",
              borderRadius: "999px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${activeUpload.progress}%`,
                backgroundColor: isOptimizing ? "var(--success)" : "var(--brand)",
                borderRadius: "999px",
                transition: "width 250ms ease-out",
                backgroundImage: isOptimizing
                  ? "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)"
                  : "none",
                backgroundSize: "1rem 1rem",
                animation: isOptimizing ? "progress-bar-stripes 1s linear infinite" : "none",
              }}
            />
          </div>
        </div>

        {/* Progress Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "var(--text-tertiary)",
          }}
        >
          <span>
            {activeUpload.productName}
          </span>
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
            {isOptimizing ? "Processing..." : `${activeUpload.progress}%`}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes progress-bar-stripes {
          from { background-position: 1rem 0; }
          to { background-position: 0 0; }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        .pulse-icon {
          animation: pulse-soft 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

// ── Upload Section ────────────────────────────────────────────────────────

interface UploadSectionProps {
  field: UploadField;
  state: FieldUploadState;
  index: number;
  onUploadFiles: (files: File[]) => void;
  onUploadZip: (file: File) => void;
  onSubmitDrive: (link: string) => void;
  onClear: () => void;
}

function UploadSection({
  field,
  state,
  index,
  onUploadFiles,
  onUploadZip,
  onSubmitDrive,
  onClear,
}: UploadSectionProps) {
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
              Initializing secure stream connection...
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
              Readying {state.files.length} file
              {state.files.length !== 1 ? "s" : ""}...
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