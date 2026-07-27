"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function AddProductButton() {
  return (
    <Link href="/dashboard/products/new">
      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium text-white transition-all duration-200"
        style={{ backgroundColor: "var(--accent)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--accent-hover)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--accent)")
        }
      >
        <Plus size={16} />
        Add Product
      </button>
    </Link>
  );
}