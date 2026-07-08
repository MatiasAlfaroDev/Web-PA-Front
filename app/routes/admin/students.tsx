import { ShieldCheck, ShieldQuestion } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/students";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiStudentRow } from "~/lib/mappers";
import { InitialsBadge } from "~/components/bits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function meta() {
  return [{ title: "Estudiantes · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const students = await api<ApiStudentRow[]>("/teacher/students", { token });
  return { students };
}

export default function Students({ loaderData }: Route.ComponentProps) {
  const { students } = loaderData;

  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <header className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight">Estudiantes</h1>
        <p className="text-sm text-muted-foreground">
          {students.length} {students.length === 1 ? "estudiante" : "estudiantes"} · entregas y progreso por desafío
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wide [&>th]:text-muted-foreground [&>th]:uppercase">
              <TableHead className="pl-4">Estudiante</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Puntaje</TableHead>
              <TableHead>Resueltos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="pl-4">
                  <Link
                    to={`/admin/students/${s.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <InitialsBadge initials={`${s.first_name[0] ?? ""}${s.last_name[0] ?? ""}`.toUpperCase()} />
                    <span className="font-semibold">
                      {s.first_name} {s.last_name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-sm">{s.ci ?? "—"}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {s.email_verified_at ? (
                      <ShieldCheck className="size-3.5 text-success" />
                    ) : (
                      <ShieldQuestion className="size-3.5" />
                    )}
                    {s.email}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">{s.total_score}</TableCell>
                <TableCell className="font-mono text-sm">{s.challenges_solved}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
