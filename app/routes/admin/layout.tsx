import { Plus } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import { requireUser } from "~/lib/auth";
import { teacher } from "~/lib/mock-data";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export function loader() {
  requireUser("teacher");
  return null;
}

export default function AdminLayout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-[1120px] items-center gap-4 px-8">
          <Link to="/admin/courses" className="flex items-center gap-2">
            <SiteLogo />
            <Badge variant="outline" className="rounded-md text-[10px] tracking-wide uppercase">
              Teacher
            </Badge>
          </Link>
          <NavLink
            to="/admin/courses"
            end
            className={({ isActive }) =>
              isActive
                ? "ml-2 text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
                : "ml-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            My Courses
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            <Button asChild>
              <Link to="/admin/courses/new">
                <Plus />
                New course
              </Link>
            </Button>
            <ThemeToggle />
            <Avatar className="size-8">
              <AvatarFallback className="font-mono text-xs">{teacher.initials}</AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
