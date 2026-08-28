"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919746292208"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "12px 20px",
        borderRadius: "var(--radius-btn)",
        backgroundColor: "#25D366",
        color: "#fff",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.03em",
        boxShadow: "var(--shadow-md)",
        transition: "transform 250ms ease, box-shadow 250ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
      }}
    >
      <MessageCircle size={16} strokeWidth={1.75} />
      <span className="hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}