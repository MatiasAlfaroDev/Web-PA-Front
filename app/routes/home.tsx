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
          <Entry
            key={l.slug}
            to={`/teorico/${l.slug}`}
            number={l.number}
            title={l.title}
            lead={l.lead}
            slideCount={l.slideCount}
          />
        ))}
      </ol>

      <h2 className="section-title mt-12 mb-3">Taller de LLM</h2>
      <ol className="divide-y border-y">
        {/* ponytail: mazo HTML autocontenido en public/, se sirve tal cual. */}
        <Entry
          to="/teorico/taller-llm-parte-2.html"
          reloadDocument
          number="02"
          title="Taller LLM · Parte 2"
          lead="Skills, hooks y plugins; agentes y orquestación; LLM locales y RAG."
          slideCount={33}
        />
      </ol>
    </PublicShell>
  );
}

function Entry(props: {
  to: string;
  reloadDocument?: boolean;
  number: string;
  title: string;
  lead: string;
  slideCount: number;
}) {
  return (
    <li>
      <Link
        to={props.to}
        reloadDocument={props.reloadDocument}
        prefetch={props.reloadDocument ? "none" : "intent"}
        className="group flex items-baseline gap-4 py-4"
      >
        <span className="num w-6 shrink-0 text-xs text-muted-foreground">{props.number}</span>
        <span className="min-w-0 flex-1">
          <span className="section-title block transition-colors group-hover:text-success-ink">
            {props.title}
          </span>
          <span className="mt-0.5 block text-[13.5px] text-muted-foreground">{props.lead}</span>
        </span>
        <span className="num shrink-0 text-xs text-muted-foreground">
          {props.slideCount} diapositivas
        </span>
        <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
