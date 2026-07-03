import { NavLink, Outlet } from "react-router";
import { requireUser } from "~/lib/auth";

export function loader() {
  requireUser("teacher");
  return null;
}

export default function AdminLayout() {
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <nav className="mx-auto flex max-w-4xl items-center gap-4 p-4">
          <span className="font-semibold">Admin</span>
          <NavLink to="/admin/courses" className="text-sm text-muted-foreground">
            Manage courses
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
