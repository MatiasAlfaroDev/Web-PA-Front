import { useEffect, useRef, useState } from "react";
import { GripVertical, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/theory-course";
import { api, apiResult } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiCourse, ApiLesson } from "~/lib/mappers";
import { splitSlides } from "~/lib/slides";
import { BackLink, EmptyState, PageHeader } from "~/components/bits";
import { Button } from "~/components/ui/button";
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
import { toDatetimeLocal } from "~/lib/utils";

export function meta() {
  return [{ title: "Teórico · Programación Avanzada" }];
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

  if (intent === "delete-lesson") {
    await apiResult(`/lessons/${form.get("lesson_id")}`, { method: "DELETE", token });
    return { ok: true };
  }

  if (intent === "reorder-lessons") {
    const ids = form.getAll("id");
    await Promise.all(
      ids.map((id, i) =>
        apiResult(`/lessons/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({ position: i + 1 }),
        }),
      ),
    );
    return { ok: true };
  }

  if (intent === "save-lesson") {
    const lid = form.get("lesson_id");
    const payload = {
      title: form.get("title"),
      content: form.get("content"),
      published: form.get("published") === "on",
      available_from: form.get("available_from") || null,
      available_until: form.get("available_until") || null,
    };
    const res = lid
      ? await apiResult(`/lessons/${lid}`, { method: "PATCH", token, body: JSON.stringify(payload) })
      : await apiResult(`/courses/${courseId}/lessons`, {
          method: "POST",
          token,
          body: JSON.stringify({ ...payload, position: Number(form.get("position")) || 1 }),
        });
    return { ok: res.ok, error: res.ok ? undefined : res.data.message };
  }

  return { ok: false };
}

type EditLesson = NonNullable<ApiCourse["lessons"]>[number];

export default function AdminTheoryCourse({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;
  const serverLessons = course.lessons ?? [];

  // Local order for smooth drag; resynced whenever the loader revalidates.
  const [lessonOrder, setLessonOrder] = useState<EditLesson[]>(serverLessons);
  useEffect(() => setLessonOrder(serverLessons), [serverLessons]);

  const [editing, setEditing] = useState<EditLesson | null | undefined>(undefined); // undefined = closed, null = new
  const reorder = useFetcher();
  const remove = useFetcher();
  const dragIndex = useRef<number | null>(null);

  function drop(to: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === to) return;
    const next = [...lessonOrder];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLessonOrder(next);
    const fd = new FormData();
    fd.set("intent", "reorder-lessons");
    next.forEach((l) => fd.append("id", String(l.id)));
    reorder.submit(fd, { method: "post" });
  }

  return (
    <main className="mx-auto max-w-[1000px] px-8 py-10 pb-20">
      <BackLink to="/admin/theory">Teórico</BackLink>
      <PageHeader
        title={course.title}
        lead="Arrastrá para reordenar. Cada lección se presenta como diapositivas."
      >
        <Button variant="outline" onClick={() => setEditing(null)}>
          <Plus />
          Agregar lección
        </Button>
      </PageHeader>

      {lessonOrder.length === 0 ? (
        <EmptyState
          title="Todavía no hay lecciones"
          hint="Agregá la primera para armar el material teórico de este curso."
        >
          <Button onClick={() => setEditing(null)}>
            <Plus />
            Agregar lección
          </Button>
        </EmptyState>
      ) : (
        <ul className="divide-y border-y">
          {lessonOrder.map((l, i) => (
            <li
              key={l.id}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(i)}
              className="flex items-center gap-3 py-2.5"
            >
              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
              <span className="num w-6 shrink-0 text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
              <Button asChild variant="secondary" size="sm">
                <Link
                  prefetch="intent"
                  to={`/admin/theory/${course.id}/lessons/${l.id}/present`}
                >
                  <Play className="fill-current" />
                  Presentar
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${l.title}`}
                onClick={() => setEditing(l)}
              >
                <Pencil />
              </Button>
              <remove.Form method="post">
                <input type="hidden" name="intent" value="delete-lesson" />
                <input type="hidden" name="lesson_id" value={l.id} />
                <Button
                  type="submit"
                  variant="destructive"
                  size="icon"
                  aria-label={`Eliminar ${l.title}`}
                >
                  <Trash2 />
                </Button>
              </remove.Form>
            </li>
          ))}
        </ul>
      )}

      <LessonDialog
        editing={editing}
        nextPosition={lessonOrder.length + 1}
        onClose={() => setEditing(undefined)}
      />
    </main>
  );
}

function LessonDialog({
  editing,
  nextPosition,
  onClose,
}: {
  editing: EditLesson | null | undefined;
  nextPosition: number;
  onClose: () => void;
}) {
  const isEdit = !!editing;
  const save = useFetcher<{ ok?: boolean; error?: string }>();
  const detail = useFetcher<{ lesson: ApiLesson }>();

  useEffect(() => {
    if (editing) detail.load(`/admin/lessons/${editing.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

  useEffect(() => {
    if (save.state === "idle" && save.data?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save.state, save.data]);

  const full = isEdit ? detail.data?.lesson : undefined;
  const loading = isEdit && detail.state !== "idle" && !full;
  const formKey = isEdit ? `edit-${editing?.id}-${full ? "loaded" : "loading"}` : "new";

  return (
    <Dialog open={editing !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lección" : "Agregar lección"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá el material teórico de esta lección."
              : "Se agregará a la sección Teórico del curso."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <save.Form method="post" key={formKey}>
            <input type="hidden" name="intent" value="save-lesson" />
            {isEdit && <input type="hidden" name="lesson_id" value={editing!.id} />}
            {!isEdit && <input type="hidden" name="position" value={nextPosition} />}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="l-title">Título</Label>
                <Input
                  id="l-title"
                  name="title"
                  defaultValue={full?.title ?? editing?.title ?? ""}
                  placeholder="ej. Herencia y polimorfismo"
                  required
                />
              </div>
              <LessonContentField defaultValue={full?.content ?? ""} />
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <input type="checkbox" name="published" defaultChecked={full?.published ?? true} />
                  Publicado
                </label>
                <div className="space-y-2">
                  <Label htmlFor="l-from">Disponible desde</Label>
                  <Input
                    id="l-from"
                    name="available_from"
                    type="datetime-local"
                    defaultValue={toDatetimeLocal(full?.available_from)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="l-until">Disponible hasta</Label>
                  <Input
                    id="l-until"
                    name="available_until"
                    type="datetime-local"
                    defaultValue={toDatetimeLocal(full?.available_until)}
                  />
                </div>
              </div>
              {save.data?.error && <p className="text-sm text-destructive">{save.data.error}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.state !== "idle"}>
                {isEdit ? "Guardar cambios" : "Agregar lección"}
              </Button>
            </DialogFooter>
          </save.Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// The slide count is the one piece of feedback that makes `---` discoverable:
// the teacher types a separator and watches the count go up as they write.
function LessonContentField({ defaultValue }: { defaultValue: string }) {
  const [content, setContent] = useState(defaultValue);
  const count = splitSlides(content).length;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <Label htmlFor="l-content">Contenido (Markdown)</Label>
        <span className="num text-xs text-muted-foreground">
          {count} {count === 1 ? "diapositiva" : "diapositivas"}
        </span>
      </div>
      <Textarea
        id="l-content"
        name="content"
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={"# Herencia\n\nUna clase hereda de otra...\n\n---\n\n# Polimorfismo"}
        required
      />
      <p className="text-xs text-muted-foreground">
        Una línea con <code className="rounded bg-muted px-1 py-0.5 font-mono">---</code> corta la
        lección en diapositivas.
      </p>
    </div>
  );
}
