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
    <>
      <style>{`
        .prod-tab-bar {
          display: flex;
          gap: 2px;
          padding: 4px;
          border-radius: 8px;
          background-color: var(--bg-primary);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .prod-tab-bar::-webkit-scrollbar { display: none; }

        .prod-tab-btn {
          flex-shrink: 0;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .prod-tab-btn-active {
          background-color: var(--surface);
          color: var(--text-primary);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .prod-tab-btn-inactive {
          background-color: transparent;
          color: var(--text-secondary);
        }

        .prod-tab-btn-inactive:hover {
          color: var(--text-primary);
          background-color: rgba(255,255,255,0.5);
        }
      `}</style>

      <div style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Link href="/dashboard/products">
              <button
                aria-label="Back to products"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={15} strokeWidth={1.75} />
              </button>
            </Link>
            <div>
              <h1
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {currentProduct.name}
              </h1>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
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

        {/* Tab bar */}
        <div className="prod-tab-bar" style={{ marginBottom: "20px" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`prod-tab-btn ${
                activeTab === tab.id
                  ? "prod-tab-btn-active"
                  : "prod-tab-btn-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
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
    </>
  );
}