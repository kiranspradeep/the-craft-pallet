interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "neutral" | "brand";
}

const variants = {
  success: { bg: "rgba(142,159,130,0.15)", color: "#5A7A52" },
  warning: { bg: "rgba(201,108,74,0.12)", color: "#C96C4A" },
  error: { bg: "rgba(220,38,38,0.1)", color: "#DC2626" },
  neutral: { bg: "rgba(166,138,117,0.12)", color: "#A68A75" },
  brand: { bg: "rgba(166,138,117,0.12)", color: "#A68A75" },
};

export default function Badge({ label, variant = "neutral" }: BadgeProps) {
  const v = variants[variant];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: v.bg, color: v.color }}
    >
      {label}
    </span>
  );
}