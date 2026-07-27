import SettingsGrid from "./SettingsGrid";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your store configuration
        </p>
      </div>
      <SettingsGrid />
    </div>
  );
}