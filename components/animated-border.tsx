import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedBorder({ children, className }: Props) {
  return (
    <div className={cn("relative rounded-2xl p-px overflow-hidden", className)}>
      <span
        className="pointer-events-none absolute inset-[-1px] rounded-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,85,247,0.9), rgba(34,211,238,0.9), rgba(236,72,153,0.9), rgba(168,85,247,0.9))",
          animation: "border-spin 7s linear infinite",
        }}
      />
      <div className="relative rounded-2xl bg-ink-950">{children}</div>
    </div>
  );
}
