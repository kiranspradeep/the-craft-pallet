"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { cartApi } from "@/lib/cart";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    cartApi
      .getCart()
      .then((cart) => setCartCount(cart?.cart?.items?.length ?? 0))
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/#about", label: "About" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: scrolled ? "rgba(250,249,246,0.85)" : "var(--bg)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-soft)"
          : "1px solid transparent",
        transition: "all 300ms ease",
      }}
    >
      <div className="tcp-container">
        <div
          className="flex items-center justify-between"
          style={{ height: "80px" }}
        >
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              The Craft Pallet
            </span>
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginTop: "2px",
              }}
            >
              Personalised Gifts
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center" style={{ gap: "40px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  transition: "color 200ms",
                }}
                className="hover:text-[var(--brand)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Link
              href="/products"
              className="hidden md:flex items-center justify-center transition-colors"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                color: "var(--text-primary)",
              }}
            >
              <Search size={18} strokeWidth={1.75} />
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center justify-center transition-colors"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                color: "var(--text-primary)",
              }}
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: "6px",
                    right: "6px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: "var(--accent)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden flex items-center justify-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                color: "var(--text-primary)",
              }}
              onClick={() => setMenuOpen((v) => !v)}
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

      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            backgroundColor: "var(--surface)",
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          <div className="tcp-container" style={{ padding: "16px 32px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "14px 0",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}