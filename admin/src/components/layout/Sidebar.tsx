"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="w-60 flex flex-col h-full border-r"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: "var(--brand)" }}
        >
          CP
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Craft Pallet
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Admin
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={{
                backgroundColor: active ? "rgba(166,138,117,0.1)" : "transparent",
                color: active ? "var(--brand)" : "var(--text-secondary)",
              }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2 : 1.75}
                style={{ color: active ? "var(--brand)" : "var(--text-secondary)" }}
              />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight size={14} style={{ color: "var(--brand)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(201,108,74,0.08)";
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-secondary)";
          }}
        >
          <LogOut size={18} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}