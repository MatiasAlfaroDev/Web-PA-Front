import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/theory";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { courseLockState, mapCourse, type ApiCourse } from "~/lib/mappers";
import { CourseLockNotice } from "~/components/bits";
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
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <header className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight">Teórico</h1>
        <p className="text-sm text-muted-foreground">Material teórico por curso</p>
      </header>

      <div className="divide-y rounded-xl border bg-card">
        {loaderData.courses.map((course) => {
          const { locked, unlocksAt } = courseLockState(course);

          const content = (
            <>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h2 className="font-semibold">{course.title}</h2>
                <p className="line-clamp-1 text-[13.5px] text-muted-foreground">{course.description}</p>
              </div>
              {locked ? (
                <CourseLockNotice unlocksAt={unlocksAt} />
              ) : (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {course.lessonsCount} {course.lessonsCount === 1 ? "tema" : "temas"}
                </span>
              )}
            </>
          );

          const className = cn(
            "flex items-center gap-4 p-4 transition-colors",
            locked ? "cursor-not-allowed opacity-75" : "hover:bg-muted/40",
          );

          return locked ? (
            <div key={course.id} className={className}>
              {content}
            </div>
          ) : (
            <Link key={course.id} to={`/app/theory/${course.id}`} className={className}>
              {content}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
