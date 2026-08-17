"use client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Props {
  storagePath: string;
  previewPath: string | null;
  originalName: string;
}

export default function OrderPhotoThumb({
  storagePath,
  previewPath,
  originalName,
}: Props) {
  const src = previewPath
    ? `${API}/${previewPath}`
    : `${API}/${storagePath}`;

  return (
    <img
      src={src}
      alt={originalName}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      onError={(e) => {
        const img = e.currentTarget;
        const fallback = `${API}/${storagePath}`;
        if (img.src !== fallback) {
          img.src = fallback;
        }
      }}
    />
  );
}