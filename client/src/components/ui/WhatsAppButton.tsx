"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918086415357"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 20px",
        borderRadius: "999px",
        backgroundColor: "#25D366",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 12px 32px rgba(37, 211, 102, 0.35)",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 16px 40px rgba(37, 211, 102, 0.45)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 32px rgba(37, 211, 102, 0.35)";
      }}
    >
      <MessageCircle size={18} strokeWidth={1.75} />
      <span className="hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}