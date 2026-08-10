"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/categories", label: "Categories", icon: Tag },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? "0" : "10px",
          padding: collapsed ? "18px 0" : "18px 20px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid var(--border)",
          minHeight: "69px",
          transition: "padding 250ms ease",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            backgroundColor: "var(--text-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          CP
        </div>
        {!collapsed && (
          <div
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Craft Pallet
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "var(--text-secondary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Admin
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "12px 6px" : "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          transition: "padding 250ms ease",
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px" : "9px 14px",
              }}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.75} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: collapsed ? "12px 6px" : "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          transition: "padding 250ms ease",
        }}
      >
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="sidebar-collapse-btn desktop-only"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px" : "9px 14px",
          }}
        >
          {collapsed ? (
            <ChevronsRight size={17} strokeWidth={1.75} />
          ) : (
            <>
              <ChevronsLeft size={17} strokeWidth={1.75} />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-logout"
          title={collapsed ? "Logout" : undefined}
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px" : "9px 14px",
          }}
        >
          <LogOut size={17} strokeWidth={1.75} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        /* ── Sidebar links ── */
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 150ms ease, color 150ms ease;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .sidebar-link:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        .sidebar-link-active {
          background-color: rgba(166, 138, 117, 0.1) !important;
          color: var(--brand) !important;
        }

        /* ── Collapse button ── */
        .sidebar-collapse-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
          white-space: nowrap;
        }
        .sidebar-collapse-btn:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        /* ── Logout ── */
        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
          white-space: nowrap;
        }
        .sidebar-logout:hover {
          background-color: #FEF2F2;
          color: #DC2626;
        }

        /* ── Desktop sidebar ── */
        .sidebar-desktop {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--surface);
          border-right: 1px solid var(--border);
          transition: width 250ms cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
          flex-shrink: 0;
        }

        /* ── Mobile trigger ── */
        .sidebar-mobile-trigger {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 60;
          width: 40px;
          height: 40px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background-color: var(--surface);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        /* ── Mobile backdrop ── */
        .sidebar-mobile-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 70;
          background-color: rgba(43, 43, 43, 0.4);
          animation: sidebarFadeIn 200ms ease;
        }

        /* ── Mobile drawer ── */
        .sidebar-mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 71;
          width: 260px;
          background-color: var(--surface);
          border-right: 1px solid var(--border);
          flex-direction: column;
          animation: sidebarSlideIn 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ── Mobile close ── */
        .sidebar-mobile-close {
          position: absolute;
          top: 18px;
          right: -48px;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .desktop-only {
          display: flex;
        }

        @keyframes sidebarFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes sidebarSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none !important;
          }
          .sidebar-mobile-trigger {
            display: flex !important;
          }
          .sidebar-mobile-backdrop.open {
            display: block !important;
          }
          .sidebar-mobile-drawer.open {
            display: flex !important;
          }
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Desktop sidebar ── */}
      <div
        className="sidebar-desktop"
        style={{
          width: collapsed ? "64px" : "232px",
        }}
      >
        {sidebarContent}
      </div>

      {/* ── Mobile trigger button ── */}
      <button
        className="sidebar-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>

      {/* ── Mobile backdrop ── */}
      <div
        className={`sidebar-mobile-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div className={`sidebar-mobile-drawer ${mobileOpen ? "open" : ""}`}>
        {/* Close button */}
        <button
          className="sidebar-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={16} strokeWidth={1.75} />
        </button>

        {sidebarContent}
      </div>
    </>
  );
}