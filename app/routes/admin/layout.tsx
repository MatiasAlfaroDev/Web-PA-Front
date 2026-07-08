import { Plus } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { initialsOf, requireUser } from "~/lib/auth";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, "teacher");
  return { user };
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-[1120px] items-center gap-4 px-8">
          <Link to="/admin/courses" className="flex items-center gap-2">
            <SiteLogo />
            <Badge variant="outline" className="rounded-md text-[10px] tracking-wide uppercase">
              Profesor
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
            Mis cursos
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            <Button asChild>
              <Link to="/admin/courses/new">
                <Plus />
                Nuevo curso
              </Link>
            </Button>
            <ThemeToggle />
            <Avatar className="size-8">
              <AvatarFallback className="font-mono text-xs">{initialsOf(user)}</AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
