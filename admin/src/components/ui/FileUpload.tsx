"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  value?: string | string[];
  onUpload: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  helpText?: string;
  error?: string;
}

export default function FileUpload({
  label,
  accept = "image/jpeg,image/png,image/webp",
  multiple = false,
  maxFiles = 10,
  value,
  onUpload,
  onRemove,
  helpText,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const urls: string[] = value
    ? Array.isArray(value)
      ? value.filter(Boolean)
      : value
      ? [value]
      : []
    : [];

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      if (!multiple && fileArray.length > 1) {
        setUploadError("Only one file allowed");
        return;
      }

      if (urls.length + fileArray.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);
      setUploadError("");
      setProgress(0);

      try {
        const formData = new FormData();
        fileArray.forEach((file) => formData.append("files", file));

        const xhr = new XMLHttpRequest();

        const result = await new Promise<string[]>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                // Admin upload returns { data: { urls: string[] } }
                const uploadedUrls: string[] = data?.data?.urls;
                if (uploadedUrls && uploadedUrls.length > 0) {
                  resolve(uploadedUrls);
                } else {
                  reject(new Error("No URLs in response"));
                }
              } catch {
                reject(new Error("Invalid response"));
              }
            } else {
              try {
                const data = JSON.parse(xhr.responseText);
                reject(new Error(data.message || "Upload failed"));
              } catch {
                reject(new Error("Upload failed"));
              }
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Network error"))
          );

          // Calls Next.js /api/upload which proxies to Express with auth token
          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        onUpload(result);
      } catch (err: any) {
        setUploadError(err.message || "Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [multiple, maxFiles, urls.length, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);
  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          className="block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}

      {/* Preview existing images */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-2">
          {urls.map((url) => (
            <div key={url} className="relative group">
              <div
                className="w-20 h-20 rounded-xl overflow-hidden border"
                style={{ borderColor: "var(--border)" }}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: dragOver
            ? "var(--brand)"
            : error || uploadError
            ? "#DC2626"
            : "var(--border)",
          backgroundColor: dragOver
            ? "rgba(166,138,117,0.05)"
            : "var(--bg-primary)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <Loader2
              size={24}
              className="mx-auto animate-spin"
              style={{ color: "var(--brand)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Uploading to Cloudinary... {progress}%
            </p>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "var(--brand)",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
              style={{ backgroundColor: "rgba(166,138,117,0.1)" }}
            >
              {urls.length > 0 ? (
                <ImageIcon size={20} style={{ color: "var(--brand)" }} />
              ) : (
                <Upload size={20} style={{ color: "var(--brand)" }} />
              )}
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {dragOver
                  ? "Drop files here"
                  : urls.length > 0
                  ? "Upload more"
                  : "Click or drag files to upload"}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {multiple
                  ? `Up to ${maxFiles} files · JPG, PNG, WebP`
                  : "JPG, PNG, WebP"}
              </p>
            </div>
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <p className="text-xs" style={{ color: "#DC2626" }}>
          {error || uploadError}
        </p>
      )}
      {helpText && !error && !uploadError && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {helpText}
        </p>
      )}
    </div>
  );
}