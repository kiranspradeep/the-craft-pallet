import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import OrderActions from "./OrderActions";

async function getOrder(id: string, token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0"
      style={{ borderColor: "var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";
  const order = await getOrder(id, token);

  if (!order) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-secondary)" }}>Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders">
            <button
              className="p-2 rounded-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1
              className="text-xl font-semibold font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {order.orderNumber}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <Badge
          label={order.status.replace(/_/g, " ")}
          variant={
            order.status === "DELIVERED"
              ? "success"
              : order.status === "CANCELLED"
              ? "error"
              : order.status === "AWAITING_PAYMENT"
              ? "warning"
              : "neutral"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <Section title="Order Items">
            <div className="space-y-3">
              {order.items.map(
                (item: {
                  id: string;
                  productName: string;
                  variantName: string | null;
                  quantity: number;
                  unitPrice: string;
                  totalPrice: string;
                }) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-xl"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.variantName}
                        </p>
                      )}
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Qty: {item.quantity} × ₹
                        {Number(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ₹{Number(item.totalPrice).toFixed(2)}
                    </span>
                  </div>
                )
              )}
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Order Timeline">
            {order.timeline && order.timeline.length > 0 ? (
              <div className="space-y-3">
                {order.timeline.map(
                  (
                    event: {
                      id: string;
                      title: string;
                      description: string | null;
                      createdAt: string;
                      isVisibleToCustomer: boolean;
                    },
                    i: number
                  ) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: "var(--brand)" }}
                        />
                        {i < order.timeline.length - 1 && (
                          <div
                            className="w-px flex-1 mt-1"
                            style={{ backgroundColor: "var(--border)" }}
                          />
                        )}
                      </div>
                      <div className="pb-3">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {event.title}
                        </p>
                        {event.description && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {event.description}
                          </p>
                        )}
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {new Date(event.createdAt).toLocaleString("en-IN")}
                          {event.isVisibleToCustomer && (
                            <span
                              className="ml-2 px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: "rgba(142,159,130,0.12)",
                                color: "var(--success)",
                              }}
                            >
                              Visible to customer
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No timeline events yet
              </p>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <Section title="Customer">
            <Row label="Name" value={order.customer.name} />
            <Row label="Phone" value={order.customer.phone} />
            {order.customer.email && (
              <Row label="Email" value={order.customer.email} />
            )}
          </Section>

          {/* Shipping Address */}
          <Section title="Shipping Address">
            <div className="text-sm space-y-1" style={{ color: "var(--text-primary)" }}>
              <p className="font-medium">{order.shipName}</p>
              <p style={{ color: "var(--text-secondary)" }}>{order.shipPhone}</p>
              <p style={{ color: "var(--text-secondary)" }}>{order.shipLine1}</p>
              {order.shipLine2 && (
                <p style={{ color: "var(--text-secondary)" }}>{order.shipLine2}</p>
              )}
              <p style={{ color: "var(--text-secondary)" }}>
                {order.shipCity}, {order.shipState} — {order.shipPincode}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>{order.shipCountry}</p>
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <Row
              label="Status"
              value={
                <Badge
                  label={order.payment?.status ?? "—"}
                  variant={
                    order.payment?.status === "SUCCESS"
                      ? "success"
                      : order.payment?.status === "FAILED"
                      ? "error"
                      : "neutral"
                  }
                />
              }
            />
            <Row
              label="Amount"
              value={`₹${Number(order.totalAmount).toFixed(2)}`}
            />
            <Row
              label="Subtotal"
              value={`₹${Number(order.subtotal).toFixed(2)}`}
            />
            <Row
              label="Discount"
              value={`-₹${Number(order.discountAmount).toFixed(2)}`}
            />
            <Row
              label="Shipping"
              value={`₹${Number(order.shippingCharge).toFixed(2)}`}
            />
            {order.couponCode && (
              <Row label="Coupon" value={order.couponCode} />
            )}
          </Section>

          {/* Actions */}
          <Section title="Actions">
            <OrderActions order={order} />
          </Section>
        </div>
      </div>
    </div>
  );
}