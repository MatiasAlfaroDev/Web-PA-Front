import { Link } from "react-router";
import type { Route } from "./+types/courses";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { courseLockState, mapCourse, type Course, type ApiCourse } from "~/lib/mappers";
import { CourseLockNotice, EmptyState, PageHeader, ProgressTicks } from "~/components/bits";

export function meta() {
  return [{ title: "Tus cursos · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const courses = (await api<ApiCourse[]>("/courses", { token })).map(mapCourse);
  return { courses };
}

function OpenCourse({ course }: { course: Course }) {
  const pct = course.total ? Math.round((course.done / course.total) * 100) : 0;
  const complete = course.total > 0 && course.done === course.total;

  return (
    <Link
      prefetch="intent"
      to={`/app/courses/${course.id}`}
      className="group flex flex-col gap-5 rounded-xl border bg-card p-5 transition-colors hover:border-border-strong"
    >
      <div className="space-y-1.5">
        <h2 className="section-title transition-colors group-hover:text-success-ink">
          {course.title}
        </h2>
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">
          {course.description}
        </p>
      </div>

      <div className="mt-auto space-y-2">
        <ProgressTicks done={course.done} total={course.total} />
        <p className="num text-xs text-muted-foreground">
          {course.done}/{course.total} desafíos
          {complete ? (
            <span className="font-semibold text-success-ink"> completo</span>
          ) : (
            <span className="sr-only">, {pct}%</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  const states = loaderData.courses.map((course) => ({ course, ...courseLockState(course) }));
  const open = states.filter((s) => !s.locked);
  const locked = states.filter((s) => s.locked);

  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <PageHeader title="Tus cursos" lead="Retomá donde lo dejaste" />

      {open.length === 0 && locked.length === 0 && (
        <EmptyState
          title="Todavía no tenés cursos"
          hint="En cuanto el profesor habilite un curso vas a verlo acá."
        />
      )}

      {open.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
          {open.map(({ course }) => (
            <OpenCourse key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Locked courses are context, not destinations: a quiet ruled list keeps
          them visible without competing with what the student can open now. */}
      {locked.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-3 text-muted-foreground">Todavía cerrados</h2>
          <ul className="divide-y border-t">
            {locked.map(({ course, unlocksAt }) => (
              <li key={course.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                <span className="min-w-0 flex-1 truncate font-medium text-muted-foreground">
                  {course.title}
                </span>
                <CourseLockNotice unlocksAt={unlocksAt} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
