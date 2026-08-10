"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  thumbnail: { url: string; altText: string | null } | null;
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with URL param changes
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/products?search=${encodeURIComponent(query.trim())}&limit=5`,
        { cache: "no-store" }
      );
      const json = await res.json();
      const results: Suggestion[] = (json.data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        thumbnail: p.thumbnail ?? null,
      }));
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  // Live filter + suggestions as user types
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setActiveSuggestion(-1);

    // Fetch suggestions with short debounce (250ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);

    // Apply live filter to product grid with longer debounce (500ms)
    if (liveSearchRef.current) clearTimeout(liveSearchRef.current);
    liveSearchRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("search", value.trim());
      else params.delete("search");
      router.push(`/products?${params.toString()}`);
    }, 500);
  };

  const handleClear = () => {
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (liveSearchRef.current) clearTimeout(liveSearchRef.current);
    updateParam("search", null);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearch(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveSuggestion(-1);

    const params = new URLSearchParams(searchParams.toString());
    params.set("search", suggestion.name);
    router.push(`/products?${params.toString()}`);
  };

  // Keyboard navigation through suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  // Highlight matched portion of suggestion
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          {text.slice(idx, idx + query.trim().length)}
        </strong>
        {text.slice(idx + query.trim().length)}
      </>
    );
  };

  return (
    <div>
      {/* Search */}
      <div ref={searchRef} style={{ position: "relative", marginBottom: "20px" }}>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "var(--surface)",
    border: `1px solid ${showSuggestions ? "var(--brand)" : "var(--border)"}`,
    borderRadius: showSuggestions
      ? `var(--radius-input) var(--radius-input) 0 0`
      : "var(--radius-input)",
    transition: "border-color 200ms ease",
  }}
  onFocusCapture={() => {
    if (suggestions.length > 0) setShowSuggestions(true);
  }}
>
          {suggestionsLoading ? (
            <Loader2
              size={15}
              strokeWidth={1.75}
              style={{
                color: "var(--text-tertiary)",
                flexShrink: 0,
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <Search
              size={15}
              strokeWidth={1.75}
              style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
            />
          )}

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "13px",
              backgroundColor: "transparent",
              color: "var(--text-primary)",
            }}
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleClear}
              style={{
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                transition: "color 200ms ease",
                flexShrink: 0,
              }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 40,
              backgroundColor: "var(--surface)",
              border: "1px solid var(--brand)",
              borderTop: "1px solid var(--border-soft)",
              borderRadius: `0 0 var(--radius-input) var(--radius-input)`,
              overflow: "hidden",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                onMouseDown={(e) => {
                  // Use mousedown to fire before blur
                  e.preventDefault();
                  handleSuggestionClick(s);
                }}
                onMouseEnter={() => setActiveSuggestion(i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 16px",
                  textAlign: "left",
                  backgroundColor:
                    activeSuggestion === i
                      ? "var(--brand-soft)"
                      : "transparent",
                  borderBottom:
                    i < suggestions.length - 1
                      ? "1px solid var(--border-soft)"
                      : "none",
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-input)",
                    overflow: "hidden",
                    backgroundColor: "var(--brand-soft)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.thumbnail ? (
                    <img
                      src={s.thumbnail.url}
                      alt={s.thumbnail.altText || s.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Search
                      size={14}
                      strokeWidth={1.5}
                      style={{ color: "var(--border)", opacity: 0.5 }}
                    />
                  )}
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {highlightMatch(s.name, search)}
                </span>
              </button>
            ))}

            {/* View all results */}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setShowSuggestions(false);
                const params = new URLSearchParams(searchParams.toString());
                if (search.trim()) params.set("search", search.trim());
                router.push(`/products?${params.toString()}`);
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--brand)",
                backgroundColor: "var(--brand-soft)",
                cursor: "pointer",
                transition: "background-color 150ms ease",
                gap: "6px",
              }}
            >
              <Search size={11} strokeWidth={2} />
              View all results for &ldquo;{search}&rdquo;
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <FilterChip
          label="All"
          active={!currentCategory}
          onClick={() => updateParam("category", null)}
        />
        {categories.map((cat) => (
          <FilterChip
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

function FilterChip({
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
        padding: "8px 16px",
        borderRadius: "var(--radius-badge)",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "0.03em",
        border: active
          ? "1px solid var(--text-primary)"
          : "1px solid var(--border)",
        backgroundColor: active ? "var(--text-primary)" : "transparent",
        color: active ? "#fff" : "var(--text-secondary)",
        transition: "all 200ms ease",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}