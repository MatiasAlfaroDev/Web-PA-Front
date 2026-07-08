import { Flame } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigation, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/layout";
import { initialsOf, requireUser } from "~/lib/auth";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { PageSkeleton } from "~/components/skeletons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

// Points/streak rarely change between clicks — only refetch the profile after
// a submission (e.g. a challenge run or a profile edit), not on every navigation.
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod != null ? defaultShouldRevalidate : false;
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
    : "text-sm font-medium text-muted-foreground hover:text-foreground";
}

export default function StudentLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const navigation = useNavigation();
  const location = useLocation();
  // Only swap in a skeleton when actually changing pages — not for in-place
  // revalidation (form submits, fetcher polling) on the current route.
  const navigatingTo =
    navigation.state === "loading" && navigation.location.pathname !== location.pathname
      ? navigation.location.pathname
      : null;
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
      {navigatingTo ? <PageSkeleton pathname={navigatingTo} /> : <Outlet />}
    </div>
  );
}
