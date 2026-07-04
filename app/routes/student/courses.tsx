import { Link } from "react-router";
import { courses } from "~/lib/mock-data";
import { InitialsBadge, DifficultyPill } from "~/components/bits";
import { Progress } from "~/components/ui/progress";

export function meta() {
  return [{ title: "Your courses · CodeClass" }];
}

export function loader() {
  // ponytail: swap for api<Course[]>("/courses")
  return { courses };
}

export default function Courses({ loaderData }: { loaderData: { courses: typeof courses } }) {
  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <header className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight">Your courses</h1>
        <p className="text-sm text-muted-foreground">Pick up where you left off</p>
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
                    {course.done}/{course.total} challenges
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
