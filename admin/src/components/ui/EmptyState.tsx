import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 opacity-30"
        style={{ color: "var(--text-secondary)" }}
      >
        {icon}
      </div>
      <h3
        className="text-base font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm mt-1 max-w-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}