import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { lectures } from "~/lib/teorico";
import { PublicShell } from "~/components/public-shell";

// MODO VITRINA (temporal, mientras el backend está caído)
//
// La raíz era un redirect a /login o al área según el rol. Ahora es el índice
// del teórico de Minecraft, servido enteramente desde el front: sin loader,
// sin token, sin una sola llamada a la API. Funciona con el back apagado.
//
// Para volver al modo normal: restaurar el loader de abajo y borrar el
// componente. /app y /admin nunca se tocaron, siguen pidiendo login; solo
// dejaron de estar enlazadas desde el nav.
//
// export async function loader({ request }: Route.LoaderArgs) {
//   if (!(await getToken(request))) return redirect("/login");
//   const user = await requireUser(request);
//   return redirect(homeFor(user.role));
// }

export function meta() {
  return [{ title: "Teórico · Minecraft · Programación Avanzada" }];
}

export default function Home(_: Route.ComponentProps) {
  return (
    <PublicShell>
      <header className="mb-8 max-w-[58ch]">
        <h1 className="page-title">Modding de Minecraft</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seis clases teóricas, de cómo funciona el juego por dentro hasta la entrega del
          proyecto.
        </p>
      </header>

      <ol className="divide-y border-y">
        {lectures.map((l) => (
          <li key={l.slug}>
            <Link
              to={`/teorico/${l.slug}`}
              prefetch="intent"
              className="group flex items-baseline gap-4 py-4"
            >
              <span className="num w-6 shrink-0 text-xs text-muted-foreground">{l.number}</span>
              <span className="min-w-0 flex-1">
                <span className="section-title block transition-colors group-hover:text-success-ink">
                  {l.title}
                </span>
                <span className="mt-0.5 block text-[13.5px] text-muted-foreground">{l.lead}</span>
              </span>
              <span className="num shrink-0 text-xs text-muted-foreground">
                {l.slideCount} diapositivas
              </span>
              <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ol>
    </PublicShell>
  );
}
