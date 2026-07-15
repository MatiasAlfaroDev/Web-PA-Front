import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/lesson";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapLessonDetail, type ApiLesson } from "~/lib/mappers";
import { Prose } from "~/components/bits";

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

  return (
    <main className="mx-auto max-w-[840px] px-8 py-10 pb-20">
      <Link prefetch="intent"
        to={`/app/theory/${courseId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al curso
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold tracking-tight">{lesson.title}</h1>
      <Prose text={lesson.content} />
    </main>
  );
}
