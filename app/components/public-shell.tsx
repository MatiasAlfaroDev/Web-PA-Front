import { Lock } from "lucide-react";
import { Link } from "react-router";
import { SiteLogo, ThemeToggle } from "~/components/bits";

// Cáscara del modo vitrina: mismo lenguaje visual que la app con sesión, pero
// sin cuenta detrás. Las secciones que dependen del backend se muestran
// apagadas en vez de desaparecer, para que se vea que el curso es más que esto.
const blocked = ["Cursos", "Clasificación"];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav className="relative mx-auto flex h-14 max-w-[1100px] items-center gap-6 px-6">
          <Link to="/">
            <SiteLogo />
          </Link>

          <div className="flex items-center gap-5 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <Link
              to="/"
              className="text-sm font-semibold underline decoration-2 underline-offset-8"
            >
              Teórico
            </Link>
            {blocked.map((label) => (
              <span
                key={label}
                aria-disabled="true"
                title="Disponible cuando vuelva el servidor"
                className="flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-muted-foreground/60"
              >
                <Lock className="size-3.5" />
                {label}
              </span>
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
