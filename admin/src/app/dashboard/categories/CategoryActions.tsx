//admin\src\app\dashboard\categories\CategoryActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, RotateCcw, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface Props {
  id: string;
  isActive: boolean;
}

export default function CategoryActions({ id, isActive }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Deactivate this category?")) return;
    setLoading(true);
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const handleRestore = async () => {
    setLoading(true);
    await fetch(`/api/admin/categories/${id}/restore`, { method: "PATCH" });
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--bg-primary)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.backgroundColor =
            "transparent")
        }
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-20 w-40 rounded-xl border shadow-lg overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
            }}
          >
            <Link
              href={`/dashboard/categories/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--bg-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent")
              }
              onClick={() => setOpen(false)}
            >
              <Pencil size={14} />
              Edit
            </Link>

            {isActive ? (
              <button
                disabled={loading}
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2.5 text-sm w-full transition-colors"
                style={{ color: "#DC2626" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(220,38,38,0.06)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent")
                }
              >
                <Trash2 size={14} />
                Deactivate
              </button>
            ) : (
              <button
                disabled={loading}
                onClick={handleRestore}
                className="flex items-center gap-2 px-4 py-2.5 text-sm w-full transition-colors"
                style={{ color: "var(--success)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(142,159,130,0.08)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent")
                }
              >
                <RotateCcw size={14} />
                Restore
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}