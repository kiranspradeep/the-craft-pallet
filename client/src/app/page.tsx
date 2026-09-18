import type { Metadata } from "next";
import { apiGet, apiGetList } from "@/lib/api";
import HeroSection from "@/components/home/HeroSection";
import BestSellersSection from "@/components/home/BestSellersSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedStory from "@/components/home/FeaturedStory";
import TrustBar from "@/components/home/TrustBar";
import FaqSection from "@/components/home/FaqSection";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

// ── Next.js SEO Metadata Configuration ───────────────────────────────────────
export const metadata: Metadata = {
  title: "The Craft Pallet | Personalised Gifts, Photo Prints & Polaroids",
  description:
    "Transform your favourite memories into beautifully crafted keepsakes. Premium personalised polaroids, photo prints, and custom gifts.",
  alternates: {
    canonical: "https://craftpallet.com",
  },
  openGraph: {
    title: "The Craft Pallet | Personalised Gifts & Keepsakes",
    description:
      "Transform your favourite memories into beautifully crafted keepsakes. Premium personalised polaroids, photo prints, and custom gifts.",
    url: "https://craftpallet.com",
    siteName: "The Craft Pallet",
    type: "website",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "The Craft Pallet — Crafting Memories",
      },
    ],
  },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  thumbnail: { url: string; altText: string | null } | null;
  pricingConfig: {
    strategy: string;
    unitPrice: string | null;
    incrementPrice: string | null;
    incrementQuantity: number | null;
    baseUnitPrice: string | null;
    tiers: {
      quantity: number;
      price: string;
      label: string | null;
      isSpecialOffer: boolean;
    }[];
  } | null;
  variants: { id: string; name: string; price: string }[];
}

async function getHomeData() {
  try {
    const [categoriesRes, productsRes] = await Promise.allSettled([
      apiGet<Category[]>("/api/categories"),
      apiGetList<Product>("/api/products?featured=true&limit=8"),
    ]);

    const categories =
      categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)
        ? categoriesRes.value
        : [];

    const featuredProducts =
      productsRes.status === "fulfilled" ? productsRes.value.data : [];

    return { categories, featuredProducts };
  } catch {
    return { categories: [], featuredProducts: [] };
  }
}

export default async function HomePage() {
  const { categories, featuredProducts } = await getHomeData();

  // Structured Data linking your Brand, Store, and official Instagram handle
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": "https://craftpallet.com/#organization",
    name: "The Craft Pallet",
    url: "https://craftpallet.com",
    logo: "https://craftpallet.com/images/craft-pallet-logo-icon.png",
    image: "https://craftpallet.com/images/craft-pallet-logo-horizontal.svg",
    description:
      "Premium personalised polaroids, photo prints, custom frames, and memory keepsakes crafted in India.",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
    priceRange: "₹",
    telephone: "+919746292208",
    sameAs: [
      "https://www.instagram.com/craft.pallet_/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-97462-92208",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "ml", "hi"],
    },
  };

  return (
    <>
      {/* Organization / OnlineStore structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* 1. Brand statement + immediate shop CTA */}
      <HeroSection />

      {/* 2. Products first — people came to see what you sell */}
      <BestSellersSection products={featuredProducts} />

      {/* 3. Help them browse by category */}
      <CategoriesSection categories={categories} />

      {/* 4. Brand story */}
      <FeaturedStory />

      {/* 5. Reassurance */}
      <TrustBar />

      {/* 6. Answer final objections */}
      <FaqSection />

      {/* 7. Always available */}
      <WhatsAppButton />
    </>
  );
}