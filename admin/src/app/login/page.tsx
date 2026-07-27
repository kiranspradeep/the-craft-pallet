"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <span className="text-white text-xl font-bold">CP</span>
          </div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            The Craft Pallet
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-sm border"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Sign in to your account
          </h2>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                border: "1px solid #FECACA",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="admin@craftpallet.com"
                  className="w-full pl-10 pr-4 py-3 rounded-[14px] text-sm outline-none transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--brand)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border)")
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-[14px] text-sm outline-none transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--brand)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[12px] text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              style={{
                backgroundColor: loading
                  ? "var(--text-secondary)"
                  : "var(--accent)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.target as HTMLElement).style.backgroundColor =
                    "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.target as HTMLElement).style.backgroundColor =
                    "var(--accent)";
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}