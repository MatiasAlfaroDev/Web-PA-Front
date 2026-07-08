import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
]

// "2 days ago" from an ISO timestamp.
export function timeAgo(iso?: string): string {
  if (!iso) return ""
  const secs = (Date.now() - new Date(iso).getTime()) / 1000
  for (const [unit, size] of UNITS) {
    if (secs >= size) return rtf.format(-Math.floor(secs / size), unit)
  }
  return "recién"
}
