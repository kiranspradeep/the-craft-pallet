interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  helpText?: string;
}

export default function Toggle({
  label,
  checked,
  onChange,
  helpText,
}: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className="w-10 h-5 rounded-full transition-all duration-200"
          style={{
            backgroundColor: checked ? "var(--brand)" : "var(--border)",
          }}
        />
        <div
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        {helpText && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {helpText}
          </p>
        )}
      </div>
    </label>
  );
}