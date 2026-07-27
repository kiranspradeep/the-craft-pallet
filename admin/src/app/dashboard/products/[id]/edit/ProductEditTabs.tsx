"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import GeneralTab from "./tabs/GeneralTab";
import ImagesTab from "./tabs/ImagesTab";
import VariantsTab from "./tabs/VariantsTab";
import PricingTab from "./tabs/PricingTab";
import ConfigurationTab from "./tabs/ConfigurationTab";
import CustomFieldsTab from "./tabs/CustomFieldsTab";

const TABS = [
  { id: "general", label: "General" },
  { id: "images", label: "Images" },
  { id: "variants", label: "Variants" },
  { id: "pricing", label: "Pricing" },
  { id: "configuration", label: "Configuration" },
  { id: "customFields", label: "Custom Fields" },
];

interface Props {
  product: any;
  categories: { id: string; name: string }[];
}

export default function ProductEditTabs({ product, categories }: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const [currentProduct, setCurrentProduct] = useState(product);

  const refresh = (updated: any) => setCurrentProduct(updated);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products">
            <button
              className="p-2 rounded-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {currentProduct.name}
            </h1>
            <p
              className="text-sm font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              {currentProduct.slug}
            </p>
          </div>
        </div>
        <Badge
          label={currentProduct.isActive ? "Active" : "Inactive"}
          variant={currentProduct.isActive ? "success" : "neutral"}
        />
      </div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor:
                activeTab === tab.id ? "var(--surface)" : "transparent",
              color:
                activeTab === tab.id
                  ? "var(--brand)"
                  : "var(--text-secondary)",
              boxShadow:
                activeTab === tab.id
                  ? "0 2px 8px rgba(0,0,0,0.06)"
                  : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "general" && (
          <GeneralTab
            product={currentProduct}
            categories={categories}
            onUpdate={refresh}
          />
        )}
        {activeTab === "images" && (
          <ImagesTab product={currentProduct} onUpdate={refresh} />
        )}
        {activeTab === "variants" && (
          <VariantsTab product={currentProduct} onUpdate={refresh} />
        )}
        {activeTab === "pricing" && (
          <PricingTab product={currentProduct} onUpdate={refresh} />
        )}
        {activeTab === "configuration" && (
          <ConfigurationTab product={currentProduct} onUpdate={refresh} />
        )}
        {activeTab === "customFields" && (
          <CustomFieldsTab product={currentProduct} onUpdate={refresh} />
        )}
      </div>
    </div>
  );
}