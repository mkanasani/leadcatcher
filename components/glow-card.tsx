"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  glow?: "violet" | "cyan" | "magenta" | "lime";
};

const glowMap = {
  violet: "rgba(168,85,247,0.55)",
  cyan: "rgba(34,211,238,0.55)",
  magenta: "rgba(236,72,153,0.55)",
  lime: "rgba(163,230,53,0.55)",
};

export function GlowCard({ children, className, glow = "violet" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-6 backdrop-blur-xl transition-shadow duration-300",
        hover && "shadow-[0_0_60px_-10px_rgba(168,85,247,0.45)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${glowMap[glow]}, transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
