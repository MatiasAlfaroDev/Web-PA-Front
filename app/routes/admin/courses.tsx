import { Pencil, Plus } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/courses";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { initialsFromTitle, type ApiCourse } from "~/lib/mappers";
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
import { timeAgo } from "~/lib/utils";

export function meta() {
  return [{ title: "Mis cursos · CodeClass" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const [courses, students] = await Promise.all([
    api<ApiCourse[]>("/courses", { token }),
    api<unknown[]>("/teacher/students", { token }),
  ]);
  return { courses, studentCount: students.length };
}

export default function AdminCourses({ loaderData }: Route.ComponentProps) {
  const { courses, studentCount } = loaderData;

  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-extrabold tracking-tight">Mis cursos</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} {courses.length === 1 ? "curso" : "cursos"} · {studentCount} estudiantes inscriptos
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/courses/new">
            <Plus />
            Nuevo curso
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wide [&>th]:text-muted-foreground [&>th]:uppercase">
              <TableHead className="pl-4">Curso</TableHead>
              <TableHead>Desafíos</TableHead>
              <TableHead>Lecciones</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <InitialsBadge initials={initialsFromTitle(c.title)} />
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="line-clamp-1 max-w-sm text-xs text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{c.challenges_count ?? 0}</TableCell>
                <TableCell className="font-mono text-sm">{c.lessons_count ?? 0}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(c.updated_at)}</TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon" aria-label={`Editar ${c.title}`}>
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
