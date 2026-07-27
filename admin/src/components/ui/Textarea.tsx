import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, ...props }, ref) => {
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
        <textarea
          ref={ref}
          rows={4}
          className="w-full px-3.5 py-2.5 rounded-[14px] text-sm outline-none transition-all resize-none"
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

Textarea.displayName = "Textarea";
export default Textarea;