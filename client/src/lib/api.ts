const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { cache: "no-store" });
}

// For list endpoints that also return meta (total, page, etc.)
export async function apiGetList<T>(
  path: string
): Promise<{ data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return {
    data: json.data ?? [],
    meta: json.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}