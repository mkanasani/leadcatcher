import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60_000);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  const future = diff > 0;
  if (mins < 60) return future ? `in ${mins}m` : `${mins}m ago`;
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`;
  return future ? `in ${days}d` : `${days}d ago`;
}

export function formatOffset(minutes: number, anchor: "appointment" | "signup") {
  const abs = Math.abs(minutes);
  const hours = abs / 60;
  const days = hours / 24;
  const unit =
    days >= 1 && Number.isInteger(days)
      ? `${days}d`
      : hours >= 1 && Number.isInteger(hours)
        ? `${hours}h`
        : `${abs}m`;
  if (anchor === "appointment") {
    return minutes < 0 ? `${unit} before call` : `${unit} after call`;
  }
  return `${unit} after signup`;
}
