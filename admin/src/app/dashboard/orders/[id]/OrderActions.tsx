"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ExternalLink, CheckCircle, XCircle, Truck, Package } from "lucide-react";

interface Order {
  id: string;
  status: string;
  productionStage: string | null;
  payment: { status: string } | null;
}

const getToken = () => {
  const match = document.cookie
    .split("; ")
    .find((r) => r.startsWith("tcp_admin_token="));
  return match?.split("=")[1] || "";
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const PRODUCTION_STAGES = [
  { value: "QUEUED", label: "Queued" },
  { value: "DESIGN", label: "Design" },
  { value: "PRINTING", label: "Printing" },
  { value: "CRAFTING", label: "Crafting" },
  { value: "PACKING", label: "Packing" },
  { value: "READY", label: "Ready to Ship" },
];

const NEXT_STAGE: Record<string, string> = {
  QUEUED: "DESIGN",
  DESIGN: "PRINTING",
  PRINTING: "CRAFTING",
  CRAFTING: "PACKING",
  PACKING: "READY",
};

export default function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Note form
  const [note, setNote] = useState("");

  // Mark paid form
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [paidNote, setPaidNote] = useState("");

  // Cancel form
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Payment link result
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const call = async (path: string, method: string, body?: object) => {
    const res = await fetch(`${API}/api/admin/orders/${order.id}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const action = async (
    key: string,
    fn: () => Promise<unknown>,
    successMsg?: string
  ) => {
    setLoading(key);
    setError("");
    setSuccess("");
    try {
      await fn();
      if (successMsg) {
        setSuccess(successMsg);
        setTimeout(() => setSuccess(""), 3000);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const nextStage = order.productionStage
    ? NEXT_STAGE[order.productionStage]
    : null;

  const nextStageLabel = nextStage
    ? PRODUCTION_STAGES.find((s) => s.value === nextStage)?.label
    : null;

  return (
    <div className="space-y-4">
      {/* Error / Success */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: "rgba(142,159,130,0.15)",
            color: "var(--success)",
            border: "1px solid rgba(142,159,130,0.3)",
          }}
        >
          {success}
        </div>
      )}

      {/* ── Generate Payment Link ── */}
      {order.status === "AWAITING_PAYMENT" && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Payment
          </p>

          <Button
            size="sm"
            loading={loading === "paylink"}
            onClick={() =>
              action(
                "paylink",
                async () => {
                  const data = await call("/payment-link", "POST");
                  setPaymentLink(data.data.paymentLinkUrl);
                },
                "Payment link generated"
              )
            }
          >
            <ExternalLink size={14} />
            Generate Payment Link
          </Button>

          {paymentLink && (
            <div
              className="p-3 rounded-xl text-xs break-all"
              style={{
                backgroundColor: "rgba(166,138,117,0.08)",
                color: "var(--brand)",
              }}
            >
              <p className="font-medium mb-1">Payment Link:</p>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {paymentLink}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentLink);
                  setSuccess("Link copied to clipboard");
                  setTimeout(() => setSuccess(""), 2000);
                }}
                className="mt-2 block px-3 py-1 rounded-lg text-white text-xs"
                style={{ backgroundColor: "var(--brand)" }}
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Mark as Paid (Manual) ── */}
      {order.status === "AWAITING_PAYMENT" && (
        <div className="space-y-2">
          {!showMarkPaid ? (
            <button
              onClick={() => setShowMarkPaid(true)}
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--success)" }}
            >
              <CheckCircle size={14} />
              Mark as Paid (Manual)
            </button>
          ) : (
            <div
              className="p-3 rounded-xl space-y-3"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Manual Payment Verification
              </p>
              <input
                placeholder="Reference number (optional)"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text-primary)",
                }}
              />
              <textarea
                placeholder="Note (optional)"
                rows={2}
                value={paidNote}
                onChange={(e) => setPaidNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text-primary)",
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={loading === "markpaid"}
                  onClick={() =>
                    action(
                      "markpaid",
                      () =>
                        call("/mark-paid", "PATCH", {
                          referenceNumber: refNumber || undefined,
                          note: paidNote || undefined,
                        }),
                      "Order marked as paid"
                    )
                  }
                >
                  Confirm Payment
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowMarkPaid(false);
                    setRefNumber("");
                    setPaidNote("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Move to Production ── */}
      {order.status === "CONFIRMED" && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Production
          </p>
          <Button
            size="sm"
            variant="secondary"
            loading={loading === "production"}
            onClick={() =>
              action(
                "production",
                () =>
                  call("/status", "PATCH", { status: "IN_PRODUCTION" }),
                "Order moved to production"
              )
            }
          >
            <Package size={14} />
            Move to Production
          </Button>
        </div>
      )}

      {/* ── Advance Production Stage ── */}
      {order.status === "IN_PRODUCTION" && nextStage && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Production Stage
          </p>
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Current:{" "}
              <span style={{ color: "var(--brand)" }}>
                {PRODUCTION_STAGES.find(
                  (s) => s.value === order.productionStage
                )?.label ?? order.productionStage}
              </span>
            </p>
            <Button
              size="sm"
              loading={loading === "stage"}
              onClick={() =>
                action(
                  "stage",
                  () =>
                    call("/production-stage", "PATCH", {
                      productionStage: nextStage,
                    }),
                  `Stage advanced to ${nextStageLabel}`
                )
              }
            >
              Advance to {nextStageLabel}
            </Button>
          </div>
        </div>
      )}

      {/* ── Mark as Shipped ── */}
      {order.status === "IN_PRODUCTION" &&
        order.productionStage === "READY" && (
          <div className="space-y-2">
            <Button
              size="sm"
              loading={loading === "ship"}
              onClick={() =>
                action(
                  "ship",
                  () => call("/status", "PATCH", { status: "SHIPPED" }),
                  "Order marked as shipped"
                )
              }
            >
              <Truck size={14} />
              Mark as Shipped
            </Button>
          </div>
        )}

      {/* ── Mark as Delivered ── */}
      {order.status === "SHIPPED" && (
        <div className="space-y-2">
          <Button
            size="sm"
            loading={loading === "delivered"}
            onClick={() =>
              action(
                "delivered",
                () =>
                  call("/status", "PATCH", { status: "DELIVERED" }),
                "Order marked as delivered"
              )
            }
          >
            <CheckCircle size={14} />
            Mark as Delivered
          </Button>
        </div>
      )}

      {/* ── Add Admin Note ── */}
      <div
        className="space-y-2 pt-3 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--text-secondary)" }}
        >
          Admin Note
        </p>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note (not visible to customer)..."
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
            action(
              "note",
              async () => {
                await call("/note", "PATCH", { note });
                setNote("");
              },
              "Note added"
            )
          }
        >
          Add Note
        </Button>
      </div>

      {/* ── Cancel Order ── */}
      {["AWAITING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED"].includes(
        order.status
      ) && (
        <div
          className="pt-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "#DC2626" }}
            >
              <XCircle size={14} />
              Cancel Order
            </button>
          ) : (
            <div className="space-y-2">
              <p
                className="text-xs font-semibold"
                style={{ color: "#DC2626" }}
              >
                Cancel Order
              </p>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Cancellation reason (required)..."
                className="w-full px-3 py-2 rounded-xl text-sm resize-none outline-none"
                style={{
                  border: "1px solid #DC2626",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <div className="flex gap-2">
                <button
                  disabled={!cancelReason.trim() || loading === "cancel"}
                  onClick={() =>
                    action(
                      "cancel",
                      () =>
                        call("/status", "PATCH", {
                          status: "CANCELLED",
                          note: cancelReason,
                        }),
                      "Order cancelled"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  {loading === "cancel" ? "Cancelling..." : "Confirm Cancel"}
                </button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowCancel(false);
                    setCancelReason("");
                  }}
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