import { Presentation } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/theory-course";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapCourseDetail, type ApiCourse } from "~/lib/mappers";
import { BackLink, EmptyState, PageHeader } from "~/components/bits";
import { Button } from "~/components/ui/button";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const course = await api<ApiCourse>(`/courses/${params.courseId}`, { token });
  return { course: mapCourseDetail(course) };
}

export function meta() {
  return [{ title: "Teórico · Programación Avanzada" }];
}

export default function TheoryCourse({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  return (
    <main className="mx-auto max-w-[900px] px-8 py-10 pb-20">
      <BackLink to="/app/theory">Teórico</BackLink>
      <PageHeader
        title={course.title}
        lead={`${course.lessons.length} ${course.lessons.length === 1 ? "tema" : "temas"} para leer o seguir en diapositivas`}
      />

      {course.lessons.length === 0 ? (
        <EmptyState
          title="Todavía no hay material teórico"
          hint="Cuando el profesor publique los temas de este curso, los vas a ver acá."
        />
      ) : (
        <ol className="divide-y border-y">
          {course.lessons.map((l, i) => (
            <li key={l.id} className="group flex items-center gap-4">
              <Link
                prefetch="intent"
                to={`/app/theory/${course.id}/lessons/${l.id}`}
                className="flex min-w-0 flex-1 items-baseline gap-4 py-4 transition-colors group-hover:text-success-ink"
              >
                <span className="num w-6 shrink-0 text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate font-medium">{l.title}</span>
              </Link>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link prefetch="intent" to={`/app/theory/${course.id}/lessons/${l.id}/slides`}>
                  <Presentation />
                  Diapositivas
                </Link>
              </Button>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
