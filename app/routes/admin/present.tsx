import { useEffect, useState } from "react";
import { Radio, CircleStop } from "lucide-react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/present";
import { api, apiResult } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapLessonDetail, type ApiLesson } from "~/lib/mappers";
import { fetchLiveSession } from "~/lib/live";
import { clampSlide, slideTitle, splitSlides } from "~/lib/slides";
import { BackLink } from "~/components/bits";
import { SlideDeck } from "~/components/slide-deck";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const [lesson, live] = await Promise.all([
    api<ApiLesson>(`/lessons/${params.lessonId}`, { token }),
    fetchLiveSession(token),
  ]);
  return { lesson: mapLessonDetail(lesson), courseId: params.courseId, live };
}

// The deck itself never changes while presenting, so a slide push must not drag
// the lesson back over the wire with it.
export function shouldRevalidate() {
  return false;
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await getTokenOrRedirect(request);
  const form = await request.formData();

  if (form.get("intent") === "stop") {
    await apiResult("/presentation", { method: "DELETE", token });
    return { live: false };
  }

  const res = await apiResult("/presentation", {
    method: "PUT",
    token,
    body: JSON.stringify({
      lesson_id: Number(params.lessonId),
      slide: Number(form.get("slide")),
      total: Number(form.get("total")),
    }),
  });
  return { live: res.ok, error: res.ok ? undefined : "No se pudo transmitir la diapositiva." };
}

export function meta() {
  return [{ title: "Presentar · Programación Avanzada" }];
}

export default function Present({ loaderData }: Route.ComponentProps) {
  const { lesson, courseId } = loaderData;
  const slides = splitSlides(lesson.content);
  const total = slides.length;

  const push = useFetcher<typeof action>();
  const [slide, setSlide] = useState(() =>
    loaderData.live?.lessonId === lesson.id ? clampSlide(loaderData.live.slide, total) : 0,
  );
  const [broadcasting, setBroadcasting] = useState(loaderData.live?.lessonId === lesson.id);

  // While broadcasting, the slide the teacher is on *is* the published state,
  // so every move pushes. Not debounced on purpose: a skipped intermediate
  // slide would leave the class a step behind.
  useEffect(() => {
    if (!broadcasting) return;
    const fd = new FormData();
    fd.set("intent", "go");
    fd.set("slide", String(slide));
    fd.set("total", String(total));
    push.submit(fd, { method: "post" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, broadcasting, total]);

  function stop() {
    setBroadcasting(false);
    push.submit({ intent: "stop" }, { method: "post" });
  }

  return (
    <main className="mx-auto max-w-[1400px] px-8 py-8 pb-16">
      <BackLink to={`/admin/theory/${courseId}`}>Lecciones del curso</BackLink>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="space-y-1">
          <h1 className="page-title">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "diapositiva" : "diapositivas"}, cortadas donde escribiste
            {" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">---</code>
          </p>
        </div>

        {broadcasting ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-md bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success-soft-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-success-soft-foreground opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-success-soft-foreground" />
              </span>
              En vivo, la clase te sigue
            </span>
            <Button variant="outline" onClick={stop}>
              <CircleStop />
              Finalizar
            </Button>
          </div>
        ) : (
          <Button onClick={() => setBroadcasting(true)}>
            <Radio />
            Transmitir a la clase
          </Button>
        )}
      </div>

      {push.data?.error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {push.data.error}
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SlideDeck slides={slides} slide={slide} onSlide={setSlide} className="min-w-0 flex-1" />

        <aside className="w-full shrink-0 space-y-5 lg:w-[290px]">
          <section className="space-y-2">
            <h2 className="section-title">Lo que sigue</h2>
            {slide + 1 < total ? (
              <button
                type="button"
                onClick={() => setSlide(slide + 1)}
                className="block w-full rounded-xl border bg-card p-4 text-left transition-colors hover:border-border-strong"
              >
                <span className="num text-xs text-muted-foreground">
                  {String(slide + 2).padStart(2, "0")}
                </span>
                <p className="mt-1 line-clamp-3 text-sm leading-snug font-medium">
                  {slideTitle(slides[slide + 1], slide + 1)}
                </p>
              </button>
            ) : (
              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Última diapositiva.
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="section-title">Recorrido</h2>
            <ol className="divide-y overflow-hidden rounded-xl border bg-card">
              {slides.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-current={i === slide}
                    className={cn(
                      "flex w-full items-baseline gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                      i === slide
                        ? "bg-success-soft/60 font-semibold"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <span className="num shrink-0 text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="line-clamp-2">{slideTitle(s, i)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
}
