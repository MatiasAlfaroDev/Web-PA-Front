import { useEffect, useState } from "react";
import { Lock, Radio } from "lucide-react";
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
import { getSiteLock, getToken, requireUser } from "~/lib/auth";
import { fetchLiveSession, type LiveSession } from "~/lib/live";
import { useLiveSession } from "~/hooks/use-live-session";
import { SiteLogo, UserMenu } from "~/components/bits";
import { PageSkeleton } from "~/components/skeletons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const token = await getToken(request);
  const [lockedUntil, live] = await Promise.all([getSiteLock(token), fetchLiveSession(token)]);
  return { user, lockedUntil, live };
}

// Points/streak rarely change between clicks — only refetch the profile after
// a submission (e.g. a challenge run or a profile edit), not on every navigation.
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod != null ? defaultShouldRevalidate : false;
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
    : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
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
      <p className="section-title">Sitio bloqueado</p>
      <p className="num text-3xl font-semibold">
        {remaining != null ? formatCountdown(remaining) : "--:--:--"}
      </p>
      <p className="text-sm text-muted-foreground">
        Volvé a las{" "}
        {new Date(lockedUntil).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

// The only always-on indicator in the app, and it earns it: while the teacher
// is presenting, every page offers one tap into the live deck.
function LiveBar({ live }: { live: LiveSession }) {
  return (
    <Link
      to={`/app/theory/${live.courseId}/lessons/${live.lessonId}/slides`}
      className="flex items-center justify-center gap-2.5 border-b bg-success-soft px-8 py-2 text-sm text-success-soft-foreground transition-colors hover:bg-success-soft/80"
    >
      <Radio className="size-4 shrink-0" />
      <span className="truncate">
        El profesor está presentando <span className="font-semibold">{live.lessonTitle}</span>
      </span>
      <span className="shrink-0 font-semibold underline underline-offset-4">Seguir la clase</span>
    </Link>
  );
}

export default function StudentLayout({ loaderData }: Route.ComponentProps) {
  const { user, lockedUntil } = loaderData;
  const locked = lockedUntil != null && new Date(lockedUntil) > new Date();
  const navigation = useNavigation();
  const location = useLocation();

  // Slow poll: this bar only has to notice that a session started. The slides
  // view itself polls fast because it tracks the slide number.
  const live = useLiveSession(loaderData.live, 15000);
  const onThisDeck = location.pathname.endsWith(`/lessons/${live?.lessonId}/slides`);
  const showLiveBar = live != null && !onThisDeck && !locked;

  // Only swap in a skeleton when actually changing pages — not for in-place
  // revalidation (form submits, fetcher polling) on the current route.
  const navigatingTo =
    navigation.state === "loading" && navigation.location.pathname !== location.pathname
      ? navigation.location.pathname
      : null;

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        {/* Links are centred on the bar itself, not between the logo and the
            actions, so the two sides can grow without dragging them off centre.
            Under sm: they fall back into normal flow beside the logo. */}
        <nav className="relative mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-8">
          <Link prefetch="intent" to="/app/courses">
            <SiteLogo />
          </Link>

          <div className="flex items-center gap-6 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <NavLink prefetch="intent" to="/app/courses" className={navClass}>
              Cursos
            </NavLink>
            <NavLink prefetch="intent" to="/app/theory" className={navClass}>
              Teórico
            </NavLink>
            <NavLink prefetch="intent" to="/app/leaderboard" className={navClass}>
              Clasificación
            </NavLink>
          </div>

          <div className="ml-auto flex items-center">
            <UserMenu user={user} />
          </div>
        </nav>
        {showLiveBar && <LiveBar live={live} />}
      </header>
      <div className={locked ? "pointer-events-none blur-sm select-none" : undefined}>
        {navigatingTo ? <PageSkeleton pathname={navigatingTo} /> : <Outlet />}
      </div>
      {locked && <LockOverlay lockedUntil={lockedUntil!} />}
    </div>
  );
}
