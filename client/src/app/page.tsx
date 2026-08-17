//client\src\app\page.tsx
import { apiGet, apiGetList } from "@/lib/api";
import HeroSection from "@/components/home/HeroSection";
import BestSellersSection from "@/components/home/BestSellersSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedStory from "@/components/home/FeaturedStory";
import TrustBar from "@/components/home/TrustBar";
import FaqSection from "@/components/home/FaqSection";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

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

  return (
    <>
      {/* 1. Brand statement + immediate shop CTA */}
      <HeroSection />

      {/* 2. Products first — people came to see what you sell */}
      <BestSellersSection products={featuredProducts} />

      {/* 3. Help them browse by category */}
      <CategoriesSection categories={categories} />

      {/* 4. Brand story — build emotional connection after product interest */}
      <FeaturedStory />

      {/* 5. Reassurance — reinforce quality before objections */}
      <TrustBar />

      {/* 6. Answer final objections */}
      <FaqSection />

      {/* 7. Always available */}
      <WhatsAppButton />
    </>
  );
}