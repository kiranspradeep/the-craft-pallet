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

async function getCategories(token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(
    `${API_URL}/api/admin/categories?limit=100&sortBy=sortOrder`,
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
    <div>
      <PageHeader
        title="Categories"
        description="Manage your product categories"
        action={<AddCategoryButton />}
      />

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {categories.length === 0 ? (
          <EmptyState
            icon={<Tag size={40} />}
            title="No categories yet"
            description="Create your first category to organise products"
            action={<AddCategoryButton />}
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
                <th className="text-left px-6 py-3">Category</th>
                <th className="text-left px-6 py-3">Slug</th>
                <th className="text-left px-6 py-3">Products</th>
                <th className="text-left px-6 py-3">Sort</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {categories.map((cat) => (
                <tr key={cat.id} className="group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: "rgba(166,138,117,0.1)" }}
                        >
                          <Tag size={16} style={{ color: "var(--brand)" }} />
                        </div>
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-mono px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cat._count.products}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cat.sortOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={cat.isActive ? "Active" : "Inactive"}
                      variant={cat.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CategoryActions id={cat.id} isActive={cat.isActive} />
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