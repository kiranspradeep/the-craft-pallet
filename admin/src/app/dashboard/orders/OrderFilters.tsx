"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "",                 label: "All Statuses"      },
  { value: "AWAITING_PAYMENT", label: "Awaiting Payment"  },
  { value: "PAYMENT_FAILED",   label: "Payment Failed"    },
  { value: "CONFIRMED",        label: "Confirmed"         },
  { value: "IN_PRODUCTION",    label: "In Production"     },
  { value: "SHIPPED",          label: "Shipped"           },
  { value: "DELIVERED",        label: "Delivered"         },
  { value: "CANCELLED",        label: "Cancelled"         },
];

export default function OrderFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Initialise from URL so filters survive refresh / back navigation
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  // Keep local state in sync if the URL changes externally
  // (e.g. browser back/forward)
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setStatus(searchParams.get("status") ?? "");
  }, [searchParams]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function buildParams(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams(searchParams.toString());

    // Apply overrides
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });

    // Always reset to page 1 when filters change
    params.delete("page");

    return params.toString();
  }

  const applyFilters = () => {
    const qs = buildParams({ search: search.trim(), status });
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    // Remove all filter + page params but keep any other params that may exist
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("status");
    params.delete("dateFrom");
    params.delete("dateTo");
    params.delete("page");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const hasFilters =
    search ||
    status ||
    searchParams.get("dateFrom") ||
    searchParams.get("dateTo");

  return (
    <div
      style={{
        display:         "flex",
        flexWrap:        "wrap",
        alignItems:      "center",
        gap:             "10px",
        padding:         "14px 16px",
        borderRadius:    "8px",
        border:          "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display:         "flex",
          alignItems:      "center",
          gap:             "8px",
          padding:         "9px 14px",
          borderRadius:    "6px",
          border:          "1px solid var(--border)",
          backgroundColor: "var(--bg-primary)",
          flex:            "1 1 200px",
          minWidth:        "180px",
          transition:      "border-color 200ms ease",
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
          type="text"
          placeholder="Search by order, name, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          style={{
            flex:       1,
            fontSize:   "13px",
            outline:    "none",
            background: "transparent",
            color:      "var(--text-primary)",
            border:     "none",
          }}
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              // Also clear it from the URL immediately
              const qs = buildParams({ search: "" });
              router.push(`${pathname}${qs ? `?${qs}` : ""}`);
            }}
            aria-label="Clear search"
            style={{
              color:      "var(--text-tertiary)",
              display:    "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <X size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* ── Status select ──────────────────────────────────────────────── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={status}
          onChange={(e) => {
            const val = e.target.value;
            setStatus(val);
            // Apply status filter immediately without needing Apply button
            const qs = buildParams({ search: search.trim(), status: val });
            router.push(`${pathname}${qs ? `?${qs}` : ""}`);
          }}
          style={{
            padding:          "9px 36px 9px 14px",
            borderRadius:     "6px",
            border:           "1px solid var(--border)",
            backgroundColor:  "var(--bg-primary)",
            color:            "var(--text-primary)",
            fontSize:         "13px",
            outline:          "none",
            appearance:       "none",
            WebkitAppearance: "none",
            cursor:           "pointer",
            transition:       "border-color 200ms ease",
          }}
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
            position:      "absolute",
            right:         "12px",
            top:           "50%",
            transform:     "translateY(-50%)",
            color:         "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Apply ──────────────────────────────────────────────────────── */}
      <button
        onClick={applyFilters}
        style={{
          padding:         "9px 18px",
          borderRadius:    "6px",
          fontSize:        "13px",
          fontWeight:      500,
          letterSpacing:   "0.02em",
          color:           "#fff",
          backgroundColor: "var(--text-primary)",
          border:          "none",
          cursor:          "pointer",
          transition:      "background-color 150ms ease",
          flexShrink:      0,
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

      {/* ── Clear ──────────────────────────────────────────────────────── */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "6px",
            padding:         "9px 14px",
            borderRadius:    "6px",
            fontSize:        "13px",
            fontWeight:      500,
            color:           "var(--text-secondary)",
            border:          "1px solid var(--border)",
            backgroundColor: "transparent",
            cursor:          "pointer",
            transition:      "all 150ms ease",
            flexShrink:      0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--text-primary)";
            el.style.color       = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--border)";
            el.style.color       = "var(--text-secondary)";
          }}
        >
          <X size={13} strokeWidth={1.75} />
          Clear
        </button>
      )}
    </div>
  );
}