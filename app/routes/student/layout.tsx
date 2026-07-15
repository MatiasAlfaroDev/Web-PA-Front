import { useEffect, useState } from "react";
import { Flame, Lock } from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigation,
  useRevalidator,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import type { Route } from "./+types/layout";
import { getSiteLock, getToken, initialsOf, requireUser } from "~/lib/auth";
import { SiteLogo, ThemeToggle } from "~/components/bits";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { PageSkeleton } from "~/components/skeletons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const lockedUntil = await getSiteLock(await getToken(request));
  return { user, lockedUntil };
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

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// Client-only ticking countdown — revalidates the loader once it hits zero so
// the lock lifts automatically instead of leaving the page stuck at 00:00:00.
function LockOverlay({ lockedUntil }: { lockedUntil: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const revalidator = useRevalidator();

  useEffect(() => {
    const tick = () => {
      const ms = new Date(lockedUntil).getTime() - Date.now();
      setRemaining(Math.max(0, ms));
      if (ms <= 0) revalidator.revalidate();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedUntil]);

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 z-30 flex flex-col items-center justify-center gap-2 bg-background/70 text-center">
      <Lock className="size-8 text-muted-foreground" />
      <p className="text-lg font-semibold">Sitio bloqueado</p>
      <p className="font-mono text-3xl font-bold tabular-nums">
        {remaining != null ? formatCountdown(remaining) : "--:--:--"}
      </p>
      <p className="text-sm text-muted-foreground">
        Volvé a las {new Date(lockedUntil).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

export default function StudentLayout({ loaderData }: Route.ComponentProps) {
  const { user, lockedUntil } = loaderData;
  const locked = lockedUntil != null && new Date(lockedUntil) > new Date();
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
        <nav className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-8">
          <Link prefetch="intent" to="/app/courses">
            <SiteLogo />
          </Link>
          <NavLink prefetch="intent" to="/app/courses" className={navClass}>
            Cursos
          </NavLink>
          <NavLink prefetch="intent" to="/app/theory" className={navClass}>
            Teórico
          </NavLink>
          <NavLink prefetch="intent" to="/app/leaderboard" className={navClass}>
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
            <Link prefetch="intent" to="/app/profile" aria-label="Tu perfil">
              <Avatar className="size-8">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                <AvatarFallback className="font-mono text-xs">{initialsOf(user)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </nav>
      </header>
      <div className={locked ? "pointer-events-none blur-sm select-none" : undefined}>
        {navigatingTo ? <PageSkeleton pathname={navigatingTo} /> : <Outlet />}
      </div>
      {locked && <LockOverlay lockedUntil={lockedUntil!} />}
    </div>
  );
}
