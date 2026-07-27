"use client";

import Link from "next/link";
import {
  Building2,
  CreditCard,
  Truck,
  MessageCircle,
  Image,
} from "lucide-react";

const sections = [
  {
    href: "/dashboard/settings/business",
    icon: Building2,
    title: "Business Settings",
    description: "Name, logo, contact details, social links",
  },
  {
    href: "/dashboard/settings/payment",
    icon: CreditCard,
    title: "Payment Settings",
    description: "UPI ID, Razorpay keys, COD configuration",
  },
  {
    href: "/dashboard/settings/shipping",
    icon: Truck,
    title: "Shipping Settings",
    description: "Shipping charges, free shipping threshold",
  },
  {
    href: "/dashboard/settings/whatsapp",
    icon: MessageCircle,
    title: "WhatsApp Settings",
    description: "WhatsApp number and message templates",
  },
  {
    href: "/dashboard/settings/image-retention",
    icon: Image,
    title: "Image Retention",
    description: "How long customer uploads are retained",
  },
];

export default function SettingsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      {sections.map(({ href, icon: Icon, title, description }) => (
        <Link
          key={href}
          href={href}
          className="block rounded-2xl border p-5 transition-all duration-200"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 16px 40px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 10px 30px rgba(0,0,0,0.06)";
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: "rgba(166,138,117,0.1)" }}
          >
            <Icon size={20} style={{ color: "var(--brand)" }} />
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        </Link>
      ))}
    </div>
  );
}