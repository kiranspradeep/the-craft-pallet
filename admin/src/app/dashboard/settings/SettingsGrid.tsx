// settings/SettingsGrid.tsx

"use client";

import Link from "next/link";
import {
  Building2,
  CreditCard,
  Truck,
  MessageCircle,
  Image,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    href: "/dashboard/settings/business",
    icon: Building2,
    title: "Business",
    description: "Name, logo, contact details, social links",
  },
  // {
  //   href: "/dashboard/settings/payment",
  //   icon: CreditCard,
  //   title: "Payment",
  //   description: "UPI ID, Razorpay keys, COD configuration",
  // },
  {
    href: "/dashboard/settings/shipping",
    icon: Truck,
    title: "Shipping",
    description: "Kerala and outside Kerala shipping charges and processing days",
  },
  // {
  //   href: "/dashboard/settings/whatsapp",
  //   icon: MessageCircle,
  //   title: "WhatsApp",
  //   description: "WhatsApp number and message templates",
  // },
  {
    href: "/dashboard/settings/image-retention",
    icon: Image,
    title: "Image Retention",
    description: "How long customer uploads are retained",
  },
];

export default function SettingsGrid() {
  return (
    <>
      <style>{`
        .settings-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 18px;
          text-decoration: none;
          border-bottom: 1px solid var(--border);
          transition: background-color 120ms ease;
        }
        .settings-item:last-child {
          border-bottom: none;
        }
        .settings-item:hover {
          background-color: var(--bg-primary);
        }
      `}</style>

      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
          maxWidth: "640px",
        }}
      >
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="settings-item">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "6px",
                backgroundColor: "rgba(166,138,117,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.75}
                style={{ color: "var(--brand)" }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "2px",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {description}
              </p>
            </div>

            <ChevronRight
              size={15}
              strokeWidth={1.75}
              style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
            />
          </Link>
        ))}
      </div>
    </>
  );
}