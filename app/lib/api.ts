// Thin fetch wrapper for the Laravel backend (separate repo). All calls run
// server-side inside React Router loaders/actions, so the Bearer token comes
// from the httpOnly cookie (see lib/auth.ts) — never from the browser.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

type ApiInit = RequestInit & { token?: string | null };

function headersFor(init?: ApiInit): HeadersInit {
  const { token, headers } = init ?? {};
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

// Throws a Response on non-2xx so React Router error boundaries render it.
// Use this in loaders. Returns parsed JSON (or undefined for 204).
export async function api<T>(path: string, init?: ApiInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: headersFor(init) });

  if (!res.ok) {
    throw new Response(await res.text(), { status: res.status });
  }

  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T & { message?: string; errors?: Record<string, string[]> };
}

// Non-throwing variant for actions that need to show validation messages.
export async function apiResult<T = unknown>(path: string, init?: ApiInit): Promise<ApiResult<T>> {
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: headersFor(init) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
