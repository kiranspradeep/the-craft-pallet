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
    <header
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div />

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--bg-primary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              "transparent")
          }
        >
          <Bell size={18} strokeWidth={1.75} />
        </button>

        {/* Admin info */}
        {admin && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {admin.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {admin.role}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: "var(--brand)" }}
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}