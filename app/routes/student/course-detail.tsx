import { Check, Lock, Play } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/course-detail";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapCourseDetail, type ApiCourse, type Challenge } from "~/lib/mappers";
import { BackLink, EmptyState, Figure, ProgressTicks } from "~/components/bits";
import { cn } from "~/lib/utils";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const course = await api<ApiCourse>(`/courses/${params.courseId}`, { token });
  return { course: mapCourseDetail(course) };
}

export function meta() {
  return [{ title: "Curso · Programación Avanzada" }];
}

function DayTile({ c, courseId }: { c: Challenge; courseId: string }) {
  const day = String(c.day).padStart(2, "0");

  if (c.status === "locked") {
    return (
      <div
        className="flex min-h-26 cursor-not-allowed flex-col gap-2 rounded-xl border bg-muted/40 p-4"
        aria-label={`Día ${c.day}, bloqueado`}
      >
        <div className="num flex items-center justify-between text-sm font-semibold text-muted-foreground">
          {day}
          <Lock className="size-4" />
        </div>
        <p className="font-medium text-muted-foreground">Por abrir</p>
      </div>
    );
  }

  const done = c.status === "done";
  return (
    <Link
      prefetch="intent"
      to={`/app/courses/${courseId}/challenges/${c.id}`}
      className={cn(
        "flex min-h-26 flex-col gap-2 rounded-xl border p-4 transition-colors",
        done
          ? "border-success bg-success text-white hover:bg-success/90"
          : "animate-unlock-pulse border-brand bg-card hover:bg-muted/40",
      )}
    >
      <div className="num flex items-center justify-between text-sm font-semibold">
        {day}
        {done ? <Check className="size-4" /> : <Play className="size-4 fill-current text-success-ink" />}
      </div>
      <p className="font-semibold">{c.title}</p>
      <span
        className={cn(
          "num mt-auto w-fit rounded-md px-1.5 py-0.5 text-[11px] font-medium",
          done ? "bg-white/20" : "bg-success-soft text-success-soft-foreground",
        )}
      >
        +{c.points} pts
      </span>
    </Link>
  );
}

export default function CourseDetail({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <BackLink to="/app/courses">Todos los cursos</BackLink>

      {/* The course head pairs its one figure with the per-day rail, so the
          student sees both how far along they are and what opens next. */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-6">
        <div className="max-w-[52ch] space-y-1">
          <h1 className="page-title">{course.title}</h1>
          <p className="text-sm text-muted-foreground">
            {course.total} desafíos diarios, {course.unlockCopy}
          </p>
        </div>
        <div className="flex items-end gap-8">
          <Figure value={`${course.done}/${course.total}`} label="resueltos" tone="accent" />
          <ProgressTicks
            done={course.done}
            total={course.total}
            className="w-[min(320px,40vw)] pb-2"
          />
        </div>
      </header>

      {course.challenges.length === 0 ? (
        <EmptyState
          title="Este curso todavía no tiene desafíos"
          hint="El profesor los publica día por día."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {course.challenges.map((c) => (
            <DayTile key={c.id} c={c} courseId={course.id} />
          ))}
        </div>
      )}
    </main>
  );
}
