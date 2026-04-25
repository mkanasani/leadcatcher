import { GlowCard } from "./glow-card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  glow?: "violet" | "cyan" | "magenta" | "lime";
  icon?: React.ReactNode;
};

export function StatCard({ label, value, hint, glow, icon }: Props) {
  return (
    <GlowCard glow={glow}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-glow">{value}</div>
          {hint && <div className="mt-2 text-sm text-white/55">{hint}</div>}
        </div>
        {icon && (
          <div className={cn("rounded-xl border border-white/10 bg-white/5 p-2 text-white/70")}>
            {icon}
          </div>
        )}
      </div>
    </GlowCard>
  );
}
