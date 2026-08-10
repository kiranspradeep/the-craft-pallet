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
  X,
  Check,
  Loader2,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { assetApi, cartApi, buyNowApi } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("bn");

  const [productConfig, setProductConfig] = useState<{
    minImages?: number | null;
    maxImages?: number | null;
    uploadRequired?: boolean;
  } | null>(null);
  const [productIdForUpload, setProductIdForUpload] = useState<string | null>(null);
  const [cartItemInfo, setCartItemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState("");
  const [driveLoading, setDriveLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (buyNowId) {
          const session = await buyNowApi.get(buyNowId);
          setProductIdForUpload(session.productId);
          const res = await fetch(`${API}/api/products/${session.productId}`);
          const data = await res.json();
          if (data.data?.configuration) {
            setProductConfig(data.data.configuration);
          }
          setCartItemInfo({
            productName: data.data?.name,
            quantity: session.quantity,
          });
        } else {
          const cartRes = await cartApi.getCart();
          if (!cartRes?.cart?.items?.length) {
            router.push("/cart");
            return;
          }
          const uploadItem = cartRes.cart.items.find(
            (i: any) => i.product?.configuration?.uploadRequired
          );
          if (!uploadItem) {
            router.push("/checkout");
            return;
          }
          setProductIdForUpload(uploadItem.productId);
          setProductConfig(uploadItem.product.configuration);
          setCartItemInfo({
            productName: uploadItem.product.name,
            quantity: uploadItem.quantity,
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [buyNowId, router]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    const total = files.length + newFiles.length;
    if (productConfig?.maxImages && total > productConfig.maxImages) {
      setError(`Maximum ${productConfig.maxImages} photos allowed`);
      return;
    }
    setError("");
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setAssetId(null);
    setSuccess("");
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    if (productConfig?.minImages && files.length < productConfig.minImages) {
      setError(`Please add at least ${productConfig.minImages} photos`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const asset = await assetApi.uploadDirect(
        files,
        productIdForUpload || undefined
      );
      setAssetId(asset.id);
      setSuccess(`${files.length} photos uploaded successfully`);
      if (buyNowId) {
        await buyNowApi.update(buyNowId, { assetId: asset.id });
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadZip = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const asset = await assetApi.uploadZip(
        file,
        productIdForUpload || undefined
      );
      setAssetId(asset.id);
      setSuccess("ZIP extracted and uploaded");
      if (buyNowId) {
        await buyNowApi.update(buyNowId, { assetId: asset.id });
      }
    } catch (err: any) {
      setError(err.message || "ZIP upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitDriveLink = async () => {
    if (!driveLink.trim()) return;
    setDriveLoading(true);
    setError("");
    try {
      const asset = await assetApi.uploadDriveLink(driveLink.trim());
      setAssetId(asset.id);
      setSuccess("Google Drive link saved");
      if (buyNowId) {
        await buyNowApi.update(buyNowId, { assetId: asset.id });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save link");
    } finally {
      setDriveLoading(false);
    }
  };

  const goToCheckout = () => {
    router.push(`/checkout${buyNowId ? `?bn=${buyNowId}` : ""}`);
  };

  const switchToWhatsApp = () => {
    router.push(
      `/checkout?method=whatsapp${buyNowId ? `&bn=${buyNowId}` : ""}`
    );
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

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "56px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "860px" }}>
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
            transition: "color 200ms ease",
          }}
          className="hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          Back
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
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
          {cartItemInfo && (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              For:{" "}
              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                {cartItemInfo.productName}
              </span>
              {productConfig?.minImages && productConfig?.maxImages && (
                <span style={{ color: "var(--text-tertiary)" }}>
                  {" · "}
                  {productConfig.minImages === productConfig.maxImages
                    ? `${productConfig.maxImages} photos required`
                    : `${productConfig.minImages}–${productConfig.maxImages} photos`}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Error / Success */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-input)",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: "13px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={14} strokeWidth={1.75} />
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-input)",
              backgroundColor: "rgba(142,159,130,0.12)",
              border: "1px solid rgba(142,159,130,0.25)",
              color: "var(--success)",
              fontSize: "13px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Check size={14} strokeWidth={2} />
            {success}
          </div>
        )}

        {/* Upload method cards */}
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            marginBottom: "14px",
          }}
        >
          Upload Method
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <UploadCard
            icon={<Upload size={18} strokeWidth={1.75} />}
            title="Upload Photos"
            description="Browse or drag & drop files"
            onClick={() => fileInputRef.current?.click()}
          />
          <UploadCard
            icon={<Folder size={18} strokeWidth={1.75} />}
            title="Upload Folder"
            description="Best for 100+ photos"
            onClick={() => folderInputRef.current?.click()}
          />
          <UploadCard
            icon={<FileArchive size={18} strokeWidth={1.75} />}
            title="Upload ZIP"
            description="Fastest for large collections"
            onClick={() => zipInputRef.current?.click()}
          />
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          // @ts-expect-error non-standard attribute
          webkitdirectory=""
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadZip(file);
          }}
        />

        {/* Google Drive */}
        <div
          style={{
            padding: "20px",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border-soft)",
            backgroundColor: "var(--surface)",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-input)",
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Cloud size={16} strokeWidth={1.75} />
            </div>
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Google Drive
              </h4>
              <p
                style={{ fontSize: "12px", color: "var(--text-tertiary)" }}
              >
                Paste your sharing link
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "var(--radius-input)",
                border: "1px solid var(--border)",
                fontSize: "14px",
                backgroundColor: "var(--bg)",
                color: "var(--text-primary)",
                transition: "border-color 200ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--brand)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
            <button
              onClick={submitDriveLink}
              disabled={driveLoading || !driveLink.trim()}
              className="btn-secondary"
              style={{ padding: "11px 18px", fontSize: "12px" }}
            >
              {driveLoading ? "Saving..." : "Import"}
            </button>
          </div>
        </div>

        {/* File previews */}
        {files.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "12px",
                letterSpacing: "0.02em",
              }}
            >
              {files.length} photo{files.length !== 1 ? "s" : ""} selected
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {files.map((file, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "var(--radius-card)",
                    overflow: "hidden",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={() => removeFile(i)}
                    aria-label="Remove photo"
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={11} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>

            {!assetId && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" strokeWidth={2} />
                    Uploading {files.length} photos...
                  </>
                ) : (
                  `Upload ${files.length} Photo${files.length !== 1 ? "s" : ""}`
                )}
              </button>
            )}
          </div>
        )}

        {/* Continue */}
        <div
          style={{
            padding: "20px",
            borderRadius: "var(--radius-card)",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <button
            onClick={goToCheckout}
            disabled={!assetId && productConfig?.uploadRequired !== false}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Continue to Checkout
            <ArrowRight size={15} strokeWidth={2} />
          </button>

          <button
            onClick={switchToWhatsApp}
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
              transition: "color 200ms ease",
              letterSpacing: "0.02em",
            }}
            className="hover:text-[var(--text-primary)]"
          >
            <MessageCircle size={13} strokeWidth={1.75} />
            Or continue on WhatsApp instead
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "20px",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 250ms ease, box-shadow 250ms ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--brand)";
        el.style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "var(--radius-input)",
          backgroundColor: "var(--brand-soft)",
          color: "var(--brand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>
      <h4
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}
      >
        {title}
      </h4>
      <p style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
        {description}
      </p>
    </button>
  );
}