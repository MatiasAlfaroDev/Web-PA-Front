import { Lock } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigation, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/layout";
import { api } from "~/lib/api";
import { getToken, initialsOf, requireUser } from "~/lib/auth";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { PageSkeleton } from "~/components/skeletons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, "teacher");
  const { locked_until } = await api<{ locked_until: string | null }>("/site-lock", {
    token: await getToken(request),
  });
  return { user, lockedUntil: locked_until };
}

// Same rationale as the student layout: skip refetching the teacher's
// profile on plain navigations, only after a submission.
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod != null ? defaultShouldRevalidate : false;
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
    : "text-sm font-medium text-muted-foreground hover:text-foreground";
}

function SiteLockBadge({ lockedUntil }: { lockedUntil: string | null }) {
  const locked = lockedUntil != null && new Date(lockedUntil) > new Date();
  return (
    <Link
      to="/admin/settings"
      className={
        locked
          ? "flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 font-mono text-xs font-medium text-destructive"
          : "flex items-center gap-1.5 rounded-md bg-success-soft px-2.5 py-1 font-mono text-xs font-medium text-success-soft-foreground"
      }
    >
      <Lock className="size-3.5" />
      {locked
        ? `Bloqueado hasta ${new Date(lockedUntil!).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}`
        : "Sitio activo"}
    </Link>
  );
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user, lockedUntil } = loaderData;
  const navigation = useNavigation();
  const location = useLocation();
  const navigatingTo =
    navigation.state === "loading" && navigation.location.pathname !== location.pathname
      ? navigation.location.pathname
      : null;
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
          <NavLink to="/admin/courses" end className={({ isActive }) => `ml-2 ${navClass({ isActive })}`}>
            Mis cursos
          </NavLink>
          <NavLink to="/admin/theory" className={navClass}>
            Teórico
          </NavLink>
          <NavLink to="/admin/students" className={navClass}>
            Estudiantes
          </NavLink>
          <NavLink to="/admin/settings" className={navClass}>
            Ajustes
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            <SiteLockBadge lockedUntil={lockedUntil} />
            <ThemeToggle />
            <Link to="/app/profile" aria-label="Tu perfil">
              <Avatar className="size-8">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                <AvatarFallback className="font-mono text-xs">{initialsOf(user)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </nav>
      </header>
      {navigatingTo ? <PageSkeleton pathname={navigatingTo} /> : <Outlet />}
    </div>
  );
}
