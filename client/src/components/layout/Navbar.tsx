

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <Image
              src="/images/craft-pallet-logo-horizontal.svg"
              alt="The Craft Pallet"
              width={160}
              height={40}
              priority
              style={{
                height: "68px",
                width: "auto",
                objectFit: "contain",
              }}
            />
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



// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { ShoppingBag, Menu, X } from "lucide-react";
// import { cartApi } from "@/lib/cart";

// export default function Navbar() {
//   const pathname = usePathname();

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [cartCount, setCartCount] = useState(0);
//   const [scrolled, setScrolled] = useState(false);
//   const [hash, setHash] = useState("");

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 24);
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     const updateHash = () => setHash(window.location.hash || "");
//     updateHash();

//     window.addEventListener("hashchange", updateHash);
//     return () => window.removeEventListener("hashchange", updateHash);
//   }, []);

//   useEffect(() => {
//     const loadCount = () => {
//       cartApi
//         .getCart()
//         .then((cart) => setCartCount(cart?.cart?.items?.length ?? 0))
//         .catch(() => {});
//     };

//     // Load on mount
//     loadCount();

//     // Reload when any cart mutation happens
//     window.addEventListener("cart-updated", loadCount);
//     return () => window.removeEventListener("cart-updated", loadCount);
//   }, []);

//   const navLinks = [
//     { href: "/products", label: "Shop" },
//     { href: "/categories", label: "Collections" },
//     { href: "/#about", label: "About" },
//     { href: "/#faq", label: "FAQ" },
//   ];

//   const isActiveLink = (href: string) => {
//     if (href === "/products") {
//       return pathname === "/products" || pathname.startsWith("/products/");
//     }

//     if (href === "/categories") {
//       return pathname === "/categories" || pathname.startsWith("/categories/");
//     }

//     if (href === "/#about") {
//       return pathname === "/" && hash === "#about";
//     }

//     if (href === "/#faq") {
//       return pathname === "/" && hash === "#faq";
//     }

//     return pathname === href;
//   };

//   return (
//     <>
//       {/* Responsive variables injected directly to keep clean modular breakpoints */}
//       <style>{`
//         :root {
//           --nav-height-mobile: 68px;
//           --nav-height-desktop: 92px;
//           --logo-height-mobile: 48px;
//           --logo-height-desktop: 68px;
//         }
//         .tcp-navbar {
//           height: var(--nav-height-mobile);
//         }
//         .tcp-logo {
//           height: var(--logo-height-mobile);
//         }
//         @media (min-width: 768px) {
//           .tcp-navbar {
//             height: var(--nav-height-desktop);
//           }
//           .tcp-logo {
//             height: var(--logo-height-desktop);
//           }
//         }
//       `}</style>

//       <header
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 50,
//           backgroundColor: scrolled
//             ? "rgba(250, 249, 246, 0.95)"
//             : "var(--bg)",
//           backdropFilter: scrolled ? "blur(12px)" : "none",
//           borderBottom: scrolled
//             ? "1px solid var(--border-soft)"
//             : "1px solid transparent",
//           transition: "all 300ms ease-out",
//         }}
//       >
//         <div className="tcp-container">
//           <div
//             className="tcp-navbar"
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               transition: "height 300ms ease-out",
//             }}
//           >
//             {/* Logo Wrapper */}
//             <Link
//               href="/"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 textDecoration: "none",
//               }}
//             >
//               <Image
//                 src="/images/craft-pallet-logo-horizontal.svg"
//                 alt="The Craft Pallet"
//                 width={220}
//                 height={68}
//                 priority
//                 className="tcp-logo"
//                 style={{
//                   width: "auto",
//                   objectFit: "contain",
//                   transition: "height 300ms ease-out",
//                 }}
//               />
//             </Link>

//             {/* Desktop Navigation */}
//             <nav
//               className="hidden md:flex items-center"
//               style={{ gap: "40px" }}
//             >
//               {navLinks.map((link) => {
//                 const active = isActiveLink(link.href);

//                 return (
//                   <Link
//                     key={link.href}
//                     href={link.href}
//                     aria-current={active ? "page" : undefined}
//                     style={{
//                       position: "relative",
//                       fontSize: "13px",
//                       fontWeight: active ? 600 : 500,
//                       color: active
//                         ? "var(--text-primary)"
//                         : "var(--text-secondary)",
//                       letterSpacing: "0.03em",
//                       transition: "color 200ms ease",
//                       paddingBottom: "4px",
//                       borderBottom: active
//                         ? "2px solid var(--text-primary)"
//                         : "2px solid transparent",
//                     }}
//                     className="hover:text-[var(--text-primary)]"
//                   >
//                     {link.label}
//                   </Link>
//                 );
//               })}
//             </nav>

//             {/* Action Buttons */}
//             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//               <Link
//                 href="/cart"
//                 aria-label="Open shopping bag"
//                 className="flex hover:text-[var(--text-primary)]"
//                 style={{
//                   position: "relative",
//                   width: "44px",
//                   height: "44px",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   borderRadius: "50%",
//                   color: "var(--text-secondary)",
//                   transition: "color 200ms ease, background-color 200ms ease",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.backgroundColor = "var(--brand-soft)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.backgroundColor = "transparent";
//                 }}
//               >
//                 <ShoppingBag size={20} strokeWidth={1.75} />
//                 {cartCount > 0 && (
//                   <span
//                     style={{
//                       position: "absolute",
//                       top: "6px",
//                       right: "6px",
//                       width: "18px",
//                       height: "18px",
//                       borderRadius: "50%",
//                       fontSize: "10px",
//                       fontWeight: 600,
//                       color: "#fff",
//                       backgroundColor: "var(--text-primary)",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       animation: "pulse-soft 2s infinite ease-in-out",
//                     }}
//                   >
//                     {cartCount}
//                   </span>
//                 )}
//               </Link>

//               <button
//                 aria-label={menuOpen ? "Close menu" : "Open menu"}
//                 onClick={() => setMenuOpen((v) => !v)}
//                 className="flex md:hidden hover:text-[var(--text-primary)]"
//                 style={{
//                   width: "44px",
//                   height: "44px",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   borderRadius: "50%",
//                   color: "var(--text-secondary)",
//                   transition: "color 200ms ease, background-color 200ms ease",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.backgroundColor = "var(--brand-soft)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.backgroundColor = "transparent";
//                 }}
//               >
//                 {menuOpen ? (
//                   <X size={22} strokeWidth={1.75} />
//                 ) : (
//                   <Menu size={22} strokeWidth={1.75} />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Flyout Menu */}
//         {menuOpen && (
//           <div
//             className="md:hidden animate-fade-in"
//             style={{
//               backgroundColor: "var(--surface)",
//               borderTop: "1px solid var(--border-soft)",
//               boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
//             }}
//           >
//             <div
//               className="tcp-container"
//               style={{ paddingTop: "12px", paddingBottom: "24px" }}
//             >
//               {navLinks.map((link) => {
//                 const active = isActiveLink(link.href);

//                 return (
//                   <Link
//                     key={link.href}
//                     href={link.href}
//                     aria-current={active ? "page" : undefined}
//                     onClick={() => setMenuOpen(false)}
//                     style={{
//                       display: "block",
//                       padding: "14px 0",
//                       fontSize: "15px",
//                       fontWeight: active ? 600 : 500,
//                       color: active
//                         ? "var(--text-primary)"
//                         : "var(--text-secondary)",
//                       borderBottom: "1px solid var(--border-soft)",
//                       transition: "padding-left 200ms ease",
//                     }}
//                     className="hover:pl-2"
//                   >
//                     {link.label}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </header>
//     </>
//   );
// }


