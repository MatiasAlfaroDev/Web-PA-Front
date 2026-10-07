import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/theory";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { courseLockState, mapCourse, type ApiCourse } from "~/lib/mappers";
import { CourseLockNotice, EmptyState, PageHeader } from "~/components/bits";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Teórico · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const apiCourses = await api<ApiCourse[]>("/courses", { token });
  return { courses: apiCourses.map((c) => ({ ...mapCourse(c), lessonsCount: c.lessons_count ?? 0 })) };
}

export default function Theory({ loaderData }: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-[900px] px-8 py-10 pb-20">
      <PageHeader title="Teórico" lead="Los temas de cada curso, para leer o seguir en clase" />

      {loaderData.courses.length === 0 ? (
        <EmptyState title="Todavía no hay material teórico" />
      ) : (
        <ul className="divide-y border-y">
          {loaderData.courses.map((course) => {
            const { locked, unlocksAt } = courseLockState(course);

            const body = (
              <>
                <div className="min-w-0 flex-1">
                  <h2
                    className={cn(
                      "section-title truncate",
                      locked ? "text-muted-foreground" : "group-hover:text-success-ink",
                    )}
                  >
                    {course.title}
                  </h2>
                  <p className="line-clamp-1 text-[13.5px] text-muted-foreground">
                    {course.description}
                  </p>
                </div>
                {locked ? (
                  <CourseLockNotice unlocksAt={unlocksAt} />
                ) : (
                  <>
                    <span className="num shrink-0 text-xs text-muted-foreground">
                      {course.lessonsCount} {course.lessonsCount === 1 ? "tema" : "temas"}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </>
            );

            return (
              <li key={course.id}>
                {locked ? (
                  <div className="flex cursor-not-allowed items-center gap-4 py-4">{body}</div>
                ) : (
                  <Link
                    prefetch="intent"
                    to={`/app/theory/${course.id}`}
                    className="group flex items-center gap-4 py-4 transition-colors"
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
