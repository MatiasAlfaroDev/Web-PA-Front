import { Presentation } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/lesson";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapLessonDetail, type ApiLesson } from "~/lib/mappers";
import { splitSlides } from "~/lib/slides";
import { BackLink, Prose } from "~/components/bits";
import { Button } from "~/components/ui/button";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const lesson = await api<ApiLesson>(`/lessons/${params.lessonId}`, { token });
  return { lesson: mapLessonDetail(lesson), courseId: params.courseId };
}

export function meta() {
  return [{ title: "Lección · Programación Avanzada" }];
}

export default function Lesson({ loaderData }: Route.ComponentProps) {
  const { lesson, courseId } = loaderData;
  // The same `---` breaks that make slides also mark the reading view's
  // sections, so a lesson reads the same way it is presented.
  const sections = splitSlides(lesson.content);

  return (
    <main className="mx-auto max-w-[820px] px-8 py-10 pb-20">
      <BackLink to={`/app/theory/${courseId}`}>Volver al curso</BackLink>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b pb-5">
        <h1 className="page-title">{lesson.title}</h1>
        {sections.length > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link prefetch="intent" to={`/app/theory/${courseId}/lessons/${lesson.id}/slides`}>
              <Presentation />
              Ver en diapositivas
            </Link>
          </Button>
        )}
      </div>

      {sections.map((section, i) => (
        <section key={i}>
          {i > 0 && <hr className="my-9 border-dashed" />}
          <Prose text={section} className="text-[16px] leading-[1.75]" />
        </section>
      ))}
    </main>
  );
}
