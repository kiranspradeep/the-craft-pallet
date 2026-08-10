"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, ChevronDown, ArrowUpDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const SORT_OPTIONS = [
  { value: "sortOrder:asc", label: "Sort Order" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc", label: "Oldest First" },
];

interface Props {
  currentSearch: string;
  currentSort: string;
  currentSortOrder: string;
  currentStatus: string;
  currentFeatured: string;
}

export default function ProductListFilters({
  currentSearch,
  currentSort,
  currentSortOrder,
  currentStatus,
  currentFeatured,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);

  const currentSortValue = `${currentSort}:${currentSortOrder}`;

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();

    const s = overrides.search ?? search;
    const status = overrides.status ?? currentStatus;
    const featured = overrides.featured ?? currentFeatured;
    const sort = overrides.sort ?? currentSortValue;

    if (s.trim()) params.set("search", s.trim());
    if (status) params.set("status", status);
    if (featured) params.set("featured", featured);

    const [sortBy, sortOrder] = sort.split(":");
    if (sortBy && sortBy !== "sortOrder") params.set("sortBy", sortBy);
    if (sortOrder && sortOrder !== "asc") params.set("sortOrder", sortOrder);

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasFilters = currentSearch || currentStatus || currentFeatured;

  const selectStyle = {
    padding: "9px 36px 9px 14px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    cursor: "pointer",
    transition: "border-color 200ms ease",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px",
        padding: "14px 16px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 14px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-primary)",
          flex: "1 1 180px",
          minWidth: "160px",
          transition: "border-color 200ms ease",
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
        }}
        onBlurCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
      >
        <Search
          size={14}
          strokeWidth={1.75}
          style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
        />
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters({ search });
          }}
          style={{
            flex: 1,
            fontSize: "13px",
            outline: "none",
            background: "transparent",
            color: "var(--text-primary)",
            border: "none",
          }}
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              applyFilters({ search: "" });
            }}
            aria-label="Clear search"
            style={{
              color: "var(--text-tertiary)",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Status */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={currentStatus}
          onChange={(e) => applyFilters({ status: e.target.value })}
          style={selectStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--brand)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          strokeWidth={1.75}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Sort */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={currentSortValue}
          onChange={(e) => applyFilters({ sort: e.target.value })}
          style={{ ...selectStyle, paddingLeft: "34px" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--brand)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown
          size={13}
          strokeWidth={1.75}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
        <ChevronDown
          size={13}
          strokeWidth={1.75}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Featured toggle */}
      <button
        onClick={() =>
          applyFilters({
            featured: currentFeatured === "true" ? "" : "true",
          })
        }
        style={{
          padding: "9px 16px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          border:
            currentFeatured === "true"
              ? "1px solid var(--text-primary)"
              : "1px solid var(--border)",
          backgroundColor:
            currentFeatured === "true" ? "var(--text-primary)" : "transparent",
          color: currentFeatured === "true" ? "#fff" : "var(--text-secondary)",
          cursor: "pointer",
          transition: "all 150ms ease",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Featured
      </button>

      {/* Apply */}
      <button
        onClick={() => applyFilters()}
        style={{
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
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#1F1F1F";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--text-primary)";
        }}
      >
        Apply
      </button>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            backgroundColor: "transparent",
            cursor: "pointer",
            transition: "all 150ms ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--text-primary)";
            el.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--border)";
            el.style.color = "var(--text-secondary)";
          }}
        >
          <X size={13} strokeWidth={1.75} />
          Clear
        </button>
      )}
    </div>
  );
}