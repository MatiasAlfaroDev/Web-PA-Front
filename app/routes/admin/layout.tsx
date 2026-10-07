import { Lock } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigation, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/layout";
import { getSiteLock, getToken, requireUser } from "~/lib/auth";
import { SiteLogo, UserMenu } from "~/components/bits";
import { Badge } from "~/components/ui/badge";
import { PageSkeleton } from "~/components/skeletons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, "teacher");
  const lockedUntil = await getSiteLock(await getToken(request));
  return { user, lockedUntil };
}

// Same rationale as the student layout: skip refetching the teacher's
// profile on plain navigations, only after a submission. Presenting is the one
// exception — each slide is a submission, and reloading the profile and the
// site lock on every arrow key would be absurd.
export function shouldRevalidate({
  formMethod,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formAction?.endsWith("/present")) return false;
  return formMethod != null ? defaultShouldRevalidate : false;
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
    : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
}

function SiteLockBadge({ lockedUntil }: { lockedUntil: string | null }) {
  const locked = lockedUntil != null && new Date(lockedUntil) > new Date();
  return (
    <Link prefetch="intent"
      to="/admin/settings"
      className={
        locked
          ? "flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
          : "flex items-center gap-1.5 rounded-md bg-success-soft px-2.5 py-1 text-xs font-medium text-success-soft-foreground"
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
        {/* Same bar shape as the student area: centred links, account behind
            the avatar. The lock badge stays out in the open because it is a
            live state the teacher has to see without clicking. */}
        <nav className="relative mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-8">
          <Link prefetch="intent" to="/admin/courses" className="flex items-center gap-2">
            <SiteLogo />
            <Badge variant="outline" className="rounded-md text-[10px]">
              Profesor
            </Badge>
          </Link>

          <div className="flex items-center gap-5 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <NavLink prefetch="intent" to="/admin/courses" end className={navClass}>
              Mis cursos
            </NavLink>
            <NavLink prefetch="intent" to="/admin/theory" className={navClass}>
              Teórico
            </NavLink>
            <NavLink prefetch="intent" to="/admin/students" className={navClass}>
              Estudiantes
            </NavLink>
            <NavLink prefetch="intent" to="/admin/settings" className={navClass}>
              Ajustes
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <SiteLockBadge lockedUntil={lockedUntil} />
            <UserMenu user={user} />
          </div>
        </nav>
      </header>
      {navigatingTo ? <PageSkeleton pathname={navigatingTo} /> : <Outlet />}
    </div>
  );
}
