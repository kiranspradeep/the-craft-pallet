import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            className="block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {label}
            {props.required && (
              <span style={{ color: "var(--accent)" }}> *</span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className="w-full px-3.5 py-2.5 rounded-[14px] text-sm outline-none transition-all appearance-none"
            style={{
              border: `1px solid ${error ? "#DC2626" : "var(--border)"}`,
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>
        {error && (
          <p className="text-xs" style={{ color: "#DC2626" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;