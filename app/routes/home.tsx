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
  return [{ title: "Teórico · Programación Avanzada" }];
}

interface Entry {
  to: string;
  number: string;
  title: string;
  lead: string;
  slideCount: number;
  /** Mazo HTML autocontenido en public/: se navega fuera del router. */
  external?: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  unit: string;
  entries: Entry[];
}

// ponytail: los talleres de LLM son mazos HTML ya armados, se sirven tal cual
// desde public/teorico/. Si cambian, actualizar acá la cantidad de diapositivas.
const topics: Topic[] = [
  {
    id: "minecraft",
    title: "Modding de Minecraft",
    description: "De cómo funciona el juego por dentro hasta la entrega del proyecto.",
    unit: "clases",
    entries: lectures.map((l) => ({
      to: `/teorico/${l.slug}`,
      number: l.number,
      title: l.title,
      lead: l.lead,
      slideCount: l.slideCount,
    })),
  },
  {
    id: "taller-llm",
    title: "Taller LLM para Desarrollo de Software",
    description: "Claude Code, costo de los tokens, modelos abiertos, agentes y RAG.",
    unit: "partes",
    entries: [
      {
        to: "/teorico/taller-llm-parte-1.html",
        external: true,
        number: "01",
        title: "Claude, tokens y otros LLM",
        lead: "Claude Code bien usado, tokens y effort, modelos abiertos, MCP y subagentes.",
        slideCount: 36,
      },
      {
        to: "/teorico/taller-llm-parte-2.html",
        external: true,
        number: "02",
        title: "Skills, agentes y LLM locales",
        lead: "Skills, hooks y plugins; agentes y orquestación; LLM locales y RAG.",
        slideCount: 33,
      },
    ],
  },
];

export default function Home(_: Route.ComponentProps) {
  return (
    <PublicShell>
      <header className="mb-10 max-w-[58ch]">
        <h1 className="page-title">Teórico</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Las clases teóricas del curso, agrupadas por tema. Cada una se abre como presentación.
        </p>
      </header>

      <div className="flex flex-col gap-14">
        {topics.map((t) => (
          <section
            key={t.id}
            id={t.id}
            aria-labelledby={`${t.id}-title`}
            className="grid scroll-mt-20 gap-5 border-t pt-6 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-10"
          >
            <div className="md:sticky md:top-20 md:self-start">
              <h2 id={`${t.id}-title`} className="text-xl font-semibold tracking-tight text-balance">
                {t.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              <p className="num mt-3 text-xs text-muted-foreground">
                {t.entries.length} {t.unit}
              </p>
            </div>

            <ol className="divide-y md:-mt-4">
              {t.entries.map((e) => (
                <li key={e.to}>
                  <Link
                    to={e.to}
                    reloadDocument={e.external}
                    prefetch={e.external ? "none" : "intent"}
                    className="group flex items-baseline gap-4 py-4"
                  >
                    <span className="num w-6 shrink-0 text-xs text-muted-foreground">{e.number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="section-title block transition-colors group-hover:text-success-ink">
                        {e.title}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] text-muted-foreground">{e.lead}</span>
                    </span>
                    <span className="num hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {e.slideCount} diapositivas
                    </span>
                    <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}
