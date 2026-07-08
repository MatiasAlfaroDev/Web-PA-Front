import { Link, NavLink, Outlet, useLocation, useNavigation, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/layout";
import { initialsOf, requireUser } from "~/lib/auth";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { PageSkeleton } from "~/components/skeletons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, "teacher");
  return { user };
}

// Same rationale as the student layout: skip refetching the teacher's
// profile on plain navigations, only after a submission.
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod != null ? defaultShouldRevalidate : false;
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
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
          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              isActive
                ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
                : "text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Estudiantes
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Avatar className="size-8">
              <AvatarFallback className="font-mono text-xs">{initialsOf(user)}</AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </header>
      {navigatingTo ? <PageSkeleton pathname={navigatingTo} /> : <Outlet />}
    </div>
  );
}
