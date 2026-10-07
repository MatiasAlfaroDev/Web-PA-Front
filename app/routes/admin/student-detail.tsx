import { useState } from "react";
import { Code2 } from "lucide-react";
import type { Route } from "./+types/student-detail";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiStudentDetail, ApiStudentSubmission } from "~/lib/mappers";
import { BackLink, Figure, InitialsBadge } from "~/components/bits";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { timeAgo, cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Estudiante · Programación Avanzada" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const detail = await api<ApiStudentDetail>(`/teacher/students/${params.studentId}`, { token });
  return detail;
}

const STATUS_LABEL: Record<ApiStudentSubmission["status"], string> = {
  pending: "Pendiente",
  judging: "Ejecutando",
  passed: "Aprobado",
  partial: "Parcial",
  failed: "Falló",
  error: "Error",
};

const STATUS_CLASS: Record<ApiStudentSubmission["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  judging: "bg-muted text-muted-foreground",
  passed: "bg-success-soft text-success-soft-foreground",
  partial: "bg-warning-soft text-warning-soft-foreground",
  failed: "bg-destructive/10 text-destructive",
  error: "bg-destructive/10 text-destructive",
};

export default function StudentDetail({ loaderData }: Route.ComponentProps) {
  const { student, progress, recent_submissions } = loaderData;
  const [viewing, setViewing] = useState<ApiStudentSubmission | null>(null);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-8 py-10 pb-20">
      <BackLink to="/admin/students">Estudiantes</BackLink>

      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <InitialsBadge
            size="lg"
            initials={`${student.first_name[0] ?? ""}${student.last_name[0] ?? ""}`.toUpperCase()}
          />
          <div className="min-w-0 space-y-0.5">
            <h1 className="page-title">
              {student.first_name} {student.last_name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{student.email}</p>
            {student.ci && <p className="num text-xs text-muted-foreground">CI {student.ci}</p>}
          </div>
        </div>
        <div className="flex items-end gap-8">
          <Figure value={progress.filter((p) => Number(p.solved) > 0).length} label="resueltos" tone="accent" />
          <Figure value={recent_submissions.length} label="entregas recientes" />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="section-title">Progreso por desafío</h2>
        <div className="divide-y border-t">
          {progress.map((p) => (
            <div key={p.id} className="flex items-center gap-4 py-3">
              <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
              <span className="num shrink-0 text-xs text-muted-foreground">
                {p.attempts} intentos
              </span>
              <span className="num shrink-0 text-xs text-muted-foreground">
                mejor {p.best_score} pts
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0",
                  Number(p.solved) > 0 && "border-success text-success-ink",
                )}
              >
                {Number(p.solved) > 0 ? "Resuelto" : "Sin resolver"}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Últimas entregas</h2>
        <div className="divide-y border-t">
          {recent_submissions.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">Todavía no hay entregas.</p>
          )}
          {recent_submissions.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-3">
              <span className="min-w-0 flex-1 truncate font-medium">{s.challenge.title}</span>
              <span className="num shrink-0 text-xs text-muted-foreground">
                {s.passed_count}/{s.total_count} casos, {s.score} pts
              </span>
              <Badge className={STATUS_CLASS[s.status]}>{STATUS_LABEL[s.status]}</Badge>
              <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                {timeAgo(s.created_at)}
              </span>
              <Button variant="ghost" size="icon" aria-label="Ver código" onClick={() => setViewing(s)}>
                <Code2 />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewing?.challenge.title}</DialogTitle>
          </DialogHeader>
          <pre className="max-h-[60vh] overflow-auto rounded-md bg-[#1e1e1e] p-4 font-mono text-[13px] leading-relaxed text-[#d4d4d4]">
            {viewing?.code}
          </pre>
        </DialogContent>
      </Dialog>
    </main>
  );
}
