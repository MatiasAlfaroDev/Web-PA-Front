import { Code2 } from "lucide-react";

// Split-screen auth layout: the green brand panel (left) is the app's signature,
// reused across sign in / register / verify / reset so the flow feels like one place.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,46%)_1fr]">
      <aside className="hidden flex-col justify-between gap-12 bg-[#0f2818] p-12 text-[#f0fdf4] lg:flex 2xl:p-16">
        <Code2 className="size-8 shrink-0 text-success" strokeWidth={2.5} />

        {/* Centered between the logo (top) and the institutional footer (bottom),
            so the panel reads as balanced on tall/ultra-wide screens instead of
            leaving a void in the middle. */}
        <div className="my-auto max-w-md space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-xs tracking-[0.2em] text-[#f0fdf4]/70 uppercase">
              2.º BT · Tecnologías de la Información
            </p>
            <h1 className="text-[34px] leading-[1.1] font-bold tracking-tight text-balance 2xl:text-5xl">
              Programación Avanzada
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-[#f0fdf4]/70 2xl:text-base">
            Completa los ejercicios, <strong>mejora tus habilidades</strong>. 
            Esta plataforma esta pensada para que puedas practicar y reforzar los conceptos del Curso.
          </p>
        </div>

        <div className="shrink-0 space-y-4 border-t border-[#f0fdf4]/10 pt-6">
          {/* ponytail: logo remoto; conviene autohospedarlo si UTU cambia la URL */}

          <p className="font-mono text-sm text-[#f0fdf4]/60">Prof. Matías Alfaro - 2026 | UTU - San José</p>
        </div>
      </aside>

      <div className="flex items-center justify-center p-6 py-12">{children}</div>
    </main>
  );
}
