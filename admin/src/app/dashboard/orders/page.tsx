import { cookies } from "next/headers";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import OrderFilters from "./OrderFilters";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  productionStage: string | null;
  totalAmount: string;
  createdAt: string;
  customer: { name: string; phone: string };
  payment: { status: string } | null;
  _count: { items: number };
}

function statusVariant(
  status: string
): "success" | "warning" | "error" | "neutral" | "brand" {
  switch (status) {
    case "DELIVERED": return "success";
    case "CONFIRMED": return "success";
    case "AWAITING_PAYMENT": return "warning";
    case "PAYMENT_FAILED": return "error";
    case "CANCELLED": return "error";
    case "IN_PRODUCTION": return "brand";
    case "SHIPPED": return "brand";
    default: return "neutral";
  }
}

function paymentVariant(
  status: string
): "success" | "error" | "neutral" | "warning" {
  switch (status) {
    case "SUCCESS": return "success";
    case "FAILED": return "error";
    case "INITIATED": return "warning";
    default: return "neutral";
  }
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ");
}

async function getOrders(token: string, params: Record<string, string>) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const query = new URLSearchParams({
    limit: "50",
    sortBy: "createdAt",
    sortOrder: "desc",
    ...params,
  }).toString();

  const res = await fetch(`${API_URL}/api/admin/orders?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { orders: [], total: 0 };
  const data = await res.json();
  return {
    orders: data.data as Order[],
    total: data.meta?.total ?? 0,
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";

  // Build filter params from URL search params
  const filterParams: Record<string, string> = {};
  if (resolvedParams["status"]) filterParams["status"] = resolvedParams["status"];
  if (resolvedParams["search"]) filterParams["search"] = resolvedParams["search"];
  if (resolvedParams["dateFrom"]) filterParams["dateFrom"] = resolvedParams["dateFrom"];
  if (resolvedParams["dateTo"]) filterParams["dateTo"] = resolvedParams["dateTo"];

  const { orders, total } = await getOrders(token, filterParams);

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${total} total orders`}
      />

      {/* Filters */}
      <OrderFilters />

      <div
        className="rounded-2xl border overflow-hidden mt-5"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={40} />}
            title="No orders found"
            description="Orders will appear here once customers start purchasing"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr
                className="border-b text-xs font-medium uppercase tracking-wide"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <th className="text-left px-6 py-3">Order</th>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Items</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Payment</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-right px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-opacity-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-medium font-mono"
                      style={{ color: "var(--brand)" }}
                    >
                      {order.orderNumber}
                    </span>
                    {order.productionStage && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatLabel(order.productionStage)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.customer.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {order.customer.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {order._count.items}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={
                        order.payment?.status
                          ? formatLabel(order.payment.status)
                          : "—"
                      }
                      variant={paymentVariant(order.payment?.status ?? "")}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={formatLabel(order.status)}
                      variant={statusVariant(order.status)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        color: "var(--brand)",
                        backgroundColor: "rgba(166,138,117,0.08)",
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}