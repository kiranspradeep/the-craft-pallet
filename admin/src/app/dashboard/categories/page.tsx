import { cookies } from "next/headers";
import { Tag } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import CategoryActions from "./CategoryActions";
import AddCategoryButton from "./AddCategoryButton";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string | null;
  createdAt: string;
  _count: { products: number };
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getCategories(token: string) {
  const res = await fetch(
    `${API}/api/admin/categories?limit=100&sortBy=sortOrder`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data as Category[];
}

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";
  const categories = await getCategories(token);

  return (
    <>
      <style>{`
        .cat-table { width: 100%; border-collapse: collapse; }
        .cat-thead { display: table-header-group; }
        .cat-tbody-row { display: table-row; }
        .cat-td { display: table-cell; }
        .cat-slug-col { display: table-cell; }
        .cat-sort-col { display: table-cell; }
        .cat-mobile-meta { display: none; }
        .cat-mobile-only { display: none; }

        @media (max-width: 768px) {
          .cat-thead { display: none; }
          .cat-tbody-row {
            display: flex;
            flex-direction: column;
            padding: 16px;
            border-bottom: 1px solid var(--border);
            gap: 10px;
          }
          .cat-tbody-row:last-child { border-bottom: none; }
          .cat-td { display: block; padding: 0 !important; }
          .cat-slug-col { display: none !important; }
          .cat-sort-col { display: none !important; }
          .cat-mobile-meta { display: block !important; }
          .cat-mobile-only { display: flex !important; }
        }

        .cat-tr-hover:hover {
          background-color: var(--bg-primary);
        }
      `}</style>

      <div>
        <PageHeader
          title="Categories"
          description="Manage your product categories"
          action={<AddCategoryButton />}
        />

        {/* 
          Key fix: removed overflow:hidden from this wrapper.
          Instead, use clip-path for rounded corners which 
          doesn't clip positioned descendants (dropdowns).
        */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            position: "relative",
          }}
        >
          {categories.length === 0 ? (
            <EmptyState
              icon={<Tag size={32} strokeWidth={1.25} />}
              title="No categories yet"
              description="Create your first category to organise products"
              action={<AddCategoryButton />}
            />
          ) : (
            <table className="cat-table">
              <thead className="cat-thead">
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {["Category", "Slug", "Products", "Sort", "Status", ""].map(
                    (h, i) => (
                      <th
                        key={h + i}
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
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="cat-tbody-row cat-tr-hover"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {/* Name + image */}
                    <td className="cat-td" style={{ padding: "12px 16px" }}>
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
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
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
                                backgroundColor: "rgba(166,138,117,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Tag
                                size={15}
                                strokeWidth={1.75}
                                style={{ color: "var(--brand)" }}
                              />
                            </div>
                          )}
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cat.name}
                          </span>
                        </div>

                        {/* Mobile-only: badge + actions */}
                        <div
                          className="cat-mobile-only"
                          style={{
                            alignItems: "center",
                            gap: "10px",
                            flexShrink: 0,
                          }}
                        >
                          <Badge
                            label={cat.isActive ? "Active" : "Inactive"}
                            variant={cat.isActive ? "success" : "neutral"}
                          />
                          <CategoryActions
                            id={cat.id}
                            isActive={cat.isActive}
                          />
                        </div>
                      </div>

                      {/* Mobile-only: products count */}
                      <p
                        className="cat-mobile-meta"
                        style={{
                          fontSize: "11px",
                          color: "var(--text-tertiary)",
                          marginTop: "6px",
                          paddingLeft: "48px",
                        }}
                      >
                        {cat._count.products} product
                        {cat._count.products !== 1 ? "s" : ""}
                      </p>
                    </td>

                    {/* Slug */}
                    <td
                      className="cat-td cat-slug-col"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-secondary)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {cat.slug}
                      </span>
                    </td>

                    {/* Products */}
                    <td
                      className="cat-td cat-slug-col"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {cat._count.products}
                      </span>
                    </td>

                    {/* Sort */}
                    <td
                      className="cat-td cat-sort-col"
                      style={{ padding: "12px 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {cat.sortOrder}
                      </span>
                    </td>

                    {/* Status — desktop */}
                    <td
                      className="cat-td cat-slug-col"
                      style={{ padding: "12px 16px" }}
                    >
                      <Badge
                        label={cat.isActive ? "Active" : "Inactive"}
                        variant={cat.isActive ? "success" : "neutral"}
                      />
                    </td>

                    {/* Actions — desktop */}
                    <td
                      className="cat-td cat-slug-col"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        overflow: "visible",
                        position: "relative",
                      }}
                    >
                      <CategoryActions
                        id={cat.id}
                        isActive={cat.isActive}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}