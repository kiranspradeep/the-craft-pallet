import Link from "next/link";

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "48px" }}>
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

// ── Prose paragraph ───────────────────────────────────────────────────────────

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

// ── Bullet list ───────────────────────────────────────────────────────────────

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul
      style={{
        paddingLeft:  "0",
        listStyle:    "none",
        marginBottom: "12px",
        display:      "flex",
        flexDirection:"column",
        gap:          "6px",
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

// ── Highlight box ─────────────────────────────────────────────────────────────

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding:         "16px 18px",
        borderRadius:    "var(--radius-input)",
        backgroundColor: "var(--brand-soft)",
        border:          "1px solid var(--border-soft)",
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

// ── Sub-heading ───────────────────────────────────────────────────────────────

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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
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
            Privacy{" "}
            <em style={{ fontStyle: "italic", color: "var(--brand)" }}>
              Policy
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
            This Privacy Policy explains what information The Craft Pallet
            collects from you, how we use it, and how we protect it. Please
            read this carefully before placing an order or uploading photographs
            to our website.
          </p>
        </div>

        {/* ── 1. Who we are ─────────────────────────────────────────────── */}
        <Section title="1. Who We Are">
          <P>
            The Craft Pallet is a personalised gifts and handmade photo
            products business based in Kerala, India. We create custom products
            — including photo frames, printed keepsakes, and other personalised
            items — using photographs and customisation details provided by
            customers.
          </P>
          <P>
            For privacy-related questions, you can reach us at{" "}
            <a
              href="mailto:kiranspradeep2002@gmail.com"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              kiranspradeep2002@gmail.com
            </a>
            .
          </P>
        </Section>

        {/* ── 2. Information we collect ─────────────────────────────────── */}
        <Section title="2. Information We Collect">
          <P>
            We only collect information that is necessary to process your order
            and deliver your personalised product. We do not collect information
            we do not need.
          </P>

          <Sub>Personal Information</Sub>
          <Ul
            items={[
              "Name",
              "Phone number",
              "Email address (if provided)",
              "Delivery address",
            ]}
          />

          <Sub>Order Information</Sub>
          <Ul
            items={[
              "Products purchased and quantities",
              "Order ID and order status",
              "Customisation instructions",
              "Special requests or notes",
            ]}
          />

          <Sub>Uploaded Content</Sub>
          <InfoBox>
            Because we make personalised photo products, customers are required
            to upload photographs or image files as part of placing an order.
            These files are an essential part of the service we provide.
          </InfoBox>
          <Ul
            items={[
              "Photographs uploaded for personalised products",
              "Image files submitted via the website or WhatsApp",
              "Customisation instructions related to uploaded images",
            ]}
          />

          <Sub>Payment Information</Sub>
          <P>
            Payments are processed through Razorpay, our payment service
            provider. The Craft Pallet does not directly receive or store your
            complete card details, UPI credentials, or banking information.
            Please refer to{" "}
            <a
              href="https://razorpay.com/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              Razorpay's Privacy Policy
            </a>{" "}
            for details of how they handle payment information.
          </P>

          <Sub>Technical Information</Sub>
          <P>
            Our website may collect basic technical information as part of
            normal website operation, including:
          </P>
          <Ul
            items={[
              "IP address",
              "Browser type and version",
              "Device type",
              "Session information required for shopping cart and checkout",
            ]}
          />
          <P>
            We do not currently use third-party analytics or advertising
            tracking tools on this website.
          </P>
        </Section>

        {/* ── 3. How we use your information ───────────────────────────── */}
        <Section title="3. How We Use Your Information">
          <P>
            Information collected through our website is used only for the
            following purposes:
          </P>
          <Ul
            items={[
              "Processing and fulfilling your order",
              "Creating the personalised product you have ordered",
              "Processing payment through our payment provider",
              "Arranging delivery of your order",
              "Contacting you about your order status, shipping, or any issues",
              "Providing customer support",
              "Resolving payment or delivery problems",
              "Preventing fraud or misuse of our service",
              "Improving our website and service based on general feedback",
            ]}
          />
          <P>
            We do not use your personal information for marketing purposes
            without your consent, and we do not send promotional emails or
            messages unless you have specifically requested them.
          </P>
        </Section>

        {/* ── 4. Customer photographs ───────────────────────────────────── */}
        <Section title="4. Customer Photographs">
          <InfoBox>
            Photographs you upload are used exclusively to create the
            personalised product you have ordered. They are not used for any
            other purpose — including advertising, social media, or sharing with
            third parties — without your explicit permission.
          </InfoBox>

          <Sub>How photographs are stored</Sub>
          <P>
            Uploaded photographs are stored securely on our servers and are
            accessible only to members of The Craft Pallet team involved in
            fulfilling your order.
          </P>

          <Sub>Retention</Sub>
          <P>
            Customer-uploaded photographs may be retained for a period after
            your order is completed to allow for any issues or reprints. Files
            are reviewed and cleared periodically. If you would like your
            photographs deleted sooner, please contact us and we will action
            your request promptly.
          </P>

          <Sub>Your photographs will never be</Sub>
          <Ul
            items={[
              "Shared publicly or posted on social media without your explicit permission",
              "Sold or transferred to any third party",
              "Used for marketing or promotional purposes without your consent",
              "Accessed by anyone outside The Craft Pallet team",
            ]}
          />
        </Section>

        {/* ── 5. Sharing information ────────────────────────────────────── */}
        <Section title="5. Sharing Your Information">
          <P>
            We do not sell, rent, or trade your personal information to third
            parties. Information may only be shared in the following limited
            circumstances:
          </P>

          <Sub>Payment processing</Sub>
          <P>
            Your name, contact details, and order amount are shared with
            Razorpay to process your payment securely.
          </P>

          <Sub>Delivery</Sub>
          <P>
            Your name, phone number, and delivery address are shared with our
            courier or delivery partner to fulfil shipment of your order.
          </P>

          <Sub>Hosting and infrastructure</Sub>
          <P>
            Our website and its data are hosted on third-party infrastructure
            providers. These providers store data only as necessary to operate
            our service and are not permitted to use it for their own purposes.
          </P>

          <Sub>Legal requirements</Sub>
          <P>
            We may disclose information if required to do so by law or in
            response to a valid legal request from a government authority.
          </P>
        </Section>

        {/* ── 6. Cookies ───────────────────────────────────────────────── */}
        <Section title="6. Cookies">
          <P>
            Our website uses a small number of cookies that are necessary for
            the website to function correctly. These include:
          </P>
          <Ul
            items={[
              "Session cookies — to maintain your shopping cart while you browse",
              "Authentication cookies — to keep you logged in during your session",
            ]}
          />
          <P>
            We do not currently use advertising cookies, third-party tracking
            cookies, or analytics cookies. If this changes, this policy will
            be updated accordingly.
          </P>
        </Section>

        {/* ── 7. Data security ─────────────────────────────────────────── */}
        <Section title="7. Data Security">
          <P>
            We take reasonable steps to protect the information we hold from
            unauthorised access, loss, or misuse. These measures include secure
            server infrastructure, restricted access to customer data, and
            using established payment providers for financial transactions.
          </P>
          <P>
            No method of transmitting or storing data over the internet is
            completely secure. While we take this responsibility seriously and
            work to protect your information, we cannot guarantee absolute
            security.
          </P>
          <P>
            If you believe your information has been compromised in any way,
            please contact us immediately at{" "}
            <a
              href="mailto:kiranspradeep2002@gmail.com"
              style={{ color: "var(--brand)", textDecoration: "underline" }}
            >
              kiranspradeep2002@gmail.com
            </a>
            .
          </P>
        </Section>

        {/* ── 8. Your rights ───────────────────────────────────────────── */}
        <Section title="8. Your Rights">
          <P>
            You have the right to:
          </P>
          <Ul
            items={[
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Access</strong>{" "}
                — request a copy of the personal information we hold about you
              </span>,
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Correction</strong>{" "}
                — ask us to correct inaccurate or incomplete information
              </span>,
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Deletion</strong>{" "}
                — request that we delete your personal information or uploaded
                photographs, subject to any legal obligations we may have to
                retain certain records
              </span>,
              <span>
                <strong style={{ color: "var(--text-primary)" }}>Questions</strong>{" "}
                — contact us with any questions about how your information is
                handled
              </span>,
            ]}
          />
          <P>
            To exercise any of these rights, please contact us using the
            details below. We will respond to your request as promptly as
            possible.
          </P>
        </Section>

        {/* ── 9. Changes to this policy ────────────────────────────────── */}
        <Section title="9. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or applicable law. When we make changes,
            the "Last updated" date at the top of this page will be revised.
            We encourage you to review this page periodically.
          </P>
          <P>
            Continued use of our website after changes are posted constitutes
            your acceptance of the updated policy.
          </P>
        </Section>

        {/* ── 10. Contact ──────────────────────────────────────────────── */}
        <Section title="10. Contact Us">
          <P>
            For any privacy-related questions, requests, or concerns, please
            contact us:
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
                fontFamily:    "'Playfair Display', serif",
                fontSize:      "16px",
                fontWeight:    600,
                color:         "var(--text-primary)",
                marginBottom:  "4px",
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
            paddingTop:  "32px",
            borderTop:   "1px solid var(--border-soft)",
            display:     "flex",
            gap:         "24px",
            flexWrap:    "wrap",
          }}
        >
          {[
            { href: "/",        label: "← Back to Home"   },
            { href: "/contact", label: "Contact Us"        },
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