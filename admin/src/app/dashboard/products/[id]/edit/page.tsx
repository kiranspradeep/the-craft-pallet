//admin\src\app\dashboard\products\[id]\edit\page.tsx
import { cookies } from "next/headers";
import ProductEditTabs from "./ProductEditTabs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getProduct(id: string, token: string) {
  const [productRes, categoriesRes] = await Promise.all([
    fetch(`${API}/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${API}/api/admin/categories?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);

  if (!productRes.ok) return null;
  const productData = await productRes.json();
  const categoriesData = await categoriesRes.json();

  return {
    product: productData.data,
    categories: categoriesData.data || [],
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";
  const result = await getProduct(id, token);

  if (!result) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-secondary)" }}>Product not found</p>
      </div>
    );
  }

  return (
    <ProductEditTabs
      product={result.product}
      categories={result.categories}
    />
  );
}