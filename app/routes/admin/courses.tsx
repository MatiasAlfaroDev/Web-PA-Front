import { Pencil, Plus } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/courses";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { type ApiCourse } from "~/lib/mappers";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn, timeAgo } from "~/lib/utils";

export function meta() {
  return [{ title: "Mis cursos · Programación Avanzada" }];
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
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-extrabold tracking-tight">Mis cursos</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} {courses.length === 1 ? "curso" : "cursos"} · {studentCount} estudiantes inscriptos
          </p>
        </div>
        <Button asChild>
          <Link prefetch="intent" to="/admin/courses/new">
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
              <TableHead>Estado</TableHead>
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
                  <p className="font-semibold">{c.title}</p>
                  <p className="line-clamp-1 max-w-sm text-xs text-muted-foreground">
                    {c.description}
                  </p>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      c.published
                        ? "bg-success-soft text-success-soft-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.published ? "Habilitado" : "Bloqueado"}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{c.challenges_count ?? 0}</TableCell>
                <TableCell className="font-mono text-sm">{c.lessons_count ?? 0}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(c.updated_at)}</TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon" aria-label={`Editar ${c.title}`}>
                    <Link prefetch="intent" to={`/admin/courses/${c.id}`}>
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
