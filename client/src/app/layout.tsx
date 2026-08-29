import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PreventZoom from "@/components/ui/PreventZoom";

export const metadata: Metadata = {
  title: "The Craft Pallet — Personalised Gifts & Printing",
  description:
    "Transform your favourite memories into beautifully crafted keepsakes. Premium personalised polaroids, photo prints, and custom gifts.",
  keywords:
    "personalised gifts, polaroids, photo prints, custom gifts, memory keepsakes",

  icons: {
    icon: "/images/craft-pallet-logo-icon.png",
    shortcut: "/images/craft-pallet-logo-icon.png",
    apple: "/images/craft-pallet-logo-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <PreventZoom />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}