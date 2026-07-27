"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface Order {
  id: string;
  status: string;
  payment: { status: string } | null;
}

const getToken = () => {
  const match = document.cookie
    .split("; ")
    .find((r) => r.startsWith("tcp_admin_token="));
  return match?.split("=")[1] || "";
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const call = async (path: string, method: string, body?: object) => {
    const res = await fetch(`${API}/api/admin/orders/${order.id}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  };

  const action = async (key: string, fn: () => Promise<unknown>) => {
    setLoading(key);
    try {
      await fn();
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Verify Payment */}
      {order.status === "AWAITING_PAYMENT" && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Payment Verification
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={loading === "approve"}
              onClick={() =>
                action("approve", () =>
                  call("/verify-payment", "POST", { approved: true })
                )
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={loading === "reject"}
              onClick={() =>
                action("reject", () =>
                  call("/verify-payment", "POST", { approved: false })
                )
              }
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Move to Production */}
      {order.status === "CONFIRMED" && (
        <Button
          size="sm"
          variant="secondary"
          loading={loading === "production"}
          onClick={() =>
            action("production", () =>
              call("/status", "PATCH", { status: "IN_PRODUCTION" })
            )
          }
        >
          Move to Production
        </Button>
      )}

      {/* Mark Delivered */}
      {order.status === "SHIPPED" && (
        <Button
          size="sm"
          loading={loading === "delivered"}
          onClick={() =>
            action("delivered", () =>
              call("/shipment/status", "PATCH", { status: "DELIVERED" })
            )
          }
        >
          Mark Delivered
        </Button>
      )}

      {/* Add Note */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Add Note
        </p>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note..."
          className="w-full px-3 py-2 rounded-xl text-sm resize-none outline-none"
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!note.trim()}
          loading={loading === "note"}
          onClick={() =>
            action("note", async () => {
              await call("/notes", "POST", {
                note,
                isVisibleToCustomer: false,
              });
              setNote("");
            })
          }
        >
          Add Note
        </Button>
      </div>

      {/* Cancel */}
      {["AWAITING_PAYMENT", "CONFIRMED"].includes(order.status) && (
        <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              className="text-xs"
              style={{ color: "#DC2626" }}
            >
              Cancel Order
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Cancellation reason..."
                className="w-full px-3 py-2 rounded-xl text-sm resize-none outline-none"
                style={{
                  border: "1px solid #DC2626",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  disabled={!cancelReason.trim()}
                  loading={loading === "cancel"}
                  onClick={() =>
                    action("cancel", () =>
                      call("/cancel", "PATCH", { reason: cancelReason })
                    )
                  }
                >
                  Confirm Cancel
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCancel(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}