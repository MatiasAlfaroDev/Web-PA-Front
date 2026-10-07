import { useState } from "react";
import { Radio } from "lucide-react";
import type { Route } from "./+types/lesson-slides";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapLessonDetail, type ApiLesson } from "~/lib/mappers";
import { fetchLiveSession } from "~/lib/live";
import { clampSlide, splitSlides } from "~/lib/slides";
import { useLiveSession } from "~/hooks/use-live-session";
import { BackLink } from "~/components/bits";
import { SlideDeck } from "~/components/slide-deck";
import { Button } from "~/components/ui/button";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const [lesson, live] = await Promise.all([
    api<ApiLesson>(`/lessons/${params.lessonId}`, { token }),
    fetchLiveSession(token),
  ]);
  return { lesson: mapLessonDetail(lesson), courseId: params.courseId, live };
}

export function meta() {
  return [{ title: "Diapositivas · Programación Avanzada" }];
}

export default function LessonSlides({ loaderData }: Route.ComponentProps) {
  const { lesson, courseId } = loaderData;
  const slides = splitSlides(lesson.content);

  // 2s: the slide number is the one thing that has to feel immediate, because
  // the class is looking at the projector and their screen at the same time.
  const live = useLiveSession(loaderData.live, 2000);
  const broadcasting = live?.lessonId === lesson.id;

  const [ownSlide, setOwnSlide] = useState(0);
  const [following, setFollowing] = useState(true);
  const followed = broadcasting && following;
  const slide = followed ? clampSlide(live!.slide, slides.length) : clampSlide(ownSlide, slides.length);

  return (
    <main className="mx-auto max-w-[1100px] px-8 py-8 pb-16">
      <BackLink to={`/app/theory/${courseId}/lessons/${lesson.id}`}>Volver a la lección</BackLink>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="page-title">{lesson.title}</h1>
        {broadcasting && (
          <span className="flex items-center gap-2 rounded-md bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-soft-foreground">
            <Radio className="size-3.5" />
            El profesor está presentando
          </span>
        )}
      </div>

      <SlideDeck
        slides={slides}
        slide={slide}
        onSlide={(next) => {
          setFollowing(false);
          setOwnSlide(next);
        }}
        locked={followed}
        lockedHint="La clase avanza con el profesor"
      >
        {broadcasting &&
          (following ? (
            <Button variant="outline" size="sm" onClick={() => setFollowing(false)}>
              Ver a mi ritmo
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFollowing(true)}
              title={`El profesor está en la diapositiva ${live!.slide + 1}`}
            >
              Volver con la clase
            </Button>
          ))}
      </SlideDeck>

      <p className="mt-4 text-xs text-muted-foreground">
        Flechas o barra espaciadora para cambiar de diapositiva, F para pantalla completa.
      </p>
    </main>
  );
}
