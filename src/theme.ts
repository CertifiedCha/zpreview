import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ShellVariant, ThemeId, ThemeTokens } from "./types";

export const themes: Record<ThemeId, ThemeTokens> = {
  "up-red": {
    id: "up-red",
    name: "UP Red",
    primary: "#b91c1c",
    shadow: "#7f1d1d",
    accent: "#ef4444",
    bgLight: "#fef2f2",
    borderLight: "#fca5a5",
    bgHover: "#fee2e2",
  },
  "brilliant-blue": {
    id: "brilliant-blue",
    name: "Brilliant Blue",
    primary: "#2563eb",
    shadow: "#1e3a8a",
    accent: "#3b82f6",
    bgLight: "#eff6ff",
    borderLight: "#bfdbfe",
    bgHover: "#dbeafe",
  },
  "eco-green": {
    id: "eco-green",
    name: "Eco Green",
    primary: "#16a34a",
    shadow: "#14532d",
    accent: "#22c55e",
    bgLight: "#f0fdf4",
    borderLight: "#bbf7d0",
    bgHover: "#dcfce7",
  },
  "space-dark": {
    id: "space-dark",
    name: "Space Dark",
    primary: "#18181b",
    shadow: "#09090b",
    accent: "#71717a",
    bgLight: "#f4f4f5",
    borderLight: "#e4e4e7",
    bgHover: "#e4e4e7",
  },
};

export const categoryColors = {
  text: "#2563eb",
  content: "#0f766e",
  data: "#64748b",
  math: "#7c3aed",
  multimedia: "#0891b2",
  layout: "#9333ea",
  assessment: "#ea580c",
  gamified: "#7c3aed",
  interaction: "#16a34a",
  tools: "#475569",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shellClass(variant: ShellVariant | "standard" | "compact" = "plain") {
  if (variant === "card" || variant === "compact") {
    return "rounded-[20px] border-2 border-zinc-200 bg-white p-5 shadow-[0_3px_0_#d4d4d8]";
  }

  if (variant === "tinted") {
    return "rounded-[20px] border-2 border-zinc-200 bg-zinc-50 p-5";
  }

  if (variant === "outline") {
    return "rounded-[20px] border-2 border-zinc-300 bg-transparent p-5";
  }

  if (variant === "embossed" || variant === "standard") {
    return "rounded-[20px] border-2 border-zinc-200 border-b-[5px] bg-white p-5 shadow-sm";
  }

  return "border-none bg-transparent shadow-none";
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}
