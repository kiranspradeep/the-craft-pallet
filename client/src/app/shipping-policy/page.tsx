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
    <div id={id} style={{ marginBottom: "48px" }}>
      <h2
        style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      "22px",
          fontWeight:    600,
          color:         "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom:  "16px",
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
        marginBottom: "12px",
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
        marginBottom:  "12px",
        display:       "flex",
        flexDirection: "column",
        gap:           "6px",
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
    brand:   { bg: "var(--brand-soft)",            border: "1px solid var(--border-soft)"          },
    warning: { bg: "rgba(201,108,74,0.07)",        border: "1px solid rgba(201,108,74,0.2)"       },
    success: { bg: "rgba(142,159,130,0.1)",        border: "1px solid rgba(142,159,130,0.25)"     },
  };

  return (
    <div
      style={{
        padding:         "16px 18px",
        borderRadius:    "var(--radius-input)",
        backgroundColor: styles[variant].bg,
        border:          styles[variant].border,
        marginBottom:    "16px",
      }}
    >
      <p
        style={{
          fontSize:   "13px",
          color:      "var(--text-secondary)",
          lineHeight: 1.75,
        }}
      >
        {children}
      </p>
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
        marginBottom:  "8px",
        marginTop:     "20px",
      }}
    >
      {children}
    </p>
  );
}

// ── Order flow steps ──────────────────────────────────────────────────────────

const ORDER_FLOW = [
  { label: "Order received",                    detail: "Your order is placed and payment is initiated"              },
  { label: "Payment verified",                  detail: "Payment confirmed via Razorpay or manual verification"      },
  { label: "Photos & customisation reviewed",   detail: "We review your uploaded photographs and instructions"       },
  { label: "Production",                        detail: "Your personalised product is handcrafted"                   },
  { label: "Quality check",                     detail: "Final inspection before packing"                            },
  { label: "Dispatch",                          detail: "Order packed and handed to courier"                         },
  { label: "Delivery",                          detail: "Order delivered to your address"                            },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ShippingPolicyPage() {
  const lastUpdated = "January 2026";

  return (
    <div style={{ backgroundColor: "var(--bg)", padding: "72px 0 120px" }}>
      <div className="tcp-container" style={{ maxWidth: "760px" }}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: "56px" }}>
          <p className="tcp-eyebrow">Legal</p>
          <h1
            style={{
              fontFamily:    "'Playfair Display', serif",
              fontSize:      "clamp(28px, 4vw, 48px)",
              fontWeight:    500,
              color:         "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom:  "16px",
            }}
          >
            Shipping &{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              Delivery
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
            Every order from The Craft Pallet is personalised and handcrafted.
            This page explains what happens after you place your order, how long
            delivery takes, and what to do if something goes wrong.
          </p>
        </div>

        {/* ── 1. Order processing ───────────────────────────────────────── */}
        <Section id="processing" title="1. Order Processing">
          <P>
            Because all our products are personalised and made to order, each
            order goes through several stages before it reaches you. Here's
            what happens after you place your order:
          </P>

          {/* Flow diagram */}
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              margin:        "20px 0",
            }}
          >
            {ORDER_FLOW.map((step, i) => {
              const isLast = i === ORDER_FLOW.length - 1;
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
                          minHeight:       "16px",
                          backgroundColor: "var(--border-soft)",
                          margin:          "4px 0",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      paddingBottom: isLast ? "0" : "16px",
                      paddingTop:    "4px",
                    }}
                  >
                    <p
                      style={{
                        fontSize:     "13px",
                        fontWeight:   600,
                        color:        "var(--text-primary)",
                        marginBottom: step.detail ? "2px" : "0",
                      }}
                    >
                      {step.label}
                    </p>
                    {step.detail && (
                      <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <InfoBox>
            Production begins only after payment has been verified and all
            required photographs and customisation details have been received
            and reviewed.
          </InfoBox>
        </Section>

        {/* ── 2. Processing time ────────────────────────────────────────── */}
        <Section id="processing-time" title="2. Processing Time">
          <P>
            Orders are processed and prepared for production after successful
            payment and submission of all required customisation details
            (photographs, text, etc.).
          </P>
          <P>
            Processing time depends on the product ordered, customisation
            complexity, and current order volume. Most orders are dispatched
            within the estimated delivery window below.
          </P>
          <InfoBox variant="warning">
            If we notice any issue with your photographs or customisation
            details, we will contact you before beginning production. This
            may add to the overall processing time.
          </InfoBox>
        </Section>

        {/* ── 3. Estimated delivery time ────────────────────────────────── */}
        <Section id="delivery-time" title="3. Estimated Delivery Time">
          <div
            style={{
              padding:         "20px 24px",
              borderRadius:    "var(--radius-card)",
              backgroundColor: "var(--surface)",
              border:          "1px solid var(--border-soft)",
              marginBottom:    "16px",
              textAlign:       "center",
            }}
          >
            <p
              style={{
                fontSize:      "10px",
                fontWeight:    600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "var(--text-tertiary)",
                marginBottom:  "8px",
              }}
            >
              Estimated Delivery
            </p>
            <p
  style={{
    fontFamily:    "'Playfair Display', serif",
    fontSize:      "32px",
    fontWeight:    600,
    color:         "var(--text-primary)",
    letterSpacing: "-0.02em",
    marginBottom:  "6px",
  }}
>
  7 – 10 Working Days
</p>
<p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
  From order confirmation · Monday – Saturday
</p>
          </div>

          <P>
  The estimated delivery time of{" "}
  <strong style={{ color: "var(--text-primary)" }}>
    7–10 working days
  </strong>{" "}
  is calculated from the date your order is confirmed (payment
  verified and customisation details received), not from the date the
  order was placed. Working days are Monday to Saturday, excluding
  public holidays.
</P>
          <P>
            This estimate includes both production time and courier transit
            time. Actual delivery may vary based on product type, customisation
            requirements, your delivery location, and courier conditions.
          </P>
          <InfoBox>
            For time-sensitive orders (birthdays, anniversaries, etc.), please
            place your order well in advance and mention the date in the order
            notes. We'll do our best to prioritise, but we cannot guarantee
            delivery by a specific date.
          </InfoBox>
        </Section>

        {/* ── 4. Shipping charges ───────────────────────────────────────── */}
        <Section id="shipping-charges" title="4. Shipping Charges">
          <P>
            Shipping charges are calculated at checkout based on your delivery
            address:
          </P>

          <div
            style={{
              borderRadius: "var(--radius-input)",
              border:       "1px solid var(--border-soft)",
              overflow:     "hidden",
              marginBottom: "16px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor:    "var(--surface)",
                borderBottom:        "1px solid var(--border-soft)",
                padding:             "10px 16px",
              }}
            >
              {["Delivery Location", "Shipping Charge"].map((h) => (
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
            {[
              { location: "Within Kerala",  charge: "₹55 per order" },
              { location: "Outside Kerala",  charge: "₹60 per order" },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display:             "grid",
                  gridTemplateColumns: "1fr 1fr",
                  padding:             "12px 16px",
                  backgroundColor:     i % 2 === 0 ? "var(--bg)" : "var(--surface)",
                  borderBottom:        i === 0 ? "1px solid var(--border-soft)" : "none",
                  alignItems:          "center",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {row.location}
                </span>
                <span
                  style={{
                    fontSize:   "14px",
                    fontWeight: 600,
                    color:      "var(--text-primary)",
                  }}
                >
                  {row.charge}
                </span>
              </div>
            ))}
          </div>

          <P>
            Shipping charges displayed at the time of checkout are final for
            your order. We reserve the right to update shipping charges for
            future orders.
          </P>
        </Section>

        {/* ── 5. Delivery area ──────────────────────────────────────────── */}
        <Section id="delivery-area" title="5. Delivery Area">
          <P>
            We currently deliver across India via established courier and postal
            services including India Post.
          </P>
          <InfoBox variant="warning">
            Deliveries to remote or hard-to-reach locations may take longer than
            the standard estimated delivery time. If your pincode is not
            serviceable by our primary courier partner, we will use India Post
            or an alternative service.
          </InfoBox>
        </Section>

        {/* ── 6. Delivery address ───────────────────────────────────────── */}
        <Section id="delivery-address" title="6. Delivery Address">
          <InfoBox variant="warning">
            It is the customer's responsibility to provide a complete and
            accurate delivery address, including a valid pincode and a reachable
            phone number. Please double-check your address before completing
            your order.
          </InfoBox>
          <P>
            If a delivery fails because the address provided was incorrect,
            incomplete, or the customer was unreachable, The Craft Pallet is
            not responsible for the failed delivery. Additional charges may
            apply for re-dispatch.
          </P>
          <P>
            Address changes after an order has been confirmed may not always be
            possible, especially if the order has already been dispatched.
            Please contact us as soon as possible if you need to update your
            address.
          </P>
        </Section>

        {/* ── 7. Order tracking ─────────────────────────────────────────── */}
        <Section id="tracking" title="7. Order Tracking">
          <P>
            Once your order has been dispatched, we will provide you with a
            tracking number. You can use this to track your shipment.
          </P>

          {/* Tracking flow */}
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              margin:        "20px 0",
            }}
          >
            {[
              { label: "Order dispatched",                detail: "Your order leaves our workshop"                },
              { label: "Tracking number assigned",        detail: "We share your tracking details"                },
              { label: "Track your order",                detail: "Use the tracking number on the courier website" },
              { label: "Delivered",                       detail: "Order arrives at your doorstep"                },
            ].map((step, i, arr) => {
              const isLast = i === arr.length - 1;
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
                        backgroundColor: "var(--success)",
                        color:           "#fff",
                        display:         "flex",
                        alignItems:      "center",
                        justifyContent:  "center",
                        fontSize:        "11px",
                        fontWeight:      700,
                      }}
                    >
                      {i + 1}
                    </div>
                    {!isLast && (
                      <div
                        style={{
                          width:           "1px",
                          flex:            1,
                          minHeight:       "16px",
                          backgroundColor: "rgba(142,159,130,0.3)",
                          margin:          "4px 0",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ paddingBottom: isLast ? "0" : "16px", paddingTop: "4px" }}>
                    <p
                      style={{
                        fontSize:     "13px",
                        fontWeight:   600,
                        color:        "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {step.label}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <P>
            You can track your order at any time using our{" "}
            <Link
              href="/track"
              style={{ color: "var(--brand)", textDecoration: "underline", fontWeight: 500 }}
            >
              Track Order
            </Link>{" "}
            page by entering your order number and phone number.
          </P>
          <P>
            For shipments via India Post, you can also track on the{" "}
            <a
              href="https://www.indiapost.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--brand)", textDecoration: "underline", fontWeight: 500 }}
            >
              India Post website
            </a>
            .
          </P>
        </Section>

        {/* ── 8. Courier delays ─────────────────────────────────────────── */}
        <Section id="delays" title="8. Possible Delays">
          <P>
            While we do our best to deliver within the estimated timeframe,
            delays may occasionally occur due to circumstances beyond our
            control:
          </P>
          <Ul
            items={[
              "Adverse weather conditions or natural disasters",
              "Public holidays or regional festivals",
              "Courier service disruptions or strikes",
              "Incorrect or incomplete delivery address provided by the customer",
              "Customer unavailable at the delivery address",
              "Remote or hard-to-reach delivery locations",
              "High order volumes during festive seasons",
              "Customs or regulatory requirements for certain regions",
            ]}
          />
          <P>
            Delivery delays caused by these circumstances do not automatically
            qualify for a refund. If your order is significantly delayed beyond
            the estimated delivery time, please contact us and we will
            investigate with the courier.
          </P>
        </Section>

        {/* ── 9. Damaged or missing shipment ────────────────────────────── */}
        <Section id="damaged" title="9. Damaged or Missing Shipment">
          <InfoBox variant="warning">
            If your order arrives damaged, or if you suspect it was tampered
            with during transit, please contact us within{" "}
            <strong>48 hours of delivery</strong> with photographs of the
            product and packaging.
          </InfoBox>

          <Sub>What to do</Sub>
          <Ul
            items={[
              "Photograph the packaging before opening (if damage is visible externally)",
              "Photograph the damaged product clearly",
              "Contact us via WhatsApp or email with your Order ID, photographs, and a brief description",
              "Do not dispose of the packaging until the claim is resolved",
            ]}
          />

          <P>
            We will review your claim and arrange a replacement or appropriate
            resolution. For full details, please see our{" "}
            <Link
              href="/refund-policy"
              style={{ color: "var(--brand)", textDecoration: "underline", fontWeight: 500 }}
            >
              Cancellation & Refund Policy
            </Link>
            .
          </P>

          <Sub>Order not received</Sub>
          <P>
            If your order has not arrived within 14 calendar days of the
            dispatch date and tracking shows no updates, please contact us.
            We will investigate with the courier and work towards a resolution.
          </P>
        </Section>

        {/* ── 10. Contact ───────────────────────────────────────────────── */}
        <Section id="contact" title="10. Contact Us">
          <P>
            For any delivery-related questions or concerns, please contact us:
          </P>
          <div
            style={{
              padding:         "20px 24px",
              borderRadius:    "var(--radius-card)",
              backgroundColor: "var(--surface)",
              border:          "1px solid var(--border-soft)",
              display:         "flex",
              flexDirection:   "column",
              gap:             "8px",
            }}
          >
            <p
              style={{
                fontFamily:   "'Playfair Display', serif",
                fontSize:     "16px",
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
                href="https://wa.me/918086415357"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--brand)", textDecoration: "underline" }}
              >
                +91 80864 15357
              </a>
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Email:{" "}
              <a
                href="mailto:kiranspradeep2002@gmail.com"
                style={{ color: "var(--brand)", textDecoration: "underline" }}
              >
                kiranspradeep2002@gmail.com
              </a>
            </p>
            <p
              style={{
                fontSize:   "12px",
                color:      "var(--text-tertiary)",
                marginTop:  "4px",
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
            { href: "/",              label: "← Back to Home"          },
            { href: "/terms",         label: "Terms & Conditions"      },
            { href: "/refund-policy", label: "Cancellation & Refunds"  },
            { href: "/track",         label: "Track Your Order"        },
            { href: "/contact",       label: "Contact Us"              },
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
  );
}