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
        padding: "48px 0",
        borderTop: "1px solid var(--border-soft)",
        borderBottom: "1px solid var(--border-soft)",
        backgroundColor: "var(--bg)",
      }}
    >
      <div className="tcp-container">
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "24px",
          }}
        >
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center"
              style={{ gap: "10px" }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                style={{ color: "var(--brand)" }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  letterSpacing: "0.01em",
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