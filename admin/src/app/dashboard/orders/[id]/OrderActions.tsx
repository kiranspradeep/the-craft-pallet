"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Copy,
  Loader2,
  AlertCircle,
  CreditCard,
  Camera,
} from "lucide-react";

interface Order {
  id: string;
  status: string;
  photoStatus: string;
  productionStage: string | null;
  payment: { status: string } | null;
}

const PRODUCTION_STAGES = [
  { value: "QUEUED",    label: "Queued"        },
  { value: "DESIGN",   label: "Design"         },
  { value: "PRINTING", label: "Printing"       },
  { value: "CRAFTING", label: "Crafting"       },
  { value: "PACKING",  label: "Packing"        },
  { value: "READY",    label: "Ready to Ship"  },
];

const NEXT_STAGE: Record<string, string> = {
  QUEUED:   "DESIGN",
  DESIGN:   "PRINTING",
  PRINTING: "CRAFTING",
  CRAFTING: "PACKING",
  PACKING:  "READY",
};

export default function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [loading,           setLoading]           = useState<string | null>(null);
  const [error,             setError]             = useState("");
  const [success,           setSuccess]           = useState("");
  const [note,              setNote]              = useState("");
  const [showMarkPaid,      setShowMarkPaid]      = useState(false);
  const [refNumber,         setRefNumber]         = useState("");
  const [paidNote,          setPaidNote]          = useState("");
  const [showCancel,        setShowCancel]        = useState(false);
  const [cancelReason,      setCancelReason]      = useState("");
  const [paymentLink,       setPaymentLink]       = useState<string | null>(null);
  const [showShipForm,      setShowShipForm]      = useState(false);
  const [trackingNumber,    setTrackingNumber]    = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const call = async (path: string, method: string, body?: object) => {
    const res = await fetch(`/api/admin/orders/${order.id}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
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

  const nextStage      = order.productionStage ? NEXT_STAGE[order.productionStage] : null;
  const nextStageLabel = nextStage
    ? PRODUCTION_STAGES.find((s) => s.value === nextStage)?.label
    : null;

  // ── Styles ────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 200ms ease",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    marginBottom: "8px",
    display: "block",
  };

  const solidBtn = (color = "var(--text-primary)"): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#fff",
    backgroundColor: color,
    border: "none",
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
  });

  const ghostBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    backgroundColor: "transparent",
    border: "1px solid var(--border)",
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
  };

  const paymentLinkBox = paymentLink ? (
    <div style={{
      marginTop: "10px",
      padding: "12px",
      borderRadius: "6px",
      backgroundColor: "var(--bg-primary)",
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontSize: "11px", fontWeight: 600,
        color: "var(--text-secondary)", marginBottom: "6px",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        Payment Link
      </p>
      <a
        href={paymentLink} target="_blank" rel="noopener noreferrer"
        style={{
          fontSize: "11px", color: "var(--brand)",
          wordBreak: "break-all", textDecoration: "underline",
          display: "block", marginBottom: "8px",
        }}
      >
        {paymentLink}
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(paymentLink);
          setSuccess("Link copied");
          setTimeout(() => setSuccess(""), 2000);
        }}
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "6px 12px", borderRadius: "6px",
          fontSize: "11px", fontWeight: 500,
          color: "#fff", backgroundColor: "var(--brand)",
          border: "none", cursor: "pointer",
        }}
      >
        <Copy size={11} strokeWidth={2} />
        Copy Link
      </button>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: "6px",
          backgroundColor: "#FEF2F2", border: "1px solid #FECACA",
          color: "#DC2626", fontSize: "12px",
          display: "flex", alignItems: "center", gap: "7px",
        }}>
          <AlertCircle size={13} strokeWidth={1.75} />
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={{
          padding: "10px 14px", borderRadius: "6px",
          backgroundColor: "rgba(142,159,130,0.12)",
          border: "1px solid rgba(142,159,130,0.3)",
          color: "var(--success)", fontSize: "12px",
          display: "flex", alignItems: "center", gap: "7px",
        }}>
          <CheckCircle size={13} strokeWidth={1.75} />
          {success}
        </div>
      )}

      {/* ── Photos: NOT_RECEIVED → Mark Received ──────────────────────────── */}
      {order.photoStatus === "NOT_RECEIVED" &&
        ["DRAFT", "AWAITING_PAYMENT", "CONFIRMED"].includes(order.status) && (
        <div>
          <span style={sectionLabel}>Photos</span>
          <div style={{
            padding: "10px 12px", borderRadius: "6px",
            backgroundColor: "rgba(201,108,74,0.08)",
            border: "1px solid rgba(201,108,74,0.2)",
            fontSize: "12px", color: "var(--accent)",
            marginBottom: "8px", lineHeight: 1.5,
          }}>
            Waiting for customer photos
          </div>
          <button
            style={ghostBtn}
            disabled={loading === "photos-received"}
            onClick={() =>
              action("photos-received",
                () => call("/photos/received", "PATCH"),
                "Photos marked as received"
              )
            }
          >
            {loading === "photos-received"
              ? <Loader2 size={13} className="animate-spin" />
              : <Camera size={13} strokeWidth={1.75} />
            }
            Mark Photos Received
          </button>
        </div>
      )}

      {/* ── Photos: RECEIVED → Verify ─────────────────────────────────────── */}
      {order.photoStatus === "RECEIVED" && (
        <div>
          <span style={sectionLabel}>Photos</span>
          <div style={{
            padding: "10px 12px", borderRadius: "6px",
            backgroundColor: "rgba(142,159,130,0.08)",
            border: "1px solid rgba(142,159,130,0.2)",
            fontSize: "12px", color: "var(--success)",
            marginBottom: "8px", lineHeight: 1.5,
          }}>
            Photos received — verify before moving to production
          </div>
          <button
            style={solidBtn("var(--success)")}
            disabled={loading === "photos-verified"}
            onClick={() =>
              action("photos-verified",
                () => call("/photos/verified", "PATCH"),
                "Photos verified — ready for production"
              )
            }
          >
            {loading === "photos-verified"
              ? <Loader2 size={13} className="animate-spin" />
              : <CheckCircle size={13} strokeWidth={1.75} />
            }
            Verify Photos
          </button>
        </div>
      )}

      {/* ── DRAFT: WhatsApp payment actions ───────────────────────────────── */}
      {order.status === "DRAFT" && (
        <div>
          <span style={sectionLabel}>WhatsApp Order — Payment</span>
          <div style={{
            padding: "10px 12px", borderRadius: "6px",
            backgroundColor: "rgba(166,138,117,0.08)",
            border: "1px solid rgba(166,138,117,0.2)",
            fontSize: "12px", color: "var(--text-secondary)",
            marginBottom: "10px", lineHeight: 1.5,
          }}>
            Draft order. Generate a payment link and send to the customer via WhatsApp.
          </div>
          <button
            style={solidBtn()}
            disabled={loading === "paylink"}
            onClick={() =>
              action("paylink", async () => {
                const data = await call("/payment-link", "POST");
                setPaymentLink(data.data.paymentLinkUrl);
              }, "Payment link generated")
            }
          >
            {loading === "paylink"
              ? <Loader2 size={13} className="animate-spin" />
              : <ExternalLink size={13} strokeWidth={1.75} />
            }
            Generate Payment Link
          </button>
          {paymentLinkBox}
          <button
            style={{ ...ghostBtn, marginTop: "8px" }}
            disabled={loading === "activate"}
            onClick={() =>
              action("activate",
                () => call("/status", "PATCH", { status: "AWAITING_PAYMENT" }),
                "Order moved to Awaiting Payment"
              )
            }
          >
            {loading === "activate"
              ? <Loader2 size={13} className="animate-spin" />
              : <CreditCard size={13} strokeWidth={1.75} />
            }
            Move to Awaiting Payment
          </button>
        </div>
      )}

      {/* ── DRAFT or AWAITING_PAYMENT: Mark as Paid (Manual) ─────────────── */}
      {(order.status === "DRAFT" || order.status === "AWAITING_PAYMENT") && (
        <div>
          {order.status === "AWAITING_PAYMENT" && (
            <span style={sectionLabel}>Payment</span>
          )}
          {!showMarkPaid ? (
            <button
              onClick={() => setShowMarkPaid(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "13px", fontWeight: 500,
                color: "var(--success)", background: "none",
                border: "none", cursor: "pointer", padding: "0",
              }}
            >
              <CheckCircle size={14} strokeWidth={1.75} />
              Mark as Paid (Manual)
            </button>
          ) : (
            <div style={{
              padding: "14px", borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-primary)",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                Manual Payment Verification
              </p>
              <input
                placeholder="Reference / UTR number (optional)"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <textarea
                placeholder="Note (optional)"
                rows={2}
                value={paidNote}
                onChange={(e) => setPaidNote(e.target.value)}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{ ...solidBtn("var(--success)"), flex: 1 }}
                  disabled={loading === "markpaid"}
                  onClick={() =>
                    action("markpaid",
                      () => call("/mark-paid", "PATCH", {
                        referenceNumber: refNumber || undefined,
                        note: paidNote || undefined,
                      }),
                      "Order marked as paid"
                    )
                  }
                >
                  {loading === "markpaid" && <Loader2 size={12} className="animate-spin" />}
                  Confirm
                </button>
                <button
                  style={{ ...ghostBtn, flex: 1 }}
                  onClick={() => { setShowMarkPaid(false); setRefNumber(""); setPaidNote(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AWAITING_PAYMENT: Generate Payment Link ───────────────────────── */}
      {order.status === "AWAITING_PAYMENT" && (
        <div>
          <button
            style={solidBtn()}
            disabled={loading === "paylink"}
            onClick={() =>
              action("paylink", async () => {
                const data = await call("/payment-link", "POST");
                setPaymentLink(data.data.paymentLinkUrl);
              }, "Payment link generated")
            }
          >
            {loading === "paylink"
              ? <Loader2 size={13} className="animate-spin" />
              : <ExternalLink size={13} strokeWidth={1.75} />
            }
            Generate Payment Link
          </button>
          {paymentLinkBox}
        </div>
      )}

      {/* ── CONFIRMED: Move to Production ────────────────────────────────── */}
      {order.status === "CONFIRMED" && (
        <div>
          <span style={sectionLabel}>Production</span>
          <button
            style={ghostBtn}
            disabled={loading === "production"}
            onClick={() =>
              action("production",
                () => call("/status", "PATCH", { status: "IN_PRODUCTION" }),
                "Order moved to production"
              )
            }
          >
            {loading === "production"
              ? <Loader2 size={13} className="animate-spin" />
              : <Package size={13} strokeWidth={1.75} />
            }
            Move to Production
          </button>
        </div>
      )}

      {/* ── IN_PRODUCTION: Advance Stage ─────────────────────────────────── */}
      {order.status === "IN_PRODUCTION" && nextStage && (
        <div>
          <span style={sectionLabel}>Production Stage</span>
          <div style={{
            padding: "12px", borderRadius: "6px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-primary)", marginBottom: "8px",
          }}>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Current:{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {PRODUCTION_STAGES.find((s) => s.value === order.productionStage)?.label
                  ?? order.productionStage}
              </span>
            </p>
          </div>
          <button
            style={solidBtn()}
            disabled={loading === "stage"}
            onClick={() =>
              action("stage",
                () => call("/production-stage", "PATCH", { productionStage: nextStage }),
                `Stage advanced to ${nextStageLabel}`
              )
            }
          >
            {loading === "stage" && <Loader2 size={13} className="animate-spin" />}
            Advance to {nextStageLabel}
          </button>
        </div>
      )}

      {/* ── IN_PRODUCTION + READY: Mark as Shipped (with tracking form) ───── */}
      {order.status === "IN_PRODUCTION" && order.productionStage === "READY" && (
        <div>
          <span style={sectionLabel}>Ship Order</span>
          {!showShipForm ? (
            <button style={ghostBtn} onClick={() => setShowShipForm(true)}>
              <Truck size={13} strokeWidth={1.75} />
              Mark as Shipped
            </button>
          ) : (
            <div style={{
              padding: "14px", borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-primary)",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                Enter Tracking Details
              </p>

              <div>
                <label style={{ ...sectionLabel, marginBottom: "5px" }}>
                  Tracking Number *
                </label>
                <input
                  placeholder="e.g. EA123456789IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>

              <div>
                <label style={{ ...sectionLabel, marginBottom: "5px" }}>
                  Estimated Delivery (optional)
                </label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    ...solidBtn(),
                    flex: 1,
                    opacity: !trackingNumber.trim() || loading === "ship" ? 0.5 : 1,
                    cursor: !trackingNumber.trim() || loading === "ship"
                      ? "not-allowed" : "pointer",
                  }}
                  disabled={!trackingNumber.trim() || loading === "ship"}
                  onClick={() =>
                    action("ship",
                      () => call("/ship", "PATCH", {
                        trackingNumber: trackingNumber.trim(),
                        estimatedDelivery: estimatedDelivery || undefined,
                      }),
                      "Order marked as shipped"
                    )
                  }
                >
                  {loading === "ship"
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Truck size={13} strokeWidth={1.75} />
                  }
                  Confirm Shipped
                </button>
                <button
                  style={{ ...ghostBtn, flex: 1 }}
                  onClick={() => {
                    setShowShipForm(false);
                    setTrackingNumber("");
                    setEstimatedDelivery("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SHIPPED: Mark as Delivered ───────────────────────────────────── */}
      {order.status === "SHIPPED" && (
        <button
          style={solidBtn("var(--success)")}
          disabled={loading === "delivered"}
          onClick={() =>
            action("delivered",
              () => call("/status", "PATCH", { status: "DELIVERED" }),
              "Order marked as delivered"
            )
          }
        >
          {loading === "delivered"
            ? <Loader2 size={13} className="animate-spin" />
            : <CheckCircle size={13} strokeWidth={1.75} />
          }
          Mark as Delivered
        </button>
      )}

      {/* ── Admin Note ───────────────────────────────────────────────────── */}
      <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
        <span style={sectionLabel}>Admin Note</span>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note (not visible to customer)..."
          style={{
            width: "100%", padding: "9px 12px", borderRadius: "6px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)", fontSize: "13px",
            outline: "none", resize: "none", marginBottom: "8px",
            transition: "border-color 200ms ease",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
        <button
          style={{
            ...ghostBtn,
            opacity: !note.trim() ? 0.5 : 1,
            cursor: !note.trim() ? "not-allowed" : "pointer",
          }}
          disabled={!note.trim() || loading === "note"}
          onClick={() =>
            action("note", async () => {
              await call("/note", "PATCH", { note });
              setNote("");
            }, "Note added")
          }
        >
          {loading === "note" && <Loader2 size={12} className="animate-spin" />}
          Add Note
        </button>
      </div>

      {/* ── Cancel Order ─────────────────────────────────────────────────── */}
      {["DRAFT", "AWAITING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED"].includes(
        order.status
      ) && (
        <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "13px", fontWeight: 500,
                color: "#DC2626", background: "none",
                border: "none", cursor: "pointer", padding: "0",
              }}
            >
              <XCircle size={14} strokeWidth={1.75} />
              Cancel Order
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#DC2626" }}>
                Cancel Order
              </p>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Cancellation reason (required)..."
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: "6px",
                  border: "1px solid #DC2626",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: "13px",
                  outline: "none", resize: "none",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  disabled={!cancelReason.trim() || loading === "cancel"}
                  onClick={() =>
                    action("cancel",
                      () => call("/status", "PATCH", {
                        status: "CANCELLED",
                        note: cancelReason,
                      }),
                      "Order cancelled"
                    )
                  }
                  style={{
                    flex: 1,
                    display: "inline-flex", alignItems: "center",
                    justifyContent: "center", gap: "7px",
                    padding: "8px 14px", borderRadius: "6px",
                    fontSize: "12px", fontWeight: 500,
                    color: "#fff", backgroundColor: "#DC2626",
                    border: "none",
                    cursor: !cancelReason.trim() || loading === "cancel"
                      ? "not-allowed" : "pointer",
                    opacity: !cancelReason.trim() || loading === "cancel" ? 0.5 : 1,
                  }}
                >
                  {loading === "cancel" && <Loader2 size={12} className="animate-spin" />}
                  Confirm Cancel
                </button>
                <button
                  style={{ ...ghostBtn, flex: 1 }}
                  onClick={() => { setShowCancel(false); setCancelReason(""); }}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}