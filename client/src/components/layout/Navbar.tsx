"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { cartApi } from "@/lib/cart";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash || "");
    updateHash();

    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
  const loadCount = () => {
    cartApi
      .getCart()
      .then((cart) => setCartCount(cart?.cart?.items?.length ?? 0))
      .catch(() => {});
  };

  // Load on mount
  loadCount();

  // Reload when any cart mutation happens
  window.addEventListener("cart-updated", loadCount);
  return () => window.removeEventListener("cart-updated", loadCount);
}, []);

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/categories", label: "Collections" },
    { href: "/#about", label: "About" },
    { href: "/#faq", label: "FAQ" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/products") {
      return pathname === "/products" || pathname.startsWith("/products/");
    }

    if (href === "/categories") {
      return pathname === "/categories" || pathname.startsWith("/categories/");
    }

    if (href === "/#about") {
      return pathname === "/" && hash === "#about";
    }

    if (href === "/#faq") {
      return pathname === "/" && hash === "#faq";
    }

    return pathname === href;
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled
          ? "rgba(250,249,246,0.92)"
          : "var(--bg)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-soft)"
          : "1px solid transparent",
        transition: "all 300ms ease",
      }}
    >
      <div className="tcp-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.2,
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              The Craft Pallet
            </span>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginTop: "1px",
              }}
            >
              Personalised Gifts
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center"
            style={{ gap: "36px" }}
          >
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    position: "relative",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                    color: active
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    letterSpacing: "0.02em",
                    transition: "color 200ms ease",
                    paddingBottom: "4px",
                    borderBottom: active
                      ? "1px solid var(--text-primary)"
                      : "1px solid transparent",
                  }}
                  className="hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* <Link
              href="/products"
              aria-label="Search products"
              className="hidden md:flex hover:text-[var(--text-primary)]"
              style={{
                width: "40px",
                height: "40px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                transition: "color 200ms ease",
              }}
            >
              <Search size={18} strokeWidth={1.75} />
            </Link> */}

            <Link
              href="/cart"
              aria-label="Open shopping bag"
              className="flex hover:text-[var(--text-primary)]"
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                transition: "color 200ms ease",
              }}
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "7px",
                    right: "7px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "999px",
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex md:hidden hover:text-[var(--text-primary)]"
              style={{
                width: "40px",
                height: "40px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                transition: "color 200ms ease",
              }}
            >
              {menuOpen ? (
                <X size={20} strokeWidth={1.75} />
              ) : (
                <Menu size={20} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            backgroundColor: "var(--surface)",
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          <div
            className="tcp-container"
            style={{ paddingTop: "8px", paddingBottom: "20px" }}
          >
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "13px 0",
                    fontSize: "14px",
                    fontWeight: active ? 600 : 500,
                    color: active
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}