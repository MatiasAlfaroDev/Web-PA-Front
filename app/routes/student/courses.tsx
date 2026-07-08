import { Link } from "react-router";
import type { Route } from "./+types/courses";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapCourse, type ApiCourse } from "~/lib/mappers";
import { InitialsBadge, DifficultyPill } from "~/components/bits";
import { Progress } from "~/components/ui/progress";

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
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <header className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight">Tus cursos</h1>
        <p className="text-sm text-muted-foreground">Retomá donde lo dejaste</p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px]">
        {loaderData.courses.map((course) => {
          const pct = Math.round((course.done / course.total) * 100);
          return (
            <Link
              key={course.id}
              to={`/app/courses/${course.id}`}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center justify-between">
                <InitialsBadge initials={course.initials} />
                <DifficultyPill difficulty={course.difficulty} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-[17px] leading-snug font-bold">{course.title}</h2>
                <p className="line-clamp-2 text-[13.5px] text-muted-foreground">
                  {course.description}
                </p>
              </div>
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
            </Link>
          );
        })}
      </div>
    </main>
  );
}
