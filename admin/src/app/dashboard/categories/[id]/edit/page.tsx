import { cookies } from "next/headers";
import EditCategoryForm from "./EditCategoryForm";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getCategory(id: string, token: string) {
  const res = await fetch(`${API}/api/admin/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value || "";
  const category = await getCategory(id, token);

  if (!category) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-secondary)" }}>Category not found</p>
      </div>
    );
  }

  return <EditCategoryForm category={category} />;
}