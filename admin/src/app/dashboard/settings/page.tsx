// settings/page.tsx

import SettingsGrid from "./SettingsGrid";

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: "4px",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          Manage your store configuration
        </p>
      </div>
      <SettingsGrid />
    </div>
  );
}