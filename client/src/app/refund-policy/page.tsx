"use client";

import Link from "next/link";

// ── Reusable components ───────────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="policy-section" style={{ marginBottom: "56px" }}>
      <h2
        style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      "clamp(20px, 3vw, 24px)",
          fontWeight:    600,
          color:         "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom:  "20px",
          paddingBottom: "12px",
          borderBottom:  "1px solid var(--border-soft)",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize:     "14px",
        color:        "var(--text-secondary)",
        lineHeight:   1.8,
        marginBottom: "16px",
      }}
    >
      {children}
    </p>
  );
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul
      style={{
        paddingLeft:   "0",
        listStyle:     "none",
        marginBottom:  "16px",
        display:       "flex",
        flexDirection: "column",
        gap:           "8px",
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display:    "flex",
            alignItems: "flex-start",
            gap:        "10px",
            fontSize:   "14px",
            color:      "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          <span
            style={{
              width:           "5px",
              height:          "5px",
              borderRadius:    "50%",
              backgroundColor: "var(--brand)",
              flexShrink:      0,
              marginTop:       "9px",
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoBox({
  children,
  variant = "brand",
}: {
  children: React.ReactNode;
  variant?: "brand" | "warning" | "success";
}) {
  const styles = {
    brand: {
      bg:     "var(--brand-soft)",
      border: "1px solid var(--border-soft)",
    },
    warning: {
      bg:     "rgba(220, 38, 38, 0.04)",
      border: "1px solid rgba(220, 38, 38, 0.15)",
    },
    success: {
      bg:     "rgba(142,159,130,0.1)",
      border: "1px solid rgba(142,159,130,0.25)",
    },
  };

  return (
    <div
      style={{
        padding:         "18px 20px",
        borderRadius:    "var(--radius-input)",
        backgroundColor: styles[variant].bg,
        border:          styles[variant].border,
        marginBottom:    "20px",
      }}
    >
      <div
        style={{
          fontSize:   "13px",
          color:      "var(--text-secondary)",
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize:      "11px",
        fontWeight:    600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color:         "var(--text-primary)",
        marginBottom:  "10px",
        marginTop:     "24px",
      }}
    >
      {children}
    </p>
  );
}

function FlowDiagram({
  steps,
}: {
  steps: { label: string; detail?: string }[];
}) {
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        margin:        "24px 0",
      }}
    >
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                flexShrink:    0,
              }}
            >
              <div
                style={{
                  width:           "28px",
                  height:          "28px",
                  borderRadius:    "6px",
                  backgroundColor: "var(--text-primary)",
                  color:           "#fff",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  fontSize:        "11px",
                  fontWeight:      700,
                  flexShrink:      0,
                }}
              >
                {i + 1}
              </div>
              {!isLast && (
                <div
                  style={{
                    width:           "1px",
                    flex:            1,
                    minHeight:       "20px",
                    backgroundColor: "var(--border-soft)",
                    margin:          "6px 0",
                  }}
                />
              )}
            </div>
            <div
              style={{
                paddingBottom: isLast ? "0" : "20px",
                paddingTop:    "4px",
              }}
            >
              <p
                style={{
                  fontSize:     "14px",
                  fontWeight:   600,
                  color:        "var(--text-primary)",
                  marginBottom: step.detail ? "4px" : "0",
                }}
              >
                {step.label}
              </p>
              {step.detail && (
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Policy summary table ──────────────────────────────────────────────────────

const POLICY_TABLE = [
  { situation: "Cancellation requested before production",          outcome: "Cancellation accepted",          ok: true  },
  { situation: "Cancellation requested after production begins",    outcome: "Not accepted",                   ok: false },
  { situation: "Change of mind after production",                   outcome: "No refund",                      ok: false },
  { situation: "Customer uploaded wrong photograph",                outcome: "No refund",                      ok: false },
  { situation: "Customer provided incorrect customisation details", outcome: "No refund",                      ok: false },
  { situation: "Customer provided incorrect delivery address",      outcome: "No refund",                      ok: false },
  { situation: "Courier delay outside our control",                 outcome: "No automatic refund",            ok: false },
  { situation: "Product damaged in transit",                        outcome: "Replacement or resolution",      ok: true  },
  { situation: "Wrong product sent by The Craft Pallet",            outcome: "Replacement",                    ok: true  },
  { situation: "Personalisation mistake made by us",                outcome: "Replacement",                    ok: true  },
  { situation: "Manufacturing or printing defect",                  outcome: "Replacement",                    ok: true  },
  { situation: "Replacement not reasonably possible",               outcome: "Refund may be provided",         ok: true  },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RefundPolicyPage() {
  const lastUpdated = "January 2026";

  return (
    <>
      {styleInjections}
      <div style={{ backgroundColor: "var(--bg)", padding: "72px 0 120px" }}>
        <div className="tcp-container" style={{ maxWidth: "760px" }}>

          {/* ── Page header ───────────────────────────────────────────────── */}
          <div style={{ marginBottom: "56px" }}>
            <p className="tcp-eyebrow">Legal</p>
            <h1
              style={{
                fontFamily:    "'Playfair Display', serif",
                fontSize:      "clamp(32px, 5vw, 48px)",
                fontWeight:    500,
                color:         "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom:  "16px",
              }}
            >
              Cancellation &{" "}
              <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
                Refund Policy
              </em>
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Last updated: {lastUpdated}
            </p>
            <p
              style={{
                fontSize:   "15px",
                color:      "var(--text-secondary)",
                lineHeight: 1.7,
                marginTop:  "16px",
                maxWidth:   "600px",
              }}
            >
              Every product we make is personalised and handcrafted specifically
              for you. Please read this policy carefully before placing an order.
            </p>
          </div>

          {/* ── 1. Important notice ───────────────────────────────────────── */}
          <Section id="notice" title="1. Important Notice">
            <InfoBox variant="warning">
              <span style={{ color: "#DC2626", fontWeight: 700 }}>
                Personalised products are non-refundable and cannot be cancelled
                once production has started.
              </span>{" "}
              Each product is made to order using photographs and customisation
              details you provide. Once we begin making your product, the
              materials and work cannot be recovered.
            </InfoBox>
            <P>
              We ask that you review your order — including your photographs,
              customisation details, and delivery address — carefully before
              completing payment.
            </P>
            <P>
              The only exceptions to this policy are situations where the fault
              lies with The Craft Pallet, such as a damaged, defective, or
              incorrectly prepared product. These are covered in Sections 4 and 5
              below.
            </P>
          </Section>

          {/* ── 2. Cancellation before production ────────────────────────── */}
          <Section id="cancel-before" title="2. Cancellation Before Production">
            <InfoBox variant="success">
              If you need to cancel your order before production has started,
              please contact us as soon as possible. Cancellation requests
              received before personalisation begins will be accepted and a full
              refund will be issued.
            </InfoBox>
            <Sub>How to request cancellation</Sub>
            <P>
              Contact us via WhatsApp or email and include:
            </P>
            <Ul
              items={[
                "Your Order ID (e.g. TCP-2026-0001)",
                "Your name",
                "Your registered phone number or email address",
                "Reason for cancellation",
              ]}
            />
            <P>
              We will confirm whether production has started and advise you on
              the next steps. If your cancellation is approved, a full refund
              will be initiated — see Section 6 for timelines.
            </P>
          </Section>

          {/* ── 3. After production begins ───────────────────────────────── */}
          <Section id="cancel-after" title="3. After Production Begins">
            <InfoBox variant="warning">
              Once personalisation or production has started, your order cannot
              be cancelled and no refund will be issued — except in the
              circumstances described in Sections 4 and 5.
            </InfoBox>
            <P>
              This applies regardless of the reason, including:
            </P>
            <Ul
              items={[
                "Change of mind",
                "Ordering by mistake",
                "Incorrect photograph or customisation details submitted by the customer",
                "Purchasing as a gift that is no longer needed",
              ]}
            />
            <P>
              We take care to review photographs and customisation details before
              production begins where possible, and we will contact you if we
              notice any obvious issue. However, it remains the customer's
              responsibility to check all details before completing payment.
            </P>
          </Section>

          {/* ── 4. Damaged or defective product ──────────────────────────── */}
          <Section id="damaged" title="4. Damaged or Defective Product">
            <P>
              If your order arrives damaged or with a manufacturing defect, please
              contact us within{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                48 hours of delivery
              </strong>
              . We take quality seriously and will resolve the issue as quickly
              as possible.
            </P>

            <FlowDiagram
              steps={[
                {
                  label:  "Contact us within 48 hours of delivery",
                  detail: "Via WhatsApp or email",
                },
                {
                  label:  "Provide your Order ID and evidence",
                  detail: "Clear photographs or video of the damaged product and packaging",
                },
                {
                  label:  "We review your claim",
                  detail: "Usually within 1–2 business days",
                },
                {
                  label:  "We arrange a replacement",
                  detail: "Or a refund where replacement is not reasonably possible",
                },
              ]}
            />

            <InfoBox variant="warning">
              Claims submitted without photographic or video evidence of the
              damage may not be accepted. Please photograph the product and
              packaging before disposing of either.
            </InfoBox>

            <Sub>What is covered</Sub>
            <Ul
              items={[
                "Product physically damaged during transit",
                "Manufacturing or printing defects",
                "Product that does not match what was ordered due to an error by The Craft Pallet",
              ]}
            />

            <Sub>What is not covered</Sub>
            <Ul
              items={[
                "Damage caused by the customer after delivery",
                "Minor colour variations due to screen calibration or print characteristics",
                "Quality issues resulting from low-resolution or unsuitable photographs provided by the customer",
              ]}
            />
          </Section>

          {/* ── 5. Wrong product ─────────────────────────────────────────── */}
          <Section id="wrong-product" title="5. Wrong or Incorrect Product">
            <P>
              If we send you the wrong product, wrong size, or if we made an
              error in your personalisation that was not caused by incorrect
              information you provided, please contact us within{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                48 hours of delivery
              </strong>
              .
            </P>
            <Ul
              items={[
                "Wrong product dispatched",
                "Wrong size or variant sent",
                "Personalisation error made by The Craft Pallet (not based on customer-provided details)",
                "Missing item in a multi-item order",
              ]}
            />
            <InfoBox variant="success">
              Where the error is on our part, we will arrange a replacement at
              no cost to you, including any return shipping required. If a
              replacement is not reasonably possible, a full refund will be
              provided.
            </InfoBox>

            <Sub>Customer-provided errors</Sub>
            <P>
              We are not responsible for errors in the final product that result
              from incorrect, unclear, or low-quality photographs or
              customisation instructions submitted by the customer. Please check
              everything carefully before completing your order.
            </P>
          </Section>

          {/* ── 6. Refund method & timeline ──────────────────────────────── */}
          <Section id="refund" title="6. Refund Method & Timeline">
            <Sub>Method</Sub>
            <P>
              Where a refund is approved, it will be processed through the
              original payment method used at the time of purchase:
            </P>
            <Ul
              items={[
                "Payments made via Razorpay will be refunded to the original payment source — UPI, card, or net banking",
                "Manually processed payments will be refunded via bank transfer or UPI to details provided by the customer",
              ]}
            />

            <Sub>Timeline</Sub>
            <Ul
              items={[
                <span>
                  The refund will be initiated within{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    3–5 business days
                  </strong>{" "}
                  of approval
                </span>,
                "The time for the amount to appear in your account depends on your bank or payment provider — typically 5–7 business days",
                "You will be notified via WhatsApp or email once the refund has been initiated",
              ]}
            />
            <InfoBox>
              If you do not receive your refund within 10 business days of our
              confirmation, please check with your bank first. If the issue
              persists, contact us and we will investigate with Razorpay.
            </InfoBox>
          </Section>

          {/* ── 7. Delivery problems ─────────────────────────────────────── */}
          <Section id="delivery" title="7. Delivery Problems">
            <Sub>Incorrect address</Sub>
            <P>
              If an order cannot be delivered because the address provided was
              incorrect or incomplete, The Craft Pallet is not liable for the
              loss. Please ensure your delivery address is accurate when placing
              your order.
            </P>

            <Sub>Customer unavailable</Sub>
            <P>
              If the courier is unable to deliver after reasonable attempts
              because the customer was unavailable or uncontactable, The Craft
              Pallet is not responsible for the failed delivery. Please ensure
              your registered phone number is correct and accessible.
            </P>

            <Sub>Courier delays</Sub>
            <P>
              Delivery delays caused by courier services, weather, or other
              factors outside our control do not automatically qualify for a
              refund. If your order is significantly delayed, please contact us
              and we will do our best to assist.
            </P>
          </Section>

          {/* ── 8. Policy summary table ──────────────────────────────────── */}
          <Section id="summary" title="8. Policy Summary">
            <div
              style={{
                borderRadius: "var(--radius-input)",
                border:       "1px solid var(--border-soft)",
                overflow:     "hidden",
                marginBottom: "16px",
              }}
            >
              {/* Table Header */}
              <div
                className="policy-table-header"
                style={{
                  display:             "grid",
                  gridTemplateColumns: "1fr 1fr",
                  backgroundColor:     "var(--surface)",
                  borderBottom:        "1px solid var(--border-soft)",
                  padding:             "12px 16px",
                }}
              >
                {["Situation", "Outcome"].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize:      "10px",
                      fontWeight:    600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color:         "var(--text-tertiary)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {POLICY_TABLE.map((row, i) => (
                <div
                  key={i}
                  className="policy-table-row"
                  style={{
                    display:             "grid",
                    gridTemplateColumns: "1fr 1fr",
                    padding:             "14px 16px",
                    backgroundColor:     i % 2 === 0 ? "var(--bg)" : "var(--surface)",
                    borderBottom:
                      i < POLICY_TABLE.length - 1
                        ? "1px solid var(--border-soft)"
                        : "none",
                    alignItems: "center",
                    gap:        "16px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {row.situation}
                  </span>
                  <span
                    style={{
                      fontSize:   "13px",
                      fontWeight: 600,
                      color:      row.ok ? "var(--success)" : "#DC2626",
                      display:    "flex",
                      alignItems: "center",
                      gap:        "6px",
                    }}
                  >
                    <span
                      style={{
                        width:           "6px",
                        height:          "6px",
                        borderRadius:    "50%",
                        backgroundColor: row.ok ? "var(--success)" : "#DC2626",
                        flexShrink:      0,
                        display:         "inline-block",
                      }}
                    />
                    {row.outcome}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 9. How to contact us ─────────────────────────────────────── */}
          <Section id="contact" title="9. Contact Us">
            <P>
              For cancellation or refund requests, or if you have received a
              damaged or incorrect product, please contact us and include the
              following:
            </P>

            <div
              style={{
                padding:         "20px",
                borderRadius:    "var(--radius-input)",
                backgroundColor: "var(--surface)",
                border:          "1px solid var(--border-soft)",
                marginBottom:    "24px",
                display:         "flex",
                flexDirection:   "column",
                gap:             "10px",
              }}
            >
              <p
                style={{
                  fontSize:      "10px",
                  fontWeight:    600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:         "var(--text-tertiary)",
                  marginBottom:  "4px",
                }}
              >
                Include in your message
              </p>
              {[
                { field: "Order ID",                  eg: "e.g. TCP-2026-0001"          },
                { field: "Your name",                 eg: "As provided when ordering"   },
                { field: "Registered phone or email", eg: "Used when placing the order" },
                { field: "Reason for request",        eg: "Brief description"           },
                { field: "Evidence if applicable",    eg: "Photos or video of damage"   },
              ].map((item) => (
                <div
                  key={item.field}
                  style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
                >
                  <span
                    style={{
                      width:           "5px",
                      height:          "5px",
                      borderRadius:    "50%",
                      backgroundColor: "var(--brand)",
                      flexShrink:      0,
                      marginTop:       "7px",
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {item.field}
                    </strong>
                    {" — "}
                    <span style={{ color: "var(--text-tertiary)" }}>{item.eg}</span>
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding:         "24px",
                borderRadius:    "var(--radius-card)",
                backgroundColor: "var(--surface)",
                border:          "1px solid var(--border-soft)",
                display:         "flex",
                flexDirection:   "column",
                gap:             "10px",
              }}
            >
              <p
                style={{
                  fontFamily:   "'Playfair Display', serif",
                  fontSize:     "18px",
                  fontWeight:   600,
                  color:        "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                The Craft Pallet
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/919746292208"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--brand)", textDecoration: "underline" }}
                >
                  +91 97462 92208
                </a>
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Email:{" "}
                <a
                  href="mailto:craftpallet12@gmail.com"
                  style={{ color: "var(--brand)", textDecoration: "underline" }}
                >
                  craftpallet12@gmail.com
                </a>
              </p>
              <p
                style={{
                  fontSize:  "12px",
                  color:     "var(--text-tertiary)",
                  marginTop: "6px",
                  lineHeight: 1.5,
                }}
              >
                Support hours: Monday – Saturday, 10:00 AM – 6:00 PM
              </p>
            </div>
          </Section>

          {/* ── Back links ───────────────────────────────────────────────── */}
          <div
            style={{
              paddingTop: "32px",
              borderTop:  "1px solid var(--border-soft)",
              display:    "flex",
              gap:        "24px",
              flexWrap:   "wrap",
            }}
          >
            {[
              { href: "/",                 label: "← Back to Home"    },
              { href: "/terms",            label: "Terms & Conditions" },
              { href: "/shipping-policy",  label: "Shipping Policy"   },
              { href: "/contact",          label: "Contact Us"        },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize:       "13px",
                  color:          "var(--text-tertiary)",
                  textDecoration: "none",
                  transition:     "color 200ms ease",
                }}
                className="hover:text-[var(--text-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Style Injections (for mobile table scaling) ───────────────────────────────

const styleInjections = (
  <style>{`
    @media (max-width: 580px) {
      .policy-table-header {
        display: none !important;
      }
      .policy-table-row {
        grid-template-columns: 1fr !important;
        gap: 6px !important;
        padding: 16px !important;
      }
      .policy-table-row > span:first-of-type {
        font-weight: 600;
        color: var(--text-primary) !important;
      }
    }
  `}</style>
);