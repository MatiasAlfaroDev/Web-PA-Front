import { Pencil, Plus } from "lucide-react";
import { Link } from "react-router";
import { adminCourses, type CourseStatus } from "~/lib/mock-data";
import { InitialsBadge } from "~/components/bits";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "My courses · CodeClass" }];
}

export function loader() {
  return { courses: adminCourses };
}

function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase",
        status === "Published"
          ? "bg-success-soft text-success-soft-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

export default function AdminCourses({ loaderData }: { loaderData: { courses: typeof adminCourses } }) {
  const { courses } = loaderData;
  const students = courses.reduce((n, c) => n + c.students, 0);

  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-extrabold tracking-tight">My courses</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} courses · {students} students enrolled
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/courses/new">
            <Plus />
            New course
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wide [&>th]:text-muted-foreground [&>th]:uppercase">
              <TableHead className="pl-4">Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Challenges</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <InitialsBadge initials={c.initials} />
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.difficulty}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="font-mono text-sm">{c.total}</TableCell>
                <TableCell className="font-mono text-sm">{c.students}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.updated}</TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon" aria-label={`Edit ${c.title}`}>
                    <Link to={`/admin/courses/${c.id}`}>
                      <Pencil />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
