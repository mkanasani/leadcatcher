"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedBorder } from "./animated-border";
import { Sparkles } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setErr(data.error ?? "Login failed");
    }
  }

  return (
    <main className="bg-grid relative grid min-h-screen place-items-center overflow-hidden p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-ink-950 shadow-[0_0_30px_-6px_rgba(168,85,247,0.9)]">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-center text-3xl font-semibold tracking-tight shimmer-text">
          Enter LeadCatcher
        </h1>
        <p className="mt-2 text-center text-sm text-white/55">
          Use the password you set during onboarding.
        </p>

        <AnimatedBorder className="mt-8">
          <form onSubmit={submit} className="space-y-4 p-6">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-white/55">Password</span>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none transition-all focus:border-violet-400 focus:shadow-[0_0_20px_-4px_rgba(168,85,247,0.6)]"
              />
            </label>
            {err && <div className="text-sm text-pink-400">{err}</div>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-medium text-ink-950 shadow-[0_0_30px_-8px_rgba(168,85,247,0.8)] transition-all hover:shadow-[0_0_40px_-6px_rgba(168,85,247,1)] disabled:opacity-50"
            >
              {loading ? "..." : "Unlock"}
            </button>
          </form>
        </AnimatedBorder>
      </div>
    </main>
  );
}
