import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | The Craft Pallet",
  description:
    "Learn about The Craft Pallet's shipping charges, processing times, delivery timelines, order tracking, and delivery policies across India.",
  alternates: {
    canonical: "https://craftpallet.com/shipping-policy",
  },
  openGraph: {
    title: "Shipping & Delivery Policy | The Craft Pallet",
    description:
      "Learn about The Craft Pallet's shipping charges, processing times, delivery timelines, order tracking, and delivery policies across India.",
    url: "https://craftpallet.com/shipping-policy",
    type: "website",
  },
};

export default function ShippingPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}