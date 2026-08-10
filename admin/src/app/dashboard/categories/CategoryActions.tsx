"use client";

import { useState, useRef, useEffect } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
    <>
      <style>{`
        .action-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          transition: background-color 120ms ease;
          text-align: left;
          color: var(--text-primary);
        }
        .action-menu-item:hover {
          background-color: var(--bg-primary);
        }
        .action-menu-item-danger {
          color: #DC2626;
        }
        .action-menu-item-danger:hover {
          background-color: #FEF2F2;
        }
        .action-menu-item-success {
          color: var(--success);
        }
        .action-menu-item-success:hover {
          background-color: rgba(142,159,130,0.08);
        }
        .action-trigger:hover {
          background-color: var(--bg-primary);
        }
      `}</style>

      <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Actions"
          className="action-trigger"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "background-color 120ms ease",
          }}
        >
          <MoreHorizontal size={15} strokeWidth={1.75} />
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 50,
              width: "160px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "var(--shadow-md)",
              overflow: "hidden",
            }}
          >
            <Link
              href={`/dashboard/categories/${id}/edit`}
              className="action-menu-item"
              onClick={() => setOpen(false)}
            >
              <Pencil size={14} strokeWidth={1.75} />
              Edit
            </Link>

            <div
              style={{
                height: "1px",
                backgroundColor: "var(--border)",
                margin: "2px 0",
              }}
            />

            {isActive ? (
              <button
                disabled={loading}
                onClick={handleDelete}
                className="action-menu-item action-menu-item-danger"
              >
                <Trash2 size={14} strokeWidth={1.75} />
                {loading ? "Working..." : "Deactivate"}
              </button>
            ) : (
              <button
                disabled={loading}
                onClick={handleRestore}
                className="action-menu-item action-menu-item-success"
              >
                <RotateCcw size={14} strokeWidth={1.75} />
                {loading ? "Working..." : "Restore"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}