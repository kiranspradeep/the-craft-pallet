"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";

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

const SOURCE_OPTIONS = [
  { value: "",          label: "All Sources" },
  { value: "WEBSITE",   label: "Website"     },
  { value: "WHATSAPP",  label: "WhatsApp"    },
];

const PHOTO_STATUS_OPTIONS = [
  { value: "",             label: "All Photo Statuses" },
  { value: "NOT_RECEIVED", label: "Not Received"       },
  { value: "RECEIVED",     label: "Received"           },
  { value: "VERIFIED",     label: "Verified"           },
  { value: "NOT_REQUIRED", label: "Not Required"       },
];

const STAGE_OPTIONS = [
  { value: "",         label: "All Stages" },
  { value: "QUEUED",   label: "Queued"     },
  { value: "DESIGN",   label: "Design"     },
  { value: "PRINTING", label: "Printing"   },
  { value: "CRAFTING", label: "Crafting"   },
  { value: "PACKING",  label: "Packing"    },
  { value: "READY",    label: "Ready"      },
];

export default function OrderFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state values with query parameters on render
  const [search, setSearch]                   = useState(searchParams.get("search") ?? "");
  const [status, setStatus]                   = useState(searchParams.get("status") ?? "");
  const [orderSource, setOrderSource]         = useState(searchParams.get("orderSource") ?? "");
  const [photoStatus, setPhotoStatus]         = useState(searchParams.get("photoStatus") ?? "");
  const [productionStage, setProductionStage] = useState(searchParams.get("productionStage") ?? "");
  const [dateFrom, setDateFrom]               = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo]                   = useState(searchParams.get("dateTo") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setStatus(searchParams.get("status") ?? "");
    setOrderSource(searchParams.get("orderSource") ?? "");
    setPhotoStatus(searchParams.get("photoStatus") ?? "");
    setProductionStage(searchParams.get("productionStage") ?? "");
    setDateFrom(searchParams.get("dateFrom") ?? "");
    setDateTo(searchParams.get("dateTo") ?? "");
  }, [searchParams]);

  function buildParams(overrides: Record<string, string | null> = {}) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(overrides).forEach(([k, v]) => {
      if (v) {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });

    params.delete("page"); // Reset to page 1 on search changes
    return params.toString();
  }

  const applyFilters = () => {
    const qs = buildParams({
      search: search.trim() || null,
      status: status || null,
      orderSource: orderSource || null,
      photoStatus: photoStatus || null,
      productionStage: productionStage || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    });
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setOrderSource("");
    setPhotoStatus("");
    setProductionStage("");
    setDateFrom("");
    setDateTo("");

    const params = new URLSearchParams();
    router.push(pathname);
  };

  const hasFilters =
    search ||
    status ||
    orderSource ||
    photoStatus ||
    productionStage ||
    dateFrom ||
    dateTo;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* ── Main Filter Bar ─────────────────────────────────────────── */}
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
        {/* Search Input */}
        <div
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "8px",
            padding:         "9px 14px",
            borderRadius:    "6px",
            border:          "1px solid var(--border)",
            backgroundColor: "var(--bg-primary)",
            flex:            "1 1 240px",
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
            placeholder="Search order number, name, phone..."
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
              type="button"
              onClick={() => {
                setSearch("");
                const qs = buildParams({ search: null });
                router.push(`${pathname}${qs ? `?${qs}` : ""}`);
              }}
              style={{
                color:      "var(--text-tertiary)",
                display:    "flex",
                alignItems: "center",
                flexShrink: 0,
                background: "none",
                border:     "none",
                cursor:     "pointer",
              }}
            >
              <X size={13} strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div style={{ position: "relative" }}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              const qs = buildParams({ status: e.target.value || null });
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
              minWidth:         "150px",
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

        {/* Advanced Accordion Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            gap:             "6px",
            padding:         "9px 14px",
            borderRadius:    "6px",
            fontSize:        "13px",
            fontWeight:      500,
            color:           showAdvanced ? "var(--brand)" : "var(--text-secondary)",
            border:          `1px solid ${showAdvanced ? "var(--brand)" : "var(--border)"}`,
            backgroundColor: "transparent",
            cursor:          "pointer",
            transition:      "all 150ms ease",
          }}
        >
          <SlidersHorizontal size={13} strokeWidth={2} />
          More Filters
        </button>

        {/* Action Buttons */}
        <button
          type="button"
          onClick={applyFilters}
          style={{
            padding:         "9px 18px",
            borderRadius:    "6px",
            fontSize:        "13px",
            fontWeight:      500,
            color:           "#fff",
            backgroundColor: "var(--text-primary)",
            border:          "none",
            cursor:          "pointer",
            transition:      "opacity 150ms ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Apply
        </button>

        {hasFilters && (
          <button
            type="button"
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
            }}
          >
            <X size={13} strokeWidth={1.75} />
            Clear
          </button>
        )}
      </div>

      {/* ── Advanced Expandable Panel ────────────────────────────────── */}
      {showAdvanced && (
        <div
          style={{
            display:         "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap:             "14px",
            padding:         "20px",
            borderRadius:    "8px",
            border:          "1px solid var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          {/* Order Source */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Source
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value)}
                style={{ width: "100%", padding: "9px 36px 9px 14px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "13px", outline: "none", appearance: "none" }}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Photo Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Photos
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={photoStatus}
                onChange={(e) => setPhotoStatus(e.target.value)}
                style={{ width: "100%", padding: "9px 36px 9px 14px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "13px", outline: "none", appearance: "none" }}
              >
                {PHOTO_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Production Stage */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Production Stage
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={productionStage}
                onChange={(e) => setProductionStage(e.target.value)}
                style={{ width: "100%", padding: "9px 36px 9px 14px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "13px", outline: "none", appearance: "none" }}
              >
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Date From */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Date To */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}