"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
}: {
  categories: Category[];
  currentCategory: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", search.trim() || null);
  };

  return (
    <div>
      {/* Search */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
          }}
        >
          <Search size={16} strokeWidth={1.75} style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
              backgroundColor: "transparent",
              color: "var(--text-primary)",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateParam("search", null);
              }}
              style={{ color: "var(--text-tertiary)" }}
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </form>

      {/* Category chips */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <CategoryChip
          label="All Products"
          active={!currentCategory}
          onClick={() => updateParam("category", null)}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            active={currentCategory === cat.slug}
            onClick={() => updateParam("category", cat.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 500,
        border: active
          ? "1px solid var(--text-primary)"
          : "1px solid var(--border)",
        backgroundColor: active ? "var(--text-primary)" : "var(--surface)",
        color: active ? "#fff" : "var(--text-primary)",
        transition: "all 200ms ease",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}