import { Link, useLocation } from "react-router";
import { SiteLogo, ThemeToggle } from "~/components/bits";

// Cáscara del modo vitrina: mismo lenguaje visual que la app con sesión, pero
// sin cuenta detrás.
const sections = [
  { to: "/", label: "Teórico" },
  { to: "/equipos", label: "Equipos" },
];

function navClass(active: boolean) {
  return active
    ? "text-sm font-semibold text-foreground underline decoration-2 underline-offset-8"
    : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  // Teórico cubre "/" y "/teorico/*"; cualquier otra ruta es su propia sección.
  const current = pathname.startsWith("/equipos") ? "/equipos" : "/";

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav className="relative mx-auto flex h-14 max-w-[1100px] items-center gap-6 px-6">
          <Link to="/">
            <SiteLogo />
          </Link>

          <div className="flex items-center gap-5 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            {sections.map((s) => (
              <Link key={s.to} to={s.to} prefetch="intent" className={navClass(s.to === current)}>
                {s.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-8 pb-16">{children}</main>
    </div>
  );
}
