"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Users, Workflow, Webhook, Settings, Sparkles, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/sequences", label: "Sequences", icon: Workflow },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-white/5 bg-ink-950/70 px-4 py-6 backdrop-blur-xl">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-ink-950 shadow-[0_0_24px_-4px_rgba(168,85,247,0.8)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight shimmer-text">LeadCatcher</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                active
                  ? "bg-white/10 text-white shadow-[inset_0_0_20px_-8px_rgba(168,85,247,0.6)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
              )}
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
