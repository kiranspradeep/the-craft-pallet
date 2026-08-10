"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

export default function TopBar() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tcp_admin_user="))
      ?.split("=")[1];

    if (raw) {
      try {
        setAdmin(JSON.parse(decodeURIComponent(raw)));
      } catch {}
    }
  }, []);

  return (
    <>
      <style>{`
        .topbar-bell:hover {
          background-color: var(--bg-primary);
        }

        @media (max-width: 768px) {
          .topbar {
            padding-left: 64px !important;
          }
        }
      `}</style>

      <header
        className="topbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "69px",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div />

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Bell */}
          <button
            aria-label="Notifications"
            className="topbar-bell"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              border: "none",
              background: "none",
              cursor: "pointer",
              transition: "background-color 150ms ease",
            }}
          >
            <Bell size={17} strokeWidth={1.75} />
          </button>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "24px",
              backgroundColor: "var(--border)",
            }}
          />

          {/* Admin */}
          {admin && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div className="hidden sm:block" style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {admin.name}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {admin.role}
                </p>
              </div>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "6px",
                  backgroundColor: "var(--text-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {admin.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}