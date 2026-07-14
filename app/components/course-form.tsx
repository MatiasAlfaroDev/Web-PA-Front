import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toDatetimeLocal } from "~/lib/utils";

// Course metadata form. Course difficulty is still derived server-side from its
// challenges, but courses now carry a publish flag + an optional availability
// window (teacher-controlled enable/disable + scheduling). Rendered inside a
// parent <Form>.
export function CourseForm({
  title = "",
  description = "",
  published = true,
  availableFrom = null,
  availableUntil = null,
}: {
  title?: string;
  description?: string;
  published?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
}) {
  return (
    <Card className="border p-6">
      <CardContent className="space-y-5 px-0">
        <div className="space-y-2">
          <Label htmlFor="title">Título del curso</Label>
          <Input id="title" name="title" defaultValue={title} placeholder="ej. Java: Programación Orientada a Objetos" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={description}
            placeholder="¿Qué aprenderán los estudiantes en este curso?"
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={published} />
            Publicado
          </label>
          <div className="space-y-2">
            <Label htmlFor="available_from">Disponible desde</Label>
            <Input id="available_from" name="available_from" type="datetime-local" defaultValue={toDatetimeLocal(availableFrom)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="available_until">Disponible hasta</Label>
            <Input id="available_until" name="available_until" type="datetime-local" defaultValue={toDatetimeLocal(availableUntil)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Header shared by create/edit: title + subtitle + primary action.
export function AdminFormHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mb-8 space-y-3">
      <div className="space-y-1">
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
