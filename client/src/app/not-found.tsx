import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div 
      style={{ 
        backgroundColor: "var(--bg)", 
        minHeight: "70vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "40px 20px" 
      }}
    >
      <div 
        style={{ 
          maxWidth: "480px", 
          textAlign: "center", 
          padding: "40px 24px", 
          backgroundColor: "var(--surface)", 
          border: "1px solid var(--border-soft)", 
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <p className="tcp-eyebrow" style={{ marginBottom: "12px" }}>Error 404</p>
        <h1 
          style={{ 
            fontFamily: "var(--font-playfair), serif", 
            fontSize: "clamp(28px, 4vw, 38px)", 
            color: "var(--text-primary)", 
            marginBottom: "16px",
            lineHeight: 1.2
          }}
        >
          Page Not{" "}
          <em style={{ fontStyle: "italic", color: "var(--brand)", fontWeight: 500 }}>Found</em>
        </h1>
        <p 
          style={{ 
            fontSize: "14px", 
            color: "var(--text-secondary)", 
            lineHeight: 1.6, 
            marginBottom: "32px" 
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
        </p>

        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "12px" 
          }}
        >
          <Link href="/products" className="btn-primary" style={{ width: "100%" }}>
            <ShoppingBag size={15} />
            Browse Collections
          </Link>
          <Link href="/" className="btn-secondary" style={{ width: "100%" }}>
            <Home size={15} />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}