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

// "in 3 days" from a future ISO timestamp — countdown for locked courses.
export function timeUntil(iso: string): string {
  const secs = (new Date(iso).getTime() - Date.now()) / 1000
  if (secs <= 0) return "en cualquier momento"
  for (const [unit, size] of UNITS) {
    if (secs >= size) return rtf.format(Math.ceil(secs / size), unit)
  }
  return "en menos de un minuto"
}

// ISO timestamp -> `<input type="datetime-local">` value (local wall-clock, no tz).
export function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
