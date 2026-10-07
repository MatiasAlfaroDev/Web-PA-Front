import { useState } from "react";
import { data, Link } from "react-router";
import type { Route } from "./+types/teorico";
import { lectureBySlug, lectures } from "~/lib/teorico";
import { splitSlides } from "~/lib/slides";
import { BackLink } from "~/components/bits";
import { PublicShell } from "~/components/public-shell";
import { SlideDeck } from "~/components/slide-deck";

// Una clase del teórico público, como mazo de diapositivas. El contenido sale
// del bundle (ver lib/teorico.ts), así que este loader no toca la red: solo
// resuelve el slug para poder dar un 404 de verdad si no existe.
export function loader({ params }: Route.LoaderArgs) {
  const lecture = lectureBySlug(params.slug);
  if (!lecture) throw data("No encontramos esa clase.", { status: 404 });
  return { lecture };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.lecture.title ?? "Teórico"} · Programación Avanzada` }];
}

export default function Teorico({ loaderData }: Route.ComponentProps) {
  const { lecture } = loaderData;
  const slides = splitSlides(lecture.markdown);
  const [slide, setSlide] = useState(0);

  const index = lectures.findIndex((l) => l.slug === lecture.slug);
  const next = lectures[index + 1];

  return (
    <PublicShell>
      <BackLink to="/">Todas las clases</BackLink>

      <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="num text-sm text-muted-foreground">{lecture.number}</span>
        <h1 className="page-title">{lecture.title}</h1>
      </div>

      {/* key: cambiar de clase monta un mazo nuevo, si no la diapositiva
          actual se arrastraría de una clase a la otra. */}
      <SlideDeck key={lecture.slug} slides={slides} slide={slide} onSlide={setSlide} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Flechas o barra espaciadora para cambiar de diapositiva, F para pantalla completa.
        </p>
        {next && (
          <Link
            prefetch="intent"
            to={`/teorico/${next.slug}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sigue: {next.title}
          </Link>
        )}
      </div>
    </PublicShell>
  );
}
