"use client";

import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: {
    bg: "var(--accent)",
    color: "#fff",
    hoverBg: "var(--accent-hover)",
    border: "transparent",
  },
  secondary: {
    bg: "transparent",
    color: "var(--brand)",
    hoverBg: "rgba(166,138,117,0.08)",
    border: "var(--brand)",
  },
  ghost: {
    bg: "transparent",
    color: "var(--text-secondary)",
    hoverBg: "var(--bg-primary)",
    border: "transparent",
  },
  danger: {
    bg: "transparent",
    color: "#DC2626",
    hoverBg: "rgba(220,38,38,0.08)",
    border: "#DC2626",
  },
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-[10px]",
  md: "px-4 py-2 text-sm rounded-[12px]",
  lg: "px-6 py-3 text-sm rounded-[12px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const v = variants[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium border transition-all duration-200 ${sizes[size]}`}
      style={{
        backgroundColor: v.bg,
        color: disabled || loading ? "var(--text-secondary)" : v.color,
        borderColor: v.border,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLElement).style.backgroundColor = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLElement).style.backgroundColor = v.bg;
      }}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}