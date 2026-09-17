import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "Read The Craft Pallet's cancellation and refund policy for personalised and handcrafted gifts, including cancellations, damaged products, replacements, and refunds.",
  alternates: {
    canonical: "https://craftpallet.com/refund-policy",
  },
  openGraph: {
    title: "Cancellation & Refund Policy | The Craft Pallet",
    description:
      "Read The Craft Pallet's cancellation and refund policy for personalised and handcrafted gifts, including cancellations, damaged products, replacements, and refunds.",
    url: "https://craftpallet.com/refund-policy",
    type: "website",
  },
};

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}