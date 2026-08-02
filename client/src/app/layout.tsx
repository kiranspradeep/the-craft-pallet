import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "The Craft Pallet — Personalised Gifts & Printing",
  description:
    "Transform your favourite memories into beautifully crafted keepsakes. Premium personalised polaroids, photo prints, and custom gifts.",
  keywords:
    "personalised gifts, polaroids, photo prints, custom gifts, memory keepsakes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}