"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function AddProductButton() {
  return (
    <Link href="/dashboard/products/new">
      <button
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "9px 18px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          color: "#fff",
          backgroundColor: "var(--text-primary)",
          border: "none",
          cursor: "pointer",
          transition: "background-color 150ms ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#1F1F1F";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--text-primary)";
        }}
      >
        <Plus size={15} strokeWidth={2} />
        Add Product
      </button>
    </Link>
  );
}