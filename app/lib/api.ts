import { authHeader } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Thin fetch wrapper for the backend (separate repo). Throws a Response on
// non-2xx so React Router error boundaries can render it.
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Response(await res.text(), { status: res.status });
  }

  return res.json() as Promise<T>;
}
