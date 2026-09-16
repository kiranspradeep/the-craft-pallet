import type { Metadata, Viewport } from "next"; 
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css"; 
import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer"; 
import PreventZoom from "@/components/ui/PreventZoom"; 

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://craftpallet.com";

export const metadata: Metadata = { 
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Craft Pallet — Personalised Gifts & Printing",
    template: "%s | The Craft Pallet"
  },
  description: 
    "Transform your favourite memories into beautifully crafted keepsakes. Premium personalised polaroids, photo prints, and custom gifts.", 
  keywords: [
    "personalised gifts", "polaroid prints India", "photo prints online", 
    "custom gifts", "memory keepsakes", "The Craft Pallet", "handcrafted gifts"
  ],
  authors: [{ name: "The Craft Pallet" }],
  creator: "The Craft Pallet",
  publisher: "The Craft Pallet",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "./",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "The Craft Pallet",
    title: "The Craft Pallet — Personalised Gifts & Printing",
    description: "Transform your favourite memories into beautifully crafted keepsakes. Premium personalised polaroids, photo prints, and custom gifts.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "The Craft Pallet — Crafting Memories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Craft Pallet — Personalised Gifts & Printing",
    description: "Transform your memories into beautifully crafted keepsakes.",
    images: ["/images/og-default.jpg"],
  },
  icons: { 
    icon: "/images/craft-pallet-logo-icon.png", 
    shortcut: "/images/craft-pallet-logo-icon.png", 
    apple: "/images/craft-pallet-logo-icon.png", 
  }, 
}; 

export const viewport: Viewport = { 
  width: "device-width", 
  initialScale: 1, 
  maximumScale: 5,
  userScalable: true, 
}; 

export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode; 
}) { 
  return ( 
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans"> 
        <PreventZoom /> 
        <Navbar /> 
        <main className="flex-1">{children}</main> 
        <Footer /> 
      </body> 
    </html> 
  ); 
}