"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Props {
  productId: string;
  minImages?: number | null;
  maxImages?: number | null;
  allowedSources?: string[];
  onUploaded: (assetId: string) => void;
}

export default function PhotoUploader({
  productId,
  minImages,
  maxImages,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    const totalFiles = files.length + newFiles.length;

    if (maxImages && totalFiles > maxImages) {
      setError(`Maximum ${maxImages} photos allowed`);
      return;
    }

    setError("");
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setUploadedCount(0);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one photo");
      return;
    }

    if (minImages && files.length < minImages) {
      setError(`Please upload at least ${minImages} photos`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      files.forEach((f) => formData.append("files", f));

      const res = await fetch(`${API}/api/assets/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed");
        return;
      }

      setUploadedCount(files.length);
      onUploaded(data.data.id);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          padding: "40px 20px",
          borderRadius: "16px",
          border: `2px dashed ${dragOver ? "var(--brand)" : "var(--border)"}`,
          backgroundColor: dragOver ? "var(--brand-soft)" : "var(--surface)",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "999px",
            backgroundColor: "var(--brand-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            color: "var(--brand)",
          }}
        >
          <Upload size={20} strokeWidth={1.75} />
        </div>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>
          Drag & drop or click to browse
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {minImages && maxImages
            ? `${minImages}–${maxImages} photos`
            : maxImages
            ? `Up to ${maxImages} photos`
            : "JPG, PNG, WEBP, HEIC"}
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "8px",
          }}
        >
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1/1",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "20px",
                  height: "20px",
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
      )}

      {error && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#DC2626" }}>
          {error}
        </p>
      )}

      {files.length > 0 && uploadedCount === 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary"
          style={{ marginTop: "12px", width: "100%", padding: "12px", fontSize: "13px" }}
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" strokeWidth={2} />
              Uploading {files.length} photos...
            </>
          ) : (
            `Upload ${files.length} Photos`
          )}
        </button>
      )}

      {uploadedCount > 0 && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "rgba(142,159,130,0.15)",
            color: "var(--success)",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Check size={16} strokeWidth={2} />
          {uploadedCount} photos uploaded successfully
        </div>
      )}
    </div>
  );
}