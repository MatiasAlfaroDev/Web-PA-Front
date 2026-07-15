import { useEffect, useRef, useState } from "react";
import { ArrowLeft, GripVertical, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { Form, Link, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/course-edit";
import { api, apiResult } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiChallenge, ApiCourse } from "~/lib/mappers";
import { AdminFormHeader, CourseForm } from "~/components/course-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Editar curso · Programación Avanzada" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const course = await api<ApiCourse>(`/courses/${params.courseId}`, { token });
  return { course };
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await getTokenOrRedirect(request);
  const form = await request.formData();
  const intent = form.get("intent");
  const courseId = params.courseId;

  if (intent === "delete-course") {
    await apiResult(`/courses/${courseId}`, { method: "DELETE", token });
    return redirect("/admin/courses");
  }

  if (intent === "save-course") {
    const res = await apiResult(`/courses/${courseId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        published: form.get("published") === "on",
        available_from: form.get("available_from") || null,
        available_until: form.get("available_until") || null,
      }),
    });
    return { ok: res.ok, error: res.ok ? undefined : res.data.message };
  }

  if (intent === "delete-challenge") {
    await apiResult(`/challenges/${form.get("challenge_id")}`, { method: "DELETE", token });
    return { ok: true };
  }

  if (intent === "reorder") {
    const ids = form.getAll("id");
    await Promise.all(
      ids.map((id, i) =>
        apiResult(`/challenges/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({ position: i + 1 }),
        }),
      ),
    );
    return { ok: true };
  }

  if (intent === "save-challenge") {
    const cid = form.get("challenge_id");
    const payload = {
      title: form.get("title"),
      statement: form.get("statement"),
      starter_code: form.get("starter_code"),
      points: Number(form.get("points")) || 100,
      min_points: form.get("min_points") ? Number(form.get("min_points")) : null,
      difficulty: form.get("difficulty") || "easy",
      published: form.get("published") === "on",
      language_id: 62,
    };
    const res = cid
      ? await apiResult(`/challenges/${cid}`, { method: "PATCH", token, body: JSON.stringify(payload) })
      : await apiResult(`/courses/${courseId}/challenges`, {
          method: "POST",
          token,
          body: JSON.stringify({ ...payload, position: Number(form.get("position")) || 1 }),
        });
    return { ok: res.ok, error: res.ok ? undefined : res.data.message };
  }

  return { ok: false };
}

type EditChallenge = NonNullable<ApiCourse["challenges"]>[number];

export default function CourseEdit({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;
  const serverChallenges = course.challenges ?? [];

  // Local order for smooth drag; resynced whenever the loader revalidates.
  const [order, setOrder] = useState<EditChallenge[]>(serverChallenges);
  useEffect(() => setOrder(serverChallenges), [serverChallenges]);

  const [editing, setEditing] = useState<EditChallenge | null | undefined>(undefined); // undefined = closed, null = new
  const reorder = useFetcher();
  const remove = useFetcher();
  const dragIndex = useRef<number | null>(null);

  function drop(to: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === to) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
    // Repeated "id" fields carry the new order to the reorder action.
    const fd = new FormData();
    fd.set("intent", "reorder");
    next.forEach((c) => fd.append("id", String(c.id)));
    reorder.submit(fd, { method: "post" });
  }

  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <Link prefetch="intent"
        to="/admin/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Mis cursos
      </Link>

      <Form method="post">
        <input type="hidden" name="intent" value="save-course" />
        <AdminFormHeader title="Editar curso" action={<Button type="submit">Guardar cambios</Button>} />
        <CourseForm
          title={course.title}
          description={course.description ?? ""}
          published={course.published ?? true}
          availableFrom={course.available_from}
          availableUntil={course.available_until}
        />
      </Form>

      <Card className="mt-6 border p-6">
        <CardHeader className="flex-row items-center justify-between px-0">
          <CardTitle className="text-lg font-bold">Desafíos · se desbloquean en orden, uno por día</CardTitle>
          <Button variant="outline" onClick={() => setEditing(null)}>
            <Plus />
            Agregar desafío
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {order.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Todavía no hay desafíos. Agregá el primero para iniciar la secuencia de desbloqueo.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {order.map((c, i) => (
                <li
                  key={c.id}
                  draggable
                  onDragStart={() => (dragIndex.current = i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(i)}
                  className="flex items-center gap-3 bg-card px-3 py-3 first:rounded-t-xl last:rounded-b-xl"
                >
                  <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                  <span className="w-6 shrink-0 font-mono text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium">{c.title}</span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      c.published
                        ? "bg-success-soft text-success-soft-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.published ? "Publicado" : "Borrador"}
                  </span>
                  <Button variant="ghost" size="icon" aria-label="Editar desafío" onClick={() => setEditing(c)}>
                    <Pencil />
                  </Button>
                  <remove.Form method="post">
                    <input type="hidden" name="intent" value="delete-challenge" />
                    <input type="hidden" name="challenge_id" value={c.id} />
                    <Button type="submit" variant="destructive" size="icon" aria-label="Eliminar desafío">
                      <Trash2 />
                    </Button>
                  </remove.Form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Form method="post" className="mt-6">
        <input type="hidden" name="intent" value="delete-course" />
        <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 />
          Eliminar curso
        </Button>
      </Form>

      <ChallengeDialog
        editing={editing}
        nextPosition={order.length + 1}
        onClose={() => setEditing(undefined)}
      />
    </main>
  );
}

function ChallengeDialog({
  editing,
  nextPosition,
  onClose,
}: {
  editing: EditChallenge | null | undefined;
  nextPosition: number;
  onClose: () => void;
}) {
  const isEdit = !!editing;
  const save = useFetcher<{ ok?: boolean; error?: string }>();
  const detail = useFetcher<{ challenge: ApiChallenge }>();

  // Fetch full statement + starter code when editing an existing challenge.
  useEffect(() => {
    if (editing) detail.load(`/admin/challenges/${editing.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

  // Close once a save succeeds.
  useEffect(() => {
    if (save.state === "idle" && save.data?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save.state, save.data]);

  const full = isEdit ? detail.data?.challenge : undefined;
  const loading = isEdit && detail.state !== "idle" && !full;
  // Reset field defaults when the fetched detail arrives (or when opening "new").
  const formKey = isEdit ? `edit-${editing?.id}-${full ? "loaded" : "loading"}` : "new";

  return (
    <Dialog open={editing !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar desafío" : "Agregar desafío"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá el enunciado y el código inicial de este desafío."
              : "Se agregará como el siguiente paso de la secuencia de desbloqueo."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <save.Form method="post" key={formKey}>
            <input type="hidden" name="intent" value="save-challenge" />
            {isEdit && <input type="hidden" name="challenge_id" value={editing!.id} />}
            {!isEdit && <input type="hidden" name="position" value={nextPosition} />}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-title">Título</Label>
                <Input id="c-title" name="title" defaultValue={full?.title ?? editing?.title ?? ""} placeholder="ej. Área del rectángulo" required />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label htmlFor="c-points">Puntos</Label>
                  <Input id="c-points" name="points" type="number" className="w-[110px]" defaultValue={full?.points ?? editing?.points ?? 100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-min-points">Puntos mínimos</Label>
                  <Input
                    id="c-min-points"
                    name="min_points"
                    type="number"
                    className="w-[110px]"
                    defaultValue={full?.min_points ?? ""}
                    placeholder="sin baja"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-difficulty">Dificultad</Label>
                  <select
                    id="c-difficulty"
                    name="difficulty"
                    defaultValue={full?.difficulty ?? editing?.difficulty ?? "easy"}
                    className="h-9 rounded-md border bg-transparent px-3 text-sm"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input type="checkbox" name="published" defaultChecked={full?.published ?? editing?.published ?? true} />
                  Publicado
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Los puntos bajan 10 por cada día que pasa sin resolverse desde que se publica, sin bajar de "Puntos mínimos" — dejalo vacío para que no baje nunca.
              </p>

              <Tabs defaultValue="description">
                <TabsList variant="line" className="gap-4 border-b">
                  <TabsTrigger value="description">Enunciado</TabsTrigger>
                  <TabsTrigger value="starter">Código inicial</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-2 pt-3">
                  <p className="text-xs text-muted-foreground">Markdown. Se muestra en la pestaña Instrucciones del estudiante.</p>
                  <Textarea name="statement" rows={5} defaultValue={full?.statement ?? ""} placeholder="Describí el problema, la entrada/salida y un ejemplo..." required />
                </TabsContent>
                <TabsContent value="starter" className="space-y-2 pt-3">
                  <p className="text-xs text-muted-foreground">Precarga el editor de Java del estudiante.</p>
                  <Textarea
                    name="starter_code"
                    rows={6}
                    spellCheck={false}
                    className="bg-[#1e1e1e] font-mono text-[13px] text-[#d4d4d4]"
                    defaultValue={full?.starter_code ?? ""}
                    placeholder="public class Main { ... }"
                  />
                </TabsContent>
              </Tabs>

              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" />
                Los casos de prueba que corrigen este desafío se gestionan por la API — este formulario cubre el enunciado y el código inicial.
              </p>
              {save.data?.error && <p className="text-sm text-destructive">{save.data.error}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.state !== "idle"}>
                {isEdit ? "Guardar cambios" : "Agregar desafío"}
              </Button>
            </DialogFooter>
          </save.Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
