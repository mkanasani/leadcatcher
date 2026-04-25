"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg border border-white/10 bg-ink-950/80 px-3 py-2 font-mono text-xs text-cyan-200">
        {value}
      </code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all hover:border-violet-400/50 hover:text-white hover:shadow-[0_0_20px_-6px_rgba(168,85,247,0.7)]"
      >
        {copied ? <Check className="h-4 w-4 text-lime-300" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
