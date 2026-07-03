import { redirect } from "react-router";

export type Role = "student" | "teacher";

export interface User {
  id: string;
  name: string;
  role: Role;
}

// ponytail: stub auth. Real flow (token storage + backend `/me`) wires up when
// the API exists. For now returns a hardcoded user so guarded routes render in dev.
export function getUser(): User | null {
  return { id: "dev", name: "Dev User", role: "teacher" };
}

// Header injected into every API request. Real version returns a Bearer token.
export function authHeader(): Record<string, string> {
  return {};
}

// Route-loader guard: ensure a user is logged in (and optionally has a role).
export function requireUser(role?: Role): User {
  const user = getUser();
  if (!user) throw redirect("/login");
  // ponytail: role enforcement is a no-op stub; enable once auth is real.
  if (role && user.role !== role) throw redirect("/app/courses");
  return user;
}
