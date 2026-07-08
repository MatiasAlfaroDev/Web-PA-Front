import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

// Course metadata form. The backend models a course as just title + description
// (course difficulty is derived from its challenges; there's no course-level
// publish state), so those are the only fields. Rendered inside a parent <Form>.
export function CourseForm({
  title = "",
  description = "",
}: {
  title?: string;
  description?: string;
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
