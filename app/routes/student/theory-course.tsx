import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/theory-course";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapCourseDetail, type ApiCourse, type Lesson } from "~/lib/mappers";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const course = await api<ApiCourse>(`/courses/${params.courseId}`, { token });
  return { course: mapCourseDetail(course) };
}

export function meta() {
  return [{ title: "Teórico · Programación Avanzada" }];
}

function LessonRow({ l, courseId }: { l: Lesson; courseId: string }) {
  return (
    <Link prefetch="intent"
      to={`/app/theory/${courseId}/lessons/${l.id}`}
      className="flex items-center gap-3 rounded-xl border-[1.5px] bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <span className="font-semibold">{l.title}</span>
    </Link>
  );
}

export default function TheoryCourse({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <Link prefetch="intent"
        to="/app/theory"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Teórico
      </Link>

      <h1 className="mb-6 text-[28px] font-extrabold tracking-tight">{course.title}</h1>

      <div className="space-y-3">
        {course.lessons.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Todavía no hay materiales teóricos para este curso.
          </p>
        ) : (
          course.lessons.map((l) => <LessonRow key={l.id} l={l} courseId={course.id} />)
        )}
      </div>
    </main>
  );
}
