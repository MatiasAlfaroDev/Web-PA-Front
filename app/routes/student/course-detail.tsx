import { ArrowLeft, Check, Lock, Play } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/course-detail";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { mapCourseDetail, type ApiCourse, type Challenge } from "~/lib/mappers";
import { Progress } from "~/components/ui/progress";
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
      <div className="flex min-h-24 cursor-not-allowed flex-col gap-2 rounded-xl border-[1.5px] bg-muted/40 p-4 opacity-75">
        <div className="flex items-center justify-between font-mono text-sm font-semibold text-muted-foreground">
          {day}
          <Lock className="size-4" />
        </div>
        <p className="font-semibold text-muted-foreground">???</p>
      </div>
    );
  }

  const done = c.status === "done";
  return (
    <Link
      to={`/app/courses/${courseId}/challenges/${c.id}`}
      className={cn(
        "flex min-h-24 flex-col gap-2 rounded-xl border-[1.5px] p-4 transition-colors",
        done
          ? "border-success bg-success text-white"
          : "border-success bg-card animate-unlock-pulse hover:bg-muted/40"
      )}
    >
      <div className="flex items-center justify-between font-mono text-sm font-semibold">
        {day}
        {done ? <Check className="size-4" /> : <Play className="size-4 fill-current text-success" />}
      </div>
      <p className={cn("font-semibold", !done && "text-foreground")}>{c.title}</p>
      <span
        className={cn(
          "mt-auto w-fit rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium",
          done ? "bg-white/20" : "bg-success-soft text-success-soft-foreground"
        )}
      >
        +{c.points} pts
      </span>
    </Link>
  );
}

export default function CourseDetail({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;
  const pct = Math.round((course.done / course.total) * 100);

  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <Link
        to="/app/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Todos los cursos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-[28px] font-extrabold tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground">
            {course.total} desafíos diarios · {course.difficulty} · {course.unlockCopy}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[22px] font-bold text-success">
            {course.done}
            <span className="text-muted-foreground">/{course.total}</span>
          </p>
          <p className="text-xs text-muted-foreground">desafíos completados</p>
        </div>
      </div>

      <Progress value={pct} className="mt-4 mb-8 h-1.5 max-w-[420px]" />

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {course.challenges.map((c) => (
          <DayTile key={c.id} c={c} courseId={course.id} />
        ))}
      </div>
    </main>
  );
}
