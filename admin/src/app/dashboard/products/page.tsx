import { cookies } from "next/headers";
import Link from "next/link";
import { Package } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import AddProductButton from "./AddProductButton";
import ProductListFilters from "./ProductListFilters";

interface Product {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
  images: { url: string; type: string }[];
  _count: { variants: number };
  pricingConfig: { strategy: string } | null;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PER_PAGE = 10;

async function getProducts(
  token: string,
  params: Record<string, string>
) {
  const page = parseInt(params.page || "1");
  const query = new URLSearchParams({
    limit: PER_PAGE.toString(),
    page: page.toString(),
    sortBy: params.sortBy || "sortOrder",
    sortOrder: params.sortOrder || "asc",
    ...(params.search ? { search: params.search } : {}),
    ...(params.status === "active"
      ? { isActive: "true" }
      : params.status === "inactive"
      ? { isActive: "false" }
      : {}),
    ...(params.featured === "true" ? { isFeatured: "true" } : {}),
  }).toString();

  const res = await fetch(`${API}/api/admin/products?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return { products: [], total: 0, page: 1, totalPages: 0 };
  const data = await res.json();
  return {
    products: data.data as Product[],
    total: data.meta?.total ?? 0,
    page: data.meta?.page ?? 1,
    totalPages: data.meta?.totalPages ?? 0,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";

  const { products, total, page, totalPages } = await getProducts(
    token,
    resolved
  );

  const thumbnail = (p: Product) =>
    p.images.find((i) => i.type === "THUMBNAIL")?.url ||
    p.images[0]?.url ||
    null;

  const currentPage = parseInt(resolved.page || "1");

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(resolved);
    params.set("page", pageNum.toString());
    return `/dashboard/products?${params.toString()}`;
  };

  return (
    <>
      <style>{`
        .prod-table { width: 100%; border-collapse: collapse; }
        .prod-thead { display: table-header-group; }
        .prod-tbody-row { display: table-row; }
        .prod-td { display: table-cell; }
        .prod-col-cat { display: table-cell; }
        .prod-col-pricing { display: table-cell; }
        .prod-col-variants { display: table-cell; }

        @media (max-width: 900px) {
          .prod-col-variants { display: none !important; }
          .prod-col-pricing { display: none !important; }
        }

        @media (max-width: 640px) {
          .prod-thead { display: none; }
          .prod-col-cat { display: none !important; }
          .prod-tbody-row {
            display: flex;
            flex-direction: column;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            gap: 8px;
          }
          .prod-tbody-row:last-child { border-bottom: none; }
          .prod-td { display: block; padding: 0 !important; }
          .prod-mobile-actions { display: flex !important; }
          .prod-mobile-cat { display: block !important; }
          .prod-tbody-row .prod-td:not(:first-child) {
            display: none !important;
          }
          .prod-tbody-row .prod-td:first-child {
            display: block !important;
          }
        }

        .prod-tr-hover:hover { background-color: var(--bg-primary); }

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
        }
        .page-btn:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
        .page-btn-active {
          background-color: var(--text-primary);
          border-color: var(--text-primary);
          color: #fff;
        }
        .page-btn-active:hover {
          background-color: #1F1F1F;
          color: #fff;
        }
        .page-btn-disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>

      <div>
        <PageHeader
          title="Products"
          description={`${total} product${total !== 1 ? "s" : ""} total`}
          action={<AddProductButton />}
        />

        {/* Filters */}
        <ProductListFilters
          currentSearch={resolved.search || ""}
          currentSort={resolved.sortBy || "sortOrder"}
          currentSortOrder={resolved.sortOrder || "asc"}
          currentStatus={resolved.status || ""}
          currentFeatured={resolved.featured || ""}
        />

        {/* Table */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          {products.length === 0 ? (
            <EmptyState
              icon={<Package size={32} strokeWidth={1.25} />}
              title="No products found"
              description={
                resolved.search || resolved.status
                  ? "Try adjusting your filters"
                  : "Create your first product to start selling"
              }
              action={
                !(resolved.search || resolved.status) ? (
                  <AddProductButton />
                ) : undefined
              }
            />
          ) : (
            <table className="prod-table">
              <thead className="prod-thead">
                <tr
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  {[
                    { label: "Product", cls: "" },
                    { label: "Category", cls: "prod-col-cat" },
                    { label: "Pricing", cls: "prod-col-pricing" },
                    { label: "Variants", cls: "prod-col-variants" },
                    { label: "Status", cls: "" },
                    { label: "", cls: "" },
                  ].map(({ label, cls }, i) => (
                    <th
                      key={label + i}
                      className={cls}
                      style={{
                        padding: "10px 16px",
                        textAlign: i === 5 ? "right" : "left",
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
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="prod-tbody-row prod-tr-hover"
                    style={{
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {/* Product name + thumbnail */}
                    <td
                      className="prod-td"
                      style={{ padding: "12px 16px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            minWidth: 0,
                          }}
                        >
                          {thumbnail(product) ? (
                            <img
                              src={thumbnail(product)!}
                              alt={product.name}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "6px",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "6px",
                                backgroundColor:
                                  "rgba(166,138,117,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Package
                                size={15}
                                strokeWidth={1.75}
                                style={{ color: "var(--brand)" }}
                              />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.name}
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                fontFamily: "monospace",
                                color: "var(--text-secondary)",
                                marginTop: "1px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.slug}
                            </p>
                          </div>
                        </div>

                        {/* Mobile-only */}
                        <div
                          className="prod-mobile-actions"
                          style={{
                            display: "none",
                            alignItems: "center",
                            gap: "8px",
                            flexShrink: 0,
                          }}
                        >
                          <Badge
                            label={
                              product.isActive ? "Active" : "Inactive"
                            }
                            variant={
                              product.isActive ? "success" : "neutral"
                            }
                          />
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            style={{
                              fontSize: "12px",
                              fontWeight: 500,
                              padding: "4px 12px",
                              borderRadius: "6px",
                              color: "var(--brand)",
                              backgroundColor:
                                "rgba(166,138,117,0.08)",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Edit
                          </Link>
                        </div>
                      </div>

                      <p
                        className="prod-mobile-cat"
                        style={{
                          display: "none",
                          fontSize: "11px",
                          color: "var(--text-tertiary)",
                          marginTop: "6px",
                          paddingLeft: "48px",
                        }}
                      >
                        {product.category.name}
                        {product.pricingConfig?.strategy && (
                          <>
                            {" "}
                            ·{" "}
                            {product.pricingConfig.strategy.replace(
                              /_/g,
                              " "
                            )}
                          </>
                        )}
                      </p>
                    </td>

                    <td
                      className="prod-td prod-col-cat"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {product.category.name}
                      </span>
                    </td>

                    <td
                      className="prod-td prod-col-pricing"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(166,138,117,0.1)",
                          color: "var(--brand)",
                          letterSpacing: "0.02em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.pricingConfig?.strategy?.replace(
                          /_/g,
                          " "
                        ) ?? "Not set"}
                      </span>
                    </td>

                    <td
                      className="prod-td prod-col-variants"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {product._count.variants}
                      </span>
                    </td>

                    <td
                      className="prod-td"
                      style={{ padding: "12px 16px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge
                          label={
                            product.isActive ? "Active" : "Inactive"
                          }
                          variant={
                            product.isActive ? "success" : "neutral"
                          }
                        />
                        {product.isFeatured && (
                          <Badge label="Featured" variant="brand" />
                        )}
                      </div>
                    </td>

                    <td
                      className="prod-td"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                      }}
                    >
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
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
                        Edit
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
              {/* Previous */}
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
                  if (i > 0) {
                    const prev = arr[i - 1];
                    if (p - prev > 1) acc.push("dots");
                  }
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