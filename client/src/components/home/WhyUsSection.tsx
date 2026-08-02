import { Shield, Clock, Heart, Truck } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Made With Love",
    description:
      "Every order is personally crafted with attention to detail and care.",
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description:
      "High-quality photo paper, vibrant colours, and lasting finishes.",
  },
  {
    icon: Clock,
    title: "7–10 Day Delivery",
    description:
      "Fast production and reliable delivery to your doorstep.",
  },
  {
    icon: Truck,
    title: "Pan India Delivery",
    description:
      "We deliver across India with secure and tracked shipping.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="section" style={{ backgroundColor: "var(--bg)" }}>
      <div className="tcp-container">
        <div className="text-center mb-12">
          <p
            className="text-sm font-medium uppercase tracking-widest mb-2"
            style={{ color: "var(--brand)" }}
          >
            Why Us
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Why Choose The Craft Pallet
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-[20px] border transition-shadow hover:shadow-md"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(166,138,117,0.1)" }}
              >
                <feature.icon
                  size={24}
                  strokeWidth={1.75}
                  style={{ color: "var(--brand)" }}
                />
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}