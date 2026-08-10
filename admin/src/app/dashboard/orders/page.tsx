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

function paymentVariant(
  status: string
): "success" | "error" | "neutral" | "warning" {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "error";
    case "INITIATED":
      return "warning";
    default:
      return "neutral";
  }
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ");
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PER_PAGE = 20;

async function getOrders(
  token: string,
  params: Record<string, string>
) {
  const page = parseInt(params.page || "1");

  const query = new URLSearchParams({
    limit: PER_PAGE.toString(),
    page: page.toString(),
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(params.status ? { status: params.status } : {}),
    ...(params.search ? { search: params.search } : {}),
    ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
    ...(params.dateTo ? { dateTo: params.dateTo } : {}),
  }).toString();

  const res = await fetch(`${API}/api/admin/orders?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return { orders: [], total: 0, page: 1, totalPages: 0 };
  const data = await res.json();
  return {
    orders: data.data as Order[],
    total: data.meta?.total ?? 0,
    page: data.meta?.page ?? 1,
    totalPages: data.meta?.totalPages ?? 0,
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

  const { orders, total, totalPages } = await getOrders(
    token,
    resolvedParams
  );

  const currentPage = parseInt(resolvedParams.page || "1");

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(resolvedParams);
    params.set("page", pageNum.toString());
    return `/dashboard/orders?${params.toString()}`;
  };

  return (
    <>
      <style>{`
        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-col-items { display: table-cell; }
        .orders-col-payment { display: table-cell; }
        .orders-col-date { display: table-cell; }
        .orders-col-stage { display: block; }

        @media (max-width: 1024px) {
          .orders-col-items { display: none !important; }
          .orders-col-payment { display: none !important; }
          .orders-col-date { display: none !important; }
        }

        .orders-thead-row { display: table-row; }
        .orders-tbody-row { display: table-row; }
        .orders-td { display: table-cell; }

        @media (max-width: 640px) {
          .orders-thead-row { display: none; }
          .orders-tbody-row {
            display: flex;
            flex-direction: column;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            gap: 8px;
          }
          .orders-tbody-row:last-child { border-bottom: none; }
          .orders-td { display: block; padding: 0 !important; }
          .orders-col-items { display: none !important; }
          .orders-col-payment { display: none !important; }
          .orders-col-date { display: none !important; }
          .orders-col-stage { display: none !important; }
          .orders-mobile-actions { display: flex !important; }
          .orders-mobile-meta { display: flex !important; }
          .orders-tbody-row .orders-td:not(:first-child) {
            display: none !important;
          }
          .orders-tbody-row .orders-td:first-child {
            display: block !important;
          }
        }

        .orders-tr-hover:hover { background-color: var(--bg-primary); }

        .page-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 34px;
          padding: 0 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid var(--border);
          background-color: transparent;
          color: var(--text-secondary);
          transition: all 150ms ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .page-btn:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
        .page-btn-active {
          background-color: var(--text-primary);
          border-color: var(--text-primary);
          color: #fff !important;
        }
        .page-btn-disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>

      <div>
        <PageHeader
          title="Orders"
          description={`${total} total order${total !== 1 ? "s" : ""}`}
        />

        <OrderFilters />

        {/* Table */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
            marginTop: "16px",
          }}
        >
          {orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={32} strokeWidth={1.25} />}
              title="No orders found"
              description="Orders will appear here once customers start purchasing"
            />
          ) : (
            <table className="orders-table">
              <thead>
                <tr
                  className="orders-thead-row"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  {[
                    { label: "Order", cls: "" },
                    { label: "Customer", cls: "" },
                    { label: "Items", cls: "orders-col-items" },
                    { label: "Amount", cls: "" },
                    { label: "Payment", cls: "orders-col-payment" },
                    { label: "Status", cls: "" },
                    { label: "Date", cls: "orders-col-date" },
                    { label: "", cls: "" },
                  ].map(({ label, cls }, i) => (
                    <th
                      key={label + i}
                      className={cls}
                      style={{
                        padding: "10px 16px",
                        textAlign: i === 7 ? "right" : "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="orders-tbody-row orders-tr-hover"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {/* Order number */}
                    <td
                      className="orders-td"
                      style={{ padding: "12px 16px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--brand)",
                            fontFamily: "monospace",
                          }}
                        >
                          {order.orderNumber}
                        </span>

                        {/* Mobile: status + action */}
                        <div
                          className="orders-mobile-actions"
                          style={{
                            display: "none",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Badge
                            label={formatLabel(order.status)}
                            variant={statusVariant(order.status)}
                          />
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            style={{
                              fontSize: "12px",
                              fontWeight: 500,
                              padding: "4px 12px",
                              borderRadius: "6px",
                              color: "var(--brand)",
                              backgroundColor: "rgba(166,138,117,0.08)",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            View
                          </Link>
                        </div>
                      </div>

                      {/* Mobile: customer + amount */}
                      <div
                        className="orders-mobile-meta"
                        style={{
                          display: "none",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "6px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                            }}
                          >
                            {order.customer.name}
                          </p>
                          <p
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {order.customer.phone}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          ₹{Number(order.totalAmount).toFixed(0)}
                        </span>
                      </div>

                      {order.productionStage && (
                        <p
                          className="orders-col-stage"
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          {formatLabel(order.productionStage)}
                        </p>
                      )}
                    </td>

                    {/* Customer */}
                    <td
                      className="orders-td orders-col-items"
                      style={{ padding: "12px 16px" }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {order.customer.name}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          marginTop: "2px",
                        }}
                      >
                        {order.customer.phone}
                      </p>
                    </td>

                    {/* Items */}
                    <td
                      className="orders-td orders-col-items"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {order._count.items}
                      </span>
                    </td>

                    {/* Amount */}
                    <td
                      className="orders-td"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        ₹{Number(order.totalAmount).toFixed(0)}
                      </span>
                    </td>

                    {/* Payment */}
                    <td
                      className="orders-td orders-col-payment"
                      style={{ padding: "12px 16px" }}
                    >
                      <Badge
                        label={
                          order.payment?.status
                            ? formatLabel(order.payment.status)
                            : "—"
                        }
                        variant={paymentVariant(
                          order.payment?.status ?? ""
                        )}
                      />
                    </td>

                    {/* Status */}
                    <td
                      className="orders-td"
                      style={{ padding: "12px 16px" }}
                    >
                      <Badge
                        label={formatLabel(order.status)}
                        variant={statusVariant(order.status)}
                      />
                    </td>

                    {/* Date */}
                    <td
                      className="orders-td orders-col-date"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </td>

                    {/* Action */}
                    <td
                      className="orders-td"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                      }}
                    >
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          padding: "6px 14px",
                          borderRadius: "6px",
                          color: "var(--brand)",
                          backgroundColor: "rgba(166,138,117,0.08)",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          display: "inline-block",
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                letterSpacing: "0.02em",
              }}
            >
              Showing{" "}
              {Math.min((currentPage - 1) * PER_PAGE + 1, total)}–
              {Math.min(currentPage * PER_PAGE, total)} of {total}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* Prev */}
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="page-btn"
                >
                  Prev
                </Link>
              ) : (
                <span className="page-btn page-btn-disabled">Prev</span>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | "dots")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("dots");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "dots" ? (
                    <span
                      key={`dots-${i}`}
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                        padding: "0 4px",
                      }}
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={item}
                      href={buildPageUrl(item as number)}
                      className={`page-btn ${
                        currentPage === item ? "page-btn-active" : ""
                      }`}
                    >
                      {item}
                    </Link>
                  )
                )}

              {/* Next */}
              {currentPage < totalPages ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="page-btn"
                >
                  Next
                </Link>
              ) : (
                <span className="page-btn page-btn-disabled">Next</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}