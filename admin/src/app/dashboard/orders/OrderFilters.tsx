"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
  { value: "PAYMENT_FAILED", label: "Payment Failed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    router.push(pathname);
  };

  const hasFilters = search || status;

  return (
    <div
      className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border mb-0"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <Search size={14} style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          placeholder="Search by order number, name, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 rounded-xl text-sm outline-none"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Apply */}
      <button
        onClick={applyFilters}
        className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Apply
      </button>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}