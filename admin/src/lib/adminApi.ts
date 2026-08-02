/**
 * All admin API calls go through /api/proxy
 * which reads the httpOnly token from cookies
 * and forwards to the backend.
 */

export async function adminGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function adminPost<T = any>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function adminPut<T = any>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function adminPatch<T = any>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function adminDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}