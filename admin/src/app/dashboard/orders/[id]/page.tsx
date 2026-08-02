import { cookies } from "next/headers";
import { ArrowLeft, Download } from "lucide-react";
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

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="flex justify-between items-center py-2 border-b last:border-0"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        className="text-sm font-medium text-right"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

function statusVariant(
  status: string
): "success" | "warning" | "error" | "neutral" | "brand" {
  switch (status) {
    case "DELIVERED":
    case "CONFIRMED":
      return "success";
    case "AWAITING_PAYMENT":
      return "warning";
    case "PAYMENT_FAILED":
    case "CANCELLED":
      return "error";
    case "IN_PRODUCTION":
    case "SHIPPED":
      return "brand";
    default:
      return "neutral";
  }
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ");
}

const STAGE_STEPS = [
  "QUEUED",
  "DESIGN",
  "PRINTING",
  "CRAFTING",
  "PACKING",
  "READY",
];

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

  const currentStageIndex = order.productionStage
    ? STAGE_STEPS.indexOf(order.productionStage)
    : -1;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders">
            <button
              className="p-2 rounded-xl transition-colors"
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
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <Badge
          label={formatLabel(order.status)}
          variant={statusVariant(order.status)}
        />
      </div>

      {/* Production Stage Progress */}
      {order.status === "IN_PRODUCTION" && order.productionStage && (
        <div
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Production Progress
          </p>
          <div className="flex items-center gap-0">
            {STAGE_STEPS.map((stage, i) => {
              const isCompleted = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;
              const isLast = i === STAGE_STEPS.length - 1;

              return (
                <div
                  key={stage}
                  className="flex items-center"
                  style={{ flex: isLast ? "0 0 auto" : 1 }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isCompleted
                          ? "var(--success)"
                          : isCurrent
                          ? "var(--brand)"
                          : "var(--border)",
                        color:
                          isCompleted || isCurrent
                            ? "#fff"
                            : "var(--text-secondary)",
                      }}
                    >
                      {isCompleted ? "✓" : i + 1}
                    </div>
                    <p
                      className="text-xs mt-1.5 text-center"
                      style={{
                        color: isCurrent
                          ? "var(--brand)"
                          : isCompleted
                          ? "var(--success)"
                          : "var(--text-secondary)",
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {formatLabel(stage)}
                    </p>
                  </div>
                  {!isLast && (
                    <div
                      className="h-0.5 flex-1 mx-1 mb-5"
                      style={{
                        backgroundColor: isCompleted
                          ? "var(--success)"
                          : "var(--border)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <Section title={`Order Items (${order.items?.length ?? 0})`}>
            <div className="space-y-3">
              {order.items?.map(
                (item: {
                  id: string;
                  productName: string;
                  variantName: string | null;
                  quantity: number;
                  unitPrice: string;
                  totalPrice: string;
                  pricingStrategy: string;
                  customizations: {
                    id: string;
                    fieldLabel: string;
                    fieldType: string;
                    textValue: string | null;
                    numberValue: string | null;
                    dateValue: string | null;
                    booleanValue: boolean | null;
                    asset: {
                      id: string;
                      status: string;
                      files: {
                        id: string;
                        originalName: string;
                        storagePath: string;
                        previewPath: string | null;
                        fileSize: number | null;
                      }[];
                    } | null;
                  }[];
                }) => (
                  <div
                    key={item.id}
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {/* Item header */}
                    <div
                      className="flex items-start justify-between p-4"
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

                    {/* Customizations */}
                    {item.customizations?.length > 0 && (
                      <div
                        className="px-4 py-3 border-t space-y-3"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Customizations
                        </p>
                        {item.customizations.map((c) => (
                          <div key={c.id}>
                            {/* Text / Number / Date / Boolean fields */}
                            {c.fieldType !== "PHOTO_UPLOAD" && (
                              <div className="flex justify-between">
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {c.fieldLabel}
                                </span>
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {c.textValue ??
                                    c.numberValue?.toString() ??
                                    (c.dateValue
                                      ? new Date(
                                          c.dateValue
                                        ).toLocaleDateString("en-IN")
                                      : null) ??
                                    (c.booleanValue !== null
                                      ? c.booleanValue
                                        ? "Yes"
                                        : "No"
                                      : "—")}
                                </span>
                              </div>
                            )}

                            {/* Photo uploads */}
                            {c.fieldType === "PHOTO_UPLOAD" && c.asset && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    {c.fieldLabel} (
                                    {c.asset.files.length} files)
                                  </span>
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        c.asset.status === "UPLOADED"
                                          ? "rgba(142,159,130,0.15)"
                                          : "rgba(166,138,117,0.1)",
                                      color:
                                        c.asset.status === "UPLOADED"
                                          ? "var(--success)"
                                          : "var(--brand)",
                                    }}
                                  >
                                    {c.asset.status}
                                  </span>
                                </div>

                                {/* Image thumbnails */}
                                {c.asset.files.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2">
                                    {c.asset.files
                                      .slice(0, 8)
                                      .map((file) => (
                                        <div
                                          key={file.id}
                                          className="relative group"
                                        >
                                          <div
                                            className="aspect-square rounded-lg overflow-hidden border"
                                            style={{
                                              borderColor: "var(--border)",
                                            }}
                                          >
                                            {file.previewPath ? (
                                              <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${file.previewPath}`}
                                                alt={file.originalName}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div
                                                className="w-full h-full flex items-center justify-center text-xs"
                                                style={{
                                                  backgroundColor:
                                                    "var(--bg-primary)",
                                                  color:
                                                    "var(--text-secondary)",
                                                }}
                                              >
                                                IMG
                                              </div>
                                            )}
                                          </div>
                                          <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/${file.storagePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                                            style={{
                                              backgroundColor:
                                                "rgba(0,0,0,0.5)",
                                            }}
                                          >
                                            <Download
                                              size={14}
                                              className="text-white"
                                            />
                                          </a>
                                        </div>
                                      ))}
                                    {c.asset.files.length > 8 && (
                                      <div
                                        className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium"
                                        style={{
                                          backgroundColor: "var(--bg-primary)",
                                          color: "var(--text-secondary)",
                                          border: "1px solid var(--border)",
                                        }}
                                      >
                                        +{c.asset.files.length - 8} more
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </Section>

          {/* Customer Note */}
          {order.customerNote && (
            <Section title="Customer Note">
              <p
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {order.customerNote}
              </p>
            </Section>
          )}

          {/* Admin Note */}
          {order.adminNote && (
            <Section title="Admin Note">
              <p
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {order.adminNote}
              </p>
            </Section>
          )}

          {/* Timeline */}
          <Section title="Order Timeline">
            {order.timeline?.length > 0 ? (
              <div className="space-y-1">
                {[...order.timeline]
                  .reverse()
                  .map(
                    (
                      event: {
                        id: string;
                        title: string;
                        description: string | null;
                        createdAt: string;
                        actorType: string;
                        isVisibleToCustomer: boolean;
                      },
                      i: number,
                      arr: unknown[]
                    ) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{
                              backgroundColor:
                                i === 0
                                  ? "var(--brand)"
                                  : "var(--border)",
                            }}
                          />
                          {i < arr.length - 1 && (
                            <div
                              className="w-px flex-1 mt-1"
                              style={{
                                backgroundColor: "var(--border)",
                              }}
                            />
                          )}
                        </div>
                        <div className="pb-4">
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
                          <div className="flex items-center gap-2 mt-1">
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {new Date(event.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: "var(--bg-primary)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {event.actorType}
                            </span>
                            {event.isVisibleToCustomer && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor:
                                    "rgba(142,159,130,0.12)",
                                  color: "var(--success)",
                                }}
                              >
                                Customer visible
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No timeline events yet
              </p>
            )}
          </Section>
        </div>

        {/* ── Right column ── */}
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
            <div
              className="text-sm space-y-1"
              style={{ color: "var(--text-secondary)" }}
            >
              <p
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {order.shipName}
              </p>
              <p>{order.shipPhone}</p>
              <p>{order.shipLine1}</p>
              {order.shipLine2 && <p>{order.shipLine2}</p>}
              <p>
                {order.shipCity}, {order.shipState} — {order.shipPincode}
              </p>
              <p>{order.shipCountry}</p>
            </div>
          </Section>

          {/* Payment Summary */}
          <Section title="Payment">
            <Row
              label="Status"
              value={
                <Badge
                  label={formatLabel(order.payment?.status ?? "—")}
                  variant={
                    order.payment?.status === "SUCCESS"
                      ? "success"
                      : order.payment?.status === "FAILED"
                      ? "error"
                      : order.payment?.status === "INITIATED"
                      ? "warning"
                      : "neutral"
                  }
                />
              }
            />
            <Row
              label="Subtotal"
              value={`₹${Number(order.subtotal).toFixed(2)}`}
            />
            {Number(order.discountAmount) > 0 && (
              <Row
                label="Discount"
                value={
                  <span style={{ color: "var(--success)" }}>
                    -₹{Number(order.discountAmount).toFixed(2)}
                  </span>
                }
              />
            )}
            <Row
              label="Shipping"
              value={`₹${Number(order.shippingCharge).toFixed(2)}`}
            />
            <Row
              label="Total"
              value={
                <span className="font-bold">
                  ₹{Number(order.totalAmount).toFixed(2)}
                </span>
              }
            />
            {order.couponCode && (
              <Row
                label="Coupon"
                value={
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: "rgba(166,138,117,0.1)",
                      color: "var(--brand)",
                    }}
                  >
                    {order.couponCode}
                  </span>
                }
              />
            )}
            {order.payment?.gatewayPaymentId && (
              <Row
                label="Payment ID"
                value={
                  <span className="font-mono text-xs">
                    {order.payment.gatewayPaymentId}
                  </span>
                }
              />
            )}
            {order.payment?.paidAt && (
              <Row
                label="Paid At"
                value={new Date(order.payment.paidAt).toLocaleDateString(
                  "en-IN"
                )}
              />
            )}
          </Section>

          {/* Shipment Info */}
          {order.shipment && (
            <Section title="Shipment">
              <Row
                label="Partner"
                value={order.shipment.shippingPartner?.name ?? "—"}
              />
              <Row
                label="Tracking"
                value={
                  <span className="font-mono text-xs">
                    {order.shipment.trackingNumber}
                  </span>
                }
              />
              <Row
                label="Status"
                value={formatLabel(order.shipment.status)}
              />
              {order.shipment.estimatedDelivery && (
                <Row
                  label="Est. Delivery"
                  value={new Date(
                    order.shipment.estimatedDelivery
                  ).toLocaleDateString("en-IN")}
                />
              )}
            </Section>
          )}

          {/* Actions */}
          <Section title="Actions">
            <OrderActions order={order} />
          </Section>
        </div>
      </div>
    </div>
  );
}