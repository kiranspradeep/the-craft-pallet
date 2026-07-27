import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = "", ...props }, ref) => {
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
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-[14px] text-sm outline-none transition-all ${className}`}
          style={{
            border: `1px solid ${error ? "#DC2626" : "var(--border)"}`,
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => {
            (e.target as HTMLElement).style.borderColor = error
              ? "#DC2626"
              : "var(--brand)";
          }}
          onBlur={(e) => {
            (e.target as HTMLElement).style.borderColor = error
              ? "#DC2626"
              : "var(--border)";
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: "#DC2626" }}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;