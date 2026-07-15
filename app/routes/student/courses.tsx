import { Link } from "react-router";
import type { Route } from "./+types/courses";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { courseLockState, mapCourse, type ApiCourse } from "~/lib/mappers";
import { CourseLockNotice } from "~/components/bits";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Tus cursos · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const courses = (await api<ApiCourse[]>("/courses", { token })).map(mapCourse);
  return { courses };
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <header className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight">Tus cursos</h1>
        <p className="text-sm text-muted-foreground">Retomá donde lo dejaste</p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px]">
        {loaderData.courses.map((course) => {
          const { locked, unlocksAt } = courseLockState(course);
          const pct = course.total ? Math.round((course.done / course.total) * 100) : 0;

          const content = (
            <>
              <div className="space-y-1.5">
                <h2 className="text-[17px] leading-snug font-bold">{course.title}</h2>
                <p className="line-clamp-2 text-[13.5px] text-muted-foreground">
                  {course.description}
                </p>
              </div>
              {locked ? (
                <div className="mt-auto">
                  <CourseLockNotice unlocksAt={unlocksAt} />
                </div>
              ) : (
                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-muted-foreground">
                      {course.done}/{course.total} desafíos
                    </span>
                    <span className={pct === 100 ? "font-bold text-success" : "font-bold"}>
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )}
            </>
          );

          const className = cn(
            "flex flex-col gap-4 rounded-xl border p-5 transition-colors",
            locked ? "cursor-not-allowed bg-muted/40 opacity-75" : "bg-card hover:border-border-strong",
          );

          return locked ? (
            <div key={course.id} className={className}>
              {content}
            </div>
          ) : (
            <Link prefetch="intent" key={course.id} to={`/app/courses/${course.id}`} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
