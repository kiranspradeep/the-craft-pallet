import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "tcp_session_id";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const getSessionId = (): string => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const cartHeaders = () => ({
  "Content-Type": "application/json",
  "X-Session-Id": getSessionId(),
});

// ── Cart API ───────────────────────────────────────────────────────────────

export const cartApi = {
  getCart: async () => {
    const sessionId = getSessionId();
    if (!sessionId) return { cart: null, totals: null };

    const res = await fetch(`/api/cart`, {
      headers: cartHeaders(),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response:", text.slice(0, 300));
      throw new Error("Server returned non-JSON response");
    }

    const data = await res.json();
    return data.data;
  },

  addItem: async (body: {
  productId: string;
  variantId?: string;
  quantity: number;
  selectedTierQuantity?: number;
  customizations?: unknown[];
  notes?: string;
}) => {
  const res = await fetch(`/api/cart/items`, {
    method: "POST",
    headers: cartHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add to cart");
  dispatchCartUpdate();
  return data.data;
},

  updateItem: async (
  itemId: string,
  body: { quantity?: number; notes?: string }
) => {
  const res = await fetch(`/api/cart/items/${itemId}`, {
    method: "PUT",
    headers: cartHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update cart");
  dispatchCartUpdate();
  return data.data;
},

  removeItem: async (itemId: string) => {
  const res = await fetch(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers: cartHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to remove item");
  dispatchCartUpdate();
  return data.data;
},

  applyCoupon: async (code: string) => {
  const res = await fetch(`/api/cart/apply-coupon`, {
    method: "POST",
    headers: cartHeaders(),
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Invalid coupon");
  dispatchCartUpdate();
  return data.data;
},

  // Links an uploaded asset to a specific PHOTO_UPLOAD customization field
  // on a cart item. Called after assetApi.uploadDirect/uploadZip/uploadDriveLink.
  linkAssetToUploadField: async (
    itemId: string,
    customizationId: string,
    assetId: string
  ) => {
    const res = await fetch(
      `/api/cart/items/${itemId}/upload-fields/${customizationId}/asset`,
      {
        method: "PATCH",
        headers: cartHeaders(),
        body: JSON.stringify({ assetId }),
      }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to link asset to upload field");
    return data.data;
  },
};

// ── Buy Now API ────────────────────────────────────────────────────────────

export const buyNowApi = {
  create: async (body: {
    productId: string;
    variantId?: string;
    quantity: number;
    selectedTierQuantity?: number;
    notes?: string;
    customizations?: unknown[];
    assetId?: string;
  }) => {
    const res = await fetch(`/api/checkout/buy-now`, {
      method: "POST",
      headers: cartHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to start checkout");
    return data.data;
  },

  get: async (id: string) => {
    const res = await fetch(`/api/checkout/buy-now/${id}`, {
      headers: cartHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Session not found");
    return data.data;
  },

  update: async (
    id: string,
    body: { assetId?: string; customizations?: unknown[] }
  ) => {
    const res = await fetch(`/api/checkout/buy-now/${id}`, {
      method: "PATCH",
      headers: cartHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update");
    return data.data;
  },
};

// ── Checkout API ───────────────────────────────────────────────────────────

export const checkoutApi = {
  placeWebsiteOrder: async (body: any) => {
    const res = await fetch(`/api/checkout`, {
      method: "POST",
      headers: cartHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to place order");
    return data.data;
  },

  placeDraftOrder: async (body: any) => {
    const res = await fetch(`/api/checkout/draft`, {
      method: "POST",
      headers: cartHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create draft");
    return data.data;
  },
};

// ── Asset API ──────────────────────────────────────────────────────────────

export const assetApi = {
  // Direct image upload — goes to local server storage
  // Used for customer order photos
  uploadDirect: async (files: File[], productId?: string) => {
    const formData = new FormData();
    if (productId) formData.append("productId", productId);
    files.forEach((f) => formData.append("files", f));

    const res = await fetch(`${API_URL}/api/assets/upload`, {
      method: "POST",
      headers: { "X-Session-Id": getSessionId() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data.data;
  },

  // ZIP upload — goes to local server storage
  uploadZip: async (file: File, productId?: string) => {
    const formData = new FormData();
    if (productId) formData.append("productId", productId);
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/assets/upload-zip`, {
      method: "POST",
      headers: { "X-Session-Id": getSessionId() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "ZIP upload failed");
    return data.data;
  },

  // Google Drive link — stored as external reference
  uploadDriveLink: async (driveUrl: string) => {
    const res = await fetch(`${API_URL}/api/assets/upload-drive-link`, {
      method: "POST",
      headers: cartHeaders(),
      body: JSON.stringify({ driveUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save link");
    return data.data;
  },
};

// ── Price Formatting ───────────────────────────────────────────────────────

export const formatPrice = (amount: number | string): string => {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const dispatchCartUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
};