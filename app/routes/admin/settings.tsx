import { useFetcher } from "react-router";
import type { Route } from "./+types/settings";
import { api, apiResult } from "~/lib/api";
import { getToken, getTokenOrRedirect } from "~/lib/auth";
import type { ApiCourse } from "~/lib/mappers";
import { useActionToast } from "~/hooks/use-action-toast";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Ajustes · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const [courses, lock] = await Promise.all([
    api<ApiCourse[]>("/courses", { token }),
    api<{ locked_until: string | null }>("/site-lock", { token }),
  ]);
  return { courses, lockedUntil: lock.locked_until };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await getTokenOrRedirect(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "lock-site") {
    const minutes = form.get("duration_minutes");
    const until = form.get("locked_until");
    const body = minutes ? { duration_minutes: Number(minutes) } : { locked_until: until };
    const res = await apiResult("/site-lock", { method: "PUT", token, body: JSON.stringify(body) });
    return { ok: res.ok, message: "Sitio bloqueado", error: res.ok ? undefined : res.data.message };
  }

  if (intent === "unlock-site") {
    await apiResult("/site-lock", { method: "DELETE", token });
    return { ok: true, message: "Sitio desbloqueado" };
  }

  if (intent === "toggle-course") {
    const published = form.get("published") === "true";
    const res = await apiResult(`/courses/${form.get("course_id")}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ published }),
    });
    return {
      ok: res.ok,
      message: published ? "Curso habilitado" : "Curso bloqueado",
      error: res.ok ? undefined : res.data.message,
    };
  }

  if (intent === "set-all-courses") {
    const published = form.get("published") === "true";
    const courses = await api<ApiCourse[]>("/courses", { token });
    const results = await Promise.all(
      courses.map((c) =>
        apiResult(`/courses/${c.id}`, { method: "PATCH", token, body: JSON.stringify({ published }) }),
      ),
    );
    const failed = results.find((r) => !r.ok);
    return {
      ok: !failed,
      message: published ? "Todos los cursos habilitados" : "Todos los cursos bloqueados",
      error: failed?.data.message,
    };
  }

  return { ok: false };
}

function SiteLockCard({ lockedUntil }: { lockedUntil: string | null }) {
  const fetcher = useFetcher<{ ok: boolean; message?: string; error?: string }>();
  useActionToast(fetcher, "Listo");
  const locked = lockedUntil != null && new Date(lockedUntil) > new Date();

  return (
    <Card className="border p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-lg font-bold">Bloqueo del sitio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <p className="text-sm text-muted-foreground">
          Mientras el sitio esté bloqueado, los estudiantes no pueden acceder a cursos, teórico ni
          desafíos (vos sí seguís teniendo acceso).
        </p>

        {locked ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-destructive/10 px-3 py-1.5 font-mono text-sm text-destructive">
              Bloqueado hasta{" "}
              {new Date(lockedUntil!).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="unlock-site" />
              <Button type="submit" variant="outline" disabled={fetcher.state !== "idle"}>
                Desbloquear
              </Button>
            </fetcher.Form>
          </div>
        ) : (
          <fetcher.Form method="post" className="flex flex-wrap items-end gap-4">
            <input type="hidden" name="intent" value="lock-site" />
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Bloquear por (minutos)</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" min={1} className="w-40" />
            </div>
            <span className="pb-2 text-sm text-muted-foreground">o</span>
            <div className="space-y-2">
              <Label htmlFor="locked_until">Bloquear hasta</Label>
              <Input id="locked_until" name="locked_until" type="datetime-local" className="w-56" />
            </div>
            <Button type="submit" disabled={fetcher.state !== "idle"}>
              Bloquear sitio
            </Button>
          </fetcher.Form>
        )}
      </CardContent>
    </Card>
  );
}

function CourseRow({ course }: { course: ApiCourse }) {
  const fetcher = useFetcher<{ ok: boolean; message?: string; error?: string }>();
  useActionToast(fetcher, "Listo");
  const serverPublished = course.published ?? true;
  // Show the in-flight target immediately — the checkbox is otherwise fully
  // server-controlled and gives no feedback until the request round-trips.
  const pending = fetcher.state !== "idle";
  const published = pending ? fetcher.formData?.get("published") === "true" : serverPublished;

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="font-medium">{course.title}</span>
      <div className="flex items-center gap-3">
        {pending && <span className="text-xs text-muted-foreground">Guardando…</span>}
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="toggle-course" />
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="published" value={(!serverPublished).toString()} />
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <span className={published ? "text-success-soft-foreground" : "text-muted-foreground"}>
              {published ? "Habilitado" : "Bloqueado"}
            </span>
            <input
              type="checkbox"
              checked={published}
              disabled={pending}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="size-4 accent-success"
            />
          </label>
        </fetcher.Form>
      </div>
    </li>
  );
}

export default function AdminSettings({ loaderData }: Route.ComponentProps) {
  const { courses, lockedUntil } = loaderData;
  const bulk = useFetcher<{ ok: boolean; message?: string; error?: string }>();
  useActionToast(bulk, "Listo");
  const bulkBusy = bulk.state !== "idle";

  return (
    <main className="mx-auto max-w-[1120px] space-y-6 px-8 py-10 pb-20">
      <h1 className="text-[28px] font-extrabold tracking-tight">Ajustes</h1>

      <SiteLockCard lockedUntil={lockedUntil} />

      <Card className="border p-6">
        <CardHeader className="flex-row items-center justify-between px-0">
          <CardTitle className="text-lg font-bold">Cursos</CardTitle>
          <div className="flex items-center gap-2">
            {bulkBusy && <span className="text-xs text-muted-foreground">Actualizando…</span>}
            <bulk.Form method="post">
              <input type="hidden" name="intent" value="set-all-courses" />
              <input type="hidden" name="published" value="true" />
              <Button type="submit" variant="outline" size="sm" disabled={bulkBusy}>
                Habilitar todos
              </Button>
            </bulk.Form>
            <bulk.Form method="post">
              <input type="hidden" name="intent" value="set-all-courses" />
              <input type="hidden" name="published" value="false" />
              <Button type="submit" variant="outline" size="sm" disabled={bulkBusy}>
                Bloquear todos
              </Button>
            </bulk.Form>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <p className="mb-3 text-sm text-muted-foreground">
            Habilitá o bloqueá cada curso sin salir de esta página. La fecha/hora de disponibilidad se
            configura desde la edición de cada curso.
          </p>
          <ul className="divide-y rounded-xl border">
            {courses.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
