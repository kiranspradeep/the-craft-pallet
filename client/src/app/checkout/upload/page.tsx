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

  // Common file state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [assetId, setAssetId] = useState<string | null>(null);

  // Google Drive
  const [driveLink, setDriveLink] = useState("");
  const [driveLoading, setDriveLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (buyNowId) {
          const session = await buyNowApi.get(buyNowId);
          setProductIdForUpload(session.productId);

          // Fetch product to get configuration
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
          // Use first item that requires upload
          const uploadItem = cartRes.cart.items.find(
            (i: any) => i.product?.configuration?.uploadRequired
          );
          if (!uploadItem) {
            // No upload needed — skip to checkout
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
    if (
      productConfig?.minImages &&
      files.length < productConfig.minImages
    ) {
      setError(`Please add at least ${productConfig.minImages} photos`);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const asset = await assetApi.uploadDirect(files, productIdForUpload || undefined);
      setAssetId(asset.id);
      setSuccess(`${files.length} photos uploaded successfully!`);

      // Attach to buy-now session
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
      const asset = await assetApi.uploadZip(file, productIdForUpload || undefined);
      setAssetId(asset.id);
      setSuccess("ZIP extracted and uploaded!");
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
      setSuccess("Google Drive link saved!");
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
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "60px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "900px" }}>
        <Link
          href={`/checkout/upload-method${buyNowId ? `?bn=${buyNowId}` : ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Back
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <p className="tcp-eyebrow">Step 2 of 3</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Send us your{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              photos
            </em>
          </h1>
          {cartItemInfo && (
            <p
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
              }}
            >
              For: <strong>{cartItemInfo.productName}</strong>
              {productConfig?.minImages && productConfig?.maxImages && (
                <>
                  {" · "}
                  {productConfig.minImages === productConfig.maxImages
                    ? `${productConfig.maxImages} photos required`
                    : `${productConfig.minImages}–${productConfig.maxImages} photos`}
                </>
              )}
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(142,159,130,0.15)",
              color: "var(--success)",
              fontSize: "13px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Check size={16} strokeWidth={2} />
            {success}
          </div>
        )}

        {/* Upload Options */}
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            letterSpacing: "0.05em",
            marginBottom: "16px",
            textTransform: "uppercase",
          }}
        >
          Choose how you&apos;d like to send your photos
        </p>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <UploadCard
            icon={<Upload size={22} strokeWidth={1.75} />}
            title="Upload Photos"
            description="Drag & drop or browse files"
            onClick={() => fileInputRef.current?.click()}
          />
          <UploadCard
            icon={<Folder size={22} strokeWidth={1.75} />}
            title="Upload Folder"
            description="Recommended for 100+ photos"
            onClick={() => folderInputRef.current?.click()}
          />
          <UploadCard
            icon={<FileArchive size={22} strokeWidth={1.75} />}
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

        {/* Google Drive card */}
        <div
          style={{
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid var(--border-soft)",
            backgroundColor: "var(--surface)",
            marginBottom: "32px",
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: "12px", marginBottom: "12px" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Cloud size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Google Drive
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
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
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1.5px solid var(--border)",
                fontSize: "14px",
                backgroundColor: "var(--bg)",
              }}
            />
            <button
              onClick={submitDriveLink}
              disabled={driveLoading || !driveLink.trim()}
              className="btn-primary"
              style={{ padding: "12px 20px" }}
            >
              {driveLoading ? "Saving..." : "Import"}
            </button>
          </div>
        </div>

        {/* File previews */}
        {files.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "12px",
              }}
            >
              {files.length} photo{files.length !== 1 && "s"} selected
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {files.map((file, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
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
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>

            {!assetId && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="btn-primary"
                style={{ width: "100%", padding: "14px" }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" strokeWidth={2} />
                    Uploading {files.length} photos...
                  </>
                ) : (
                  `Upload ${files.length} Photos`
                )}
              </button>
            )}
          </div>
        )}

        {/* Continue */}
        <div
          style={{
            marginTop: "24px",
            padding: "20px 24px",
            borderRadius: "20px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <button
            onClick={goToCheckout}
            disabled={!assetId && productConfig?.uploadRequired !== false}
            className="btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "15px" }}
          >
            Continue to Checkout
            <ArrowRight size={16} strokeWidth={2} />
          </button>

          <button
            onClick={switchToWhatsApp}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <MessageCircle size={14} strokeWidth={1.75} />
            Or continue on WhatsApp instead
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upload Card Component ────────────────────────────────────────────────

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
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        cursor: "pointer",
        transition: "all 300ms ease",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "var(--border)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          backgroundColor: "var(--brand-soft)",
          color: "var(--brand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>
      <h4
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </button>
  );
}