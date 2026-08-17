import { cookies } from "next/headers";
import { ArrowLeft, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import OrderActions from "./OrderActions";
import OrderPhotoThumb from "./OrderPhotoThumb";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getOrder(id: string, token: string) {
  const res = await fetch(`${API}/api/admin/orders/${id}`, {
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
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: "16px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 0",
        borderBottom: "1px solid var(--border-soft)",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text-primary)",
          textAlign: "right",
        }}
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

// ── Types ─────────────────────────────────────────────────────────────────

interface AssetFile {
  id: string;
  originalName: string;
  storagePath: string;
  previewPath: string | null;
  fileSize: number | null;
}

interface Customization {
  id: string;
  fieldLabel: string;
  fieldType: string;
  unitIndex?: number;
  textValue: string | null;
  numberValue: string | null;
  dateValue: string | null;
  booleanValue: boolean | null;
  asset: {
    id: string;
    status: string;
    files: AssetFile[];
  } | null;
}

interface OrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  customizations: Customization[];
}

// ── Main Page ─────────────────────────────────────────────────────────────

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
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Order not found
        </p>
      </div>
    );
  }

  const currentStageIndex = order.productionStage
    ? STAGE_STEPS.indexOf(order.productionStage)
    : -1;

  return (
    <>
      <style>{`
        .order-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .order-detail-grid {
            grid-template-columns: 1fr 320px;
            gap: 20px;
          }
        }
        .stage-bar {
          display: flex;
          align-items: flex-start;
          gap: 0;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .stage-bar::-webkit-scrollbar { height: 4px; }
        .stage-bar::-webkit-scrollbar-track { background: transparent; }
        .stage-bar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 999px;
        }
      `}</style>

      <div style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/dashboard/orders">
              <button
                aria-label="Back to orders"
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
            <div>
              <h1
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                }}
              >
                {order.orderNumber}
              </h1>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
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
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                marginBottom: "16px",
              }}
            >
              Production Progress
            </p>
            <div className="stage-bar">
              {STAGE_STEPS.map((stage, i) => {
                const isCompleted = i < currentStageIndex;
                const isCurrent = i === currentStageIndex;
                const isLast = i === STAGE_STEPS.length - 1;
                return (
                  <div
                    key={stage}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: isLast ? "0 0 auto" : 1,
                      minWidth: isLast ? "auto" : "60px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: isCompleted
                            ? "var(--success)"
                            : isCurrent
                            ? "var(--text-primary)"
                            : "var(--border)",
                          color:
                            isCompleted || isCurrent
                              ? "#fff"
                              : "var(--text-secondary)",
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle size={13} strokeWidth={2.5} />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent
                            ? "var(--text-primary)"
                            : isCompleted
                            ? "var(--success)"
                            : "var(--text-tertiary)",
                          whiteSpace: "nowrap",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {formatLabel(stage)}
                      </p>
                    </div>
                    {!isLast && (
                      <div
                        style={{
                          height: "1px",
                          flex: 1,
                          margin: "0 6px 20px",
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

        {/* Main grid */}
        <div className="order-detail-grid">
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Order Items */}
            <Section title={`Items · ${order.items?.length ?? 0}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {order.items?.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Item header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        backgroundColor: "var(--bg-primary)",
                        gap: "12px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            marginBottom: "2px",
                          }}
                        >
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            {item.variantName}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          letterSpacing: "-0.01em",
                          flexShrink: 0,
                        }}
                      >
                        ₹{Number(item.totalPrice).toFixed(2)}
                      </span>
                    </div>

                    {/* Customizations — grouped by unitIndex */}
                    {item.customizations?.length > 0 && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderTop: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Customizations
                        </p>

                        {(() => {
                          // Group by unitIndex
                          const byUnit = new Map<number, Customization[]>();
                          for (const c of item.customizations) {
                            const ui = c.unitIndex ?? 0;
                            if (!byUnit.has(ui)) byUnit.set(ui, []);
                            byUnit.get(ui)!.push(c);
                          }
                          const units = Array.from(byUnit.entries()).sort(
                            (a, b) => a[0] - b[0]
                          );
                          const totalUnits = units.length;

                          return units.map(([unitIndex, customizations]) => (
                            <div
                              key={unitIndex}
                              style={{
                                border: "1px solid var(--border-soft)",
                                borderRadius: "6px",
                                overflow: "hidden",
                              }}
                            >
                              {/* Unit header — only if multiple units */}
                              {totalUnits > 1 && (
                                <div
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "var(--bg-primary)",
                                    borderBottom: "1px solid var(--border-soft)",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "var(--brand)",
                                  }}
                                >
                                  Unit {unitIndex + 1} of {totalUnits}
                                </div>
                              )}

                              <div
                                style={{
                                  padding: "10px 12px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "10px",
                                }}
                              >
                                {customizations.map((c) => (
                                  <div key={c.id}>
                                    {/* Non-photo fields */}
                                    {c.fieldType !== "PHOTO_UPLOAD" && (
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          gap: "12px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            color: "var(--text-secondary)",
                                          }}
                                        >
                                          {c.fieldLabel}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            color: "var(--text-primary)",
                                            textAlign: "right",
                                          }}
                                        >
                                          {c.textValue ??
                                            c.numberValue?.toString() ??
                                            (c.dateValue
                                              ? new Date(c.dateValue).toLocaleDateString("en-IN")
                                              : null) ??
                                            (c.booleanValue !== null
                                              ? c.booleanValue
                                                ? "Yes"
                                                : "No"
                                              : "—")}
                                        </span>
                                      </div>
                                    )}

                                    {/* Photo upload fields */}
                                    {c.fieldType === "PHOTO_UPLOAD" && c.asset && (
                                      <div>
                                        {/* Row: label + status + download ZIP */}
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "10px",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "8px",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                color: "var(--text-secondary)",
                                              }}
                                            >
                                              {c.fieldLabel} ({c.asset.files.length} files)
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                letterSpacing: "0.06em",
                                                textTransform: "uppercase",
                                                padding: "3px 8px",
                                                borderRadius: "999px",
                                                backgroundColor:
                                                  c.asset.status === "UPLOADED"
                                                    ? "rgba(142,159,130,0.12)"
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

                                          {/* Download ZIP button */}
                                          {c.asset.files.length > 0 && (
                                            <a
                                              href={`/api/admin/orders/${order.id}/items/${item.id}/download?unitIndex=${unitIndex}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                padding: "5px 10px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                                color: "var(--text-primary)",
                                                border: "1px solid var(--border)",
                                                backgroundColor: "var(--bg-primary)",
                                                textDecoration: "none",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              <Download size={11} strokeWidth={2} />
                                              Download{" "}
                                              {c.asset.files.length > 1
                                                ? `All ${c.asset.files.length}`
                                                : "Photo"}{" "}
                                              (.zip)
                                            </a>
                                          )}
                                        </div>

                                        {/* Thumbnails */}
                                        {c.asset.files.length > 0 && (
                                          <div
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns:
                                                "repeat(auto-fill, minmax(72px, 1fr))",
                                              gap: "8px",
                                            }}
                                          >
                                            {c.asset.files
                                              .slice(0, 12)
                                              .map((file: AssetFile) => (
                                                <div key={file.id}>
                                                  <a
                                                    href={`${API}/${file.storagePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={file.originalName}
                                                    style={{
                                                      display: "block",
                                                      width: "72px",
                                                      height: "72px",
                                                      borderRadius: "6px",
                                                      overflow: "hidden",
                                                      border: "1px solid var(--border)",
                                                      position: "relative",
                                                    }}
                                                  >
                                                    <OrderPhotoThumb
                                                      storagePath={file.storagePath}
                                                      previewPath={file.previewPath}
                                                      originalName={file.originalName}
                                                    />
                                                    <span
                                                      style={{
                                                        position: "absolute",
                                                        bottom: "3px",
                                                        right: "3px",
                                                        width: "18px",
                                                        height: "18px",
                                                        borderRadius: "3px",
                                                        backgroundColor: "rgba(0,0,0,0.55)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                      }}
                                                    >
                                                      <Download
                                                        size={10}
                                                        strokeWidth={2}
                                                        style={{ color: "#fff" }}
                                                      />
                                                    </span>
                                                  </a>
                                                  <p
                                                    style={{
                                                      fontSize: "9px",
                                                      color: "var(--text-tertiary)",
                                                      marginTop: "3px",
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                      whiteSpace: "nowrap",
                                                      maxWidth: "72px",
                                                    }}
                                                  >
                                                    {file.originalName}
                                                  </p>
                                                </div>
                                              ))}

                                            {c.asset.files.length > 12 && (
                                              <div
                                                style={{
                                                  width: "72px",
                                                  height: "72px",
                                                  borderRadius: "6px",
                                                  border: "1px solid var(--border)",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  fontSize: "11px",
                                                  fontWeight: 500,
                                                  backgroundColor: "var(--bg-primary)",
                                                  color: "var(--text-secondary)",
                                                }}
                                              >
                                                +{c.asset.files.length - 12}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* Customer note */}
            {order.customerNote && (
              <Section title="Customer Note">
                <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                  {order.customerNote}
                </p>
              </Section>
            )}

            {/* Admin note */}
            {order.adminNote && (
              <Section title="Admin Note">
                <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                  {order.adminNote}
                </p>
              </Section>
            )}

            {/* Timeline */}
            <Section title="Timeline">
              {order.timeline?.length > 0 ? (
                <div>
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
                        <div key={event.id} style={{ display: "flex", gap: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "2px",
                                marginTop: "4px",
                                backgroundColor:
                                  i === 0 ? "var(--text-primary)" : "var(--border)",
                                flexShrink: 0,
                              }}
                            />
                            {i < arr.length - 1 && (
                              <div
                                style={{
                                  width: "1px",
                                  flex: 1,
                                  marginTop: "4px",
                                  backgroundColor: "var(--border)",
                                }}
                              />
                            )}
                          </div>
                          <div style={{ paddingBottom: "16px", minWidth: 0, flex: 1 }}>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                                marginBottom: "2px",
                              }}
                            >
                              {event.title}
                            </p>
                            {event.description && (
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-secondary)",
                                  marginBottom: "4px",
                                  lineHeight: 1.5,
                                }}
                              >
                                {event.description}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                                {new Date(event.createdAt).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 500,
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  backgroundColor: "var(--bg-primary)",
                                  color: "var(--text-secondary)",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {event.actorType}
                              </span>
                              {event.isVisibleToCustomer && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    padding: "2px 7px",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(142,159,130,0.12)",
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
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  No timeline events yet
                </p>
              )}
            </Section>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Section title="Customer">
              <Row label="Name" value={order.customer.name} />
              <Row label="Phone" value={order.customer.phone} />
              {order.customer.email && (
                <Row label="Email" value={order.customer.email} />
              )}
            </Section>

            <Section title="Shipping Address">
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <p style={{ fontWeight: 500, color: "var(--text-primary)" }}>
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
              <Row label="Subtotal" value={`₹${Number(order.subtotal).toFixed(2)}`} />
              {Number(order.discountAmount) > 0 && (
                <Row
                  label="Discount"
                  value={
                    <span style={{ color: "var(--success)" }}>
                      −₹{Number(order.discountAmount).toFixed(2)}
                    </span>
                  }
                />
              )}
              <Row label="Shipping" value={`₹${Number(order.shippingCharge).toFixed(2)}`} />
              <Row
                label="Total"
                value={
                  <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.01em" }}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>
                }
              />
              {order.couponCode && (
                <Row
                  label="Coupon"
                  value={
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
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
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>
                      {order.payment.gatewayPaymentId}
                    </span>
                  }
                />
              )}
              {order.payment?.paidAt && (
                <Row
                  label="Paid At"
                  value={new Date(order.payment.paidAt).toLocaleDateString("en-IN")}
                />
              )}
            </Section>

            {order.shipment && (
              <Section title="Shipment">
                <Row label="Partner" value={order.shipment.shippingPartner?.name ?? "—"} />
                <Row
                  label="Tracking"
                  value={
                    <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                      {order.shipment.trackingNumber}
                    </span>
                  }
                />
                <Row label="Status" value={formatLabel(order.shipment.status)} />
                {order.shipment.estimatedDelivery && (
                  <Row
                    label="Est. Delivery"
                    value={new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN")}
                  />
                )}
              </Section>
            )}

            <Section title="Actions">
              <OrderActions order={order} />
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}