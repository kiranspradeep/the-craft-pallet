import { Heart, Package, Sparkles, Truck, Award } from "lucide-react";

const items = [
  { icon: Heart, label: "Handmade with Love" },
  { icon: Award, label: "Premium Materials" },
  { icon: Sparkles, label: "Personalised" },
  { icon: Package, label: "Secure Packaging" },
  { icon: Truck, label: "Fast Delivery" },
];

export default function TrustBar() {
  return (
    <section
      style={{
        padding: "40px 0",
        borderTop: "1px solid var(--border-soft)",
        borderBottom: "1px solid var(--border-soft)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="tcp-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "20px",
          }}
        >
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <Icon
                size={16}
                strokeWidth={1.5}
                style={{ color: "var(--brand)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}