import { Flame } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { initialsOf, requireUser } from "~/lib/auth";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
    : "text-sm font-medium text-muted-foreground hover:text-foreground";
}

export default function StudentLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-[1120px] items-center gap-6 px-8">
          <Link to="/app/courses">
            <SiteLogo />
          </Link>
          <NavLink to="/app/courses" className={navClass}>
            Cursos
          </NavLink>
          <NavLink to="/app/leaderboard" className={navClass}>
            Clasificación
          </NavLink>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground">
              {user.points ?? 0} pts
            </span>
            <span className="flex items-center gap-1 rounded-md bg-success-soft px-2.5 py-1 font-mono text-xs font-medium text-success-soft-foreground">
              <Flame className="size-3.5" />
              {user.streak ?? 0}
            </span>
            <ThemeToggle />
            <Link to="/app/profile" aria-label="Tu perfil">
              <Avatar className="size-8">
                <AvatarFallback className="font-mono text-xs">{initialsOf(user)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
