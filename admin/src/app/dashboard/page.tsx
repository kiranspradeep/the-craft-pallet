// dashboard/page.tsx

import { cookies } from "next/headers";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  ArrowRight,
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
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              letterSpacing: "0.02em",
              marginBottom: "8px",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {value}
          </p>
        </div>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "6px",
            backgroundColor: `${color}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    DELIVERED: {
      bg: "rgba(142,159,130,0.12)",
      color: "var(--success)",
    },
    CONFIRMED: {
      bg: "rgba(142,159,130,0.12)",
      color: "var(--success)",
    },
    AWAITING_PAYMENT: {
      bg: "rgba(201,108,74,0.1)",
      color: "var(--accent)",
    },
    IN_PRODUCTION: {
      bg: "rgba(107,159,191,0.1)",
      color: "#6B9FBF",
    },
    SHIPPED: {
      bg: "rgba(166,138,117,0.1)",
      color: "var(--brand)",
    },
    DRAFT: {
      bg: "var(--bg-primary)",
      color: "var(--text-secondary)",
    },
    CANCELLED: {
      bg: "#FEF2F2",
      color: "#DC2626",
    },
  };

  const style = config[status] || config.DRAFT;

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: "999px",
        backgroundColor: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
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
    return await res.json();
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
      icon: <ShoppingBag size={18} strokeWidth={1.75} />,
      color: "#A68A75",
    },
    {
      label: "Awaiting Payment",
      value: "—",
      icon: <Clock size={18} strokeWidth={1.75} />,
      color: "#C96C4A",
    },
    {
      label: "In Production",
      value: "—",
      icon: <Package size={18} strokeWidth={1.75} />,
      color: "#8E9F82",
    },
    {
      label: "Ready to Ship",
      value: "—",
      icon: <Truck size={18} strokeWidth={1.75} />,
      color: "#6B9FBF",
    },
    {
      label: "Delivered",
      value: "—",
      icon: <CheckCircle size={18} strokeWidth={1.75} />,
      color: "#8E9F82",
    },
    {
      label: "Revenue",
      value: "—",
      icon: <TrendingUp size={18} strokeWidth={1.75} />,
      color: "#A68A75",
    },
  ];

  return (
    <>
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .orders-table-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          gap: 12px;
          border-bottom: 1px solid var(--border);
          transition: background-color 100ms ease;
        }
        .orders-table-row:last-child {
          border-bottom: none;
        }
        .orders-table-row:hover {
          background-color: var(--bg-primary);
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              marginBottom: "4px",
            }}
          >
            Welcome back{admin?.name ? `, ${admin.name}` : ""}
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              letterSpacing: "0.02em",
            }}
          >
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Recent Orders */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "0.01em",
              }}
            >
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--brand)",
                letterSpacing: "0.02em",
                textDecoration: "none",
                transition: "gap 200ms ease",
              }}
            >
              View All
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>

          {/* Table header */}
          {ordersData?.data && ordersData.data.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
                gap: "12px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                }}
              >
                Order
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    width: "80px",
                    textAlign: "right",
                  }}
                >
                  Amount
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    width: "120px",
                    textAlign: "right",
                  }}
                >
                  Status
                </span>
              </div>
            </div>
          )}

          {/* Rows */}
          {ordersData?.data && ordersData.data.length > 0 ? (
            <div>
              {ordersData.data.map(
                (order: {
                  id: string;
                  orderNumber: string;
                  status: string;
                  totalAmount: number;
                  customer: { name: string; phone: string };
                }) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="orders-table-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          marginBottom: "2px",
                        }}
                      >
                        {order.orderNumber}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          letterSpacing: "0.02em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {order.customer.name} · {order.customer.phone}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          width: "80px",
                          textAlign: "right",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        ₹{Number(order.totalAmount).toFixed(0)}
                      </span>
                      <div
                        style={{
                          width: "120px",
                          textAlign: "right",
                        }}
                      >
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div
              style={{
                padding: "56px 20px",
                textAlign: "center",
              }}
            >
              <ShoppingBag
                size={28}
                strokeWidth={1.25}
                style={{
                  color: "var(--border)",
                  margin: "0 auto 12px",
                }}
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                No orders yet
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}