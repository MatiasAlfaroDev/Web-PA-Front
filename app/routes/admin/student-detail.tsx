import { useState } from "react";
import { ArrowLeft, Code2 } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/student-detail";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiStudentDetail, ApiStudentSubmission } from "~/lib/mappers";
import { InitialsBadge } from "~/components/bits";
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
    <main className="mx-auto max-w-[1120px] space-y-6 px-8 py-10 pb-20">
      <Link
        to="/admin/students"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Estudiantes
      </Link>

      <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
        <InitialsBadge
          initials={`${student.first_name[0] ?? ""}${student.last_name[0] ?? ""}`.toUpperCase()}
        />
        <div className="space-y-0.5">
          <p className="text-lg font-bold">
            {student.first_name} {student.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {student.email} {student.ci && `· CI ${student.ci}`}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Progreso por desafío</h2>
        <div className="divide-y rounded-xl border bg-card">
          {progress.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3">
              <span className="flex-1 font-medium">{p.title}</span>
              <span className="font-mono text-xs text-muted-foreground">{p.attempts} intentos</span>
              <span className="font-mono text-xs text-muted-foreground">mejor: {p.best_score} pts</span>
              <Badge
                variant="outline"
                className={cn(Number(p.solved) > 0 && "border-success text-success")}
              >
                {Number(p.solved) > 0 ? "Resuelto" : "Sin resolver"}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Últimas entregas</h2>
        <div className="divide-y rounded-xl border bg-card">
          {recent_submissions.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Todavía no hay entregas.</p>
          )}
          {recent_submissions.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-4 py-3">
              <span className="flex-1 font-medium">{s.challenge.title}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {s.passed_count}/{s.total_count} casos · {s.score} pts
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
