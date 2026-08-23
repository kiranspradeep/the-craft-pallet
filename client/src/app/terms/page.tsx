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
  variant?: "brand" | "warning";
}) {
  return (
    <div
      style={{
        padding:         "16px 18px",
        borderRadius:    "var(--radius-input)",
        backgroundColor:
          variant === "warning"
            ? "rgba(201,108,74,0.07)"
            : "var(--brand-soft)",
        border:
          variant === "warning"
            ? "1px solid rgba(201,108,74,0.2)"
            : "1px solid var(--border-soft)",
        marginBottom: "16px",
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
  { step: "1", label: "Customer places order",          detail: "Products and customisation selected"              },
  { step: "2", label: "Order created",                  detail: "Order ID generated, awaiting payment"             },
  { step: "3", label: "Payment completed",              detail: "Payment processed securely via Razorpay"          },
  { step: "4", label: "Order confirmed",                detail: "Payment verified, order enters our queue"         },
  { step: "5", label: "Photograph review",              detail: "Uploaded photos reviewed and verified by our team"},
  { step: "6", label: "Production",                     detail: "Your personalised product is handcrafted"         },
  { step: "7", label: "Dispatch",                       detail: "Order packed and handed to courier"               },
  { step: "8", label: "Delivery",                       detail: "Order delivered to your address"                  },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TermsPage() {
  const effectiveDate = "January 2026";

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
            Terms &{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              Conditions
            </em>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Effective date: {effectiveDate}
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
            Please read these Terms &amp; Conditions carefully before placing
            an order. By accessing or using this website and placing an order
            with The Craft Pallet, you agree to be bound by these terms.
          </p>
        </div>

        {/* ── 1. Introduction ───────────────────────────────────────────── */}
        <Section id="introduction" title="1. Introduction">
          <P>
            These Terms &amp; Conditions govern your use of The Craft Pallet
            website and any orders you place with us. They form a legally
            binding agreement between you (the customer) and The Craft Pallet.
          </P>
          <Ul
            items={[
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Business:</strong>{" "}
                The Craft Pallet
              </span>,
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Location:</strong>{" "}
                Kerala, India
              </span>,
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Contact:</strong>{" "}
                kiranspradeep2002@gmail.com
              </span>,
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Effective date:</strong>{" "}
                {effectiveDate}
              </span>,
            ]}
          />
          <P>
            If you do not agree to these terms, please do not use this website
            or place an order.
          </P>
        </Section>

        {/* ── 2. Products ───────────────────────────────────────────────── */}
        <Section id="products" title="2. Products">
          <InfoBox>
            All products sold by The Craft Pallet are personalised and
            custom-made based on photographs and instructions provided by the
            customer at the time of ordering.
          </InfoBox>

          <Sub>Custom nature of products</Sub>
          <P>
            Because each product is individually made to order, no two products
            are identical. The final product may have minor variations from
            images displayed on the website in terms of colour, texture, or
            finish, depending on the photographs provided, materials used, and
            the nature of the handcrafting process.
          </P>

          <Sub>Product availability</Sub>
          <P>
            All products are subject to availability. In the unlikely event
            that a product becomes unavailable after your order is placed, we
            will contact you promptly to discuss alternatives or arrange a full
            refund.
          </P>

          <Sub>Product descriptions</Sub>
          <P>
            We make every effort to describe our products accurately. Product
            dimensions, materials, and specifications are listed on individual
            product pages. Please review these carefully before ordering.
          </P>
        </Section>

        {/* ── 3. Reviewing your order ───────────────────────────────────── */}
        <Section id="order-review" title="3. Reviewing Your Order">
          <P>
            Before completing your order, please carefully review:
          </P>
          <Ul
            items={[
              "The product selected",
              "Quantity ordered",
              "Size or variant selected (where applicable)",
              "Customisation details and instructions",
              "Photographs uploaded",
              "Total price including shipping",
              "Delivery address",
            ]}
          />
          <InfoBox variant="warning">
            Once an order enters production, changes may not be possible. It is
            the customer's responsibility to ensure all details are correct
            before completing payment.
          </InfoBox>
        </Section>

        {/* ── 4. Customer-uploaded photographs ─────────────────────────── */}
        <Section id="photographs" title="4. Customer-Uploaded Photographs">
          <Sub>Your responsibility</Sub>
          <P>
            By uploading photographs to our website, you confirm that:
          </P>
          <Ul
            items={[
              "You own the photographs or have the necessary rights and permissions to use them",
              "The photographs do not infringe the copyright, privacy, or other rights of any third party",
              "You have obtained appropriate consent from any identifiable individuals appearing in the photographs, where required",
              "The photographs are appropriate for use in a personalised product",
            ]}
          />

          <Sub>Prohibited content</Sub>
          <P>
            You must not upload photographs or content that:
          </P>
          <Ul
            items={[
              "Is illegal, obscene, or offensive",
              "Infringes the intellectual property rights of another person or organisation",
              "Contains nudity, unless it is artistic and tasteful and not involving minors",
              "Depicts violence, hate, or discrimination",
              "You do not have the right to use",
            ]}
          />

          <InfoBox variant="warning">
            The Craft Pallet reserves the right to refuse or cancel any order
            that includes content we consider inappropriate, illegal, or in
            breach of these terms.
          </InfoBox>

          <Sub>How we use your photographs</Sub>
          <P>
            Photographs you upload are used solely to create the personalised
            product you have ordered. They are never shared publicly, used for
            advertising, or transferred to third parties without your explicit
            consent. Please see our{" "}
            <Link
              href="/privacy"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              Privacy Policy
            </Link>{" "}
            for full details.
          </P>
        </Section>

        {/* ── 5. Customisation ─────────────────────────────────────────── */}
        <Section id="customisation" title="5. Customisation">
          <P>
            The Craft Pallet creates personalised products based entirely on
            the photographs and instructions provided by the customer. Our
            team follows your specifications as closely as possible.
          </P>
          <Ul
            items={[
              "It is the customer's responsibility to provide clear, high-quality photographs suitable for the product ordered",
              "It is the customer's responsibility to provide accurate customisation instructions",
              "The Craft Pallet is not responsible for errors, omissions, or poor quality in the final product that result from incorrect, unclear, or low-resolution photographs or instructions submitted by the customer",
              "Changes to customisation details after production has begun may not be possible",
              "If you need to correct an error in your order, please contact us as soon as possible — we will do our best to accommodate changes before production starts",
            ]}
          />
        </Section>

        {/* ── 6. Order process ─────────────────────────────────────────── */}
        <Section id="orders" title="6. Order Process">
          <P>
            Orders placed on The Craft Pallet website follow this process:
          </P>

          {/* Order flow */}
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              gap:           "0",
              margin:        "20px 0",
            }}
          >
            {ORDER_FLOW.map((item, i) => {
              const isLast = i === ORDER_FLOW.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: "16px" }}>
                  {/* Step indicator + connector */}
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
                      {item.step}
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

                  {/* Content */}
                  <div style={{ paddingBottom: isLast ? "0" : "16px", paddingTop: "4px" }}>
                    <p
                      style={{
                        fontSize:     "13px",
                        fontWeight:   600,
                        color:        "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <InfoBox>
            An order is not considered confirmed until payment has successfully
            completed. Placing items in your cart or beginning checkout does
            not reserve stock or guarantee availability.
          </InfoBox>
        </Section>

        {/* ── 7. Pricing ───────────────────────────────────────────────── */}
        <Section id="pricing" title="7. Pricing">
          <Sub>Product prices</Sub>
          <P>
            All prices are displayed in Indian Rupees (₹) and are inclusive of
            applicable taxes unless otherwise stated. Product prices are shown
            on individual product pages.
          </P>

          <Sub>Shipping charges</Sub>
          <P>
            Shipping charges are calculated at checkout based on your delivery
            address:
          </P>

          {/* Shipping table */}
          <div
            style={{
              borderRadius:    "var(--radius-input)",
              border:          "1px solid var(--border-soft)",
              overflow:        "hidden",
              marginBottom:    "16px",
            }}
          >
            {[
              { region: "Kerala",         charge: "₹55 per order" },
              { region: "Outside Kerala", charge: "₹60 per order" },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display:         "flex",
                  justifyContent:  "space-between",
                  alignItems:      "center",
                  padding:         "12px 16px",
                  backgroundColor:
                    i % 2 === 0 ? "var(--surface)" : "var(--bg)",
                  borderBottom:
                    i === 0 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {row.region}
                </span>
                <span
                  style={{
                    fontSize:   "13px",
                    fontWeight: 600,
                    color:      "var(--text-primary)",
                  }}
                >
                  {row.charge}
                </span>
              </div>
            ))}
          </div>

          <Sub>Price changes</Sub>
          <P>
            Prices displayed at the time you complete payment are the prices
            that apply to your order. We reserve the right to update product
            prices or shipping charges at any time. Price changes will not
            affect orders that have already been paid and confirmed.
          </P>
        </Section>

        {/* ── 8. Payments ──────────────────────────────────────────────── */}
        <Section id="payments" title="8. Payments">
          <P>
            Payments on The Craft Pallet website are processed securely by
            Razorpay, our payment service provider. We accept UPI, credit and
            debit cards, net banking, and other methods supported by Razorpay.
          </P>

          <Sub>Payment confirmation</Sub>
          <P>
            Once payment is successfully completed, you will receive an order
            confirmation. Production begins only after payment has been verified.
          </P>

          <Sub>Failed payments</Sub>
          <P>
            If your payment fails, your order will not be confirmed and no
            amount will be charged. If an amount is debited from your account
            but the order is not confirmed, please contact us immediately at{" "}
            <a
              href="mailto:kiranspradeep2002@gmail.com"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              kiranspradeep2002@gmail.com
            </a>{" "}
            and we will investigate and resolve the issue promptly.
          </P>

          <Sub>Duplicate payments</Sub>
          <P>
            If you are charged more than once for the same order, please
            contact us as soon as possible. Duplicate charges will be refunded
            in full.
          </P>

          <Sub>Manual payments</Sub>
          <P>
            For orders placed via WhatsApp, payment may be arranged manually
            through a payment link generated by our team. The same confirmation
            process applies.
          </P>
        </Section>

        {/* ── 9. Cancellation ──────────────────────────────────────────── */}
        <Section id="cancellation" title="9. Cancellation & Refunds">
          <P>
            Because our products are personalised and made to order, our
            cancellation and refund terms differ from standard retail.
          </P>
          <P>
            Please review our full{" "}
            <Link
              href="/refund-policy"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              Cancellation &amp; Refund Policy
            </Link>{" "}
            for complete details on:
          </P>
          <Ul
            items={[
              "When cancellations are accepted",
              "How to request a cancellation",
              "Refund eligibility and timelines",
              "What happens if a product is damaged in transit",
            ]}
          />
        </Section>

        {/* ── 10. Delivery ─────────────────────────────────────────────── */}
        <Section id="delivery" title="10. Delivery">
          <P>
            We deliver across India via established courier and postal services.
            Delivery timelines depend on the product, customisation complexity,
            and your delivery location.
          </P>
          <P>
            Please review our full{" "}
            <Link
              href="/shipping-policy"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              Shipping &amp; Delivery Policy
            </Link>{" "}
            for complete details on estimated timelines, tracking, and what to
            do if your order does not arrive.
          </P>
        </Section>

        {/* ── 11. Intellectual property ────────────────────────────────── */}
        <Section id="ip" title="11. Intellectual Property">
          <P>
            All content on The Craft Pallet website is the property of The
            Craft Pallet unless otherwise stated. This includes:
          </P>
          <Ul
            items={[
              "The Craft Pallet brand name and logo",
              "Website design, layout, and code",
              "Product photographs and descriptions",
              "Marketing materials and graphics",
              "All written content on this website",
            ]}
          />
          <P>
            You may not copy, reproduce, distribute, republish, or reuse any
            content from this website for commercial purposes without our prior
            written permission. Unauthorised use of our brand, logo, or content
            may constitute trademark or copyright infringement.
          </P>
          <P>
            Customer-uploaded photographs remain the property of the customer.
            By uploading photographs, you grant The Craft Pallet a limited
            licence to use those photographs solely for the purpose of
            fulfilling your order.
          </P>
        </Section>

        {/* ── 12. Limitation of liability ──────────────────────────────── */}
        <Section id="liability" title="12. Limitation of Liability">
          <P>
            The Craft Pallet's liability in connection with any order is
            limited to the value of that order. We are not liable for:
          </P>
          <Ul
            items={[
              "Indirect or consequential losses",
              "Losses arising from incorrect information provided by the customer",
              "Delays caused by courier or postal services beyond our control",
              "Damage caused during transit that is the responsibility of the delivery partner",
            ]}
          />
          <P>
            Nothing in these terms limits our liability for fraud, death, or
            personal injury caused by our negligence.
          </P>
        </Section>

        {/* ── 13. Changes to terms ─────────────────────────────────────── */}
        <Section id="changes" title="13. Changes to These Terms">
          <P>
            We may update these Terms &amp; Conditions from time to time to
            reflect changes in our practices, services, or applicable law.
            When we make changes, the "Effective date" at the top of this page
            will be updated.
          </P>
          <P>
            We encourage you to review these terms periodically. Continued use
            of our website after changes are posted constitutes your acceptance
            of the updated terms.
          </P>
        </Section>

        {/* ── 14. Governing law ────────────────────────────────────────── */}
        <Section id="law" title="14. Governing Law">
          <P>
            These Terms &amp; Conditions are governed by the laws of India.
            Any disputes arising from your use of this website or any order
            placed with The Craft Pallet shall be subject to the jurisdiction
            of the courts of Kerala, India.
          </P>
        </Section>

        {/* ── 15. Contact ──────────────────────────────────────────────── */}
        <Section id="contact" title="15. Contact Us">
          <P>
            If you have any questions about these Terms &amp; Conditions,
            please contact us:
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
              Email:{" "}
              <a
                href="mailto:kiranspradeep2002@gmail.com"
                style={{ color: "var(--brand)", textDecoration: "underline" }}
              >
                kiranspradeep2002@gmail.com
              </a>
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
              Kerala, India
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
            { href: "/",               label: "← Back to Home"        },
            { href: "/privacy",        label: "Privacy Policy"         },
            { href: "/refund-policy",  label: "Cancellation & Refunds" },
            { href: "/contact",        label: "Contact Us"             },
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