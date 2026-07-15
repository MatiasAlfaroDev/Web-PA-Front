import { createCookie, redirect } from "react-router";
import { api } from "./api";

export type Role = "student" | "teacher";

// Backend user (snake_case) + the stats /profile adds.
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  bio?: string | null;
  avatar_url?: string | null;
  points?: number;
  streak?: number;
  solved?: number;
}

// Bearer token lives in an httpOnly cookie — set on login, read by loaders.
export const tokenCookie = createCookie("auth_token", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  secure: process.env.NODE_ENV === "production",
});

export async function getToken(request: Request): Promise<string | null> {
  return (await tokenCookie.parse(request.headers.get("Cookie"))) ?? null;
}

// For child-route loaders: get the token or bounce to login. Avoids the extra
// /profile round-trip that requireUser does (the layout already guards the role).
export async function getTokenOrRedirect(request: Request): Promise<string> {
  const token = await getToken(request);
  if (!token) throw redirect("/login");
  return token;
}

export function homeFor(role: Role): string {
  return role === "teacher" ? "/admin/courses" : "/app/courses";
}

// Fail-open: if the backend's /site-lock endpoint is down or not deployed,
// treat the site as unlocked rather than 404ing every authenticated page.
export async function getSiteLock(token: string | null): Promise<string | null> {
  try {
    return (await api<{ locked_until: string | null }>("/site-lock", { token })).locked_until;
  } catch {
    return null;
  }
}

// Loader guard: require a logged-in user (optionally with a role). Returns the
// live profile so layouts can render points/streak without a second fetch.
export async function requireUser(request: Request, role?: Role): Promise<User> {
  const token = await getToken(request);
  if (!token) throw redirect("/login");

  let user: User;
  try {
    user = await api<User>("/profile", { token });
  } catch {
    // Bad/expired token — clear it and bounce to login.
    throw redirect("/login", { headers: { "Set-Cookie": await tokenCookie.serialize("", { maxAge: 0 }) } });
  }

  if (role && user.role !== role) throw redirect(homeFor(user.role));
  return user;
}

export const fullName = (u: { first_name: string; last_name: string }) =>
  `${u.first_name} ${u.last_name}`.trim();

export const initialsOf = (u: { first_name: string; last_name: string }) =>
  `${u.first_name[0] ?? ""}${u.last_name[0] ?? ""}`.toUpperCase();
