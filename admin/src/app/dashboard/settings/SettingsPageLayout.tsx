// Create this file: settings/SettingsPageLayout.tsx

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export function SettingsPageLayout({
  title,
  children,
  error,
  success,
}: {
  title: string;
  children: ReactNode;
  error?: string;
  success?: boolean;
}) {
  return (
    <div style={{ maxWidth: "600px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <Link href="/dashboard/settings">
          <button
            aria-label="Back to settings"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
          </button>
        </Link>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px 14px",
              borderRadius: "6px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={14} strokeWidth={1.75} />
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px 14px",
              borderRadius: "6px",
              backgroundColor: "rgba(142,159,130,0.12)",
              border: "1px solid rgba(142,159,130,0.3)",
              color: "var(--success)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={14} strokeWidth={1.75} />
            Settings saved
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export function SettingsSection({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        paddingTop: label ? "20px" : "0",
        borderTop: label ? "1px solid var(--border)" : "none",
      }}
    >
      {label && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            display: "block",
            marginBottom: "16px",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {children}
      </div>
    </div>
  );
}

export function SaveButton({
  loading,
  label = "Save Settings",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <div
      style={{
        paddingTop: "16px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <button
        type="submit"
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "9px 20px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          color: "#fff",
          backgroundColor: loading
            ? "var(--text-secondary)"
            : "var(--text-primary)",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 150ms ease",
        }}
      >
        {loading ? "Saving..." : label}
      </button>
    </div>
  );
}