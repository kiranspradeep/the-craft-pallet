import { cookies } from "next/headers";
import Link from "next/link";
import { Package } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import AddProductButton from "./AddProductButton";

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

async function getProducts(token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(
    `${API_URL}/api/admin/products?limit=100&sortBy=sortOrder`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data as Product[];
}

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";
  const products = await getProducts(token);

  const thumbnail = (p: Product) =>
    p.images.find((i) => i.type === "THUMBNAIL")?.url ||
    p.images[0]?.url ||
    null;

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalogue"
        action={<AddProductButton />}
      />

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {products.length === 0 ? (
          <EmptyState
            icon={<Package size={40} />}
            title="No products yet"
            description="Create your first product to start selling"
            action={<AddProductButton />}
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
                <th className="text-left px-6 py-3">Product</th>
                <th className="text-left px-6 py-3">Category</th>
                <th className="text-left px-6 py-3">Pricing</th>
                <th className="text-left px-6 py-3">Variants</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {thumbnail(product) ? (
                        <img
                          src={thumbnail(product)!}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: "rgba(166,138,117,0.1)" }}
                        >
                          <Package size={16} style={{ color: "var(--brand)" }} />
                        </div>
                      )}
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {product.name}
                        </p>
                        <p
                          className="text-xs font-mono"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {product.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: "rgba(166,138,117,0.1)",
                        color: "var(--brand)",
                      }}
                    >
                      {product.pricingConfig?.strategy?.replace(/_/g, " ") ??
                        "Not set"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {product._count.variants}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        label={product.isActive ? "Active" : "Inactive"}
                        variant={product.isActive ? "success" : "neutral"}
                      />
                      {product.isFeatured && (
                        <Badge label="Featured" variant="brand" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="text-sm font-medium"
                      style={{ color: "var(--brand)" }}
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
    </div>
  );
}