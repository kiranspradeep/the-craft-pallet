import { cookies } from "next/headers";
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {label}
          </p>
          <p
            className="text-3xl font-semibold mt-1"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + "18" }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

async function getDashboardStats(token: string) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const res = await fetch(`${API_URL}/api/admin/orders?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";
  const adminRaw = cookieStore.get("tcp_admin_user")?.value;
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const ordersData = await getDashboardStats(token);
  const totalOrders = ordersData?.meta?.total ?? 0;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: <ShoppingBag size={20} />,
      color: "#A68A75",
    },
    {
      label: "Awaiting Payment",
      value: "—",
      icon: <Clock size={20} />,
      color: "#C96C4A",
    },
    {
      label: "In Production",
      value: "—",
      icon: <Package size={20} />,
      color: "#8E9F82",
    },
    {
      label: "Ready to Ship",
      value: "—",
      icon: <Truck size={20} />,
      color: "#6B9FBF",
    },
    {
      label: "Delivered",
      value: "—",
      icon: <CheckCircle size={20} />,
      color: "#8E9F82",
    },
    {
      label: "Revenue",
      value: "—",
      icon: <TrendingUp size={20} />,
      color: "#A68A75",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome back{admin?.name ? `, ${admin.name}` : ""}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-2xl border"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Orders
          </h2>
          <a
            href="/dashboard/orders"
            className="text-sm font-medium"
            style={{ color: "var(--brand)" }}
          >
            View all
          </a>
        </div>

        {ordersData?.data && ordersData.data.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {ordersData.data.map(
              (order: {
                id: string;
                orderNumber: string;
                status: string;
                totalAmount: number;
                customer: { name: string; phone: string };
              }) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.orderNumber}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {order.customer.name} · {order.customer.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          order.status === "DELIVERED"
                            ? "rgba(142,159,130,0.15)"
                            : order.status === "AWAITING_PAYMENT"
                            ? "rgba(201,108,74,0.12)"
                            : "rgba(166,138,117,0.12)",
                        color:
                          order.status === "DELIVERED"
                            ? "var(--success)"
                            : order.status === "AWAITING_PAYMENT"
                            ? "var(--accent)"
                            : "var(--brand)",
                      }}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <ShoppingBag
              size={32}
              className="mx-auto mb-3"
              style={{ color: "var(--border)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No orders yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}